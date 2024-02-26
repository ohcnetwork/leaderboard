import { getLeaderboardData } from "../../api/leaderboard/functions";
import { parseDateRangeSearchParam } from "@/lib/utils";
import Leaderboard, { LeaderboardSortKey } from "../Leaderboard";

export default async function LeaderboardWrapper({
  searchParams,
}: {
  searchParams: {
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey | `-${LeaderboardSortKey}`;
    roles?: string; // typeof subsetOf("core", "intern", "operations", "contributor").join(',')
  };
}) {
  const data = await getLeaderboardData(
    parseDateRangeSearchParam(searchParams.between),
    searchParams.sortBy ?? "-points",
  );

  return <Leaderboard data={data} />;
}
