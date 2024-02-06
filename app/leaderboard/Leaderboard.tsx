"use client";

import LeaderBoardCard from "@/components/contributors/LeaderboardCard";
import { Contributor } from "@/lib/types";
import { TbZoomQuestion } from "react-icons/tb";
import { LeaderboardResultSet } from "./page";
import TopContributor from "../../components/contributors/TopContributor";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getWeekNumber, parseDateRangeSearchParam } from "@/lib/utils";
import DateRangePicker, { formatDate } from "@/components/DateRangePicker";
import Search from "@/components/filters/Search";
import Sort from "@/components/filters/Sort";
import format from "date-fns/format";

type Props = {
  resultSet: LeaderboardResultSet;
};

export default function Leaderboard(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));

  let data = props.resultSet;

  if (searchTerm) {
    data = data.filter(filterBySearchTerm(searchTerm.toLowerCase()));
  }

  const updateSearchParam = (key: string, value?: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  return (
    <section className="bg-background text-foreground border-t dark:border-gray-700 border-gray-300">
      <div className="max-w-6xl mx-auto">
        <div className="mx-4 md:mx-0 mt-4 p-4 border border-primary-500 rounded-lg">
          <div className="flex flex-col md:flex-row justify-evenly items-center md:items-start gap-4">
            <Search
              value={searchTerm}
              handleOnChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <DateRangePicker
              value={{ start, end }}
              onChange={(value) => {
                updateSearchParam(
                  "between",
                  `${format(value.start, "yyyy-MM-dd")}...${format(
                    value.end,
                    "yyyy-MM-dd",
                  )}`,
                );
              }}
            />
            <Sort
              sortByOptions={Object.entries(SORT_BY_OPTIONS).map(
                ([value, text]) => ({ value, text }),
              )}
              sortBy={searchParams.get("sortBy") ?? "points"}
              sortDescending={searchParams.get("ordering") === "asc"}
              handleSortByChange={(e) =>
                updateSearchParam("sortBy", e.target.value)
              }
              handleSortOrderChange={() => {
                updateSearchParam(
                  "ordering",
                  searchParams.get("ordering") === "asc" ? "desc" : "asc",
                );
              }}
              className="w-96"
            />
          </div>
        </div>
        <div className="border-gray-600 mx-4 xl:mx-0">
          <div className="lg:grid lg:grid-cols-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="sticky top-0 pt-6">
                <div className="terminal-container-bg border rounded-lg border-primary-500">
                  <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
                    {searchParams.get("between") ? (
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
                  {data.length ? (
                    <ul className="space-y-6 lg:space-y-8 overflow-x-auto p-6">
                      {data.map((contributor, index) => {
                        return (
                          <li key={contributor.github}>
                            <LeaderBoardCard
                              position={index}
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
                <div className="mx-auto py-12 px-4 max-w-6xl sm:px-6 lg:px-8 lg:py-24 ">
                  <div className="space-y-12 p-4 border border-primary-500 rounded-lg">
                    <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Top Contributors{" "}
                        {!searchParams.get("between") && "of the week"}
                      </h2>
                      <p className="text-xl text-gray-500 dark:text-gray-300">
                        Our top contributers across different metrics
                      </p>
                    </div>
                    <ul
                      role="list"
                      className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-1 lg:gap-8"
                    >
                      <TopContributor data={data} category="eod_update" />
                      <TopContributor data={data} category="pr_opened" />
                      <TopContributor data={data} category="pr_merged" />
                      <TopContributor data={data} category="pr_reviewed" />
                      <TopContributor data={data} category="issue_opened" />
                      <TopContributor data={data} category="comment_created" />
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

const filterBySearchTerm = (searchTermLC: string) => {
  return (contributor: Contributor) =>
    contributor.name.toLowerCase().includes(searchTermLC) ||
    contributor.github.toLowerCase().includes(searchTermLC) ||
    contributor.linkedin.toLowerCase().includes(searchTermLC) ||
    contributor.twitter.toLowerCase().includes(searchTermLC);
};

const SORT_BY_OPTIONS = {
  comment_created: "Comment Created",
  eod_update: "EOD Update",
  issue_assigned: "Issue Assigned",
  issue_opened: "Issue Opened",
  points: "Points",
  pr_merged: "PR Merged",
  pr_opened: "PR Opened",
  pr_reviewed: "PR Reviewed",
  pr_stale: "Stale PRs",
};

export type LeaderboardSortKey = keyof typeof SORT_BY_OPTIONS;
