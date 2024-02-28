"use client";

import LeaderboardCard from "@/components/contributors/LeaderboardCard";
import { TbZoomQuestion } from "react-icons/tb";
import TopContributor from "../../components/contributors/TopContributor";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getWeekNumber, parseDateRangeSearchParam } from "@/lib/utils";
import DateRangePicker, { formatDate } from "@/components/DateRangePicker";
import Search from "@/components/filters/Search";
import Sort from "@/components/filters/Sort";
import RoleFilter from "@/components/filters/RoleFilter";
import format from "date-fns/format";
import { LeaderboardAPIResponse } from "@/app/api/leaderboard/functions";

export default function Leaderboard(props: { data: LeaderboardAPIResponse }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));

  let data = props.data;

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
    <section className="border-t border-gray-300 bg-background text-foreground dark:border-gray-700">
      <div className="mx-auto max-w-6xl">
        <div className="mx-4 mt-4 rounded-lg border border-primary-500 p-4 md:mx-0">
          <div className="flex flex-col flex-wrap gap-4 md:flex-row">
            <Search
              value={searchTerm}
              handleOnChange={(e) => setSearchTerm(e.target.value)}
              className="grow"
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
              className="md:grow-1 grow"
            />
            <RoleFilter
              filterOptions={RoleOptions}
              value={
                searchParams
                  .get("role")
                  ?.split(",")
                  .map((value) => ({
                    value,
                    text: FILTER_BY_ROLE_OPTIONS[
                      value as keyof typeof FILTER_BY_ROLE_OPTIONS
                    ],
                  })) || []
              }
              onChange={(selectedOptions) =>
                updateSearchParam(
                  "role",
                  selectedOptions?.map((i) => i.value).join(","),
                )
              }
              className="md:grow-1 grow md:min-w-[120px]"
            />
            <Sort
              sortByOptions={SortOptions}
              value={
                searchParams?.get("sortBy")
                  ? ({
                      value: searchParams.get("sortBy"),
                      text: SORT_BY_OPTIONS[
                        searchParams.get(
                          "sortBy",
                        ) as keyof typeof SORT_BY_OPTIONS
                      ],
                    } as (typeof SortOptions)[number])
                  : { value: "points", text: "Points" }
              }
              onChange={(selectedOption) =>
                updateSearchParam("sortBy", selectedOption?.value)
              }
              sortDescending={searchParams.get("ordering") === "asc"}
              handleSortOrderChange={() => {
                updateSearchParam(
                  "ordering",
                  searchParams.get("ordering") === "asc" ? "desc" : "asc",
                );
              }}
              className="md:grow-1 grow md:w-[120px] "
            />
          </div>
        </div>
        <div className="mx-4 border-gray-600 xl:mx-0">
          <div className="px-0 pb-10 lg:grid lg:grid-cols-12 lg:pb-20 2xl:gap-5">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="sticky top-0 pt-6">
                <div className="terminal-container-bg rounded-lg border border-primary-500">
                  <div className="flex space-x-2 border-b border-primary-500 px-6 py-3 ">
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
                    <ul className="space-y-6 overflow-x-auto p-6 lg:space-y-8">
                      {data.map((contributor, index) => {
                        return (
                          <li key={contributor.user.social.github}>
                            <LeaderboardCard
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
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-24 ">
                  <div className="space-y-12 rounded-lg border border-primary-500 p-4">
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
  return (item: LeaderboardAPIResponse[number]) =>
    item.user.name.toLowerCase().includes(searchTermLC) ||
    item.user.social.github.toLowerCase().includes(searchTermLC) ||
    item.user.social.linkedin.toLowerCase().includes(searchTermLC) ||
    item.user.social.twitter.toLowerCase().includes(searchTermLC);
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

export const SortOptions = Object.entries(SORT_BY_OPTIONS).map(
  ([value, text]) => ({
    value,
    text,
  }),
);

export type LeaderboardSortKey = keyof typeof SORT_BY_OPTIONS;

const FILTER_BY_ROLE_OPTIONS = {
  core: "Core",
  intern: "Intern",
  operations: "Operations",
  contributor: "Contributor",
};

export const RoleOptions = Object.entries(FILTER_BY_ROLE_OPTIONS).map(
  ([value, text]) => ({
    value,
    text,
  }),
);

export type RoleFilterKey = keyof typeof FILTER_BY_ROLE_OPTIONS;
