import { getLeaderboardData } from "@/app/api/leaderboard/functions";
import Leaderboard from "@/app/leaderboard/[duration]/Leaderboard";
import { calcDateRange, LeaderboardFilterDurations } from "@/lib/utils";
import { notFound } from "next/navigation";

type Props = {
  params: { duration: (typeof LeaderboardFilterDurations)[number] };
};

export async function generateStaticParams() {
  return LeaderboardFilterDurations.map((duration) => ({ duration }));
}

export default async function Page({ params }: Props) {
  const dateRange = calcDateRange(params.duration);

  if (!dateRange) {
    return notFound();
  }

  const data = await getLeaderboardData(dateRange);

  return <Leaderboard data={data} duration={params.duration} />;
}
