import { getLeaderboard } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import LeaderboardView from "../LeaderboardView";

export default async function MonthlyLeaderboardPage() {
  const { startDate, endDate } = getDateRange("month");
  const entries = await getLeaderboard(startDate, endDate);

  return <LeaderboardView entries={entries} period="month" />;
}

