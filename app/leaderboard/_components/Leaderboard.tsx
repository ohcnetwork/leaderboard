import LeaderboardCard from "@/components/contributors/LeaderboardCard";
import { TbZoomQuestion } from "react-icons/tb";
import TopContributor from "../../../components/contributors/TopContributor";
import { getWeekNumber, parseDateRangeSearchParam } from "@/lib/utils";
import { LeaderboardAPIResponse, PageProps } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const filterBySearchTerm = (searchTermLC: string) => {
  return (item: LeaderboardAPIResponse[number]) =>
    item.user.name.toLowerCase().includes(searchTermLC) ||
    item.user.social.github.toLowerCase().includes(searchTermLC) ||
    item.user.social.linkedin.toLowerCase().includes(searchTermLC) ||
    item.user.social.twitter.toLowerCase().includes(searchTermLC);
};

export default function Leaderboard({
  data,
  searchParams,
}: {
  data: LeaderboardAPIResponse;
} & PageProps) {
  const searchTerm = searchParams.search ?? "";
  const [start, end] = parseDateRangeSearchParam(searchParams.between);
  const filteredData = data.filter((item) => {
    return searchParams.role?.includes(item.user.role) ?? true;
  });
  const ordering = searchParams.ordering ?? "desc";

  return (
    <div className="px-0 pb-10 lg:grid lg:grid-cols-12 lg:pb-20 2xl:gap-5">
      <div className="lg:col-span-7 2xl:col-span-8">
        <div className="sticky top-0 pt-6">
          <div className="terminal-container-bg rounded-lg border border-primary-500">
            <div className="flex space-x-2 border-b border-primary-500 px-6 py-3 ">
              {searchParams.between ? (
                <span>
                  Leaderboard of {formatDate(start)} → {formatDate(end)}
                </span>
              ) : (
                <span>
                  Live Leaderboard of last 7 days | Week{" "}
                  {getWeekNumber(new Date())} of {new Date().getFullYear()}
                </span>
              )}
            </div>
            {data.filter(filterBySearchTerm(searchTerm.toLowerCase()))
              .length ? (
              <ul className="space-y-6 overflow-x-auto p-6 lg:space-y-8">
                {data
                  .filter(filterBySearchTerm(searchTerm.toLowerCase()))
                  .map((contributor) => {
                    return (
                      <li key={contributor.user.social.github}>
                        <LeaderboardCard
                          position={
                            ordering === "desc"
                              ? data.indexOf(contributor)
                              : data.length - data.indexOf(contributor) - 1
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
                  Top Contributors {!searchParams.between && "of the week"}
                </h2>
                <p className="text-xl text-secondary-500 dark:text-secondary-300">
                  Our top contributers across different metrics
                </p>
              </div>
              <ul
                role="list"
                className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-1 lg:gap-8"
              >
                <TopContributor data={filteredData} category="eod_update" />
                <TopContributor data={filteredData} category="pr_opened" />
                <TopContributor data={filteredData} category="pr_merged" />
                <TopContributor data={filteredData} category="pr_reviewed" />
                <TopContributor data={filteredData} category="issue_opened" />
                <TopContributor
                  data={filteredData}
                  category="comment_created"
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
