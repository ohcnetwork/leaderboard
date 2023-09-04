import { Contributor } from "@/lib/types";
import Link from "next/link";
import { FiAlertTriangle } from "react-icons/fi";

/* eslint-disable @next/next/no-img-element */
export default function LeaderBoardCard({
  contributor,
  position,
}: {
  contributor: Contributor;
  position: number;
}) {
  const userPosition = position + 1;
  const hideBadges = position === -1;
  let badgeColors = "bg-gray-400 dark:bg-gray-800 border-black/20";

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
    <Link href={"/contributors/" + contributor.github} className="block">
      <div className="flex border-2 border-transparent hover:border-primary-400 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out transform rounded-lg p-4 md:items-center px-2 sm:px-6 md:py-0 py-2 cursor-pointer">
        {!hideBadges && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr text-white ${badgeColors} border-4 mr-4 shrink-0`}
          >
            {position + 1}
          </div>
        )}
        <div className="flex md:flex-row flex-col md:items-center justify-between w-full py-4">
          <div className="flex w-full">
            <div className="min-w-0 flex-1 flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full"
                  src={`https://avatars.githubusercontent.com/${contributor.github}`}
                  alt={contributor.github}
                />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-green-500 truncate">
                  {contributor.name}
                </div>
                <p className="mt-2 flex items-center text-sm text-foreground">
                  <span className="truncate">{contributor.title}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 flex items-center justify-between">
            <div className="md:block">
              <dl>
                <dt className="text-sm leading-5 font-medium text-foreground truncate">
                  PRs
                </dt>
                <dd className="flex">
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-sm leading-5 font-semibold text-gray-500 dark:text-gray-100">
                      {contributor.weekSummary.pr_opened}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      opened
                    </span>
                    <span className="ml-2 text-sm leading-5 font-semibold text-gray-500 dark:text-gray-100">
                      {contributor.weekSummary.pr_reviewed}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      reviewed
                    </span>
                    <span className="ml-2 text-sm leading-5 font-semibold text-gray-500 dark:text-gray-100">
                      {contributor.weekSummary.pr_merged}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      merged
                    </span>
                  </div>
                </dd>
                {contributor.weekSummary?.pr_stale ? (
                  <dd className="flex mt-2">
                    <div className="flex items-center">
                      <span className="flex text-sm leading-5 text-yellow-500 dark:text-yellow-200">
                        <FiAlertTriangle size={18} className="mr-2" />{" "}
                        {contributor.weekSummary?.pr_stale} stale
                      </span>
                    </div>
                  </dd>
                ) : null}
              </dl>
              <dl className="">
                <dt className="text-sm leading-5 font-medium text-foreground truncate mt-4">
                  Activity
                </dt>
                <dd className="flex">
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-sm leading-5 font-semibold text-gray-500 dark:text-gray-100">
                      {contributor.weekSummary.eod_update}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-foreground">
                      EOD updates
                    </span>
                    <span className="ml-2 text-sm leading-5 font-semibold text-gray-500 dark:text-gray-100">
                      {contributor.weekSummary.comment_created}
                    </span>

                    <span className="ml-2 text-sm leading-5 font-semibold text-gray-500 dark:text-gray-100">
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
