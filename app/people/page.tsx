import SearchBar from "@/components/SearchBar";
import { Suspense } from "react";
import ContributorWrapper from "./_components/ContributorWrapper";
import { PageProps } from "@/lib/types";
import LoadingText from "@/components/LoadingText";

export default async function Page({ searchParams }: PageProps) {
  return (
    <div className="mx-auto mb-20 flex max-w-full flex-col items-center justify-center gap-8 px-24">
      <SearchBar
        searchParams={searchParams}
        isDaterange={false}
        isSort={false}
        isRoleFilter={false}
      />
      <Suspense fallback={<LoadingText text="Finding the contributors" />}>
        <ContributorWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
