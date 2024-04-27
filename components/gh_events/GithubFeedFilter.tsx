"use client";
import { FilterOption } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Search from "../filters/Search";

const GithubFeed = (props: { filterEvents: FilterOption[] }) => {
  const { filterEvents } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    !!value ? params.set(key, value) : params.delete(key);

    router.push(pathname + "?" + params.toString());
  };

  let suggestions: string[] | undefined;
  const repositories = filterEvents.find(
    (filterEvents) => filterEvents.title === "repository",
  );
  const autoFill = (value: string) => {
    // suggestions =
    // suggestions = repositories?.options.filter((repo) =>
    // );
  };

  return (
    <div className="mt-4 flex items-center justify-around rounded-md border-2 border-primary-600 py-5">
      <div className="w-3/5">
        <Search
          defaultValue={"" ?? ""}
          handleOnChange={(e) => autoFill(e.target.value)}
          className="grow"
        />
        {repositories && repositories.options.length > 0 && (
          <div className="absolute w-3/5 rounded-md border-2 border-secondary-100 bg-background">
            {repositories.options.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 hover:bg-secondary-500 hover:text-background"
                onClick={() => {
                  updateSearchParam("repository", suggestion);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-fit rounded-md  border-2 border-secondary-500 p-1">
        <ul className="mx-auto space-y-4">
          {filterEvents.map((filter, index) => (
            <li key={index} className="flex flex-col">
              {/* <span className="mb-2 font-semibold">{filter.title}</span> */}
              {filter.title === "events" && (
                <select
                  className="bg-background sm:p-1"
                  value={filter.selectedOption}
                  onChange={(e) => {
                    updateSearchParam(filter.title, e.target.value);
                  }}
                >
                  <option className="w-2 sm:w-auto sm:text-sm" value="">
                    All
                  </option>
                  {filter.options.map((option, optionIndex) => (
                    <option
                      className="w-2 sm:w-auto sm:text-sm"
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
  );
};

export default GithubFeed;
