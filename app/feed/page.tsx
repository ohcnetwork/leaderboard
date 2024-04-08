import LoadingText from "@/components/LoadingText";
import { IGitHubEvent } from "@/lib/gh_events";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";
import {
  // fetchAllBranchName,
  fetchAllReposName,
} from "../api/leaderboard/functions";
import GithubFeed from "./GithubFeed";

const GITHUB_ORG: string = env.NEXT_PUBLIC_GITHUB_ORG;

export const revalidate = 600;

type Props = {
  searchParams: {
    page?: string;
  };
};

export default async function FeedPage({ searchParams }: Props) {
  const filterEvetns = [
    { title: "Repository", options: await fetchAllReposName() },
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
  ];
  const events = await octokit.paginate(
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
  return (
    <>
      {/* // <div className="flex"> */}
      {/* //   <div className="relative mx-auto my-8 flow-root max-w-4xl p-4"> */}
      {/* //     <h1 className="text-4xl text-primary-500 dark:text-white">Feed</h1> */}
      <GithubFeed events={events} filterEvetns={filterEvetns} />
      {/* <ul role="list" className="mb-20 mt-10 flex flex-col gap-4 space-y-4">
          {events.map((e) => (
            <GitHubEvent key={e.id} event={e} />
          ))}
        </ul> */}
      {/* </div> */}
      {/* </div> */}
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
