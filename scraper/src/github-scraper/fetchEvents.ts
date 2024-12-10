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
    { org, per_page: 100 },
    (response) => {
      const filtered = response.data.filter((event) => {
        if (!event.type) {
          console.debug(`Skipping event without type`);
          return false;
        }
        if (event.actor.login.endsWith("[bot]")) {
          return false;
        }
        if (BlacklistedUsers.includes(event.actor.login)) {
          return false;
        }
        if (!AllowedEventTypes.includes(event.type)) {
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
    ).toLocaleString()} (${getDurationString(
      new Date(events[0].created_at ?? ""),
      new Date(events[events.length - 1].created_at ?? ""),
    )})`,
  );

  console.log(
    `The latest event is ${getDurationString(
      new Date(),
      new Date(events[0].created_at ?? ""),
    )} behind from now`,
  );

  return events;
};

const getDurationString = (a: Date, b: Date) => {
  const diff = Math.abs(b.getTime() - a.getTime());
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return `${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m`;
};
