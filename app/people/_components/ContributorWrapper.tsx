import { parseDateRangeSearchParam } from "@/lib/utils";
import ContributorsPage from "./ContributorsPage";
import { getContributorsData } from "@/app/api/leaderboard/functions";
import { Contributor, ContributorsPageProps } from "@/lib/types";

export default async function ContributorWrapper({
  searchParams,
}: ContributorsPageProps) {
  const data = await getContributorsData();
  return <ContributorsPage contributors={data} searchParams={searchParams} />;
}
