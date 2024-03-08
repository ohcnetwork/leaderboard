import ContributorsPage from "./ContributorsPage";
import { getContributors } from "@/lib/api";
import { PageProps } from "@/lib/types";

export default async function ContributorWrapper({ searchParams }: PageProps) {
  const data = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  return <ContributorsPage contributors={data} searchParams={searchParams} />;
}
