import LoadingText from "@/components/LoadingText";
import { IGitHubEvent } from "@/lib/gh_events";
import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";
import {
  // fetchAllBranchName,
  fetchAllReposName,
} from "../api/leaderboard/functions";
import GithubFeedFilter from "../../components/gh_events/GithubFeedFilter";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { FilterOption } from "@/lib/types";

const GITHUB_ORG: string = env.NEXT_PUBLIC_GITHUB_ORG;

export const revalidate = 600;

export default async function FeedPage({ searchParams }: any) {
  const { Repository, Events } = searchParams;
  const repositories = await fetchAllReposName();
  const filterEvents: FilterOption[] = [
    { title: "Repository", options: ["All", ...repositories] },
    {
      title: "Events",
      options: [
        "All",
        "PullRequestReviewCommentEvent",
        "PullRequestReviewEvent",
        "MemberEvent",
        "IssuesEvent",
        "IssueCommentEvent",
        "PullRequestEvent",
        "PushEvent",
        "ForkEvent",
        "ReleaseEvent",
      ],
    },
  ] as const;
  let events = await octokit.paginate(
    "GET /orgs/{org}/events",
    {
      org: GITHUB_ORG,
      per_page: 1000,
    },
    (response) => {
      const data = response.data as IGitHubEvent[];
      return data.filter(exludeBotEvents).filter(excludeBlacklistedEvents);
    },
  );
  if (!Object.entries(events).length) {
    return <LoadingText text="Fetching latest events" />;
  }

  if (Repository && Events) {
    events = events.filter((event) => {
      const repoName = event.repo.name.replace(
        `${env.NEXT_PUBLIC_GITHUB_ORG}/`,
        "",
      );
      return (
        repoName === searchParams.Repository &&
        event.type === searchParams.Events
      );
    });
  } else if (Repository) {
    events = events.filter((event) => {
      const repoName = event.repo.name.replace(
        `${env.NEXT_PUBLIC_GITHUB_ORG}/`,
        "",
      );
      return repoName === searchParams.Repository;
    });
  } else if (Events) {
    events = events.filter((event) => {
      return event.type === searchParams.Events;
    });
  }

  return (
    <>
      <div className="lg:justify-betw flex flex-col lg:flex-row-reverse">
        <GithubFeedFilter filterEvents={filterEvents} />
        <div className="relative flow-root w-full max-w-4xl p-4 lg:my-8">
          <h1 className="text-4xl text-primary-500 dark:text-white">Feed</h1>
          <ul role="list" className="mb-20 mt-10 flex flex-col gap-4 space-y-4">
            {events.map((e) => (
              <GitHubEvent key={e.id} event={e} />
            ))}
          </ul>
        </div>
      </div>
    </>
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
  ];

  return !blacklist.includes(event.type);
};
