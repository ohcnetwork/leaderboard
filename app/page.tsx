import InfoCard from "@/components/contributors/InfoCard";
import Link from "next/link";
import { getContributors } from "@/lib/api";
import GitHubEvents from "@/components/gh_events/GitHubEvents";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import ActiveProjects from "@/app/projects/ActiveProjects";
import { ACTIVE_PROJECT_LABELS } from "./projects/constants";
import ReleaseSection from "@/components/releases/ReleaseSection";
import { Suspense } from "react";
import { env } from "@/env.mjs";
import CommunityEngagemet from "@/app/CommunityEngagementSummary";
import { differenceInWeeks, parseISO } from "date-fns";
import { featureIsEnabled, formatDate } from "@/lib/utils";
import { fetchGithubDiscussion } from "@/lib/discussion";
import GithubDiscussion from "@/components/discussions/GithubDiscussion";
import { Contributor } from "@/lib/types";

export default async function Home() {
  const contributors = (await getContributors())
    .filter(
      (contributor) =>
        (env.NEXT_PUBLIC_LEADERBOARD_DEFAULT_ROLES as string)
          .split(",")
          .includes(contributor.role) ?? true,
    )
    .sort((a, b) => b.weekSummary.points - a.weekSummary.points);
  const discussions = await fetchGithubDiscussion(5);
  const startDate = parseISO(env.NEXT_PUBLIC_ORG_START_DATE);

  const featuredContributors = [
    ...contributors.filter((contributor) => contributor.isNewContributor),
    ...contributors
      .filter((contributor) => !contributor.isNewContributor)
      .slice(0, 8),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="mx-4 border-secondary-600 xl:mx-0">
            <div className="px-0 pb-10 lg:grid lg:grid-cols-12 lg:gap-12 lg:pb-20">
              <div className="space-y-20 lg:col-span-8">
                {env.NEXT_PUBLIC_ORG_INFO ? (
                  <div className="pt-20">
                    <div className="mx-auto max-w-7xl">
                      <div className="space-y-12">
                        <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            What we do?
                          </h2>
                          <p className="text-justify font-inter text-lg font-medium text-secondary-500 dark:text-secondary-400">
                            {env.NEXT_PUBLIC_ORG_INFO}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-0" />
                )}

                <div className="mx-auto">
                  <div className="space-y-12">
                    <div className="flex items-center justify-between pr-5">
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        What&apos;s happening?
                      </h2>
                      <Link
                        href="/feed"
                        className="flex items-center gap-1 rounded px-3 py-2 text-secondary-400 underline underline-offset-2 transition-all duration-200 ease-in-out hover:gap-2 hover:text-primary-200 "
                      >
                        More
                        <MdOutlineArrowForwardIos />
                      </Link>
                    </div>
                    <GitHubEvents minimal />
                  </div>
                </div>

                {featureIsEnabled("Releases") && (
                  <div className="mx-auto">
                    <div className="space-y-12">
                      <div className="flex items-center justify-between pr-5">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                          Recent Releases
                        </h2>
                        <Link
                          href="/releases"
                          className="flex items-center gap-1 rounded px-3 py-2 text-secondary-400 underline underline-offset-2 transition-all duration-200 ease-in-out hover:gap-2 hover:text-primary-200"
                        >
                          More
                          <MdOutlineArrowForwardIos />
                        </Link>
                      </div>
                      <Suspense
                        fallback={
                          <>
                            <div className="h-10 w-full animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
                          </>
                        }
                      >
                        <ReleaseSection />
                      </Suspense>
                    </div>
                  </div>
                )}
                {discussions && (
                  <div className="mx-auto">
                    <div className="space-y-12">
                      <div className="flex items-center justify-between pr-2">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                          Discussions
                        </h2>
                        <Link
                          href="/discussions"
                          className="flex items-center gap-1 rounded p-2 text-secondary-400 underline underline-offset-2 transition-all duration-200 ease-in-out hover:gap-2 hover:text-primary-200"
                        >
                          More
                          <MdOutlineArrowForwardIos />
                        </Link>
                      </div>
                      {discussions.map((discussion, index) => {
                        return (
                          <GithubDiscussion
                            key={index}
                            discussion={discussion}
                            minimal
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                {featureIsEnabled("Projects") && (
                  <div className="mx-auto">
                    <div className="space-y-12">
                      <div className="flex items-center justify-between pr-5">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                          Active Projects
                        </h2>
                        <Link
                          href="/projects"
                          className="flex items-center gap-1 rounded px-3 py-2 text-secondary-400 underline underline-offset-2 transition-all duration-200 ease-in-out hover:gap-2 hover:text-primary-200"
                        >
                          More
                          <MdOutlineArrowForwardIos />
                        </Link>
                      </div>
                      <ActiveProjects
                        small
                        className="grid grid-cols-1 gap-4 font-inter lg:grid-cols-2"
                        labels={ACTIVE_PROJECT_LABELS}
                        limit={6}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="mx-auto">
                    <div className="space-y-12">
                      <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                        <div className="flex items-center justify-between">
                          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                            Our Contributors
                          </h2>
                        </div>
                        <p className="hidden text-xl text-secondary-400">
                          {env.NEXT_PUBLIC_CONTRIBUTORS_INFO}
                        </p>
                      </div>
                      <ul
                        role="list"
                        className="mt-4 space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-2 lg:gap-8"
                      >
                        {featuredContributors.map(
                          (contributor: Contributor, index: number) => {
                            return (
                              <InfoCard
                                key={index}
                                contributor={contributor}
                                isClickable
                              />
                            );
                          },
                        )}
                      </ul>
                      <Link
                        className="flex w-fit items-center gap-1 rounded px-3 py-2 text-secondary-400 underline underline-offset-2 transition-all duration-200 ease-in-out hover:gap-2 hover:text-primary-200 sm:justify-center lg:ml-auto"
                        href={"/people"}
                      >
                        {contributors.length > 8
                          ? `${contributors.length - featuredContributors.length} contributors more`
                          : "Show all contributors"}
                        <MdOutlineArrowForwardIos />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-0 pt-20">
                  <div>
                    <CommunityEngagemet />
                  </div>
                  <div className="bg-secondary-100/50 dark:bg-secondary-800/50 rounded-lg border border-secondary-100 shadow-lg dark:border-secondary-800">
                    <div className="flex flex-col justify-between rounded-t-lg border-b border-secondary-300 bg-secondary-100 px-6 py-4 dark:border-secondary-700 dark:bg-secondary-800 md:flex-row md:items-center">
                      <h4 className="font-bold">Leaderboard</h4>
                      <span className="text-secondary-600 dark:text-secondary-300">
                        <time
                          dateTime={env.NEXT_PUBLIC_ORG_START_DATE}
                          title={`Since ${formatDate(startDate)}`}
                          className="underline underline-offset-4"
                        >
                          Week {differenceInWeeks(new Date(), startDate)}
                        </time>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 p-4 ">
                      {contributors.slice(0, 5).map((contributor, index) => {
                        return (
                          <Link
                            key={index}
                            href={`/contributors/${contributor.github}`}
                          >
                            <span className="flex cursor-pointer items-center space-x-3 rounded-lg bg-background px-2 py-3 transition duration-300 hover:shadow-lg hover:shadow-primary-500">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-lg dark:bg-secondary-800">
                                {index + 1}
                              </span>
                              <span className="text-lg font-medium">
                                {contributor.name}
                              </span>
                            </span>
                          </Link>
                        );
                      })}

                      <div className="pt-2">
                        <Link
                          className="block rounded border border-primary-500 bg-gradient-to-b from-primary-500 to-primary-700 p-3 px-10 text-center font-bold text-white shadow-lg transition hover:from-secondary-800 hover:to-secondary-900 hover:text-primary-500 hover:shadow-xl"
                          href="/leaderboard"
                        >
                          View Leaderboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
