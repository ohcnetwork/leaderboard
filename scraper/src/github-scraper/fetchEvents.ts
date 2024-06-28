import { octokit } from "./config.js";
import dotenv from "dotenv";
dotenv.config();

const blacklistedUsers = [
  "dependabot",
  "snyk-bot",
  "codecov-commenter",
  "github-actions[bot]",
].concat(process.env.BLACKLISTED_USERS?.split(",") ?? []);

const requiredEventType = [
  "IssueCommentEvent",
  "IssuesEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
];

export const fetchEvents = async (
  org: string,
  startDate: Date,
  endDate: Date,
) => {
  const events = await octokit.paginate("GET /orgs/{org}/events", {
    org: org,
    per_page: 1000,
  });

  const filteredEvents = [];
  for (const event of events) {
    const eventTime: Date = new Date(event.created_at ?? 0);

    if (eventTime > endDate) {
      continue;
    } else if (eventTime <= startDate) {
      return filteredEvents;
    }

    if (
      !blacklistedUsers.includes(event.actor.login) &&
      requiredEventType.includes(event.type)
    ) {
      filteredEvents.push(event);
    }
  }
  console.log("Fetched " + filteredEvents.length + " events");

  return filteredEvents;
};
