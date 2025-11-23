import { getLeaderboard, getTopContributorsByActivity } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import { getConfig, getHiddenRoles } from "@leaderboard/core";
import LeaderboardView from "../LeaderboardView";
import { Suspense } from "react";

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
    <Suspense fallback={<></>}>
      <LeaderboardView
        entries={entries}
        period="year"
        startDate={startDate}
        endDate={endDate}
        topByActivity={topByActivity}
        hiddenRoles={getHiddenRoles()}
      />
    </Suspense>
  );
}
