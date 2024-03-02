import { getLeaderboardData } from "../../api/leaderboard/functions";
import { parseDateRangeSearchParam } from "@/lib/utils";
import Leaderboard from "./Leaderboard";
import { LeaderboardPageProps } from "@/lib/types";

export default async function LeaderboardWrapper({
  searchParams,
}: LeaderboardPageProps) {
  const data = await getLeaderboardData(
    parseDateRangeSearchParam(searchParams.between),
    searchParams.sortBy ?? "points",
    searchParams.ordering ?? "desc",
    // @ts-ignore
    (searchParams.role?.split(",") as (
      | "core"
      | "intern"
      | "operations"
      | "contributor"
    )[]) ?? [],
  );

  return <Leaderboard data={data} searchParams={searchParams} />;
}
