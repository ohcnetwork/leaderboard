import octokit from "@/lib/octokit";
import { env } from "@/env.mjs";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";
import { GoPeople } from "react-icons/go";
import { getContributors } from "@/lib/api";

const GITHUB_ORG: string = env.NEXT_PUBLIC_GITHUB_ORG;

export default async function ForkedStar() {
  const count = await getData().then((data) => {
    return data.reduce(
      (acc, ls) => {
        if (ls.forks) {
          acc.forkCount += ls.forks;
        }
        if (ls.stargazers_count) {
          acc.starCount += ls.stargazers_count;
        }
        return acc;
      },
      { forkCount: 0, starCount: 0 },
    );
  });

  const contributors = await getContributors();

  return (
    <div className="flex justify-center">
      <>
        <div className="g-secondary-100 m-4 flex w-4/12 items-center justify-center rounded-md border-2 border-secondary-700 p-2 dark:bg-secondary-800">
          <GoRepoForked className="mr-2 text-lg font-bold text-secondary-200 " />
          <div className="tracking-wider/widest font-bold">
            {count.forkCount}
          </div>
        </div>
        <div className="g-secondary-100 m-4 flex w-4/12 items-center justify-center rounded-md border-2 border-secondary-700 p-2 dark:bg-secondary-800">
          <GoStar className="mr-2 text-lg font-bold text-secondary-200" />

          <div className="tracking-wider/widest font-bold">
            {count.starCount}
          </div>
        </div>
        <div className="g-secondary-100 m-4 flex w-4/12 items-center justify-center rounded-md border-2 border-secondary-700 p-2 dark:bg-secondary-800">
          <GoPeople className="mr-2 text-lg font-bold text-secondary-200" />

          <div className="tracking-wider/widest font-bold">
            {contributors?.length}
          </div>
        </div>
      </>
    </div>
  );
}

async function getData() {
  const res = await octokit.paginate(
    "GET /orgs/{org}/repos",
    {
      org: GITHUB_ORG,
      per_page: 1000,
    },
    (response) => {
      const data = response.data.map((ls) => {
        return {
          name: ls.name,
          forks: ls.forks,
          stargazers_count: ls.stargazers_count,
        };
      });
      return data;
    },
  );

  return res;
}
