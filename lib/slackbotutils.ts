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
  Authorization: `Bearer ${process.env.SLACK_EOD_BOT_TOKEN}`,
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

const appHomeSection = (title: string, items: object[][]) => {
  return {
    type: "rich_text",
    elements: [
      {
        type: "rich_text_section",
        elements: [
          {
            type: "text",
            text: `${title} (${items.length})`,
            style: { bold: true },
          },
          {
            type: "text",
            text: `\n${items.length === 0 ? `No ${title} for today` : ""}`,
          },
        ],
      },
      {
        type: "rich_text_list",
        style: "bullet",
        elements: items.map((item) => ({
          type: "rich_text_section",
          elements: [...item],
        })),
      },
    ],
  };
};

export const updateAppHome = async (contributor: Contributor) => {
  const dailyReport = await getDailyReport(contributor.github);
  const eodUpdates = await EODUpdatesManager(contributor).get();

  const res = await fetch(`https://slack.com/api/views.publish`, {
    method: "POST",
    headers: slackApiHeaders,
    body: JSON.stringify({
      user_id: contributor.slack,
      view: {
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Hey there 👋 Activities Bot is in beta. _Last updated on ${new Date().toLocaleString("en-US", { timeZone: process.env.NEXT_PUBLIC_TIMEZONE })}_`,
            },
          },
          { type: "divider" },
          appHomeSection(
            "General EOD updates",
            eodUpdates.map((update) => [{ type: "text", text: update }]),
            // "_No general updates added for the day. Converse with the bot in the messages tab to add one._",
          ),
          { type: "divider" },
          appHomeSection(
            "Pull Requests",
            dailyReport.pull_requests.map((pr) => [
              { type: "link", text: pr.title, url: pr.url },
            ]),
          ),
          { type: "divider" },
          appHomeSection(
            "Commits",
            dailyReport.commits.map((commit) => [
              { type: "link", text: commit.title, url: commit.url },
            ]),
          ),
          { type: "divider" },
          appHomeSection(
            "Code Reviews",
            dailyReport.reviews.map((review) => [
              {
                type: "text",
                text:
                  ({
                    CHANGES_REQUESTED: "Changes Requested",
                    APPROVED: "Approved",
                    COMMENTED: "Reviewed",
                  }[review.state] ?? "Reviewed") + ": ",
              },
              { type: "link", text: review.pull_request, url: review.url },
            ]),
          ),
          { type: "divider" },
          appHomeSection(
            "Active Issues",
            dailyReport.issues_active.map((issue) => [
              { type: "link", text: issue.title, url: issue.url },
            ]),
          ),
          { type: "divider" },
          appHomeSection(
            "Pending Issues",
            dailyReport.issues_pending.map((issue) => [
              { type: "link", text: issue.title, url: issue.url },
            ]),
          ),
        ],
      },
    }),
  });

  console.info(`updated app home for ${contributor.github}`);
  console.info(await res.json());
};
