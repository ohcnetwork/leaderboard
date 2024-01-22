import { getContributors } from "@/lib/api";
import Leaderboard from "./Leaderboard";

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function LeaderboardPage({ searchParams }: PageProps) {
  const contributors = getContributors();
  return <Leaderboard contributorsList={contributors} />;
}
