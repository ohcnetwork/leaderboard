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
    role?: ("core" | "intern" | "operations" | "contributor")[];
    ordering?: "asc" | "desc";
  };
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  return (
    <section className="border-t border-gray-300 bg-background text-foreground dark:border-gray-700">
      <div className="mx-auto max-w-6xl">
        <Searchbar searchParams={searchParams} />
        <div className="mx-4 border-gray-600 xl:mx-0">
          <Suspense fallback={<LoadingText text="Ranking the contributors" />}>
            <LeaderboardWrapper searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
