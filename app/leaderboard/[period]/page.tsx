// app/leaderboard/[period]/page.tsx
import Image from "next/image";
import { headers } from "next/headers";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Entry = {
  username: string;
  name: string | null;
  avatar_url: string | null;
  total_points: number;
  breakdown: Record<string, { count: number; points: number }>;
};

// Build absolute base URL for server fetch (no relative URLs)
async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const https = process.env.VERCEL === "1" || h.get("x-forwarded-proto") === "https";
  return `${https ? "https" : "http"}://${host}`;
}

async function fetchLeaderboard(period: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || (await getBaseUrl());
  const res = await fetch(`${base}/api/leaderboard/${period}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json() as Promise<{ period: string; updatedAt: number; entries: Entry[] }>;
}

// Deterministic IST formatter (no toLocaleString → avoids hydration mismatches)
function formatIST(utcMillis: number): string {
  // Convert to IST (UTC+5:30) without relying on locale/timezone libs
  const utc = new Date(utcMillis);
  const istMillis = utc.getTime() + utc.getTimezoneOffset() * 60000 + 5.5 * 3600000;
  const d = new Date(istMillis);

  const dd = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[d.getMonth()];
  const yyyy = d.getFullYear();

  let hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  const hhStr = String(hh).padStart(2, "0");

  // Example: 12 Dec 2025, 11:44:32 PM IST
  return `${dd} ${mon} ${yyyy}, ${hhStr}:${mm}:${ss} ${ampm} IST`;
}

export default async function LeaderboardPeriodPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  const valid = (["week", "month", "year"] as const).includes(period as any) ? (period as "week"|"month"|"year") : "week";

  const config = getConfig();
  const { entries, updatedAt } = await fetchLeaderboard(valid);
  const updatedIST = formatIST(updatedAt); // stable string

  return (
    <div className="mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 capitalize">{valid} Leaderboard</h1>
        <p className="text-muted-foreground">Showing contributors from the last {valid}.</p>
        <p className="text-xs mt-2 text-muted-foreground" suppressHydrationWarning>
          Last updated: {updatedIST}
        </p>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entries.map((entry, idx) => {
          const avatar = entry.avatar_url ?? "/default-avatar.png";
          return (
            <div key={entry.username} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">#{idx + 1}</span>
                <span className="text-sm font-medium">{entry.total_points} pts</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12">
                  <Image src={avatar} alt={entry.username} fill className="rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{entry.name ?? entry.username}</p>
                  <p className="text-sm text-muted-foreground">@{entry.username}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                {Object.entries(entry.breakdown).map(([type, stats]) => {
                  const per = stats.count ? Math.round(stats.points / stats.count) : 0;
                  return (
                    <div key={type} className="flex justify-between">
                      <span>{type}</span>
                      <span>{stats.count} × {per} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <p className="text-center mt-10 text-muted-foreground">No activity recorded yet for this period.</p>
      )}

      <p className="text-center text-xs text-muted-foreground mt-8">
        Data sourced from GitHub for {config.org.name}. Cached for ~15–20 minutes.
      </p>
    </div>
  );
}
