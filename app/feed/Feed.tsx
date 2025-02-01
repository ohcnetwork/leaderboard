"use client";

import {
  useMemo,
  useState,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import { IGitHubEvent } from "@/lib/gh_events";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { FilterOption, EventType } from "@/lib/types";

interface FeedProps {
  events: IGitHubEvent[];
  filterOptions: FilterOption[];
}

export default function Feed({ events, filterOptions }: FeedProps) {
  const [repoFilter, setRepoFilter] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const repositories = useMemo(
    () => filterOptions.find((f) => f.title === "repository")?.options || [],
    [filterOptions],
  );

  const filteredRepos = useMemo(() => {
    return repositories.filter(
      (repo) =>
        repo.toLowerCase().includes(repoFilter.toLowerCase()) &&
        !selectedRepos.includes(repo),
    );
  }, [repositories, repoFilter, selectedRepos]);

  const uniqueTypes = useMemo(
    () => filterOptions.find((f) => f.title === "events")?.options || [],
    [filterOptions],
  );

  const [activeTypes, setActiveTypes] = useState<EventType[]>(
    () =>
      (filterOptions.find((f) => f.title === "events")?.options ||
        []) as EventType[],
  );

  const handleRepoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRepoFilter(e.target.value);
    setIsDropdownOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => {
          const newIndex = Math.min(prev + 1, filteredRepos.length - 1);
          requestAnimationFrame(() => scrollActiveItemIntoView());
          return newIndex;
        });
      } else {
        setSelectedIndex((prev) => {
          const newIndex = Math.max(prev - 1, -1);
          requestAnimationFrame(() => scrollActiveItemIntoView());
          return newIndex;
        });
      }
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      selectRepo(filteredRepos[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const scrollActiveItemIntoView = () => {
    if (activeItemRef.current && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const activeItem = activeItemRef.current;

      const dropdownRect = dropdown.getBoundingClientRect();
      const activeItemRect = activeItem.getBoundingClientRect();

      if (activeItemRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += activeItemRect.bottom - dropdownRect.bottom;
      } else if (activeItemRect.top < dropdownRect.top) {
        dropdown.scrollTop += activeItemRect.top - dropdownRect.top;
      }
    }
  };

  const selectRepo = (repo: string) => {
    setSelectedRepos((prev) => [...prev, repo]);
    setRepoFilter("");
    setIsDropdownOpen(false);
  };

  const removeRepo = (repo: string) => {
    setSelectedRepos((prev) => prev.filter((r) => r !== repo));
  };

  const handleClearRepo = () => {
    setRepoFilter("");
    setIsDropdownOpen(false);
  };

  const handleClearAllRepos = () => {
    setSelectedRepos([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeToggle = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type as EventType)
        ? prev.filter((t) => t !== (type as EventType))
        : [...prev, type as EventType],
    );
  };

  const handleToggleAll = () => {
    setActiveTypes(
      activeTypes.length === uniqueTypes.length
        ? []
        : (uniqueTypes as EventType[]),
    );
  };

  const filteredEvents = useMemo(() => {
    const eventTypeFiltered = events.filter((e) =>
      activeTypes.includes(e.type),
    );
    if (selectedRepos.length === 0) {
      return eventTypeFiltered;
    }
    return eventTypeFiltered.filter((event) =>
      selectedRepos.includes(`${event.repo.name.split("/")[1]}`),
    );
  }, [events, selectedRepos, activeTypes]);

  return (
    <div className="relative mx-auto my-8 max-w-7xl p-4">
      <h1 className="mb-8 text-4xl text-primary-500 dark:text-white">Feed</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="order-first lg:order-last lg:col-span-1">
          <div
            className="sticky top-24 w-full space-y-6 rounded-lg border border-gray-200 
                         bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Filters
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Repository
                  </label>
                  {selectedRepos.length > 0 && (
                    <button
                      onClick={handleClearAllRepos}
                      className="text-sm text-primary-600 hover:text-primary-800 
                                                     dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      selectedRepos.length
                        ? "Add another repository"
                        : "Filter by Repository"
                    }
                    value={repoFilter}
                    onChange={handleRepoChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full rounded-md border border-gray-300 bg-white p-2 
                                                 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500
                                                 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {repoFilter && (
                    <button
                      onClick={handleClearRepo}
                      className="absolute right-2 top-1/2 -translate-y-1/2 
                               text-gray-500 hover:text-gray-700 
                               dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  )}
                  {isDropdownOpen && filteredRepos.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-10 mt-1 max-h-60 w-full overflow-auto 
                               rounded-md border border-gray-200 
                               bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {filteredRepos.map((repo, index) => (
                        <div
                          key={repo}
                          ref={index === selectedIndex ? activeItemRef : null}
                          onClick={() => selectRepo(repo)}
                          className={`cursor-pointer px-4 py-2 text-gray-900 hover:bg-gray-100
                                   dark:text-white dark:hover:bg-gray-600
                                   ${index === selectedIndex ? "bg-gray-100 dark:bg-gray-600" : ""}`}
                        >
                          {repo}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedRepos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
                    {selectedRepos.map((repo) => (
                      <div
                        key={repo}
                        className="group inline-flex items-center rounded-md border border-gray-200
                                                         bg-white px-3 
                                                         py-1.5 shadow-sm dark:border-gray-600
                                                         dark:bg-gray-700"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {repo}
                        </span>
                        <button
                          onClick={() => removeRepo(repo)}
                          className="ml-2 rounded-full p-0.5
                                                             text-gray-400 transition-colors 
                                                             hover:bg-gray-100 hover:text-gray-600
                                                             dark:text-gray-500 dark:hover:bg-gray-600
                                                             dark:hover:text-gray-300"
                          aria-label={`Remove ${repo}`}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Types
                  </label>
                  <button
                    onClick={handleToggleAll}
                    className="text-sm text-primary-600 hover:text-primary-800 
                             dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {activeTypes.length === uniqueTypes.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueTypes.map((type) => (
                    <label
                      key={type}
                      className="inline-flex cursor-pointer items-center rounded-full bg-gray-100
                               px-3 py-1 
                               hover:bg-gray-200 dark:bg-gray-700 
                               dark:hover:bg-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={activeTypes.includes(type as EventType)}
                        onChange={() => handleTypeToggle(type)}
                        className="mr-2 text-primary-600 
                                 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-last lg:order-first lg:col-span-2">
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredEvents.length} of {events.length} events
          </div>

          <ul role="list" className="flex flex-col gap-4">
            {filteredEvents.map((e) => (
              <GitHubEvent key={e.id} event={e} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
