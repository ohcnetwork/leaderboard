"use client";

import LeaderboardCard from "@/components/contributors/LeaderboardCard";
import { TbZoomQuestion } from "react-icons/tb";
import TopContributor from "../../components/contributors/TopContributor";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getWeekNumber, parseDateRangeSearchParam } from "@/lib/utils";
import DateRangePicker, { formatDate } from "@/components/DateRangePicker";
import Search from "@/components/filters/Search";
import Sort from "@/components/filters/Sort";
import RoleFilter from "@/components/filters/RoleFilter";
import format from "date-fns/format";
import { LeaderboardAPIResponse } from "@/app/api/leaderboard/functions";
import { SelectOption } from "@/components/Select";

export default function Leaderboard(props: { data: LeaderboardAPIResponse }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));
  const [roleFilter, setRoleFilter] = useState<SelectOption[]>(
    searchParams
      .get("role")
      ?.split(",")
      .map((value) => ({
        value,
        text: SORT_BY_ROLE_OPTIONS[value as keyof typeof SORT_BY_ROLE_OPTIONS],
      })) || [],
  );
  const [sortBy, setSortBy] = useState<SelectOption | undefined>(
    searchParams?.get("sortBy")
      ? ({
          value: searchParams.get("sortBy"),
          text: SORT_BY_OPTIONS[
            searchParams.get("sortBy") as keyof typeof SORT_BY_OPTIONS
          ],
        } as (typeof SortOptions)[number])
      : { value: "points", text: "Points" },
  );

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

  useEffect(() => {
    updateSearchParam("role", roleFilter?.map((i) => i.value).join(","));
  }, [roleFilter]);

  useEffect(() => {
    updateSearchParam("sortBy", sortBy?.value);
  }, [sortBy]);

  return (
    <section className="border-gray-300 dark:border-gray-700 bg-background border-t text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="border-primary-500 mx-4 md:mx-0 mt-4 p-4 border rounded-lg">
          <div className="flex md:flex-row flex-col flex-wrap gap-4">
            <Search
              value={searchTerm}
              handleOnChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
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
              className="flex-grow md:flex-grow-1"
            />
            <RoleFilter
              sortByOptions={RoleOptions}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              className="flex-grow md:flex-grow-1 md:min-w-[120px]"
            />
            <Sort
              sortByOptions={SortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              sortDescending={searchParams.get("ordering") === "asc"}
              handleSortOrderChange={() => {
                updateSearchParam(
                  "ordering",
                  searchParams.get("ordering") === "asc" ? "desc" : "asc",
                );
              }}
              className="flex-grow md:flex-grow-1 md:w-[120px] "
            />
          </div>
        </div>
        <div className="border-gray-600 mx-4 xl:mx-0">
          <div className="2xl:gap-5 lg:grid lg:grid-cols-12 px-0 pb-10 lg:pb-20">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="top-0 sticky pt-6">
                <div className="border-primary-500 border rounded-lg terminal-container-bg">
                  <div className="flex space-x-2 border-primary-500 px-6 py-3 border-b ">
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
                    <ul className="space-y-6 lg:space-y-8 p-6 overflow-x-auto">
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
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 max-w-6xl ">
                  <div className="space-y-12 border-primary-500 p-4 border rounded-lg">
                    <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                      <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight">
                        Top Contributors{" "}
                        {!searchParams.get("between") && "of the week"}
                      </h2>
                      <p className="text-gray-500 text-xl dark:text-gray-300">
                        Our top contributers across different metrics
                      </p>
                    </div>
                    <ul
                      role="list"
                      className="sm:gap-6 lg:gap-8 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-1"
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

const SORT_BY_ROLE_OPTIONS = {
  core: "Core",
  intern: "Intern",
  operations: "Operations",
  contributor: "Contributor",
};

export const RoleOptions = Object.entries(SORT_BY_ROLE_OPTIONS).map(
  ([value, text]) => ({
    value,
    text,
  }),
);

export type RoleFilterKey = keyof typeof SORT_BY_ROLE_OPTIONS;
