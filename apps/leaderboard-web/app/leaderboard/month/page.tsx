import { getLeaderboard, getTopContributorsByActivity } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import { getConfig, getHiddenRoles } from "@/lib/config";
import LeaderboardView from "../LeaderboardView";
import { Suspense } from "react";

export default async function MonthlyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("month");
  const [entries, topByActivity] = await Promise.all([
    getLeaderboard(startDate, endDate),
    getTopContributorsByActivity(
      startDate,
      endDate,
      config.leaderboard.top_contributors
    ),
  ]);

  return (
    <Suspense fallback={<></>}>
      <LeaderboardView
        entries={entries}
        period="month"
        startDate={startDate}
        endDate={endDate}
        topByActivity={topByActivity}
        hiddenRoles={getHiddenRoles()}
      />
    </Suspense>
  );
}
