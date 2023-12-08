"use client";

import { IGitHubEvent } from "@/lib/gh_events";
import { useEffect, useState } from "react";
import GitHubEvent from "./GitHubEvent";

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
    fetch(
      `https://api.github.com/orgs/${process.env.NEXT_PUBLIC_GITHUB_ORG}/events?per_page=20&page=${page}`
    )
      .then((res) => res.json())
      .then((data) =>
        setEvents(
          data
            .filter(exludeBotEvents)
            .filter(excludeBlacklistedEvents)
            .slice(0, 5)
        )
      );
  }, [page]);

  return (
    <div className="flow-root">
      <ul role="list" className="space-y-4 flex flex-col gap-4 mt-4 -mb-8">
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
