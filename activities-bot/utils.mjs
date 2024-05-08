import { readFile, readdir } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";

const { Octokit } = require("octokit");

const root = join(
  process.cwd(),
  process.env.CONTRIBUTORS_DIR || "data-repo/contributors",
);

async function getContributorBySlug(file) {
  const { data } = matter(await readFile(join(root, file), "utf8"));
  return {
    github: file.replace(/\.md$/, ""),
    slack: data.slack,
  };
}

export async function getContributors() {
  const slugs = await readdir(`${root}`);
  const contributors = await Promise.all(
    slugs.map((path) => getContributorBySlug(path)),
  );

  return Object.fromEntries(
    contributors
      .filter((contributor) => !!contributor.slack)
      .map((c) => [c.github, c.slack]),
  );
}

const GITHUB_ORG = process.env.GITHUB_ORG;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LEADERBOARD_API_KEY = process.env.LEADERBOARD_API_KEY;
const LEADERBOARD_URL = process.env.LEADERBOARD_URL;
const SLACK_EOD_BOT_TOKEN = process.env.SLACK_EOD_BOT_TOKEN;
const SLACK_EOD_BOT_CHANNEL = process.env.SLACK_EOD_BOT_CHANNEL;

function isAllowedEvent(event) {
  if (event.type === "PullRequestEvent") {
    return event.payload.action === "opened";
  }

  if (event.type === "PullRequestReviewEvent") {
    return true;
  }
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function getEvents(allowedAuthors) {
  const aDayAgoDate = new Date();
  aDayAgoDate.setDate(aDayAgoDate.getDate() - 1);
  const aDayAgo = aDayAgoDate.getTime();

  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    { org: GITHUB_ORG, per_page: 1000 },
    (res) =>
      res.data.filter(
        (event) =>
          allowedAuthors.includes(event.actor.login) &&
          isAllowedEvent(event) &&
          event.created_at &&
          new Date(event.created_at).getTime() > aDayAgo,
      ),
  );

  return Object.groupBy(events, (e) => e.actor.login);
}

export function mergeUpdates(events, eodUpdates) {
  const updates = [];
  const counts = {
    eod_updates: eodUpdates.length,
    pull_requests: 0,
    reviews: 0,
  };

  updates.push(...eodUpdates.map((title) => ({ title })));

  for (const event of events) {
    if (event.type === "PullRequestReviewEvent") {
      const url = event.payload.pull_request.html_url;
      if (!updates.find((a) => a.url === url)) {
        counts.reviews += 1;
        updates.push({
          title: `Reviewed PR: "${event.payload.pull_request.title}"`,
          url,
        });
      }
    }

    if (
      event.type === "PullRequestEvent" &&
      event.payload.action === "opened"
    ) {
      counts.pull_requests += 1;
      updates.push({
        title: `Opened PR: "${event.payload.pull_request.title}"`,
        url: event.payload.pull_request.html_url,
      });
    }
  }

  return { updates, counts };
}

const leaderboardApiHeaders = {
  "Content-Type": "application/json",
  Authorization: `${LEADERBOARD_API_KEY}`,
};

const eodUpdatesApi = `${LEADERBOARD_URL}/api/slack-eod-bot/eod-updates`;

export async function getEODUpdates() {
  const res = await fetch(eodUpdatesApi, {
    headers: leaderboardApiHeaders,
  });
  return res.json();
}

export async function flushEODUpdates() {
  await fetch(eodUpdatesApi, {
    headers: leaderboardApiHeaders,
    method: "DELETE",
  });
}

const slackApiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SLACK_EOD_BOT_TOKEN}`,
};

export async function sendSlackMessage(channel, text, blocks) {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: slackApiHeaders,
    body: JSON.stringify({
      channel,
      text,
      ...blocks,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error(data);
  }
}

function getHumanReadableUpdates({ updates, counts }, slackID, githubId) {
  const colorRange = [
    { color: "#00FF00", min: 5 },
    { color: "#FFFF00", min: 1 },
    { color: "#FF0000", min: 0 },
  ];

  const activityCount =
    counts.pull_requests + counts.reviews + counts.eod_updates;

  const color =
    colorRange.find((range) => range.min <= activityCount)?.color || "#0000FF";

  return {
    attachments: [
      {
        color,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `
*EOD Updates for <@${slackID}>*

Summary: Opened *${counts.pull_requests}* pull requests, Reviewed *${counts.reviews}* PRs and *${counts.eod_updates}* other general updates.

<https://github.com/${githubId}|GitHub Profile> | <${LEADERBOARD_URL}/contributors/${githubId}|Contributor Profile>
`,
            },
            accessory: {
              type: "image",
              image_url: `https://avatars.githubusercontent.com/${githubId}?s=128`,
              alt_text: "profile image",
            },
          },

          {
            type: "divider",
          },
          {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  {
                    type: "text",
                    text: "Updates:",
                    style: { bold: true },
                  },
                  {
                    type: "text",
                    text: `\n${updates.length === 0 ? "No updates for today" : ""}`,
                  },
                ],
              },
              {
                type: "rich_text_list",
                style: "bullet",
                elements: updates.map((item) => {
                  const elements = [
                    {
                      type: "text",
                      text: item.title,
                    },
                  ];

                  if (item.url) {
                    let preview = "";

                    if (item.url.startsWith("https://github.com")) {
                      preview = item.url.replace("https://github.com/", "");
                      const [org, repo, type, number] = preview.split("/");
                      preview = `${repo}#${number.split("#")[0]}`;
                    }

                    elements.push({
                      type: "link",
                      text: ` ${preview} ↗`,
                      url: item.url,
                    });
                  }

                  return {
                    type: "rich_text_section",
                    elements,
                  };
                }),
              },
            ],
          },
        ],
      },
    ],
  };
}

export async function postEODMessage({ github, slack, updates }) {
  await sendSlackMessage(
    SLACK_EOD_BOT_CHANNEL,
    "",
    getHumanReadableUpdates(updates, slack, github),
  );
}
