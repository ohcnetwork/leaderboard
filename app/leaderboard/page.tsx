import { Suspense } from "react";
import LeaderboardWrapper from "./_components/LeaderboardWrapper";
import LoadingText from "@/components/LoadingText";
import Searchbar from "./_components/Searchbar";
import type { PageProps } from "@/lib/types";

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const keyString = `search=${searchParams?.search}`;
  return (
    <section className="border-t border-secondary-300 bg-background text-foreground dark:border-secondary-700">
      <div className="mx-auto max-w-6xl">
        <Searchbar searchParams={searchParams} />
        <div className="mx-4 border-secondary-600 xl:mx-0">
          <Suspense
            key={keyString}
            fallback={<LoadingText text="Ranking the contributors" />}
          >
            <LeaderboardWrapper searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
