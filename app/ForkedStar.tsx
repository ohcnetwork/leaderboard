import octokit from "@/lib/octokit";
import { env } from "@/env.mjs";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";

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

  return (
    <div className="flex justify-center">
      <>
        <div className="m-4 flex w-6/12 items-center justify-center rounded-md border-2 border-secondary-500 bg-primary-700 p-2">
          <GoRepoForked className="mr-1 text-lg font-bold text-secondary-100" />
          <div className="text-secondary-300">Forked</div>
          <div className="ml-4 rounded-md bg-background px-4 py-2">
            {count.forkCount}
          </div>
        </div>
        <div className="m-4 flex w-6/12 items-center justify-center rounded-md border-2 border-secondary-500 bg-primary-700 p-2">
          <GoStar className="mr-1 text-lg font-bold text-secondary-100" />
          <div className="text-secondary-300">Starred</div>

          <div className="ml-4 rounded-md bg-background px-4 py-2">
            {count.starCount}
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
