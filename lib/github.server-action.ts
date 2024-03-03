import { IGitHubEvent } from "@/lib/gh_events";
import { Octokit } from "octokit";

const GITHUB_PAT: string = process.env.GITHUB_PAT || "";
const GITHUB_ORG: string = process.env.NEXT_PUBLIC_GITHUB_ORG || "";

const octokit = new Octokit({
  auth: GITHUB_PAT,
});

export const eventTypes = [
  "MemberEvent",
  "IssuesEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
  "PushEvent",
  "ForkEvent",
  "ReleaseEvent",
  "IssueCommentEvent",
];

export async function fetchFilteredGitHubEvents() {
  try {
    const response = await octokit.request("GET /orgs/{org}/events", {
      org: GITHUB_ORG,
      per_page: 800,
      type: eventTypes.join(","),
    });
    const data = response.data as IGitHubEvent[];
    const filteredData = data
      .filter(exludeBotEvents)
      .filter(excludeBlacklistedEvents);
    return filteredData;
  } catch (error) {
    console.error("Error fetching filtered GitHub events:", error);
    throw error;
  }
}

export const excludeBlacklistedEvents = (event: IGitHubEvent) => {
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

export const exludeBotEvents = (event: IGitHubEvent): boolean => {
  return !event.actor.login.includes("bot");
};
