import { getLeaderboard } from "@/lib/db";
import { getDateRange } from "@/lib/utils";
import LeaderboardView from "../LeaderboardView";

export default async function WeeklyLeaderboardPage() {
  const { startDate, endDate } = getDateRange("week");
  const entries = await getLeaderboard(startDate, endDate);

  return <LeaderboardView entries={entries} period="week" />;
}

