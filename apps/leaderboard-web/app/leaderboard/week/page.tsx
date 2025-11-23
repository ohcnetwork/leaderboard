import { getLeaderboard, getTopContributorsByActivity } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import { getConfig, getHiddenRoles } from "@leaderboard/core";
import LeaderboardView from "../LeaderboardView";
import { Suspense } from "react";

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
    <Suspense fallback={<></>}>
      <LeaderboardView
        entries={entries}
        period="week"
        startDate={startDate}
        endDate={endDate}
        topByActivity={topByActivity}
        hiddenRoles={getHiddenRoles()}
      />
    </Suspense>
  );
}
