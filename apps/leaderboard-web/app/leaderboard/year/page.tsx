import {
  getLeaderboard,
  getTopContributorsByActivity,
} from "@/lib/data/loader";
import { getDateRange } from "@/lib/utils";
import { getConfig } from "@/lib/config/get-config";
import { getHiddenRoles } from "@/lib/config/helpers";
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
