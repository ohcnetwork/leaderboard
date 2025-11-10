import { getLeaderboard } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import LeaderboardView from "../LeaderboardView";

export default async function YearlyLeaderboardPage() {
  const { startDate, endDate } = getDateRange("year");
  const entries = await getLeaderboard(startDate, endDate);

  return <LeaderboardView entries={entries} period="year" />;
}

