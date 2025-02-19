import {
  advancedSkills,
  humanValues,
  professionalSelfSkills,
  professionalTeamSkills,
  resolveGraduateAttributes,
} from "@/config/GraduateAttributes";
import { getContributorBySlug, getContributorsSlugs } from "@/lib/api";
import ActivityCalendarGit from "@/components/contributors/ActivityCalendarGitHub";
import BadgeIcons from "@/components/contributors/BadgeIcons";
import GithubActivity from "@/components/contributors/GithubActivity";
import GraduateAttributeBadge from "@/components/contributors/GraduateAttributeBadge";
import InfoCard from "@/components/contributors/InfoCard";
import React from "react";
import clsx from "clsx";
import { formatDuration, parseDateRangeSearchParam } from "@/lib/utils";
import Markdown from "@/components/Markdown";
import { FiAlertTriangle } from "react-icons/fi";
import { TbGitPullRequest } from "react-icons/tb";
import RelativeTime from "@/components/RelativeTime";
import Link from "next/link";
import { env } from "@/env.mjs";
import { getLeaderboardData } from "@/app/api/leaderboard/functions";
import { Metadata } from "next";

type Params = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = params.slug;
  const contributor = await getContributorBySlug(slug, true);
  const url = env.NEXT_PUBLIC_META_URL;
  const org = env.NEXT_PUBLIC_META_TITLE;

  const title = `${slug} | ${org}`;
  const description = contributor.content;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${url}/contributors/${slug}`,
    },
  };
}
export async function generateStaticParams() {
  const slugs = await getContributorsSlugs();
  return slugs.map((slug) => ({ slug: slug.file.replace(".md", "") }));
}

export default async function Page({ params }: Params) {
  const { slug } = params;
  const contributor = await getContributorBySlug(slug, true);

  const leaderboardData = await getLeaderboardData(
    parseDateRangeSearchParam(),
    "points",
    "desc",
    [],
  );
  const rank =
    leaderboardData.findIndex(
      (data) =>
        data.user.social.github === contributor.github &&
        contributor.weekSummary.points !== 0,
    ) + 1 || null;

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* <Header /> */}
      <section className="bg-secondary-200 px-4 py-6 dark:bg-secondary-800">
        <div className=" mx-auto flex max-w-6xl flex-col gap-2 md:flex-row lg:gap-16">
          <div className="mx-auto my-auto min-w-max md:w-2/3">
            <InfoCard contributor={contributor} rank={rank} />
          </div>
          <div className="mb-2 flex flex-wrap justify-center lg:grid lg:w-full lg:grid-cols-7 lg:gap-2">
            {[
              professionalSelfSkills,
              professionalTeamSkills,
              advancedSkills,
              humanValues,
            ].map((attributeGroup) => {
              return attributeGroup.map((skill) => (
                <div
                  className="mx-2 mt-3 shrink-0 items-center justify-center rounded-lg lg:mx-5"
                  key={skill.key}
                >
                  <BadgeIcons
                    skill={resolveGraduateAttributes(skill, contributor)}
                  />
                </div>
              ));
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-16 pt-6">
        {contributor.content.includes("Still waiting for this") && (
          <div className="mt-10 flex flex-col justify-between rounded-lg border border-current bg-amber-300/20 px-4 py-4 font-semibold text-amber-500 dark:bg-amber-500/20 max-sm:mx-3 max-sm:gap-3 sm:flex-row sm:px-6 xl:px-10 ">
            <span className="flex items-center gap-4">
              <FiAlertTriangle size={20} />
              Bio is missing. Update it to complete the profile!
            </span>
            <Link
              href={`https://github.com/${env.NEXT_PUBLIC_GITHUB_ORG}/leaderboard-data/edit/main/contributors/${contributor.github}.md`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-2 py-2 font-bold text-white transition-all duration-200 ease-in-out hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 sm:px-3"
            >
              <TbGitPullRequest />
              Update Profile
            </Link>
          </div>
        )}

        <div className="px-4 md:p-0">
          <div className="mt-8 flex items-end justify-between">
            <h3 className="font-bold text-foreground">Graduate Attributes</h3>
            <Link
              href="#"
              className="mt-1 inline-flex items-center space-x-2 pl-1 pt-2 text-secondary-400 underline transition hover:text-primary-400"
            >
              <span>Learn More</span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="h-5 w-5"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                </svg>
              </span>
            </Link>
          </div>
          <div className="mt-3">
            <div className="w-full md:grid md:grid-cols-2 md:space-x-0 md:overflow-hidden">
              <div className="flex w-full shrink-0 flex-col rounded-tl-lg bg-secondary-200 pb-2 dark:bg-secondary-800 md:w-auto md:justify-between md:pr-2">
                <div className="flex items-center rounded-t-lg bg-secondary-300 p-3 dark:bg-secondary-700 md:justify-center">
                  <p className="font-semibold text-foreground md:text-lg">
                    Individual Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 py-2 pl-2 md:flex-row-reverse">
                  {professionalSelfSkills.map((skill) => (
                    <GraduateAttributeBadge
                      skill={resolveGraduateAttributes(skill, contributor)}
                      key={skill.key}
                      color={"bg-green-600"}
                      colorDark={"bg-green-700"}
                    />
                  ))}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col rounded-tr-lg bg-secondary-200 pb-2 dark:bg-secondary-800 md:w-auto md:justify-between md:border-l-4 md:border-indigo-700 md:pl-2">
                <div className="flex items-center rounded-t-lg bg-secondary-300 p-3 dark:bg-secondary-700 md:justify-center">
                  <p className="font-semibold text-foreground md:text-lg">
                    Team Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 py-2 pl-2 md:pl-0 md:pr-2">
                  {professionalTeamSkills.map((skill) => (
                    <GraduateAttributeBadge
                      skill={resolveGraduateAttributes(skill, contributor)}
                      key={skill.key}
                      color={"bg-indigo-500"}
                      colorDark={"bg-indigo-700"}
                    />
                  ))}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col-reverse justify-end rounded-bl-lg bg-secondary-200 dark:bg-secondary-800 md:w-auto md:flex-col md:justify-between md:border-t-4 md:border-indigo-700 md:pr-2 md:pt-2">
                <div className="flex flex-wrap gap-2 py-2 pl-2 pr-2 leading-tight md:flex-row-reverse md:pr-0">
                  {advancedSkills.map((skill) => (
                    <GraduateAttributeBadge
                      skill={resolveGraduateAttributes(skill, contributor)}
                      key={skill.key}
                      color={"bg-orange-500"}
                      colorDark={"bg-orange-700"}
                    />
                  ))}
                </div>
                <div className="flex items-center rounded-b-lg bg-secondary-300 p-3 dark:bg-secondary-700 md:justify-center ">
                  <p className="font-semibold text-foreground md:text-lg">
                    Advanced Skills
                  </p>
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col-reverse justify-end rounded-br-lg bg-secondary-200 dark:bg-secondary-800 md:w-auto md:flex-col md:justify-between md:border-l-4 md:border-t-4 md:border-indigo-700 md:pl-2 md:pt-2">
                <div className="flex flex-wrap gap-2 py-2 pl-2 pr-2 md:pl-0">
                  {humanValues.map((skill) => (
                    <GraduateAttributeBadge
                      skill={resolveGraduateAttributes(skill, contributor)}
                      key={skill.key}
                      color={"bg-rose-500"}
                      colorDark={"bg-rose-700"}
                    />
                  ))}
                </div>
                <div className="flex items-center bg-secondary-300 p-3 dark:bg-secondary-700 md:justify-center md:rounded-b-lg">
                  <p className="font-semibold text-foreground md:text-lg">
                    Cultural Skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:p-0">
          <div className="flex items-center justify-between">
            <h3 className="my-4 font-bold text-foreground">Short Bio</h3>
            <Link
              href={`https://github.com/${env.NEXT_PUBLIC_GITHUB_ORG}/leaderboard-data/edit/main/contributors/${contributor.github}.md`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-secondary-500 underline underline-offset-2 dark:text-secondary-300"
            >
              <TbGitPullRequest />
              Update
            </Link>
          </div>
          <div className="w-full rounded-lg bg-secondary-100 dark:bg-secondary-800 ">
            <div className="rounded-lg px-6 py-10 xl:px-10">
              <Markdown>{contributor.content}</Markdown>
            </div>
          </div>
        </div>

        <div className="px-4 md:p-0">
          <h3 className="my-4 font-bold text-foreground">Activity</h3>
          <div>
            <ActivityCalendarGit calendarData={contributor.calendarData} />
          </div>
        </div>
        <div className="px-4 md:p-0">
          <h3 className="mt-6 font-bold text-foreground">Highlights</h3>
          <dl className="mt-4 text-center sm:mx-auto sm:grid sm:max-w-3xl sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-3 mt-2 text-lg font-medium leading-6 text-primary-300">
                <Link
                  href={`https://github.com/pulls?q=sort%3Aupdated-desc+org%3A${env.NEXT_PUBLIC_GITHUB_ORG}+is%3Apr+is%3Aopen+archived%3Afalse+author%3A${contributor.github}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pull Requests
                </Link>
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground">
                {contributor.highlights.pr_opened}
              </dd>
              <p className="order-2 text-xl text-secondary-400">
                <b className="text-foreground">
                  {contributor.weekSummary.pr_opened}
                </b>{" "}
                in last 7 days
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:mt-0">
              <dt className="order-3 mt-2 text-lg font-medium leading-6 text-primary-300">
                Reviews
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground">
                {contributor.highlights.pr_reviewed}
              </dd>
              <p className="order-2 text-xl text-secondary-400">
                <b className="text-foreground">
                  {contributor.weekSummary.pr_reviewed}
                </b>{" "}
                in last 7 days
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:mt-0">
              <dt className="order-3 mt-2 text-lg font-medium leading-6 text-primary-300">
                Feed
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground">
                {contributor.highlights.eod_update}
              </dd>
              <p className="order-2 text-xl text-secondary-400">
                <b className="text-foreground">
                  {contributor.weekSummary.eod_update}
                </b>{" "}
                in last 7 days
              </p>
            </div>
            <div className="col-span-3 flex flex-col">
              <dt className="order-2 mt-2 text-lg font-medium leading-6 text-primary-300">
                Avg. PR Turnaround Time
              </dt>
              <dd className="order-1 truncate whitespace-nowrap text-5xl font-extrabold text-foreground">
                {formatDuration(
                  (contributor.activityData?.activity
                    .map((act) => act.turnaround_time)
                    .filter(Boolean)
                    .reduce(
                      (acc, curr, i, array) => acc! + curr! / array.length,
                      0,
                    ) || 0) * 1000,
                ) || (
                  <span className="text-lg font-bold text-secondary-500">
                    <p>N/A</p>
                    <p>Yet to make contributions!</p>
                  </span>
                )}
              </dd>
            </div>
            {/* <div className="flex flex-col mt-4 sm:mt-0">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                    Points
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-white">
                    {contributor.highlights.points}
                  </dd>
                </div> */}
          </dl>
        </div>

        {contributor["activityData"] &&
          contributor["activityData"]["open_prs"] &&
          contributor["activityData"]["open_prs"].length > 0 && (
            <div className="px-4 md:p-0">
              <h3 className="mt-6 font-bold text-foreground">
                Currently Working on
              </h3>
              <div className="mt-4">
                {contributor["activityData"]["open_prs"].map((pr, index) => (
                  <Link href={pr.link} key={index} className="flex gap-2">
                    <div className="tooltip">
                      {((pr?.stale_for >= 7) as Boolean) && (
                        <span className="tooltip-text tooltip-bottom mr-auto">
                          Stale for {pr?.stale_for} days
                        </span>
                      )}
                      <p
                        className={clsx(
                          "mb-2 flex gap-2 text-sm transition-colors duration-75 ease-in-out",
                          pr?.stale_for >= 7
                            ? "text-secondary-700 hover:text-primary-400 dark:text-secondary-600 dark:hover:text-primary-200"
                            : "text-secondary-400 hover:text-primary-500 dark:text-secondary-300 dark:hover:text-primary-300",
                        )}
                        key={index}
                      >
                        <span className="flex items-center">
                          <span className="pr-2 text-sm text-primary-500">
                            ➞
                          </span>
                          <code
                            className={clsx(
                              "mr-2 rounded px-1.5 py-1 text-xs",
                              pr.stale_for >= 7
                                ? "bg-secondary-200 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-600"
                                : "bg-secondary-100 text-secondary-400 dark:bg-secondary-600 dark:text-white",
                            )}
                          >
                            {pr.link
                              .split("/")
                              .slice(-3)
                              .join("/")
                              .replace("/pull", "")}
                          </code>
                          {pr.title}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        {contributor["activityData"] &&
          contributor["activityData"]["activity"] && (
            <div className="mt-6 px-4 md:w-[64rem] md:p-0">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-foreground">Contributions</h3>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">
                  Last contribution{" "}
                  {contributor.activityData.last_updated ? (
                    <RelativeTime
                      time={contributor.activityData.last_updated}
                    />
                  ) : (
                    "unknown"
                  )}
                </span>
              </div>
              <GithubActivity activityData={contributor["activityData"]} />
            </div>
          )}
      </div>
    </div>
  );
}
