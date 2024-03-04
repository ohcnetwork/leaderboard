import { LeaderboardSortKey } from "@/lib/types";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { getLeaderboardData } from "./functions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const dateRange = parseDateRangeSearchParam(searchParams.get("between"));
  const ordering = (searchParams.get("ordering") as "asc" | "desc") ?? "desc";
  const sortBy = (searchParams.get("sortBy") as LeaderboardSortKey) ?? "points";
  const roles =
    (searchParams.get("role")?.split(",") as (
      | "core"
      | "intern"
      | "operations"
      | "contributor"
    )[]) ?? [];

  const data = await getLeaderboardData(dateRange, sortBy, ordering, roles);

  return Response.json(data);
}
