import Link from "next/link";
import Markdown from "@/components/Markdown";
import { FiGithub } from "react-icons/fi";
import { env } from "@/env.mjs";
import fetchGitHubReleases from "../api/leaderboard/functions";

export default async function Releases(props: { className?: string }) {
  const accessToken = env.GITHUB_PAT;

  if (!accessToken) {
    if (env.NODE_ENV === "development") {
      console.error("'GITHUB_PAT' is not configured in the environment.");
      return (
        <>
          <span className="flex w-full justify-center text-gray-600 dark:text-gray-400 text-lg font-semibold py-10">
            No recent releases
          </span>
        </>
      );
    }

    throw "'GITHUB_PAT' is not configured in the environment.";
  }

  const sortedReleases = await fetchGitHubReleases(4);

  return (
    <>
      <div>
        <ul className="space-y-10">
          {sortedReleases.map((release) => (
            <li
              key={release.createdAt}
              className="flex flex-col rounded-lg border shadow-sm dark:border-gray-700"
            >
              <div className="flex justify-between items-center p-6 pt-4 pb-0">
                <div className="flex items-center">
                  <a
                    href={`https://github.com/coronasafe/${release.repository}`}
                    target="_blank"
                    className={`font-mono text-gray-700 dark:text-gray-300 font-bold tracking-wide`}
                  >
                    <span className="text-gray-400 tracking-normal pr-0.5">
                      {env.NEXT_PUBLIC_GITHUB_ORG}/{release.repository}
                    </span>
                  </a>
                </div>
                <a
                  href={release.url}
                  target="_blank"
                  className="rounded-lg border text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center text-sm gap-2 transition-colors hover:bg-gray-100 hover:text-gray-900 hover:dark:bg-gray-800 hover:dark:text-gray-100"
                >
                  <FiGithub />
                  Open in GitHub
                </a>
              </div>

              <div className="flex flex-col p-6">
                <h3 className={`font-semibold`}>{release.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Released by{" "}
                  <a
                    href={`https://github.com/${release.author.login}`}
                    target="_blank"
                    className="font-semibold"
                  >
                    {release.author.login}
                  </a>{" "}
                </p>
              </div>

              <div className="p-6 pt-0">
                <p>Contributors - </p>
                <div className="flex gap-2 mt-3">
                  <div className="grid grid-cols-3 md:grid-cols-10 gap-3">
                    {release.mentions.nodes.map((contributor) => (
                      <Link
                        href={`https://github.com/${contributor.login}`}
                        target="_blank"
                        className="flex"
                        key={contributor.avatarUrl}
                      >
                        <img
                          src={contributor.avatarUrl}
                          alt="img"
                          className="w-10 h-10 rounded-full"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 text-sm break-all bg-gray-100 dark:bg-gray-800 ">
                <Markdown>{release.description}</Markdown>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
