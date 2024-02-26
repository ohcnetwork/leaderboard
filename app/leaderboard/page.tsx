import { getLeaderboardData } from "../api/leaderboard/functions";
import Leaderboard, { LeaderboardSortKey } from "./Leaderboard";
import { parseDateRangeSearchParam } from "@/lib/utils";

type PageProps = {
  searchParams: {
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey | `-${LeaderboardSortKey}`;
    role?: ("core" | "intern" | "operations" | "contributor")[];
  };
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const data = await getLeaderboardData(
    parseDateRangeSearchParam(searchParams.between),
    searchParams.sortBy ?? "-points",
    // @ts-ignore
    (searchParams.role?.split(",") as (
      | "core"
      | "intern"
      | "operations"
      | "contributor"
    )[]) ?? [],
  );
  return <Leaderboard data={data} />;
}
