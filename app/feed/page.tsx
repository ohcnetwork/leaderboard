import LoadingText from "@/components/LoadingText";
import { IGitHubEvent } from "@/lib/gh_events";
import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";
import Feed from "@/components/gh_events/Feed";
import { EVENT_TYPES } from "@/lib/types";
import { fetchAllReposName } from "@/app/api/leaderboard/functions";
const GITHUB_ORG: string = env.NEXT_PUBLIC_GITHUB_ORG;

export default async function FeedPage() {
  const [events, repositories] = await Promise.all([
    octokit.paginate(
      "GET /orgs/{org}/events",
      {
        org: GITHUB_ORG,
        per_page: 1000,
      },
      (response) => {
        const data = response.data as IGitHubEvent[];
        return data.filter(excludeBotEvents).filter(excludeBlacklistedEvents);
      },
    ),
    fetchAllReposName(),
  ]);

  if (!Object.entries(events).length) {
    return <LoadingText text="Fetching latest events" />;
  }

  const filterOptions = [
    { title: "repository", options: repositories },
    { title: "events", options: EVENT_TYPES },
  ];

  return <Feed events={events} filterOptions={filterOptions} />;
}

const excludeBotEvents = (event: IGitHubEvent) => {
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
