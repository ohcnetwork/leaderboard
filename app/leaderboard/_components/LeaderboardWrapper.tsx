import { getLeaderboardData } from "../../api/leaderboard/functions";
import { parseDateRangeSearchParam } from "@/lib/utils";
import Leaderboard from "./Leaderboard";
import { LeaderboardPageProps } from "../page";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function LeaderboardWrapper({
  searchParams,
}: LeaderboardPageProps) {
  const data = await getLeaderboardData(
    parseDateRangeSearchParam(searchParams.between),
    searchParams.sortBy ?? "-points",
  );

  return <Leaderboard data={data} searchParams={searchParams} />;
}
