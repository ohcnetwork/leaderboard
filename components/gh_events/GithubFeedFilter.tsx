"use client";
import { FilterOption } from "@/lib/types";
import Search from "../filters/Search";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const GithubFeed = (props: { filterEvents: FilterOption[] }) => {
  const { filterEvents } = props;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const updateSearchParam = (key: string, value: string) => {
    setSearchValue(value);
    setSuggestions([]);
    const params = new URLSearchParams(searchParams.toString());

    !!value ? params.set(key, value) : params.delete(key);

    router.push(pathname + "?" + params.toString());
  };
  const repositories = filterEvents.find(
    (filterEvents) => filterEvents.title === "repository",
  );

  // Load suggestions of repsitories name based on user input
  const autoFill = (value: string) => {
    setSearchValue(value);
    if (value.length === 0) {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions: string[] | undefined =
      repositories?.options?.filter((repo) =>
        repo.toLowerCase().includes(value.toLowerCase()),
      );
    setSuggestions(filteredSuggestions ?? []);
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-around py-5">
      <div className="flex w-full">
        <div className="w-3/5">
          <Search
            value={searchValue}
            defaultValue={"" ?? ""}
            handleOnChange={(e) => autoFill(e.target.value)}
            className="w-full grow"
          />
          {suggestions && suggestions.length > 0 && (
            <div className="absolute z-10 max-h-[50%] w-1/2 overflow-y-scroll rounded-md border-2 border-secondary-100 bg-background text-foreground shadow-lg">
              <ul className="divide-y">
                {suggestions?.map((opt, index) => (
                  <li
                    key={index}
                    onClick={(e) => {
                      updateSearchParam("repository", opt);
                    }}
                    className="cursor-pointer px-3 py-1 hover:bg-gray-500"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="ml-4 flex items-center rounded-md border-2 border-secondary-500 p-1 md:ml-6">
          <ul className="mx-auto">
            {filterEvents.map((filter, index) => (
              <li key={index} className="flex flex-col">
                {filter.title === "events" && (
                  <select
                    className="cursor-pointer bg-background px-3 py-1 text-sm sm:p-1"
                    value={filter.selectedOption}
                    onChange={(e) => {
                      updateSearchParam(filter.title, e.target.value);
                    }}
                  >
                    <option className="cursor-pointer px-3 py-2" value="">
                      All
                    </option>
                    {filter.options.map((option, optionIndex) => (
                      <option
                        className="cursor-pointer px-3 py-2"
                        key={optionIndex}
                        value={option.replace(/\s+/g, "")}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GithubFeed;
