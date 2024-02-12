import Leaderboard, { LeaderboardSortKey } from "./Leaderboard";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { getLeaderboardData } from "../api/leaderboard/route";

type PageProps = {
  searchParams: {
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey | `-${LeaderboardSortKey}`;
    roles?: string; // typeof subsetOf("core", "intern", "operations", "contributor").join(',')
  };
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const data = await getLeaderboardData(
    parseDateRangeSearchParam(searchParams.between),
    searchParams.sortBy ?? "-points",
  );

  return <Leaderboard data={data} />;
}
