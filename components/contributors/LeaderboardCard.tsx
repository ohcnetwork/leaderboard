import { LeaderboardAPIResponse } from "@/lib/types";
import Link from "next/link";
import { FiAlertTriangle } from "react-icons/fi";
import ContributorImage from "@/components/contributors/ContributorImage";

export default function LeaderboardCard({
  contributor,
  position,
}: {
  contributor: LeaderboardAPIResponse[number];
  position: number;
}) {
  const userPosition = position + 1;
  const hideBadges = position === -1;
  let badgeColors = "bg-secondary-400 dark:bg-secondary-800 border-black/20";

  switch (userPosition) {
    case 1:
      badgeColors = "from-yellow-600 to-yellow-200 border-yellow-700";
      break;

    case 2:
      badgeColors = "from-stone-600 to-stone-300 border-stone-700";
      break;

    case 3:
      badgeColors = "from-[#804A00] to-[#A97142] border-amber-900";
      break;

    default:
      break;
  }

  return (
    <Link
      href={"/contributors/" + contributor.user.social.github}
      className="block"
    >
      <div className="flex cursor-pointer justify-center space-y-4 rounded-lg border-2 border-transparent p-4 px-2 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary-400 hover:shadow-lg sm:px-6 md:items-center md:py-0">
        {!hideBadges && (
          <div
            className={`my-6 ml-3 flex h-10 w-[40px] items-center justify-center rounded-full bg-gradient-to-tr text-white ${badgeColors} mr-4 shrink-0 border-4 max-sm:h-8 max-sm:w-[32px]`}
          >
            {position + 1}
          </div>
        )}
        <div className="flex w-full flex-col justify-between pb-2 md:flex-row md:items-center">
          <div className="flex w-full">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 md:flex-nowrap md:gap-0">
              <ContributorImage
                contributorGithub={contributor.user.social.github}
                rank={position + 1}
                size="large"
              />
              <div className="ml-4 mr-4 basis-3/5 text-wrap">
                <div className="w-[180px] truncate font-bold text-green-500">
                  {contributor.user.name}
                </div>
                <p className="flex items-center text-sm  ">
                  <span className="truncate text-wrap">
                    {contributor.user.title}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="mt-4 md:mt-0 md:block">
              <dl>
                <dt className="truncate text-sm font-medium leading-5 text-foreground">
                  PRs
                </dt>
                <dd className="flex">
                  <div className="flex flex-wrap items-center md:flex-nowrap">
                    <svg
                      className="h-5 w-5 shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-sm font-semibold leading-5 text-secondary-500 dark:text-secondary-100">
                      {contributor.highlights.pr_opened}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      opened
                    </span>
                    <span className="ml-2 text-sm font-semibold leading-5 text-secondary-500 dark:text-secondary-100">
                      {contributor.highlights.pr_reviewed}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      reviewed
                    </span>
                    <span className="ml-2 text-sm font-semibold leading-5 text-secondary-500 dark:text-secondary-100">
                      {contributor.highlights.pr_merged}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      merged
                    </span>
                  </div>
                </dd>
                {contributor.highlights.pr_stale ? (
                  <dd className="mt-2 flex">
                    <div className="flex items-center">
                      <span className="flex text-sm leading-5 text-yellow-500 dark:text-yellow-200">
                        <FiAlertTriangle size={18} className="mr-2" />{" "}
                        {contributor.highlights.pr_stale} stale
                      </span>
                    </div>
                  </dd>
                ) : null}
              </dl>
              <dl className="">
                <dt className="mt-4 truncate text-sm font-medium leading-5 text-foreground">
                  Activity
                </dt>
                <dd className="flex">
                  <div className="flex flex-wrap items-center md:flex-nowrap">
                    <svg
                      className="h-5 w-5 shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-sm font-semibold leading-5 text-secondary-500 dark:text-secondary-100">
                      {contributor.highlights.eod_update}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      EOD updates
                    </span>
                    <span className="ml-2 text-sm font-semibold leading-5 text-secondary-500 dark:text-secondary-100">
                      {contributor.highlights.comment_created}
                    </span>

                    <span className="ml-2 text-sm font-semibold leading-5 text-secondary-500 dark:text-secondary-100">
                      Comments
                    </span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </Link>
  );
}
