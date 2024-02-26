import { Suspense } from "react";
import { LeaderboardSortKey } from "./_components/Leaderboard";
import LeaderboardWrapper from "./_components/LeaderboardWrapper";
import LoadingText from "@/components/LoadingText";
import Searchbar from "./_components/Searchbar";

export type LeaderboardPageProps = {
  searchParams: {
    search?: string;
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey | `-${LeaderboardSortKey}`;
    roles?: string; // typeof subsetOf("core", "intern", "operations", "contributor").join(',')
    ordering?: "asc" | "desc";
  };
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  return (
    <section className="bg-background text-foreground border-t dark:border-gray-700 border-gray-300">
      <div className="max-w-6xl mx-auto">
        <Searchbar searchParams={searchParams} />
        <div className="border-gray-600 mx-4 xl:mx-0"></div>
        <Suspense fallback={<LoadingText text="Ranking the contributors" />}>
          <LeaderboardWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
