import { env } from "@/env.mjs";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";

export default async function ForkedStar() {
  let forkCount = 0;
  let starCount = 0;

  const data = await getData();

  data?.map((ls: any) => {
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
          <div className="flex items-center justify-center bg-primary-700 m-4 p-2 w-6/12 rounded-md border-2 border-gray-500 ">
            <GoRepoForked className=" text-lg font-bold mr-1 text-gray-300" />
            <div className="text-gray-300">Forked</div>
            <div className="bg-background py-2 px-4 rounded-md ml-4">
              {forkCount}
            </div>
          </div>
          <div className="flex items-center justify-center bg-primary-700 m-4 p-2 w-6/12 rounded-md border-2 border-gray-500">
            <GoStar className=" text-lg font-bold mr-1 text-gray-300" />
            <div className="text-gray-300">Starred</div>

            <div className="bg-background py-2 px-4 rounded-md ml-4">
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
  const res = await fetch(
    `https://api.github.com/orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/repos`,
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
