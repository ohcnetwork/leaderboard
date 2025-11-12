import { getLeaderboard, getTopContributorsByActivity } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import { getConfig, getHiddenRoles } from "@/lib/config";
import LeaderboardView from "../LeaderboardView";

export default async function YearlyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("year");
  const [entries, topByActivity] = await Promise.all([
    getLeaderboard(startDate, endDate),
    getTopContributorsByActivity(
      startDate,
      endDate,
      config.leaderboard.top_contributors
    ),
  ]);

  return (
    <LeaderboardView
      entries={entries}
      period="year"
      startDate={startDate}
      endDate={endDate}
      topByActivity={topByActivity}
      hiddenRoles={getHiddenRoles()}
    />
  );
}
