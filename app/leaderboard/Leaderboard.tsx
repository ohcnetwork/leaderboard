"use client";

import LeaderBoardCard from "@/components/contributors/LeaderboardCard";
import { Contributor } from "@/lib/types";
import { TbZoomQuestion } from "react-icons/tb";
import { LeaderboardResultSet } from "./page";
import TopContributor, {
  TOP_CONTRIBUTOR_CATEGORIES,
  TopContributorCategoryKey,
} from "../../components/contributors/TopContributor";
import { useState } from "react";
import LeaderboardFilters from "./Filters";
import { useSearchParams } from "next/navigation";
import {
  dateString,
  getWeekNumber,
  parseDateRangeSearchParam,
} from "@/lib/utils";

type Props = {
  resultSet: LeaderboardResultSet;
};

export default function Leaderboard(props: Props) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));

  let data = props.resultSet;

  if (searchTerm) {
    data = data.filter(filterBySearchTerm(searchTerm.toLowerCase()));
  }

  return (
    <section className="bg-background text-foreground border-t dark:border-gray-700 border-gray-300">
      <div className="max-w-6xl mx-auto">
        <LeaderboardFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div className="border-gray-600 mx-4 xl:mx-0">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="sticky top-0 pt-6">
                <div className="terminal-container-bg border rounded-lg border-primary-500">
                  <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
                    {searchParams.get("between") ? (
                      <span>
                        Leaderboard of {dateString(start)} - {dateString(end)}
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
                            <div className="bg-black rounded-lg p-2 opacity-75">
                              <code className="text-sm text-lime-400">
                                {JSON.stringify(
                                  contributor.summary,
                                  undefined,
                                  "  ",
                                )}
                              </code>
                            </div>
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
