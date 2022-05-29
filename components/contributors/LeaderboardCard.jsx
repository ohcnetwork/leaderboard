import Link from "next/link";

/* eslint-disable @next/next/no-img-element */
export default function LeaderBoardCard({ contributor, position }) {

  const userPosition = position+1;
  let badgeColors = "bg-gray-800 border-black/20";

  switch (userPosition) {
    case 1:
      badgeColors = "from-yellow-600 to-yellow-200 border-yellow-700"
      break;
    
    case 2:
      badgeColors = "from-stone-600 to-stone-300 border-stone-700"
      break;

    case 3: 
      badgeColors = "from-[#804A00] to-[#A97142] border-amber-900"
      break;

    default:
      break;
  }

  return (
    <Link
      href={"/contributors/" + contributor.github}
      className="block hover:bg-gray-50"
    >
      <div className="flex items-center px-4 py-4 sm:px-6 cursor-pointer">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr ${badgeColors} border-4 mr-4`}>
          {position+1}
        </div>
        <div className="min-w-0 flex-1 flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full"
              src={`https://github.com/${contributor.github}.png`}
              alt={contributor.github}
            />
          </div>
          <div className="min-w-0 flex-1 px-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500 truncate">
                {contributor.name}
              </p>
              <p className="mt-2 flex items-center text-sm text-gray-500">
                <span className="truncate">{contributor.title}</span>
              </p>
            </div>
            {/* Show the following: contributor.hightlights.pr_opened, eod_update, pr_reviewed */}
            <div className="hidden md:block">
              <dl>
                <dt className="text-sm leading-5 font-medium text-gray-500 truncate">
                  PRs
                </dt>
                <dd className="flex">
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-sm leading-5 text-gray-100">
                      {contributor.weekSummary.pr_reviewed}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-gray-500">
                      reviewed
                    </span>

                    <span className="ml-2 text-sm leading-5 text-gray-100">
                      {contributor.weekSummary.pr_opened}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-gray-500">
                      opened
                    </span>
                    <span className="ml-2 text-sm leading-5 text-gray-100">
                      {contributor.weekSummary.pr_merged}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-gray-500">
                      merged
                    </span>
                  </div>
                </dd>
              </dl>
              <dl>
                <dt className="text-sm leading-5 font-medium text-gray-500 truncate">
                  Activity
                </dt>
                <dd className="flex">
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-sm leading-5 text-gray-100">
                      {contributor.weekSummary.eod_update}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-gray-500">
                      EOD updates
                    </span>
                    <span className="ml-2 text-sm leading-5 text-gray-100">
                      {contributor.weekSummary.comment_created}
                    </span>

                    <span className="ml-2 text-sm leading-5 text-gray-500">
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
