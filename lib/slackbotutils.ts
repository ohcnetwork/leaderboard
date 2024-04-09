import { kv } from "@vercel/kv";
import { formatDuration as _formatDuration } from "date-fns";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { getDailyReport } from "./contributor";

export const getHumanReadableUpdates = (
  data: Awaited<ReturnType<typeof getDailyReport>>,
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
                      {
                        type: "link",
                        url: item.url,
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

export const sendSlackMessage = async (
  channel: string,
  text: string,
  blocks?: any,
) => {
  return await fetch(`https://slack.com/api/chat.postMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      channel,
      text,
      ...blocks,
    }),
  });
};

export const getSlackContributors = () => {
  const contributorsRoot = join(process.cwd(), "data-repo/contributors");
  const contributors = readdirSync(contributorsRoot);

  let slackContributors: {
    githubUsername: string;
    slackID: string;
    updates?: any;
  }[] = [];

  for (const contributor of contributors) {
    const md = readFileSync(join(contributorsRoot, contributor)).toString();
    const infoBlock = md.split("---")[1];
    let info: any = {};
    infoBlock
      .split("\r\n")
      .slice(1, -1)
      .forEach((line: string) => {
        const [key, value] = line.split(": ");
        info[key] = value?.replace('""', "");
      });
    if (info.slack) {
      slackContributors.push({
        githubUsername: info.github,
        slackID: info.slack,
      });
    }
  }
  return slackContributors;
};

export const addEODUpdate = async (message: string, user: string) => {
  const contributors = getSlackContributors();
  const contributor = contributors.find(
    (contributor) => contributor.slackID === user,
  );

  if (!contributor) {
    return;
  }

  const updates: string[] =
    (await kv.get("eod:" + contributor.githubUsername)) || [];

  const clear = message.toLowerCase() === "clear updates";

  const newUpdates = clear ? [] : [...updates, message];
  await kv.set("eod:" + contributor.githubUsername, newUpdates);
  if (clear) {
    sendSlackMessage(contributor.slackID, "Your updates have been cleared");
  }
};
