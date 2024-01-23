/* eslint-disable @next/next/no-img-element */
import { LeaderboardResultSet } from "@/app/leaderboard/page";
import Link from "next/link";

export const TOP_CONTRIBUTOR_CATEGORIES = {
  eod_update: "EOD Updates",
  pr_opened: "Pull Requests Opened",
  pr_merged: "Pull Requests Merged",
  pr_reviewed: "Pull Requests Reviewed",
  issue_opened: "Issues Opened",
  comment_created: "Comments Created",
};

export type TopContributorCategoryKey = keyof typeof TOP_CONTRIBUTOR_CATEGORIES;

export default function InfoCard({
  data,
  category,
}: {
  data: LeaderboardResultSet;
  category: TopContributorCategoryKey;
}) {
  const contributors = data
    .filter((c) => c.summary[category])
    .sort((a, b) =>
      a.summary[category] !== b.summary[category]
        ? b.summary[category] - a.summary[category]
        : b.summary.points - a.summary.points,
    )
    .slice(0, 3);

  if (!contributors.length) return null;

  return (
    <div
      className="py-6 px-2 bg-gray-100 dark:bg-gray-800 text-center rounded-lg xl:px-8 xl:text-left flex flex-col items-center"
      role="listitem"
    >
      <span className="text-foreground text-sm font-mono text-center">
        Most # of{" "}
        <p className="font-bold text-base">
          {TOP_CONTRIBUTOR_CATEGORIES[category]}
        </p>
      </span>
      <ul className="isolate space-x-3 mt-4">
        {contributors.map((contributor, index) => (
          <li
            className={`relative inline-block hover:scale-105 ${
              ["opacity-100", "opacity-80", "opacity-60"][0]
            } hover:opacity-100`}
            key={contributor.github}
          >
            <Link href={`/contributors/${contributor.github}`}>
              <img
                className={`rounded-full h-12 w-12 shadow-current shadow-lg ring-2 ring-current ${
                  ["text-yellow-700", "text-stone-700", "text-amber-900"][index]
                }`}
                src={`https://avatars.githubusercontent.com/${contributor.github}`}
                alt={contributor.github}
                title={contributor.name}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
