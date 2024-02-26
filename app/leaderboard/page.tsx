import { Suspense } from "react";
import Leaderboard, { LeaderboardSortKey } from "./Leaderboard";
import LeaderboardWrapper from "./_components/LeaderboardWrapper";
import LoadingText from "@/components/LoadingText";

type PageProps = {
  searchParams: {
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey | `-${LeaderboardSortKey}`;
    roles?: string; // typeof subsetOf("core", "intern", "operations", "contributor").join(',')
  };
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  return (
    <section className="bg-background text-foreground border-t dark:border-gray-700 border-gray-300">
      <Suspense fallback={<LoadingText text="Ranking the contributors" />}>
        <LeaderboardWrapper searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
