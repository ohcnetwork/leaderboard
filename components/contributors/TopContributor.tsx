/* eslint-disable @next/next/no-img-element */
import { LeaderboardAPIResponse } from "@/app/api/leaderboard/route";
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
  data: LeaderboardAPIResponse;
  category: TopContributorCategoryKey;
}) {
  let resultSet = data.filter((c) => c.highlights[category]);

  const points = Math.max(...resultSet.map((c) => c.highlights[category]));

  resultSet = resultSet
    .filter((c) => c.highlights[category] === points)
    .sort((a, b) => b.highlights.points - a.highlights.points)
    .slice(0, 3);

  if (!resultSet.length) return null;

  return (
    <div
      className="py-6 px-2 bg-gray-100 dark:bg-gray-800 text-center rounded-lg xl:px-8 xl:text-left flex flex-col items-center"
      role="listitem"
    >
      <span className="text-foreground text-sm text-center">
        Most # of{" "}
        <span className="font-bold">
          {TOP_CONTRIBUTOR_CATEGORIES[category]}
        </span>
      </span>
      <ul className="space-y-3 mt-4">
        {resultSet.map((contributor, index) => (
          <li
            className={`relative hover:scale-105 ${
              ["opacity-100", "opacity-80", "opacity-60"][0]
            } hover:opacity-100`}
            key={contributor.user.social.github}
          >
            <Link
              href={`/contributors/${contributor.user.social.github}`}
              className="flex gap-4 items-center w-full"
            >
              <img
                className="rounded-full h-11 w-11 ring-1 ring-primary-500 shadow-md shadow-primary-500"
                src={`https://avatars.githubusercontent.com/${contributor.user.social.github}`}
                alt={contributor.user.social.github}
                title={contributor.user.name}
              />
              <span className="font-bold text-primary-400">
                {contributor.user.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
