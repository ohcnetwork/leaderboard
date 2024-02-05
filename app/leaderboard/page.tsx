import { getContributors } from "@/lib/api";
import { Contributor } from "@/lib/types";
import Leaderboard, { LeaderboardSortKey } from "./Leaderboard";
import { parseDateRangeSearchParam } from "@/lib/utils";

const getResultSet = async (searchParams: PageProps["searchParams"]) => {
  const [start, end] = parseDateRangeSearchParam(searchParams.between);
  const sortBy = searchParams.sortBy ?? "points";

  let data = (await getContributors()).filter((a) => a.highlights.points);

  const filterByRole = (contributor: Contributor) => {
    const roles = searchParams.roles?.split(",") ?? [];
    if (
      roles.includes("contributor") &&
      !contributor.intern &&
      !contributor.operations &&
      !contributor.core
    )
      return true;
    for (const role of roles) {
      if (contributor[role as "intern" | "operations" | "core"]) return true;
    }
    return false;
  };

  if (searchParams.roles) {
    data = data.filter(filterByRole);
  }

  const result = data
    .map((contributor) => ({
      ...contributor,
      summary: contributor.summarize(start, end),
      // Because functions are not serializable and cannot be passed as
      // prop to client components from a server component
      summarize: undefined,
    }))
    .filter((contributor) => contributor.summary.points)
    .sort((a, b) => {
      if (sortBy === "pr_stale") {
        return b.activityData.pr_stale - a.activityData.pr_stale;
      }
      return b.summary[sortBy] - a.summary[sortBy];
    });

  if (searchParams.ordering === "asc") {
    result.reverse();
  }

  return result;
};

export type LeaderboardResultSet = Awaited<ReturnType<typeof getResultSet>>;

type PageProps = {
  searchParams: {
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey;
    ordering?: "desc" | "asc";
    roles?: string; // typeof subsetOf("core", "intern", "operations", "contributor").join(',')
  };
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const resultSet = await getResultSet(searchParams);

  return <Leaderboard resultSet={resultSet} />;
}
