import { getLeaderboardData } from "@/app/api/leaderboard/functions";
import Leaderboard from "@/app/leaderboard/[duration]/Leaderboard";
import { calcDateRange, LeaderboardFilterDurations } from "@/lib/utils";
import { notFound } from "next/navigation";

type Params = Promise<{
  duration: (typeof LeaderboardFilterDurations)[number];
}>;

export async function generateStaticParams() {
  return LeaderboardFilterDurations.map((duration) => ({ duration }));
}

export default async function Page({ params }: { params: Params }) {
  const { duration } = await params;
  const dateRange = calcDateRange(duration);

  if (!dateRange) {
    return notFound();
  }

  const data = await getLeaderboardData(dateRange);

  return <Leaderboard data={data} duration={duration} />;
}
