import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // 👈 force Node runtime (more stable locally on Windows)

type Period = "week" | "month" | "year";
type Entry = {
  username: string;
  name: string | null;
  avatar_url: string | null;
  total_points: number;
  breakdown: Record<string, { count: number; points: number }>;
};

const ORG = process.env.GITHUB_ORG ?? "CircuitVerse";
const TOKEN = process.env.GITHUB_TOKEN ?? "";
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 900);

const scores = { prOpened: 2, prMerged: 5, issueOpened: 1, review: 1 };

// tight caps so we never hang
const REQ_TIMEOUT_MS = 5000;
const MAX_SEARCH_PAGES = 2;
const MAX_REPO_PAGES = 1;
const MAX_REVIEW_PR_PAGES = 1;
const REPOS_CAP = 5;

let cache: Record<string, { at: number; data: Entry[] }> = {};
let inflight: Record<string, Promise<any>> = {};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ period: string }> }
) {
  // quick signal that the route is executing
  const startedAt = Date.now();
  const { period: raw } = await ctx.params;

  const url = new URL(req.url);
  if (url.searchParams.get("ping") === "1") {
    return NextResponse.json({ ok: true, msg: "route alive", startedAt, ORG, tokenLoaded: !!TOKEN });
  }

  if (url.searchParams.get("probe") === "1") {
    try {
      const result = await probeGithub();
      return NextResponse.json({ ok: true, result, tokenLoaded: !!TOKEN });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message ?? String(e), tokenLoaded: !!TOKEN }, { status: 502 });
    }
  }

  const period = normalize(raw);
  if (!period) return NextResponse.json({ error: "invalid period" }, { status: 400 });

  const debug = url.searchParams.get("debug") === "1";
  const now = Date.now();
  const hit = cache[period];
  if (!debug && hit && now - hit.at < TTL * 1000) {
    return NextResponse.json({ period, updatedAt: hit.at, entries: hit.data, cache: "hit" });
  }

  if (inflight[period]) {
    const out = await inflight[period];
    return NextResponse.json({ period, updatedAt: cache[period]?.at ?? now, ...(debug ? out : { entries: out.entries ?? out }) });
  }

  inflight[period] = buildLeaderboard(period, { debug })
    .catch((e) => ({ error: e?.message ?? "unknown", entries: [], stats: {} }))
    .finally(() => { /* ensure finally runs in caller */ });

  try {
    const out = await inflight[period];
    const entries: Entry[] = out.entries ?? out ?? [];
    cache[period] = { at: Date.now(), data: entries };
    return NextResponse.json({ period, updatedAt: cache[period].at, ...(debug ? out : { entries }) });
  } finally {
    delete inflight[period];
  }
}

function normalize(p?: string): Period | null {
  if (!p) return null;
  const k = p.toLowerCase();
  if (k.startsWith("week")) return "week";
  if (k.startsWith("month")) return "month";
  if (k.startsWith("year")) return "year";
  return null;
}

function since(period: Period) {
  const now = new Date();
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "month") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
}

// ---------- helpers (timeouts + GH fetch) ----------
function timeout<T>(p: Promise<T>, ms: number, label: string) {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`Timeout ${ms}ms: ${label}`)), ms)),
  ]);
}
async function gh(url: string, headers: Record<string, string>) {
  const res = await timeout(fetch(url, { headers }), REQ_TIMEOUT_MS, url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status} ${res.statusText} for ${url}\n${text}`);
  }
  return res;
}
async function probeGithub() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await gh("https://api.github.com/rate_limit", headers);
  const json = await res.json();
  return { core: json?.resources?.core, search: json?.resources?.search };
}

async function buildLeaderboard(period: Period, opts?: { debug?: boolean }) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const sinceISO = since(period).toISOString();
  const byUser: Record<string, Entry> = {};
  const stats = { prOpened: 0, prMerged: 0, issueOpened: 0, reviews: 0, reposScanned: 0 };

  const add = (login?: string, avatar?: string | null, k?: string, pts = 0) => {
    if (!login || !k) return;
    if (!byUser[login]) byUser[login] = { username: login, name: null, avatar_url: avatar ?? null, total_points: 0, breakdown: {} };
    const e = byUser[login];
    e.total_points += pts;
    e.breakdown[k] ??= { count: 0, points: 0 };
    e.breakdown[k].count += 1;
    e.breakdown[k].points += pts;
  };

  const linkNext = (link: string | null): string | null => {
    if (!link) return null;
    for (const part of link.split(",")) {
      const [urlPart, relPart] = part.split(";");
      if (relPart?.includes('rel="next"')) {
        const trimmed = urlPart?.trim();
        if (trimmed && trimmed.startsWith("<") && trimmed.endsWith(">")) {
          return trimmed.slice(1, -1);
        }
      }
    }
    return null;
  };

  const paginateSearch = async (url: string, onItem: (it: any) => void) => {
    let next: string | null = url;
    let pages = 0;
    while (next && pages < MAX_SEARCH_PAGES) {
      const res = await gh(next, headers);
      const data = await res.json();
      for (const item of data.items ?? []) onItem(item);
      next = linkNext(res.headers.get("link"));
      pages++;
    }
  };

  const paginateArray = async (
    url: string,
    onItem: (it: any) => void | Promise<void>,
    pageLimit: number
  ) => {
    let next: string | null = url;
    let pages = 0;
    while (next && pages < pageLimit) {
      const res = await gh(next, headers);
      const data = await res.json();
      for (const item of (Array.isArray(data) ? data : []) as any[]) await onItem(item);
      next = linkNext(res.headers.get("link"));
      pages++;
    }
  };

  const listRepos = async () => {
    const out: any[] = [];
    let next: string | null = `https://api.github.com/orgs/${ORG}/repos?type=public&per_page=100&sort=updated`;
    let pages = 0;
    while (next && pages < MAX_REPO_PAGES && out.length < REPOS_CAP) {
      const res = await gh(next, headers);
      const data = await res.json();
      out.push(...(Array.isArray(data) ? data : []));
      next = linkNext(res.headers.get("link"));
      pages++;
    }
    out.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return out.slice(0, REPOS_CAP);
  };

  // fast searches
  await paginateSearch(
    `https://api.github.com/search/issues?q=org:${ORG}+is:pr+created:>=${sinceISO}&per_page=100`,
    (i) => { stats.prOpened++; add(i.user?.login, i.user?.avatar_url, "PR opened", scores.prOpened); }
  );
  await paginateSearch(
    `https://api.github.com/search/issues?q=org:${ORG}+is:pr+is:merged+merged:>=${sinceISO}&per_page=100`,
    (i) => { stats.prMerged++; add(i.user?.login, i.user?.avatar_url, "PR merged", scores.prMerged); }
  );
  await paginateSearch(
    `https://api.github.com/search/issues?q=org:${ORG}+is:issue+created:>=${sinceISO}&per_page=100`,
    (i) => { stats.issueOpened++; add(i.user?.login, i.user?.avatar_url, "Issue opened", scores.issueOpened); }
  );

  // reviews (bounded)
  const repos = await listRepos();
  stats.reposScanned = repos.length;
  for (const r of repos) {
    await paginateArray(
      `https://api.github.com/repos/${ORG}/${r.name}/pulls?state=closed&sort=updated&direction=desc&per_page=50`,
      async (pr: any) => {
        const res = await gh(`https://api.github.com/repos/${ORG}/${r.name}/pulls/${pr.number}/reviews?per_page=100`, headers);
        const reviews = await res.json();
        for (const rv of Array.isArray(reviews) ? reviews : []) {
          const login: string | undefined = rv.user?.login;
          if (!login) continue;
          const t: string | undefined = rv.submitted_at ?? pr.updated_at;
          if (t && new Date(t).toISOString() >= sinceISO) {
            stats.reviews++;
            add(login, rv.user?.avatar_url, "Review", scores.review);
          }
        }
      },
      MAX_REVIEW_PR_PAGES
    );
  }

  // enrich small set
  const logins = Object.keys(byUser).slice(0, 25);
  await Promise.all(logins.map(async (login) => {
    try {
      const res = await gh(`https://api.github.com/users/${login}`, headers);
      const info = await res.json();
      const target = byUser[login];
      if (target) {
        target.name = info?.name ?? target.name ?? null;
        target.avatar_url = target.avatar_url ?? info?.avatar_url ?? null;
      }
    } catch {}
  }));

  const entries = Object.values(byUser)
    .filter((e) => e.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points);

  return opts?.debug ? { entries, stats } : { entries };
}
