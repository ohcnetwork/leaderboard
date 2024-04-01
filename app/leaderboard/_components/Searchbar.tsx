"use client";
import { usePathname, useRouter } from "next/navigation";
import Sort from "@/components/filters/Sort";
import format from "date-fns/format";
import DateRangePicker from "@/components/DateRangePicker";
import RoleFilter from "@/components/filters/RoleFilter";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { SORT_BY_OPTIONS, FILTER_BY_ROLE_OPTIONS } from "@/lib/const";
import { PageProps } from "@/lib/types";
import { env } from "@/env.mjs";
import { useState } from "react";
import { MdFilterList, MdFilterListOff } from "react-icons/md";
import TextSearchBar from "@/components/TextSearchBar";

const SortOptions = Object.entries(SORT_BY_OPTIONS).map(([value, text]) => ({
  value,
  text,
}));

export const RoleOptions = Object.entries(FILTER_BY_ROLE_OPTIONS).map(
  ([value, text]) => ({
    value,
    text,
  }),
);

export default function Searchbar({ searchParams }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [start, end] = parseDateRangeSearchParam(searchParams.between);
  const [showFilter, setShowFilter] = useState(false);

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

  const FilterComponents = () => {
    return (
      <>
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
          className="md:grow-1"
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
              : (env.NEXT_PUBLIC_LEADERBOARD_DEFAULT_ROLES as string)
                  .split(",")
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
          className="md:grow-1 mb-4 grow md:w-[120px]"
        />
      </>
    );
  };

  return (
    <div className="mx-4 mt-4 rounded-lg border border-primary-500 p-4 md:mx-0">
      <div className="flex flex-col flex-wrap sm:hidden">
        <div className="flex flex-row gap-2">
          <TextSearchBar searchString={searchParams.search} />
          <button onClick={() => setShowFilter(!showFilter)} className="">
            {showFilter ? (
              <MdFilterList className="mx-auto h-8 w-8 cursor-pointer" />
            ) : (
              <MdFilterListOff className="mx-auto h-8 w-8 cursor-pointer" />
            )}
          </button>
        </div>
        <div
          className={`${showFilter ? "mt-4 max-h-[50vh]" : "max-h-0"} flex flex-col gap-4 overflow-hidden transition-all duration-500 sm:hidden`}
        >
          <FilterComponents />
        </div>
      </div>
      <div className="hidden flex-col flex-wrap gap-4 sm:flex md:flex-row">
        <TextSearchBar searchString={searchParams.search} />
        <FilterComponents />
      </div>
    </div>
  );
}
