import octokit from "@/lib/octokit";
import { env } from "@/env.mjs";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";
import { GoPeople } from "react-icons/go";
import { getContributorsSlugs } from "@/lib/api";

export default async function CommunityEngagemet() {
  const data = await octokit.paginate(
    "GET /orgs/{org}/repos",
    {
      org: env.NEXT_PUBLIC_GITHUB_ORG,
      per_page: 1000,
      sort: "updated",
      direction: "desc",
    },
    (res) =>
      res.data.map((obj) => ({
        forks: obj.forks ?? 0,
        stars: obj.stargazers_count ?? 0,
      })),
  );

  const { forks, stars } = data.reduce(
    (acc, obj) => ({
      forks: acc.forks + obj.forks,
      stars: acc.stars + obj.stars,
    }),
    { forks: 0, stars: 0 },
  );

  const contributors = await getContributorsSlugs();

  return (
    <div className="flex justify-between">
      <div className="m-4 flex w-4/12 items-center justify-center rounded-md border border-secondary-200 bg-secondary-100 p-2 dark:border-secondary-700 dark:bg-secondary-800">
        <GoRepoForked className="mr-2 text-lg font-bold text-foreground" />
        <div className="font-bold tracking-wider">{forks}</div>
      </div>
      <div className="m-4 flex w-4/12 items-center justify-center rounded-md border border-secondary-200 bg-secondary-100 p-2 dark:border-secondary-700 dark:bg-secondary-800">
        <GoStar className="mr-2 text-lg font-bold text-foreground" />

        <div className="font-bold tracking-wider">{stars}</div>
      </div>
      <div className="m-4 flex w-4/12 items-center justify-center rounded-md border border-secondary-200 bg-secondary-100 p-2 dark:border-secondary-700 dark:bg-secondary-800">
        <GoPeople className="mr-2 text-lg font-bold text-foreground" />

        <div className="font-bold tracking-wider">{contributors?.length}</div>
      </div>
    </div>
  );
}
