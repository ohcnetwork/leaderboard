import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import fetchGitHubReleases from "@/app/api/leaderboard/functions";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { GoTag } from "react-icons/go";
export default async function ReleaseSection() {
  const releases = await fetchGitHubReleases(4);

  if (releases.length === 0) {
    return (
      <span className="flex w-full justify-center py-10 text-lg font-semibold text-secondary-600 dark:text-secondary-400">
        No recent releases
      </span>
    );
  }

  return (
    <div className="ml-5 grid grid-cols-1">
      <ol className="relative border-s border-secondary-200 dark:border-secondary-700">
        {releases.map((release) => (
          <li key={release.createdAt} className="group mb-10 ms-4">
            <div className="absolute left-[-18px] mt-1.5">
              <Image
                src={release.author.avatarUrl}
                alt="author-avatar"
                height={40}
                width={40}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-400 ring-8 ring-secondary-200 transition-all duration-200 ease-in-out group-hover:scale-125 group-hover:ring-2 dark:ring-secondary-800 group-hover:dark:ring-white/50"
              />
            </div>
            <div className="ml-10">
              <time className="mb-1 text-sm font-normal leading-none text-secondary-400 dark:text-secondary-400">
                <Link
                  href={`https://github.com/${release.author.login}`}
                  target="_blank"
                  className="font-semibold text-secondary-300"
                >
                  {release.author.login}
                </Link>{" "}
                released a new version on{" "}
                {formatDate(new Date(release.createdAt))}
              </time>
              <h3 className="flex text-lg font-semibold text-secondary-900 dark:text-secondary-300">
                {release.repository} -{" "}
                <GoTag
                  className="relative ml-1 mr-1.5 pt-1.5"
                  size={25}
                  color="#238636"
                />{" "}
                {release.name}
              </h3>
              <div className="mt-3 text-secondary-400">
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
                          alt={contributor.login}
                          height={40}
                          width={40}
                          className="h-10 w-10 rounded-full"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href={release.url}
                className="mt-5 inline-flex items-center rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-900 hover:bg-secondary-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:outline-none focus:ring-4 focus:ring-secondary-100 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-400 dark:hover:bg-secondary-700 dark:hover:text-white dark:focus:ring-secondary-700"
                target="_blank"
              >
                Open in Github{" "}
                <span className="ml-1">
                  <IoIosArrowRoundForward size={26} />
                </span>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
