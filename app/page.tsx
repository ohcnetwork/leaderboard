import InfoCard from "../components/contributors/InfoCard";
import Link from "next/link";
import { getContributors } from "../lib/api";
import GitHubEvents from "@/components/gh_events/GitHubEvents";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import ActiveProjects from "./projects/ActiveProjects";
import { ACTIVE_PROJECT_LABELS } from "./projects/constants";
import { FiExternalLink } from "react-icons/fi";

export default async function Home() {
  const contributors = (await getContributors()).sort(
    (a, b) => b.weekSummary.points - a.weekSummary.points,
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <section className="bg-background border-t dark:border-gray-700 border-gray-300 ">
        <div className="max-w-7xl mx-auto">
          <div className="border-gray-600 mx-4 xl:mx-0">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 px-0 pb-10 lg:pb-20">
              <div className="lg:col-span-8 space-y-20">
                {process.env.NEXT_PUBLIC_ORG_INFO ? (
                  <div className="pt-20">
                    <div className="mx-auto max-w-7xl">
                      <div className="space-y-12">
                        <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            What we do?
                          </h2>
                          <p className="text-lg text-gray-500 dark:text-gray-400 font-inter text-justify font-medium">
                            {process.env.NEXT_PUBLIC_ORG_INFO}
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
                    <div className="flex justify-between items-center pr-5">
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        What&apos;s happening?
                      </h2>
                      <Link
                        href="/feed"
                        className="text-gray-400 px-3 py-2 rounded underline flex items-center gap-1 underline-offset-2 hover:text-primary-200 transition-all duration-200 ease-in-out hover:gap-2"
                      >
                        More
                        <MdOutlineArrowForwardIos />
                      </Link>
                    </div>
                    <GitHubEvents minimal />
                  </div>
                </div>

                <div className="mx-auto">
                  <div className="space-y-12">
                    <div className="flex justify-between items-center pr-5">
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Active Projects
                      </h2>
                      <Link
                        href="/projects"
                        className="text-gray-400 px-3 py-2 rounded underline flex items-center gap-1 underline-offset-2 hover:text-primary-200 transition-all duration-200 ease-in-out hover:gap-2"
                      >
                        More
                        <MdOutlineArrowForwardIos />
                      </Link>
                    </div>
                    <ActiveProjects
                      small
                      className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-inter"
                      labels={ACTIVE_PROJECT_LABELS}
                      limit={6}
                    />
                  </div>
                </div>

                <div>
                  <div className="mx-auto">
                    <div className="space-y-12">
                      <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                        <div className="flex justify-between items-center">
                          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                            Our Contributors
                          </h2>
                          <Link
                            href="/people"
                            className="text-gray-400 px-3 py-2 rounded underline flex items-center gap-1 underline-offset-2 hover:text-primary-200 transition-all duration-200 ease-in-out hover:gap-2"
                          >
                            Gallery
                            <MdOutlineArrowForwardIos />
                          </Link>
                        </div>
                        <p className="text-xl text-gray-400 hidden">
                          {process.env.NEXT_PUBLIC_CONTRIBUTORS_INFO}
                        </p>
                      </div>
                      <ul
                        role="list"
                        className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-2 lg:gap-8 mt-4"
                      >
                        {contributors.map((contributor: any, index: number) => {
                          return (
                            <InfoCard
                              key={index}
                              contributor={contributor}
                              minimal
                              isClickable
                            />
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-0 pt-20">
                  <div className="rounded-lg dark:bg-gray-800 bg-gray-100 bg-opacity-50 shadow-lg border dark:border-gray-800 border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between md:items-center dark:bg-gray-800 bg-gray-100 rounded-t-lg px-6 py-4 border-b dark:border-gray-700 border-gray-300 ">
                      <h4 className="font-bold">Leaderboard</h4>
                      <span className="text-gray-600 dark:text-gray-300">
                        last 7 days
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 p-4 ">
                      {contributors
                        .filter((contributor) => !contributor.core)
                        .slice(0, 5)
                        .map((contributor: any, index: number) => {
                          return (
                            <Link
                              key={index}
                              href={`/contributors/${contributor.github}`}
                            >
                              <span className="hover:shadow-lg hover:shadow-primary-500 transition duration-300 flex space-x-3 items-center cursor-pointer bg-background bg-opacity-75 px-2 py-3 rounded-lg hover:bg-opacity-30">
                                <span className="flex items-center justify-center text-lg h-10 w-10 dark:bg-gray-800 bg-gray-100 rounded-full">
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
                          className="block px-10 p-3 text-center bg-gradient-to-b from-primary-500 to-primary-700 text-white border border-primary-500 font-bold rounded shadow-lg hover:shadow-xl hover:from-gray-800 hover:to-gray-900 hover:text-primary-500 transition"
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
