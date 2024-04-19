import { kv } from "@vercel/kv";
import { formatDuration as _formatDuration } from "date-fns";
import { getDailyReport } from "./contributor";
import { getContributors } from "@/lib/api";
import { Contributor } from "@/lib/types";

export const getHumanReadableUpdates = (
  data: Awaited<ReturnType<typeof getDailyReport>>,
  generalUpdates: string[],
  slackID: string,
) => {
  const sections = [
    {
      title: `Pull Requests Opened`,
      count: data.pull_requests.length,
      items: data.pull_requests.map((pr) => ({
        title: pr.title,
        url: pr.url,
      })),
    },
    {
      title: `Commits`,
      count: data.commits.length,
      items: data.commits.map((commit) => ({
        title: commit.title,
        url: commit.url,
      })),
    },
    {
      title: `Reviews`,
      count: data.reviews.length,
      items: data.reviews.map((review) => ({
        title: review.pull_request,
        url: review.url,
      })),
    },
    {
      title: `General updates`,
      count: generalUpdates.length,
      items: generalUpdates.map((title) => ({ title, url: undefined })),
    },
    {
      title: `Active Issues`,
      count: data.issues_active.length,
      items: data.issues_active.map((issue) => ({
        title: issue.title,
        url: issue.url,
      })),
    },
    {
      title: `Pending Issues`,
      count: data.issues_pending.length,
      items: data.issues_pending.map((issue) => ({
        title: issue.title,
        url: issue.url,
      })),
    },
  ];

  const colorRange = [
    {
      color: "#00FF00",
      min: 5,
    },
    {
      color: "#FFFF00",
      min: 1,
    },
    {
      color: "#FF0000",
      min: 0,
    },
  ];

  const color =
    colorRange.find(
      (range) =>
        range.min <=
        data.pull_requests.length + data.commits.length + data.reviews.length,
    )?.color || "#0000FF";

  return {
    attachments: [
      {
        color,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Updates for ${data.user_info.data.name || data.user_info.data.url.split("/").at(-1)}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `_${data.user_info.data.url.split("/").at(-1)}_\n<@${slackID}>\n<${data.user_info.data.url}|Github Profile>\n<${process.env.NEXT_PUBLIC_META_URL}/contributors/${data.user_info.data.url.split("/").at(-1)}|Contributor Profile>`,
            },
            accessory: {
              type: "image",
              image_url: data.user_info.data.avatar_url,
              alt_text: "profile image",
            },
          },
          ...sections.flatMap((section) => [
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
                      text: `${section.title} (${section.count})`,
                      style: {
                        bold: true,
                      },
                    },
                    {
                      type: "text",
                      text: `\n${section.items.length === 0 ? `No ${section.title.toLowerCase()} for today` : ""}`,
                    },
                  ],
                },
                {
                  type: "rich_text_list",
                  style: "bullet",
                  elements: section.items.map((item) => ({
                    type: "rich_text_section",
                    elements: [
                      item.url
                        ? {
                            type: "link",
                            text: item.title,
                            url: item.url,
                          }
                        : {
                            type: "text",
                            text: item.title,
                          },
                    ],
                  })),
                },
              ],
            },
          ]),
        ],
      },
    ],
  };
};

const slackApiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
};

export const sendSlackMessage = async (
  channel: string,
  text: string,
  blocks?: any,
) => {
  return await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: slackApiHeaders,
    body: JSON.stringify({
      channel,
      text,
      ...blocks,
    }),
  });
};

export const reactToMessage = async (
  channel: string,
  timestamp: string,
  reaction: string,
) => {
  return await fetch("https://slack.com/api/reactions.add", {
    method: "POST",
    headers: slackApiHeaders,
    body: JSON.stringify({
      channel,
      timestamp,
      name: reaction,
    }),
  });
};

const getEODUpdates = async (contributor: Contributor) => {
  return ((await kv.get("eod:" + contributor.github)) || []) as string[];
};

const setEODUpdates = async (contributor: Contributor, updates: string[]) => {
  await kv.set("eod:" + contributor.github, updates);
};

const clearEODUpdates = async (contributor: Contributor) => {
  await setEODUpdates(contributor, []);
};

const appendEODUpdate = async (contributor: Contributor, ...arr: string[]) => {
  const existing = await getEODUpdates(contributor);
  await setEODUpdates(contributor, [...existing, ...arr]);
};

export const EODUpdatesManager = (contributor: Contributor) => {
  return {
    get: () => getEODUpdates(contributor),
    set: (eodUpdates: string[]) => setEODUpdates(contributor, eodUpdates),
    clear: () => clearEODUpdates(contributor),
    append: (...updates: string[]) => appendEODUpdate(contributor, ...updates),
  };
};

export const updateAppHome = async (contributor: Contributor) => {
  const dailyReport = await getDailyReport(contributor.github);
  const eodUpdates = await EODUpdatesManager(contributor).get();

  const res = await fetch(`https://slack.com/api/views.publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      user_id: contributor.slack,
      view: {
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `
Hey there 👋 
Activities Bot is in beta.
              `,
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Manually added EOD updates (${eodUpdates.length})`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                eodUpdates.map((update) => `· ${update}\n`).join("") ||
                "_No manually entered EOD updates..._",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Pull Requests (${dailyReport.pull_requests.length})`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                dailyReport.pull_requests
                  .map((pr) => `· ${pr.title}\n`)
                  .join("") || "_No pull requests..._",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Commits (${dailyReport.commits.length})`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                dailyReport.commits
                  .map((commit) => `· ${commit.title}\n`)
                  .join("") || "_No commits made..._",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Code Reviews (${dailyReport.reviews.length})`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                dailyReport.reviews
                  .map((review) => `· ${review.state} ${review.pull_request}\n`)
                  .join("") || "_No code reviews..._",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Active Issues (${dailyReport.issues_active.length})`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                dailyReport.issues_active
                  .map((issue) => `· ${issue.title}}\n`)
                  .join("") || "_No ative issues..._",
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Pending Issues (${dailyReport.issues_pending.length})`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                dailyReport.issues_pending
                  .map((issue) => `· ${issue.title}\n`)
                  .join("") || "_No pending issues..._",
            },
          },
        ],
      },
    }),
  });
};
