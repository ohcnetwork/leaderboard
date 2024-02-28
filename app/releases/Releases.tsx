import Link from "next/link";
import Markdown from "@/components/Markdown";
import { FiGithub } from "react-icons/fi";
import { env } from "@/env.mjs";
import fetchGitHubReleases from "../api/leaderboard/functions";
import Image from "next/image";

export default async function Releases(props: { className?: string }) {
  const accessToken = env.GITHUB_PAT;

  if (!accessToken) {
    if (env.NODE_ENV === "development") {
      console.error("'GITHUB_PAT' is not configured in the environment.");
      return (
        <>
          <span className="flex w-full justify-center py-10 text-lg font-semibold text-gray-600 dark:text-gray-400">
            No recent releases
          </span>
        </>
      );
    }

    throw "'GITHUB_PAT' is not configured in the environment.";
  }

  const sortedReleases = await fetchGitHubReleases(10);

  return (
    <>
      <div>
        <ul className="space-y-10">
          {sortedReleases.map((release) => (
            <li
              key={release.createdAt}
              className="flex flex-col rounded-lg border shadow-sm dark:border-gray-700"
            >
              <div className="flex items-center justify-between p-6 pb-0 pt-4">
                <div className="flex items-center">
                  <a
                    href={`https://github.com/coronasafe/${release.repository}`}
                    target="_blank"
                    className={`font-mono font-bold tracking-wide text-gray-700 dark:text-gray-300`}
                  >
                    <span className="pr-0.5 tracking-normal text-gray-400">
                      {env.NEXT_PUBLIC_GITHUB_ORG}/{release.repository}
                    </span>
                  </a>
                </div>
                <a
                  href={release.url}
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:text-gray-200 hover:dark:bg-gray-800 hover:dark:text-gray-100"
                >
                  <FiGithub />
                  Open in GitHub
                </a>
              </div>

              <div className="flex flex-col p-6">
                <h3 className={`font-semibold`}>{release.name}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                <div className="mt-3 flex gap-2">
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-10">
                    {release.mentions.nodes.map((contributor) => (
                      <Link
                        href={`https://github.com/${contributor.login}`}
                        target="_blank"
                        className="flex"
                        key={contributor.avatarUrl}
                      >
                        <Image
                          src={contributor.avatarUrl}
                          height={40}
                          width={40}
                          alt={contributor.login}
                          className="h-10 w-10 rounded-full"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="break-all bg-gray-100 p-6 text-sm dark:bg-gray-800 ">
                <Markdown>{release.description}</Markdown>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
