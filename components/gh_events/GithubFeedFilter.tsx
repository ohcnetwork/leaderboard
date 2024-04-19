"use client";
import { FilterOption } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  return (
    <div className="flex flex-col lg:flex-row-reverse lg:justify-between">
      {/* Filter Component */}
      <div className="w-full lg:sticky lg:top-20 lg:ml-auto lg:mr-0 lg:w-auto">
        <div className="mx-auto min-w-max rounded-lg border border-primary-500 p-4 shadow-lg lg:my-20">
          <span className="mb-2 text-2xl font-bold">Filter Activity</span>
          <div className="mx-auto mt-4">
            <ul className="filters mx-auto space-y-4">
              {filterEvents.map((filter, index) => (
                <li key={index} className="flex flex-col overflow-x-hidden">
                  <span className="mb-2 font-semibold">{filter.title}</span>
                  {filter.options && (
                    <select
                      className="rounded-md border-2 border-secondary-600 bg-background p-2 sm:p-1"
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
                          value={option}
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
    </div>
  );
};

export default GithubFeed;
