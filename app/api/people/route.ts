import { NextResponse } from "next/server";

const ORG = process.env.GITHUB_ORG ?? "CircuitVerse";
const TOKEN = process.env.GITHUB_TOKEN ?? "";
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 900);

let cache: { at: number; data: any[] } | null = null;

export const dynamic = "force-dynamic";

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL * 1000) {
    return NextResponse.json({ updatedAt: cache.at, people: cache.data });
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const res = await fetch(
    `https://api.github.com/orgs/${ORG}/members?per_page=100`,
    { headers }
  );
  const members = res.ok ? await res.json() : [];

  // enrich with names (best-effort)
  const enriched = await Promise.all(
    members.slice(0, 100).map(async (m: any) => {
      const uRes = await fetch(m.url, { headers });
      const u = uRes.ok ? await uRes.json() : {};
      return {
        username: m.login,
        name: u.name ?? null,
        avatar_url: m.avatar_url,
      };
    })
  );

  cache = { at: Date.now(), data: enriched };
  return NextResponse.json({ updatedAt: cache.at, people: enriched });
}
