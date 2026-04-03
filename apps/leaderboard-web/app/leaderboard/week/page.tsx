import { getConfig } from "@/lib/config/get-config";
import { getHiddenRoles, getRoles } from "@/lib/config/helpers";
import {
  getLeaderboard,
  getTopContributorsByActivity,
} from "@/lib/data/loader";
import { getDateRange } from "@/lib/utils";
import { Suspense } from "react";
import LeaderboardView from "../LeaderboardView";

export default async function WeeklyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("week");
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
        period="week"
        startDate={startDate}
        endDate={endDate}
        topByActivity={topByActivity}
        hiddenRoles={getHiddenRoles()}
        roles={getRoles()}
      />
    </Suspense>
  );
}
