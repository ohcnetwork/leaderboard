import ContributorPage from "./ContributorPage";
import { getContributors } from "@/lib/api";

export default async function ContributorWrapper({
  searchString,
}: {
  searchString: string | undefined;
}) {
  const data = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  return <ContributorPage data={data} searchString={searchString} />;
}
