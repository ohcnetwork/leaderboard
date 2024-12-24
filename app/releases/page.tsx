import fetchGitHubReleases from "@/app/api/leaderboard/functions";
import Image from "next/image";
import Markdown from "@/components/Markdown";
import Link from "next/link";
import { FiGithub } from "react-icons/fi";
import { formatDate } from "@/lib/utils";
import { GoTag } from "react-icons/go";
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

  let myyRepos = new Set<string>();
  releases.map((release) => {
    myyRepos.add(release.repository);
  });

  return (
    <div>
      <ul className="space-y-10">
        {releases.map((release) => (
          <li
            key={release.createdAt}
            className="flex flex-col rounded-lg border shadow-sm dark:border-secondary-700"
          >
            <div className="flex items-center justify-between p-3 pb-0 pt-4 sm:p-6">
              <div className="flex items-center">
                <h3
                  className={` justify-center  text-lg font-semibold sm:flex sm:text-2xl`}
                >
                  {release.repository}
                  {" - "}
                  <GoTag
                    className="relative hidden pt-1 text-lg sm:inline sm:pt-1.5 "
                    size={30}
                    color="green"
                  />
                  {release.name}
                  {myyRepos.has(release.repository) &&
                    myyRepos.delete(release.repository) && (
                      <span className="relative ml-2 rounded-full border border-green-700 px-1 pb-1 pt-2 text-xs text-green-700">
                        Latest
                      </span>
                    )}
                </h3>
              </div>
              <a
                href={release.url}
                target="_blank"
                className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-xs text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100 sm:text-sm"
              >
                <FiGithub />
                <span className="hidden sm:inline">Open in GitHub</span>
              </a>
            </div>

            <div className="flex flex-col p-6">
              <p className="text-xs text-secondary-700 dark:text-secondary-300 sm:text-sm">
                Released by{" "}
                <a
                  href={`https://github.com/${release.author.login}`}
                  target="_blank"
                  className="text-sm font-semibold sm:text-base"
                >
                  {release.author.login}
                </a>{" "}
                on {formatDate(new Date(release.createdAt))}
              </p>
            </div>

            <div className="p-6 pt-0 text-sm sm:text-base">
              <p>Contributors - </p>
              <div className="mt-3 flex gap-2">
                <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
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

            <div className="break-all bg-secondary-100 p-6 text-xs dark:bg-secondary-800 sm:text-sm ">
              <Markdown>{release.description}</Markdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
