import ContributorsPage from "./ContributorsPage";
import { getContributorsData } from "@/app/api/leaderboard/functions";
import { PageProps } from "@/lib/types";

export default async function ContributorWrapper({ searchParams }: PageProps) {
  const data = await getContributorsData();
  return <ContributorsPage contributors={data} searchParams={searchParams} />;
}
