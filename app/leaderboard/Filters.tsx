"use client";

import Search from "@/components/filters/Search";
import Sort from "@/components/filters/Sort";
import { dateString, padZero, parseDateRangeSearchParam } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
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

export default function LeaderboardFilters(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));

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
    <div className="mx-4 md:mx-0 mt-4 p-4 border border-primary-500 rounded-lg">
      <div className="flex flex-col md:flex-row justify-evenly items-center md:items-start gap-4">
        <Search
          value={props.searchTerm}
          handleOnChange={(e) => props.setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="w-full flex items-end justify-start gap-2">
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
            className="w-full"
          />
        </div>
        <div className="w-full flex items-center justify-center gap-2">
          <input
            className="w-full"
            type="date"
            value={dateString(start)}
            onChange={(e) => {
              updateSearchParam(
                "between",
                `${e.target.value}...${dateString(end)}`,
              );
            }}
          />
          <input
            className="w-full"
            type="date"
            value={dateString(end)}
            onChange={(e) => {
              updateSearchParam(
                "between",
                `${dateString(start)}...${e.target.value}`,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
