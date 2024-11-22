import { octokit } from "./config.js";
import dotenv from "dotenv";

dotenv.config();

const BlacklistedUsers = [
  "dependabot",
  "snyk-bot",
  "codecov-commenter",
  "github-actions[bot]",
].concat(process.env.BLACKLISTED_USERS?.split(",") ?? []);

const AllowedEventTypes = [
  "IssueCommentEvent",
  "IssuesEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
];

export const fetchEvents = async (org: string) => {
  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    {
      org,
      per_page: 100,
    },
    (response) => {
      const filtered = response.data.filter((event) => {
        if (!event.type) {
          console.debug(`Skipping event without type`);
          return false;
        }
        if (event.actor.login.includes("[bot]")) {
          console.debug(`Skipping bot user: ${event.actor.login}`);
          return false;
        }
        if (BlacklistedUsers.includes(event.actor.login)) {
          console.debug(`Skipping blacklisted user: ${event.actor.login}`);
          return false;
        }
        if (!AllowedEventTypes.includes(event.type)) {
          console.debug(`Skipping event type: ${event.type}`);
          return false;
        }
        return true;
      });
      console.log(
        `Pulled ${filtered.length} relevant events out of ${response.data.length} events from page ${response.url}`,
      );
      return filtered;
    },
  );

  console.log(
    `Pulled ${events.length} events in total ranging from ${new Date(
      events[0].created_at ?? "",
    ).toLocaleString()} to ${new Date(
      events[events.length - 1].created_at ?? "",
    ).toLocaleString()}`,
  );

  const delay =
    new Date().getTime() - new Date(events[0].created_at ?? "").getTime();
  const delayHours = Math.floor(delay / 1000 / 60 / 60);
  const delayMinutes = Math.floor((delay / 1000 / 60) % 60);

  console.log(
    `The latest event is ${delayHours.toString().padStart(2, "0")}h ${delayMinutes.toString().padStart(2, "0")}m behind from now`,
  );

  return events;
};
