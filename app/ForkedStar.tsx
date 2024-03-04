"use client";

import { env } from "@/env.mjs";
import { useEffect, useMemo, useState } from "react";
import { GoRepoForked } from "react-icons/go";
import { GoStar } from "react-icons/go";

function ForkedStar(props: any) {
  const [data, setData] = useState<any>();
  let forkCount = 0;
  let starCount = 0;

  useMemo(async () => {
    const res = await fetch(
      `https://api.github.com/orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/repos`,
    );
    setData(await res.json());
  }, []);

  data?.map((ls: any) => {
    if (ls.forks) {
      forkCount += ls.forks;
    }
    if (ls.stargazers_count) {
      starCount += ls.stargazers_count;
    }
    // console.log(ls.full_name, ls.forks, ls.stargazers_count);
  });
  console.log(forkCount);

  return (
    <div className="flex justify-center">
      {forkCount > 0 && starCount > 0 ? (
        <>
          <div className="flex items-center justify-center bg-violet-950 m-4 p-2 w-6/12 rounded-md border-2 border-slate-400 ">
            <GoRepoForked className=" text-lg font-bold mr-1 text-slate-500" />
            <div className="text-slate-300">Forked</div>
            <div className="bg-slate-900 py-2 px-4 rounded-md ml-4">
              {forkCount}
            </div>
          </div>
          <div className="flex items-center bg-violet-950 m-4 p-2 w-6/12 rounded-md border-2 border-slate-400">
            <GoStar className=" text-lg font-bold mr-1 text-slate-500" />
            <div className="text-slate-300">Starred</div>

            <div className="bg-slate-900 py-2 px-4 rounded-md ml-4">
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

export async function getStaticProps() {
  // Call an external API endpoint to get posts
  const res = await fetch(
    `https://api.github.com/orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/repos`,
  );
  const posts = await res.json();

  return {
    props: {
      posts,
    },
  };
}

export default ForkedStar;
