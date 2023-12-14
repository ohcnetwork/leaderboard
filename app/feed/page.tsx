import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { IGitHubEvent } from "@/lib/gh_events";
import FeedPagination from "./FeedPagination";

export const revalidate = 300; // revalidate at most every 5 mins

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

export default async function FeedPage({ searchParams }: Props) {
  const page = (searchParams.page && parseInt(searchParams.page)) || 1;

  const res = await fetch(
    `https://api.github.com/orgs/${process.env.NEXT_PUBLIC_GITHUB_ORG}/events?per_page=20&page=${page}`,
  );

  const linkHeader = res.headers.get("link");
  const navLinks = linkHeader ? extractPaginationLinks(linkHeader) : undefined;

  const data = (await res.json()) as IGitHubEvent[];
  const events = data.filter(exludeBotEvents).filter(excludeBlacklistedEvents);

  return (
    <div className="flow-root max-w-4xl mx-auto my-8 relative">
      <h1 className="text-primary-500 dark:text-white text-4xl">Feed</h1>
      <ul role="list" className="space-y-4 flex flex-col gap-4 mt-10 mb-20">
        {events.map((e) => (
          <GitHubEvent key={e.id} event={e} />
        ))}
      </ul>
      <div className="flex flex-row justify-center">
        {navLinks && <FeedPagination navLinks={navLinks} />}
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
