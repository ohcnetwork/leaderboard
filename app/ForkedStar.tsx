// const { Octokit } = require("@octokit/action");
const { Octokit } = require("octokit");
import { env } from "@/env.mjs";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

export default async function ForkedStar() {
  let forkCount = 0;
  let starCount = 0;

  const data = await getData();

  data?.map((ls: { forks: number; stargazers_count: number }) => {
    if (ls.forks) {
      forkCount += ls.forks;
    }
    if (ls.stargazers_count) {
      starCount += ls.stargazers_count;
    }
  });

  return (
    <div className="flex justify-center">
      {forkCount > 0 && starCount > 0 ? (
        <>
          <div className="m-4 flex w-6/12 items-center justify-center rounded-md border-2 border-gray-500 bg-primary-700 p-2">
            <GoRepoForked className="mr-1 text-lg font-bold" />
            <div className="text-gray-300">Forked</div>
            <div className="ml-4 rounded-md bg-background px-4 py-2">
              {forkCount}
            </div>
          </div>
          <div className="m-4 flex w-6/12 items-center justify-center rounded-md border-2 border-gray-500 bg-primary-700 p-2">
            <GoStar className="mr-1 text-lg font-bold" />
            <div className="text-gray-300">Starred</div>

            <div className="ml-4 rounded-md bg-background px-4 py-2">
              {starCount}
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

async function getData() {
  const res = await octokit.paginate(
    `GET /orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/repos`,
    {
      org: env.NEXT_PUBLIC_GITHUB_ORG,
      per_page: 1000,
    },
  );

  return res;
}
