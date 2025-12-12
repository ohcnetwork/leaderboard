import { NextResponse } from "next/server";

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

// per-period in-memory cache
let cache: Record<string, { at: number; data: Entry[] }> = Object.create(null);
let inflight: Record<string, Promise<Entry[]>> = Object.create(null);

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: { period: string } } | { params: Promise<{ period: string }> } | any
) {
  // 🔧 params may be a Promise in Next 15 – unwrap safely
  const rawParams = typeof ctx?.params?.then === "function" ? await ctx.params : ctx?.params;
  const rawPeriod = rawParams?.period as string | undefined;

  const period = normalize(rawPeriod);
  if (!period) return NextResponse.json({ error: "invalid period" }, { status: 400 });

  const now = Date.now();
  const hit = cache[period];
  if (hit && now - hit.at < TTL * 1000) {
    return NextResponse.json({ period, updatedAt: hit.at, entries: hit.data });
  }

  if (inflight[period]) {
    const data = await inflight[period];
    return NextResponse.json({ period, updatedAt: cache[period]?.at ?? now, entries: data });
  }

  inflight[period] = buildLeaderboard(period);
  try {
    const data = await inflight[period];
    cache[period] = { at: Date.now(), data };
    return NextResponse.json({ period, updatedAt: cache[period].at, entries: data });
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

async function buildLeaderboard(period: Period): Promise<Entry[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const sinceISO = since(period).toISOString();
  const byUser: Record<string, Entry> = Object.create(null);

  // helper: safely add to a user's totals
  const add = (login?: string, avatar?: string | null, key?: string, pts = 0) => {
    if (!login || !key) return;
    if (!byUser[login]) {
      byUser[login] = {
        username: login,
        name: null,
        avatar_url: avatar ?? null,
        total_points: 0,
        breakdown: Object.create(null),
      };
    }
    const e = byUser[login]!;
    e.total_points += pts;
    e.breakdown[key] ??= { count: 0, points: 0 };
    e.breakdown[key].count += 1;
    e.breakdown[key].points += pts;
  };

  const linkNext = (link: string | null): string | null => {
    if (!link) return null;
    for (const part of link.split(",")) {
      const [u, rel] = part.split(";").map((s) => s?.trim());
      if (u && rel?.includes('rel="next"')) {
        return u.replace(/^<|>$/g, "");
      }
    }
    return null;
  };

  const paginateSearch = async (url: string, onItem: (it: any) => void) => {
    let next: string | null = url;
    let pages = 0;
    while (next && pages < 10) {
      pages++;
      const res = await fetch(next, { headers });
      if (!res.ok) break;
      const data = (await res.json()) as { items?: any[] } | undefined;
      for (const item of data?.items ?? []) onItem(item);
      next = linkNext(res.headers.get("link"));
    }
  };

  const paginate = async (url: string, onItem: (it: any) => void | Promise<void>) => {
    let next: string | null = url;
    let pages = 0;
    while (next && pages < 5) {
      pages++;
      const res = await fetch(next, { headers });
      if (!res.ok) break;
      const data = (await res.json()) as any[] | undefined;
      for (const item of data ?? []) await onItem(item);
      next = linkNext(res.headers.get("link"));
    }
  };

  const listRepos = async (): Promise<Array<{ name: string }>> => {
    const out: Array<{ name: string }> = [];
    let next: string | null = `https://api.github.com/orgs/${ORG}/repos?type=public&per_page=100&sort=updated`;
    while (next) {
      const res = await fetch(next, { headers });
      if (!res.ok) break;
      const data = (await res.json()) as Array<{ name: string }> | undefined;
      if (data?.length) out.push(...data);
      next = linkNext(res.headers.get("link"));
    }
    return out;
  };

  // PRs opened
  await paginateSearch(
    `https://api.github.com/search/issues?q=org:${ORG}+is:pr+created:>=${sinceISO}&per_page=100`,
    (i: any) => add(i.user?.login, i.user?.avatar_url, "PR opened", scores.prOpened)
  );

  // PRs merged
  await paginateSearch(
    `https://api.github.com/search/issues?q=org:${ORG}+is:pr+is:merged+merged:>=${sinceISO}&per_page=100`,
    (i: any) => add(i.user?.login, i.user?.avatar_url, "PR merged", scores.prMerged)
  );

  // Issues opened
  await paginateSearch(
    `https://api.github.com/search/issues?q=org:${ORG}+is:issue+created:>=${sinceISO}&per_page=100`,
    (i: any) => add(i.user?.login, i.user?.avatar_url, "Issue opened", scores.issueOpened)
  );

  // Reviews (approx via PRs)
  const repos = await listRepos();
  for (const r of repos) {
    await paginate(
      `https://api.github.com/repos/${ORG}/${r.name}/pulls?state=closed&sort=updated&direction=desc&per_page=50`,
      async (pr: any) => {
        const res = await fetch(
          `https://api.github.com/repos/${ORG}/${r.name}/pulls/${pr.number}/reviews?per_page=100`,
          { headers }
        );
        if (!res.ok) return;
        const reviews = (await res.json()) as any[] | undefined;
        for (const rv of reviews ?? []) {
          const login: string | undefined = rv.user?.login;
          if (!login) continue;
          const t: string | undefined = rv.submitted_at ?? pr.updated_at;
          if (t && new Date(t).toISOString() >= sinceISO) {
            add(login, rv.user?.avatar_url ?? null, "Review", scores.review);
          }
        }
      }
    );
  }

  // Enrich names (best-effort)
  const logins = Object.keys(byUser).slice(0, 50);
  await Promise.all(
    logins.map(async (login) => {
      const uRes = await fetch(`https://api.github.com/users/${login}`, { headers });
      if (!uRes.ok) return;
      const u = (await uRes.json()) as { name?: string; avatar_url?: string } | undefined;
      const entry = byUser[login];
      if (entry) {
        entry.name = u?.name ?? entry.name ?? null;
        entry.avatar_url = entry.avatar_url ?? u?.avatar_url ?? null;
      }
    })
  );

  return Object.values(byUser)
    .filter((e) => e.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points);
}
