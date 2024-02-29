"use client";
import { IGitHubEvent, combineSimilarPushEvents } from "@/lib/gh_events";
import { useEffect, useState } from "react";
import GitHubEvent from "./GitHubEvent";
import { env } from "@/env.mjs";

const exludeBotEvents = (event: IGitHubEvent) => {
  return !event.actor.login.includes("bot");
};

const excludeBlacklistedEvents = (event: IGitHubEvent) => {
  const blacklist = [
    "CreateEvent",
    "WatchEvent",
    "PullRequestReviewEvent",
    "PullRequestReviewCommentEvent",
    "DeleteEvent",
    "IssueCommentEvent",
  ] as IGitHubEvent["type"][];

  return !blacklist.includes(event.type);
};

export default function GitHubEvents({ minimal }: { minimal?: boolean }) {
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<IGitHubEvent[]>();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/events?per_page=100&page=${page}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const filteredData = data
          .filter(exludeBotEvents)
          .filter(excludeBlacklistedEvents);
        const combinedEvents = combineSimilarPushEvents(filteredData).slice(
          0,
          5,
        );
        setEvents(combinedEvents);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchEvents();
  }, [page]);

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8 mt-4 flex flex-col gap-4 space-y-4">
        {events ? (
          events.map((e) => <GitHubEvent key={e.id} event={e} />)
        ) : (
          <>
            <GitHubEvent />
            <GitHubEvent />
            <GitHubEvent />
            <GitHubEvent />
            <GitHubEvent />
          </>
        )}
      </ul>
    </div>
  );
}
