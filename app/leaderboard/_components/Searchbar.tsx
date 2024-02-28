"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Search from "@/components/filters/Search";
import Sort from "@/components/filters/Sort";
import format from "date-fns/format";
import DateRangePicker from "@/components/DateRangePicker";
import RoleFilter from "@/components/filters/RoleFilter";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { SORT_BY_OPTIONS } from "./Leaderboard";
import { LeaderboardPageProps } from "../page";

export default function Searchbar({ searchParams }: LeaderboardPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [start, end] = parseDateRangeSearchParam(searchParams.between);

  const updateSearchParam = (key: string, value?: string) => {
    const current = new URLSearchParams(searchParams as Record<string, string>);
    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm) {
      updateSearchParam("search", searchTerm);
    } else {
      updateSearchParam("search");
    }
  };

  return (
    <div className="mx-4 mt-4 rounded-lg border border-primary-500 p-4 md:mx-0">
      <div className="flex flex-col flex-wrap gap-4 md:flex-row">
        <Search
          value={searchTerm}
          handleSubmit={handleSubmit}
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
          className="md:grow-1 grow"
        />
        <RoleFilter
          filterOptions={RoleOptions}
          value={
            searchParams.role
              ? searchParams.role
                  .toString()
                  .split(",")
                  .map((value) => ({
                    value,
                    text: FILTER_BY_ROLE_OPTIONS[
                      value as keyof typeof FILTER_BY_ROLE_OPTIONS
                    ],
                  }))
              : []
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
            searchParams.sortBy
              ? ({
                  value: searchParams.sortBy,
                  text: SORT_BY_OPTIONS[
                    searchParams.sortBy as keyof typeof SORT_BY_OPTIONS
                  ],
                } as (typeof SortOptions)[number])
              : { value: "points", text: "Points" }
          }
          onChange={(selectedOption) =>
            updateSearchParam("sortBy", selectedOption?.value)
          }
          sortDescending={searchParams.ordering === "asc"}
          handleSortOrderChange={() => {
            updateSearchParam(
              "ordering",
              searchParams.ordering === "asc" ? "desc" : "asc",
            );
          }}
          className="md:grow-1 grow md:w-[120px] "
        />
      </div>
    </div>
  );
}

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
