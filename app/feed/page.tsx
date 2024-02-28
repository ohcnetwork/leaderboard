"use client";

import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { IGitHubEvent, combineSimilarPushEvents } from "@/lib/gh_events";
import { useEffect, useState } from "react";
import { scrollTo } from "@/lib/utils";
import LoadingText from "@/components/LoadingText";
import { env } from "@/env.mjs";

type Props = {
  searchParams: {
    page?: string;
  };
};

function extractPaginationLinks(text: string) {
  // Ref: https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api?apiVersion=2022-11-28#using-link-headers
  const regex = /<([^>]+)>; rel="([^"]+)"/g;
  const pageNums = {
    first: undefined as string | undefined,
    prev: undefined as string | undefined,
    next: undefined as string | undefined,
    last: undefined as string | undefined,
  };

  let match;
  while ((match = regex.exec(text)) !== null) {
    const page = new URL(match[1]).searchParams.get("page");
    pageNums[match[2] as keyof typeof pageNums] = page
      ? `/feed?page=${page}`
      : undefined;
  }

  return pageNums;
}

export default function FeedPage({ searchParams }: Props) {
  const [lastFetchedPage, setLastFetchedPage] = useState(1);
  const [events, setEvents] = useState<Record<number, IGitHubEvent[]>>({});

  useEffect(() => {
    fetch(
      `https://api.github.com/orgs/${env.NEXT_PUBLIC_GITHUB_ORG}/events?per_page=1000&page=${lastFetchedPage}`,
    )
      .then((res) => res.json())
      .then((data: IGitHubEvent[]) => {
        setEvents((existing) => ({
          ...existing,
          page: combineSimilarPushEvents(
            data.filter(exludeBotEvents).filter(excludeBlacklistedEvents),
          ),
        }));

        if (lastFetchedPage !== 1) {
          const lastEvents = events[lastFetchedPage - 1];
          scrollTo(`gh-event-${lastEvents[lastEvents.length - 1].id}`);
        }
      });
  }, [lastFetchedPage]);

  const allEvents = ([] as IGitHubEvent[]).concat(...Object.values(events));

  if (!Object.entries(events).length) {
    return <LoadingText text="Fetching latest events" />;
  }

  return (
    <div className="flow-root max-w-4xl mx-auto my-8 relative p-4">
      <h1 className="text-primary-500 dark:text-white text-4xl">Feed</h1>
      <ul role="list" className="space-y-4 flex flex-col gap-4 mt-10 mb-20">
        {allEvents.map((e) => (
          <GitHubEvent key={e.id} event={e} />
        ))}
      </ul>
      <div className="flex flex-row justify-center">
        <span
          className="underline cursor-pointer"
          onClick={() => setLastFetchedPage((p) => p + 1)}
        >
          Show more
        </span>
      </div>
    </div>
  );
}

const exludeBotEvents = (event: IGitHubEvent) => {
  return !event.actor.login.includes("bot");
};

const excludeBlacklistedEvents = (event: IGitHubEvent) => {
  const blacklist = [
    "CreateEvent",
    "WatchEvent",
    // "PullRequestReviewEvent",
    "PullRequestReviewCommentEvent",
    "DeleteEvent",
    "IssueCommentEvent",
  ] as IGitHubEvent["type"][];

  return !blacklist.includes(event.type);
};
