"use client";

import LeaderboardCard from "@/components/contributors/LeaderboardCard";
import TopContributor from "@/components/contributors/TopContributor";
import { TbGitMerge, TbZoomQuestion } from "react-icons/tb";
import {
  calcDateRange,
  getWeekNumber,
  LeaderboardFilterDurations,
} from "@/lib/utils";
import { LeaderboardAPIResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import Search from "@/components/filters/Search";
import { MdFilterList, MdFilterListOff } from "react-icons/md";
import { BsPersonFill } from "react-icons/bs";
import { Select, SelectOption } from "@/components/Select";
import { FILTER_BY_ROLE_OPTIONS, SORT_BY_OPTIONS } from "@/lib/const";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { Popover } from "@headlessui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BiGitPullRequest } from "react-icons/bi";
import { GoIssueOpened, GoIssueClosed } from "react-icons/go";
import { VscGitPullRequestClosed } from "react-icons/vsc";

const filterBySearchTerm = (searchTermLC: string) => {
  return (item: LeaderboardAPIResponse[number]) =>
    item.user.name.toLowerCase().includes(searchTermLC) ||
    item.user.social.github.toLowerCase().includes(searchTermLC) ||
    item.user.social.linkedin.toLowerCase().includes(searchTermLC) ||
    item.user.social.twitter.toLowerCase().includes(searchTermLC);
};

const ORDERING_OPTIONS = Object.entries(SORT_BY_OPTIONS).map(
  ([value, text]) => ({ value, text }),
);

export const ROLE_OPTIONS = Object.entries(FILTER_BY_ROLE_OPTIONS).map(
  ([value, text]) => ({ value, text }),
);

type Props = {
  data: LeaderboardAPIResponse;
  duration: (typeof LeaderboardFilterDurations)[number];
};

export default function Leaderboard(props: Props) {
  const [showFilter, setShowFilter] = useState(false);
  const [start, end] = calcDateRange(props.duration)!;
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const roles = searchParams.get("roles")?.split(",") || [];

  const ordering = ORDERING_OPTIONS.find(
    (option) => option.value === searchParams.get("ordering"),
  ) || { value: "points", text: "Points" };

  const isReversed = searchParams.get("isReversed") === "true";

  let resultSet = props.data;

  if (roles.length) {
    resultSet = resultSet.filter((a) => roles.includes(a.user.role));
  }

  if (ordering.value || isReversed) {
    const key =
      ordering.value as keyof LeaderboardAPIResponse[number]["highlights"];
    resultSet = resultSet.sort((a, b) => {
      const delta = b.highlights[key] - a.highlights[key];
      return isReversed ? -delta : delta;
    });
  }

  const updateSearchParams = (
    key: string,
    value: string | boolean | string[],
  ) => {
    const updatedParams = new URLSearchParams(searchParams.toString());

    if (Array.isArray(value)) {
      if (value.length) {
        updatedParams.set(key, value.join(","));
      } else {
        updatedParams.delete(key);
      }
    } else {
      updatedParams.set(key, value.toString());
    }

    window.history.pushState(null, "", `?${updatedParams.toString()}`);
  };

  const OtherFilters = () => {
    return (
      <>
        {/* Duration Filter */}
        <div>
          <div className="relative inline-block w-full whitespace-nowrap text-left">
            <Popover>
              {({ open, close }) => (
                <>
                  <Popover.Button
                    className={`block w-full rounded-md border border-secondary-600 px-4 py-2 text-sm font-medium dark:border-secondary-300 ${
                      open
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground"
                    }`}
                  >
                    <span className="capitalize">
                      {props.duration.replace("-", " ")}
                    </span>
                  </Popover.Button>
                  <Popover.Panel className="absolute z-10 mt-2 w-full rounded-lg border border-primary-400 bg-background shadow-lg shadow-primary-500 sm:min-w-[23rem]">
                    <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                      {LeaderboardFilterDurations.map((duration) => (
                        <Link
                          key={duration}
                          className={`whitespace-nowrap rounded border border-secondary-500 px-2 py-1 text-center text-sm transition-all duration-100 ease-in-out hover:bg-primary-800 hover:text-white hover:dark:bg-white hover:dark:text-black ${
                            props.duration === duration
                              ? "bg-background text-foreground dark:bg-white dark:text-black"
                              : ""
                          } `}
                          href={`/leaderboard/${duration}`}
                          onClick={close}
                        >
                          <span className="capitalize">
                            {duration.replace("-", " ")}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </Popover.Panel>
                </>
              )}
            </Popover>
          </div>
        </div>
        {/* Role filter */}
        <div className="md:min-w-72">
          <span className="relative flex w-full rounded-md shadow-sm">
            <span className="relative inline-flex items-center rounded-l-md border border-secondary-600 px-2 py-2 dark:border-secondary-300 ">
              <BsPersonFill className="text-foreground" size={20} />
            </span>
            <Select
              multiple
              options={ROLE_OPTIONS}
              value={ROLE_OPTIONS.filter((option) =>
                roles.includes(option.value),
              )}
              onChange={(value: SelectOption | SelectOption[]) =>
                updateSearchParams(
                  "roles",
                  (Array.isArray(value) ? value : [value]).map((v) => v.value),
                )
              }
              showSelectionsAs="text"
            />
          </span>
        </div>
        {/* Ordering */}
        <div className="md:min-w-72">
          <span className="relative inline-flex w-full rounded-md shadow-sm ">
            <span
              onClick={() => updateSearchParams("isReversed", !isReversed)}
              className="relative inline-flex cursor-pointer items-center rounded-l-md border border-secondary-600 px-2 py-2 dark:border-secondary-300"
            >
              {!isReversed ? (
                <HiSortAscending className="text-foreground" size={20} />
              ) : (
                <HiSortDescending className="text-foreground" size={20} />
              )}
            </span>
            <Select
              options={ORDERING_OPTIONS}
              value={ordering}
              onChange={(value: SelectOption | SelectOption[]) =>
                updateSearchParams(
                  "ordering",
                  Array.isArray(value) ? value[0].value : value.value,
                )
              }
            />
          </span>
        </div>
      </>
    );
  };

  return (
    <section className="border-t border-secondary-300 bg-background text-foreground dark:border-secondary-700">
      <div className="mx-auto max-w-7xl">
        {/* Ordering and Filters */}
        <div className="mx-4 mt-4 rounded-lg border border-primary-500 p-4 md:mx-0">
          <div className="flex flex-col sm:hidden">
            <div className="flex flex-row gap-2">
              <Search
                defaultValue={search}
                handleOnChange={(e) =>
                  updateSearchParams("search", e.target.value)
                }
                className="w-full"
              />
              <button onClick={() => setShowFilter(!showFilter)}>
                {showFilter ? (
                  <MdFilterList className="mx-auto size-6 cursor-pointer" />
                ) : (
                  <MdFilterListOff className="mx-auto size-6 cursor-pointer" />
                )}
              </button>
            </div>
            <div
              className={`${showFilter ? "mt-4 max-h-[50vh] " : "max-h-0 overflow-hidden"} flex flex-col gap-4  transition-all duration-500 sm:hidden`}
            >
              <OtherFilters />
            </div>
          </div>
          <div className="hidden flex-col gap-4 sm:flex md:flex-row">
            <Search
              defaultValue={search}
              handleOnChange={(e) =>
                updateSearchParams("search", e.target.value)
              }
              className="w-full"
            />
            <OtherFilters />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mx-4 mt-4 rounded-lg border border-primary-500 p-4 md:mx-0">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2 rounded-lg border border-secondary-600 p-3 dark:border-secondary-300">
              <GoIssueOpened className="text-2xl text-green-500" />
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-300">
                  Issues Opened
                </p>
                <p className="text-xl font-semibold">
                  {resultSet.reduce(
                    (sum, user) => sum + user.highlights.issue_opened,
                    0,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border border-secondary-600 p-3 dark:border-secondary-300">
              <GoIssueClosed className="text-2xl text-purple-500" />
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-300">
                  Issues Closed
                </p>
                <p className="text-xl font-semibold">
                  {resultSet.reduce(
                    (sum, user) => sum + user.highlights.issue_closed,
                    0,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border border-secondary-600 p-3 dark:border-secondary-300">
              <BiGitPullRequest className="text-2xl text-blue-500" />
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-300">
                  PRs Opened
                </p>
                <p className="text-xl font-semibold">
                  {resultSet.reduce(
                    (sum, user) => sum + user.highlights.pr_opened,
                    0,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border border-secondary-600 p-3 dark:border-secondary-300">
              <TbGitMerge className="text-2xl text-orange-500" />
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-300">
                  PRs Merged
                </p>
                <p className="text-xl font-semibold">
                  {resultSet.reduce(
                    (sum, user) => sum + user.highlights.pr_merged,
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="mx-4 border-secondary-600 xl:mx-0">
          <div className="px-0 pb-10 lg:grid lg:grid-cols-12 lg:pb-20 2xl:gap-5">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="sticky top-0 pt-6">
                <div className="terminal-container-bg rounded-lg border border-primary-500">
                  <div className="flex space-x-2 border-b border-primary-500 px-6 py-3 ">
                    {props.duration !== "last-week" ? (
                      <span>
                        Leaderboard of {formatDate(start)} → {formatDate(end)}
                      </span>
                    ) : (
                      <span>
                        Live Leaderboard of last 7 days | Week{" "}
                        {getWeekNumber(new Date())} of{" "}
                        {new Date().getFullYear()}
                      </span>
                    )}
                  </div>
                  {resultSet.filter(filterBySearchTerm(search.toLowerCase()))
                    .length ? (
                    <ul className="space-y-6 overflow-x-auto p-6 lg:space-y-8">
                      {resultSet
                        .filter(filterBySearchTerm(search.toLowerCase()))
                        .map((contributor) => {
                          return (
                            <li key={contributor.user.social.github}>
                              <LeaderboardCard
                                position={
                                  !isReversed
                                    ? resultSet.indexOf(contributor)
                                    : resultSet.length -
                                      resultSet.indexOf(contributor) -
                                      1
                                }
                                contributor={contributor}
                              />
                            </li>
                          );
                        })}
                    </ul>
                  ) : (
                    <div className="my-4 overflow-x-auto">
                      <div className="flex flex-row justify-center">
                        <TbZoomQuestion size={25} />{" "}
                        <span className="ml-4">No results found</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 2xl:col-span-4">
              <div>
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-24 ">
                  <div className="space-y-12 rounded-lg border border-primary-500 p-4">
                    <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Top Contributors{" "}
                        {props.duration === "last-week" && "of the week"}
                      </h2>
                      <p className="text-xl text-secondary-500 dark:text-secondary-300">
                        Our top contributors across different metrics
                      </p>
                    </div>
                    <ul
                      role="list"
                      className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-1 lg:gap-8"
                    >
                      <TopContributor data={resultSet} category="eod_update" />
                      <TopContributor data={resultSet} category="pr_opened" />
                      <TopContributor data={resultSet} category="pr_merged" />
                      <TopContributor data={resultSet} category="pr_reviewed" />
                      <TopContributor
                        data={resultSet}
                        category="issue_opened"
                      />
                      <TopContributor
                        data={resultSet}
                        category="comment_created"
                      />
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
