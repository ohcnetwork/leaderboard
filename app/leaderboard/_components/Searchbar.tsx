"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Search from "@/components/filters/Search";
import Sort from "@/components/filters/Sort";
import format from "date-fns/format";
import DateRangePicker from "@/components/DateRangePicker";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { SORT_BY_OPTIONS } from "./Leaderboard";
import { LeaderboardPageProps } from "../page";

export default function Searchbar({ searchParams }: LeaderboardPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [start, end] = parseDateRangeSearchParam(searchParams.between);
  const updateSearchParam = (key: string, value?: string) => {
    const current = new URLSearchParams(searchParams);
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
    <div className="mx-4 md:mx-0 mt-4 p-4 border border-primary-500 rounded-lg">
      <div className="flex flex-col md:flex-row justify-evenly items-center md:items-start gap-4">
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
        />
        <Sort
          sortByOptions={Object.entries(SORT_BY_OPTIONS).map(
            ([value, text]) => ({ value, text }),
          )}
          sortBy={searchParams.sortBy ?? "points"}
          sortDescending={searchParams.ordering === "asc"}
          handleSortByChange={(e) =>
            updateSearchParam("sortBy", e.target.value)
          }
          handleSortOrderChange={() => {
            updateSearchParam(
              "ordering",
              searchParams.ordering === "asc" ? "desc" : "asc",
            );
          }}
          className="w-96"
        />
      </div>
    </div>
  );
}
