"use client";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { useState, useEffect } from "react";

const GithubFeed = (props: any) => {
  const { events } = props;
  const { filterEvetns } = props;
  const [e, setEvents] = useState<any[]>(events);
  const [repo, setRepo] = useState("All");
  const [eventType, setEventType] = useState("All");

  const filterEvents = () => {
    console.log("Hey I am here");
    let filteredEvents = events;
    console.log(eventType);
    if (repo !== "All" && eventType !== "All") {
      filteredEvents = events.filter(
        (event: any) =>
          event.repo.name.split("/").pop() === repo && event.type === eventType,
      );
    } else if (eventType !== "All") {
      filteredEvents = events.filter((event: any) => event.type === eventType);
    } else if (repo !== "All") {
      filteredEvents = events.filter(
        (event: any) => event.repo.name.split("/").pop() === repo,
      );
    }
    setEvents(filteredEvents);
  };

  return (
    <div className="flex justify-between">
      <div className="relative my-8 flow-root max-w-4xl p-4">
        <h1 className="text-4xl text-primary-500 dark:text-white">Feed</h1>
        <ul role="list" className="mb-20 mt-10 flex flex-col gap-4 space-y-4">
          {e.length === 0 && (
            <div className="h-full w-full text-center text-lg font-bold">
              No Activity Found
            </div>
          )}
          {e.map((event: any) => (
            <GitHubEvent key={event.id} event={event} />
          ))}
        </ul>
      </div>
      <div className="my-20 h-fit max-w-min rounded-md border border-white p-4">
        <span className="text-xl">Filter Activity</span>
        <div className="mx-auto h-fit">
          <ul className="mx-auto">
            {filterEvetns.map((filter, index) => (
              <li key={index}>
                <span>{filter.title}</span>
                {filter.options && (
                  <select
                    value={filter.title === "Events" ? eventType : repo}
                    onChange={(e) => {
                      if (filter.title === "Repository")
                        setRepo(e.target.value);
                      else if (filter.title === "Events")
                        setEventType(e.target.value);
                    }}
                  >
                    {filter.options.map((option, optionIndex) => (
                      <option key={optionIndex}>{option}</option>
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
  );
};

export default GithubFeed;
