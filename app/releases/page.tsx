import fetchGitHubReleases from "@/app/api/leaderboard/functions";
import Image from "next/image";
import Markdown from "@/components/Markdown";
import Link from "next/link";
import { FiGithub } from "react-icons/fi";
import { env } from "@/env.mjs";

export const revalidate = 900; // revalidates atmost once every 15 mins

export default async function Page() {
  const releases = await fetchGitHubReleases(10);

  if (releases.length === 0) {
    return (
      <span className="flex w-full justify-center py-10 text-lg font-semibold text-secondary-600 dark:text-secondary-400">
        No recent releases
      </span>
    );
  }

  return (
    <div>
      <ul className="space-y-10">
        {releases.map((release) => (
          <li
            key={release.createdAt}
            className="flex flex-col rounded-lg border shadow-sm dark:border-secondary-700"
          >
            <div className="flex items-center justify-between p-6 pb-0 pt-4">
              <div className="flex items-center">
                <a
                  href={`https://github.com/coronasafe/${release.repository}`}
                  target="_blank"
                  className={`font-mono font-bold tracking-wide text-secondary-700 dark:text-secondary-300`}
                >
                  <span className="pr-0.5 tracking-normal text-secondary-400">
                    {env.NEXT_PUBLIC_GITHUB_ORG}/{release.repository}
                  </span>
                </a>
              </div>
              <a
                href={release.url}
                target="_blank"
                className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100"
              >
                <FiGithub />
                Open in GitHub
              </a>
            </div>

            <div className="flex flex-col p-6">
              <h3 className={`font-semibold`}>{release.name}</h3>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
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

            <div className="break-all bg-secondary-100 p-6 text-sm dark:bg-secondary-800 ">
              <Markdown>{release.description}</Markdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
