import { getLeaderboard, getTopContributorsByActivity } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import { getConfig } from "@/lib/config";
import LeaderboardView from "../LeaderboardView";

export default async function MonthlyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("month");
  const [entries, topByActivity] = await Promise.all([
    getLeaderboard(startDate, endDate),
    getTopContributorsByActivity(startDate, endDate, config.leaderboard.top_contributors),
  ]);

  return (
    <LeaderboardView
      entries={entries}
      period="month"
      startDate={startDate}
      endDate={endDate}
      topByActivity={topByActivity}
    />
  );
}

