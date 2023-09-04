import { getContributors } from "@/lib/api";
import Leaderboard from "./Leaderboard";

const calculateStalePrs = (contributor: any) =>
  contributor.activityData?.open_prs?.reduce(
    (acc: any, pr: any) => (pr?.stale_for >= 7 ? acc + 1 : acc),
    0,
  );

function getContributorsData() {
  const contributors = getContributors();
  return contributors.map((contributor: any) => ({
    ...contributor,
    weekSummary: {
      ...contributor.weekSummary,
      pr_stale: calculateStalePrs(contributor),
    },
  }));
}

export default function LeaderboardPage() {
  const contributors = getContributorsData();
  return <Leaderboard contributorsList={contributors} />;
}
