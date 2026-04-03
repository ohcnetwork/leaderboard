import { getConfig } from "@/lib/config/get-config";
import { getHiddenRoles, getRoles } from "@/lib/config/helpers";
import {
  getLeaderboard,
  getTopContributorsByActivity,
} from "@/lib/data/loader";
import { getDateRange } from "@/lib/utils";
import { Suspense } from "react";
import LeaderboardView from "../LeaderboardView";

export default async function MonthlyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("month");
  const [entries, topByActivity] = await Promise.all([
    getLeaderboard(startDate, endDate),
    getTopContributorsByActivity(
      startDate,
      endDate,
      config.leaderboard.top_contributors,
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
        roles={getRoles()}
      />
    </Suspense>
  );
}
