import { getLeaderboardData } from "../../api/leaderboard/functions";
import { parseDateRangeSearchParam } from "@/lib/utils";
import Leaderboard from "./Leaderboard";
import { LeaderboardPageProps } from "../page";
import { deaultRoles } from "@/lib/const";

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
    )[]) ?? deaultRoles.map((i) => i.value),
  );

  return <Leaderboard data={data} searchParams={searchParams} />;
}
