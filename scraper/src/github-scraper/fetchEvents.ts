import { octokit } from "./config.js";
import { IGitHubEvent } from "./types.js";

export const fetchEvents = async (
  org: string,
  startDate: Date,
  endDate: Date,
) => {
  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    {
      org: org,
      per_page: 1000,
    },
    (response: { data: IGitHubEvent[] }) => {
      return response.data;
    },
  );

  let eventsCount: number = 0;
  let filteredEvents = [];
  for (const event of events) {
    const eventTime: Date = new Date(event.created_at ?? 0);

    if (eventTime > endDate) {
      continue;
    } else if (eventTime <= startDate) {
      return filteredEvents;
    }
    const isBlacklisted: boolean = [
      "dependabot",
      "snyk-bot",
      "codecov-commenter",
      "github-actions[bot]",
    ].includes(event.actor.login);
    const isRequiredEventType: boolean = [
      "IssueCommentEvent",
      "IssuesEvent",
      "PullRequestEvent",
      "PullRequestReviewEvent",
    ].includes(event.type ?? "");

    if (!isBlacklisted && isRequiredEventType) {
      console.log(event.type);
      filteredEvents.push(event);
    }
    eventsCount++;
  }
  console.log("Fetched " + { eventsCount } + " events");

  return filteredEvents;
};
