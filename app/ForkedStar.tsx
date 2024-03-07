// const { Octokit } = require("@octokit/action");
const { Octokit } = require("octokit"); // Use this for local development
import { env } from "@/env.mjs";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";

const GITHUB_TOKEN = env.GITHUB_TOKEN;
const GITHUB_ORG = env.GITHUB_ORG;

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export default async function ForkedStar() {
  let count = { forkCount: 0, starCount: 0 };

  const data = await getData();

  data?.map((ls: { forks: number; stargazers_count: number }) => {
    if (ls.forks) {
      count.forkCount += ls.forks;
    }
    if (ls.stargazers_count) {
      count.starCount += ls.stargazers_count;
    }
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
    `GET /orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/repos`,
    {
      org: GITHUB_ORG,
      per_page: 1000,
    },
    (res: {
      data: { name: string; forks: number; stargazers_count: number }[];
    }) => {
      const data = res.data.map((ls) => {
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
