import { getLeaderboard, getTopContributorsByActivity } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import { getConfig, getHiddenRoles } from "@/lib/config";
import LeaderboardView from "../LeaderboardView";

export default async function WeeklyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("week");
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
      period="week"
      startDate={startDate}
      endDate={endDate}
      topByActivity={topByActivity}
      hiddenRoles={getHiddenRoles()}
    />
  );
}
