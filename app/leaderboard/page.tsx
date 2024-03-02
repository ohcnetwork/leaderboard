import { Suspense } from "react";
import LeaderboardWrapper from "./_components/LeaderboardWrapper";
import LoadingText from "@/components/LoadingText";
import Searchbar from "./_components/Searchbar";
import type { LeaderboardPageProps } from "@/lib/types";

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
