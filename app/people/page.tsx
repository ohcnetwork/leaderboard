import Searchbar from "./_components/Searchbar";
import { Suspense } from "react";
import ContributorWrapper from "./_components/ContributorWrapper";
import { ContributorsPageProps } from "@/lib/types";
import LoadingText from "@/components/LoadingText";

export default async function Page({ searchParams }: ContributorsPageProps) {
  return (
    <div className="mx-auto mb-20 flex max-w-full flex-col items-center justify-center gap-8 px-24">
      <Searchbar searchParams={searchParams} />
      <Suspense fallback={<LoadingText text="Finding the contributors" />}>
        <ContributorWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
