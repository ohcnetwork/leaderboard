"use client";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { IGitHubEvent } from "@/lib/gh_events";
import { useState } from "react";

interface Filter {
  title: string;
  options: string[];
}
interface Props {
  events: IGitHubEvent[];
  filterEvetns: Filter[];
}

const GithubFeed = (props: Props) => {
  const { events, filterEvetns } = props;
  const [e, setEvents] = useState(events);
  const [repo, setRepo] = useState("All");
  const [eventType, setEventType] = useState("All");

  const filterEvents = () => {
    let filteredEvents = events;
    if (repo !== "All" && eventType !== "All") {
      filteredEvents = e.filter(
        (events: IGitHubEvent) =>
          events.repo.name.split("/").pop() === repo &&
          events.type === eventType,
      );
    } else if (eventType !== "All") {
      filteredEvents = events.filter(
        (events: IGitHubEvent) => events.type === eventType,
      );
    } else if (repo !== "All") {
      filteredEvents = e.filter(
        (events: IGitHubEvent) => events.repo.name.split("/").pop() === repo,
      );
    }
    setEvents(filteredEvents);
  };

  return (
    <div className="lg:justify-betw flex flex-col lg:flex-row-reverse">
      {/* Filter Component */}
      <div className="w-full lg:sticky lg:top-20 lg:ml-auto lg:mr-0">
        <div className="mx-auto h-fit max-w-min rounded-md border border-white p-4 lg:my-20">
          <span className="mb-2 text-2xl font-bold">Filter Activity</span>
          <div className="mx-auto mt-4 h-fit">
            <ul className="filters mx-auto space-y-2">
              {filterEvetns.map((filter, index) => (
                <li key={index} className="filter-item">
                  <span className="filter-title">{filter.title}</span>
                  {filter.options && (
                    <select
                      className="filter-select rounded-md bg-secondary-800 p-2"
                      value={filter.title === "Events" ? eventType : repo}
                      onChange={(e) => {
                        if (filter.title === "Repository")
                          setRepo(e.target.value);
                        else if (filter.title === "Events")
                          setEventType(e.target.value);
                      }}
                    >
                      {filter.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </li>
              ))}
            </ul>

            <button
              onClick={() => filterEvents()}
              className="mx-auto mt-3 block cursor-pointer rounded border border-primary-500 bg-gradient-to-b from-primary-500 to-primary-700 p-3 px-10 text-center font-bold text-white shadow-lg transition hover:from-secondary-800 hover:to-secondary-900 hover:text-primary-500 hover:shadow-xl"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>

      {/* Feed Component */}
      <div className="relative flow-root w-full max-w-4xl p-4 lg:my-8">
        <h1 className="text-4xl text-primary-500 dark:text-white">Feed</h1>
        <ul role="list" className="mb-20 mt-10 flex flex-col gap-4 space-y-4">
          {e.length === 0 && (
            <div className="h-full w-full text-center text-lg font-bold">
              No Activity Found
            </div>
          )}
          {e.map((event: IGitHubEvent) => (
            <GitHubEvent key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GithubFeed;
