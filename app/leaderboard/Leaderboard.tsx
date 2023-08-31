"use client";

import { useState, useEffect } from "react";
import LeaderboardCard from "../../components/contributors/LeaderboardCard";
import TopContributor from "../../components/contributors/TopContributor";
import Filters from "../../components/filters/Filters";
import { TbZoomQuestion } from "react-icons/tb";
import { Category, Contributor } from "@/lib/types";

// Calculate week number
const getWeekNumber = (date: Date) => {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((Number(d) - Number(yearStart)) / 86400000 + 1) / 7);
};

const categories = [
  { slug: "eod_update", title: "EOD Updates" },
  { slug: "pr_opened", title: "Pull Requests Opened" },
  { slug: "pr_merged", title: "Pull Requests Merged" },
  { slug: "pr_reviewed", title: "Pull Requests Reviewed" },
  { slug: "issue_opened", title: "Issues Opened" },
  { slug: "comment_created", title: "Comments Created" },
];

export default function Leaderboard({
  contributorsList,
}: {
  contributorsList: Contributor[];
}) {
  const [contributors, setContributors] = useState(contributorsList);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("points");
  const [sortDescending, setSortDescending] = useState(true);
  const [showCoreMembers, setShowCoreMembers] = useState(false);
  const [categoryLeaderboard, setCategoryLeaderboard] = useState<Category[]>(
    [],
  );

  useEffect(() => {
    let filteredContributors = contributorsList;

    if (!showCoreMembers) {
      filteredContributors = filteredContributors.filter(
        (contributor) => !contributor.core,
      );
    }

    if (searchTerm) {
      const searchTermLC = searchTerm.toLowerCase();
      filteredContributors = filteredContributors.filter(
        (contributor) =>
          contributor.name.toLowerCase().includes(searchTermLC) ||
          contributor.github.toLowerCase().includes(searchTermLC) ||
          contributor.linkedin.toLowerCase().includes(searchTermLC) ||
          contributor.twitter.toLowerCase().includes(searchTermLC),
      );
    }

    filteredContributors = filteredContributors.sort((a: any, b: any) =>
      a.weekSummary[sortBy] !== b.weekSummary[sortBy]
        ? a.weekSummary[sortBy] - b.weekSummary[sortBy]
        : a.weekSummary.points - b.weekSummary.points,
    );

    if (sortDescending) {
      filteredContributors = filteredContributors.reverse();
    }

    setCategoryLeaderboard(() => {
      let temp = contributorsList;
      if (!showCoreMembers) {
        temp = temp.filter((contributor) => !contributor.core);
      }
      return categories.map((category) => ({
        ...category,
        contributor: temp
          .sort((a: any, b: any) =>
            a.weekSummary[category.slug] !== b.weekSummary[category.slug]
              ? a.weekSummary[category.slug] - b.weekSummary[category.slug]
              : a.weekSummary.points - b.weekSummary.points,
          )
          .reverse()[0],
      }));
    });

    setContributors([...filteredContributors]);
  }, [contributorsList, searchTerm, sortBy, sortDescending, showCoreMembers]);

  return (
    <section className="bg-background text-foreground border-t dark:border-gray-700 border-gray-300">
      <div className="max-w-6xl mx-auto">
        <Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDescending={sortDescending}
          setSortDescending={setSortDescending}
          showCoreMembers={showCoreMembers}
          setShowCoreMembers={setShowCoreMembers}
        />
        <div className="border-gray-600 mx-4 xl:mx-0">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="sticky top-0 pt-6">
                <div className="terminal-container-bg border rounded-lg border-primary-500">
                  <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
                    <span>
                      Live Leaderboard of last 7 days | Week{" "}
                      {getWeekNumber(new Date())} of {new Date().getFullYear()}
                    </span>
                  </div>
                  {contributors.length ? (
                    <ul className="space-y-6 lg:space-y-8 overflow-x-auto p-6">
                      {contributors.map((contributor, index) => {
                        return (
                          <li key={contributor.github}>
                            <LeaderboardCard
                              position={searchTerm ? -1 : index}
                              key={contributor.github}
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
                        Top Contributors of the week
                      </h2>
                      <p className="text-xl text-gray-500 dark:text-gray-300">
                        Our top contributers across different metrics
                      </p>
                    </div>
                    <ul
                      role="list"
                      className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-1 lg:gap-8"
                    >
                      {categoryLeaderboard.map((category: Category, index) => {
                        return (
                          <TopContributor
                            key={index}
                            contributor={category.contributor}
                            category={category}
                            minimal={true}
                          />
                        );
                      })}
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
