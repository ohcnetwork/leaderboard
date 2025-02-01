"use client";

import { useMemo, useState } from "react";
import { IGitHubEvent } from "@/lib/gh_events";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { FilterOption, EventType } from "@/lib/types";
import FeedFilter from "../filters/FeedFilter";

interface FeedProps {
  events: IGitHubEvent[];
  filterOptions: FilterOption[];
}

export default function Feed({ events, filterOptions }: FeedProps) {
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<EventType[]>(
    (filterOptions.find((f) => f.title === "events")?.options as EventType[]) ||
      [],
  );

  const { repositories, uniqueTypes } = useMemo(
    () => ({
      repositories:
        filterOptions.find((f) => f.title === "repository")?.options || [],
      uniqueTypes:
        filterOptions.find((f) => f.title === "events")?.options || [],
    }),
    [filterOptions],
  );

  const handleFilterChange = (repos: string[], types: EventType[]) => {
    setSelectedRepos(repos);
    setActiveTypes(types);
  };

  const filteredEvents = useMemo(() => {
    const eventTypeFiltered = events.filter((e) =>
      activeTypes.includes(e.type),
    );
    if (selectedRepos.length === 0) {
      return eventTypeFiltered;
    }
    return eventTypeFiltered.filter((event) =>
      selectedRepos.includes(event.repo.name.split("/")[1]),
    );
  }, [events, selectedRepos, activeTypes]);

  return (
    <div className="relative mx-auto my-8 max-w-7xl p-4">
      <h1 className="mb-8 text-4xl text-primary-500 dark:text-white">Feed</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <FeedFilter
          repositories={repositories}
          uniqueTypes={uniqueTypes}
          onFilterChange={handleFilterChange}
        />

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
