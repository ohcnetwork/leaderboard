import { getConfig } from "@/lib/config/get-config";
import {
  getHiddenRoles,
  getLeaderboardActivityDefinitions,
  getRoles,
} from "@/lib/config/helpers";
import {
  getActivities,
  getAllActivityDefinitions,
  getLeaderboard,
  getTopContributorsByActivity,
} from "@/lib/data/loader";
import { getDateRange, getPreviousDateRange } from "@/lib/utils";
import { Suspense } from "react";
import LeaderboardView from "../LeaderboardView";

export default async function YearlyLeaderboardPage() {
  const config = getConfig();
  const { startDate, endDate } = getDateRange("year");
  const { startDate: prevStart, endDate: prevEnd } =
    getPreviousDateRange("year");

  const [
    entries,
    previousEntries,
    allTimeEntries,
    topByActivity,
    activityDefinitions,
    periodActivities,
  ] = await Promise.all([
    getLeaderboard(startDate, endDate),
    getLeaderboard(prevStart, prevEnd),
    getLeaderboard(),
    getTopContributorsByActivity(
      startDate,
      endDate,
      config.leaderboard.top_contributors,
    ),
    getAllActivityDefinitions(),
    getActivities({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  ]);

  const hiddenRoles = getHiddenRoles();
  const configuredActivityDefs = getLeaderboardActivityDefinitions();
  const filteredActivityDefinitions = configuredActivityDefs
    ? configuredActivityDefs
        .map((slug) => activityDefinitions.find((d) => d.slug === slug))
        .filter((d) => d != null)
    : [];
  const hiddenRoleSet = new Set(hiddenRoles);
  const visibleEntries = entries.filter((e) => !hiddenRoleSet.has(e.role));
  const top3Usernames = new Set(
    visibleEntries.slice(0, 3).map((e) => e.username),
  );
  const defMap = new Map(activityDefinitions.map((d) => [d.slug, d]));
  const podiumActivities = periodActivities
    .filter((a) => top3Usernames.has(a.contributor))
    .map((a) => {
      const def = defMap.get(a.activity_definition);
      const entry = entries.find((e) => e.username === a.contributor);
      return {
        ...a,
        activity_name: def?.name || a.activity_definition,
        activity_icon: def?.icon || null,
        contributor_name: entry?.name || null,
        contributor_avatar_url: entry?.avatar_url || null,
      };
    });

  return (
    <Suspense fallback={<></>}>
      <LeaderboardView
        entries={entries}
        previousEntries={previousEntries}
        allTimeEntries={allTimeEntries}
        period="year"
        startDate={startDate}
        endDate={endDate}
        topByActivity={topByActivity}
        activityDefinitions={filteredActivityDefinitions}
        podiumActivities={podiumActivities}
        hiddenRoles={hiddenRoles}
        roles={getRoles()}
      />
    </Suspense>
  );
}
