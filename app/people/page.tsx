import LoadingText from "@/components/LoadingText";
import { Suspense } from "react";
import ContributorWrapper from "./_components/ContributorWrapper";
import { PageProps } from "@/lib/types";
import TextSearchBar from "@/components/TextSearchBar";
export default async function Page({ searchParams }: PageProps) {
  const keyString = `search=${searchParams?.search}`;
  return (
    <div className="mx-auto mb-20 flex max-w-full flex-col items-center justify-center gap-8 px-24">
      <div className="mx-4 mt-4 w-full rounded-lg border border-primary-500 p-4 md:mx-0">
        <TextSearchBar searchString={searchParams.search} />
      </div>
      <Suspense
        key={keyString}
        fallback={<LoadingText text="Finding the contributors" />}
      >
        <ContributorWrapper searchString={searchParams.search} />
      </Suspense>
    </div>
  );
}
