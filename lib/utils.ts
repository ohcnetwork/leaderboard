import { getDailyReport } from "@/app/api/contributors/[slug]/dailyReport/route";
import { kv } from "@vercel/kv";
import {
  formatDuration as _formatDuration,
  intervalToDuration,
  format,
} from "date-fns";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export const parametreize = (string: string) => {
  return string.replace(/\s/gu, "_").toLowerCase();
};

export const humanize = (str: string) => {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDuration = (duration_in_ms: number) =>
  _formatDuration(
    intervalToDuration({
      start: new Date(0),
      end: new Date(duration_in_ms),
    }),
  )
    .split(" ")
    .splice(0, 4)
    .join(" ");

export const getWeekNumber = (date: Date) => {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((Number(d) - Number(yearStart)) / 86400000 + 1) / 7);
};

export const parseDateRangeSearchParam = (
  range?: string | null,
  relativeDaysBefore = 7,
) => {
  if (range) {
    const [startStr, endStr] = range.split("...");
    const start = new Date(startStr);
    const end = new Date(endStr);
    end.setHours(23, 59, 59);
    return [start, end] as const;
  }

  // Last 7 days
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - relativeDaysBefore);
  end.setHours(23, 59, 59);
  return [start, end] as const;
};

export const padZero = (num: number) => (num < 10 ? `0${num}` : num);

export const scrollTo = (id: string | boolean) => {
  const element = document.querySelector(`#${id}`);
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
};

export const parseIssueNumber = (url: string) => {
  return url.replace(/^.*github\.com\/[\w-]+\/[\w-]+\/issues\//, "");
};

export const navLinks = [
  { title: "Feed", path: "/feed" },
  { title: "Leaderboard", path: "/leaderboard" },
  { title: "People", path: "/people" },
  { title: "Projects", path: "/projects" },
  { title: "Releases", path: "/releases" },
];

export const formatDate = (date: Date) => {
  return format(date, "MMM dd, yyyy");
};

export const getHumanReadableUpdates = (data: Awaited<ReturnType<typeof getDailyReport>>, slackID: string) => {

  const sections = [
    {
      title: `Pull Requests Opened`,
      count: data.pull_requests.length,
      items: data.pull_requests.map((pr) => ({
        title: pr.title,
        url: pr.url
      }))
    },
    {
      title: `Commits`,
      count: data.commits.length,
      items: data.commits.map((commit) => ({
        title: commit.title,
        url: commit.url
      }))
    },
    {
      title: `Reviews`,
      count: data.reviews.length,
      items: data.reviews.map((review) => ({
        title: review.pull_request,
        url: review.url
      }))
    },
    {
      title: `Active Issues`,
      count: data.issues_active.length,
      items: data.issues_active.map((issue) => ({
        title: issue.title,
        url: issue.url
      }))
    },
    {
      title: `Pending Issues`,
      count: data.issues_pending.length,
      items: data.issues_pending.map((issue) => ({
        title: issue.title,
        url: issue.url
      }))
    }
  ]

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
  ]

  const color = colorRange.find((range) => range.min <= (data.pull_requests.length + data.commits.length + data.reviews.length))?.color || "#0000FF"

  return {
    attachments: [
      {
        color,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Updates for ${data.user_info.data.name || data.user_info.data.url.split("/").at(-1)}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `_${data.user_info.data.url.split("/").at(-1)}_\n<@${slackID}>\n<${data.user_info.data.url}|Github Profile>\n<${process.env.NEXT_PUBLIC_META_URL}/contributors/${data.user_info.data.url.split("/").at(-1)}|Contributor Profile>`
            },
            accessory: {
              type: "image",
              image_url: data.user_info.data.avatar_url,
              alt_text: "profile image"
            }
          },
          ...sections.flatMap((section) => ([
            {
              type: "divider"
            },
            {
              type: "rich_text",
              elements: [
                {
                  type: "rich_text_section",
                  elements: [
                    {
                      "type": "text",
                      "text": `${section.title} (${section.count})`,
                      "style": {
                        "bold": true
                      }
                    },
                    {
                      "type": "text",
                      "text": `\n${section.items.length === 0 ? `No ${section.title.toLowerCase()} for today` : ""}`
                    }
                  ]
                },
                {
                  type: "rich_text_list",
                  style: "bullet",
                  elements: section.items.map(item => ({
                    type: "rich_text_section",
                    elements: [
                      {
                        type: "link",
                        url: item.url,
                        text: item.title,
                      }
                    ]
                  })),
                }
              ]
            }
          ])),
        ]
      }
    ]
  }
}

export const sendSlackMessage = async (channel: string, text: string, blocks?: any) => {
  return await fetch(`https://slack.com/api/chat.postMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      channel,
      text,
      ...blocks
    })
  })
}

export const getSlackContributors = () => {
  const contributorsRoot = join(process.cwd(), "data-repo/contributors");
  const contributors = readdirSync(contributorsRoot);

  let slackContributors: {
    githubUsername: string,
    slackID: string,
    updates?: any
  }[] = [];

  for (const contributor of contributors) {
    const md = readFileSync(join(contributorsRoot, contributor)).toString();
    const infoBlock = md.split("---")[1];
    let info: any = {};
    infoBlock.split("\r\n").slice(1, -1).forEach((line: string) => {
      const [key, value] = line.split(": ");
      info[key] = value?.replace('""', "");
    });
    if (info.slack) {
      slackContributors.push({
        githubUsername: info.github,
        slackID: info.slack
      });
    }
  }
  return slackContributors;
}

export const addEODUpdate = async (message: string, user: string) => {

  const contributors = getSlackContributors();
  const contributor = contributors.find((contributor) => contributor.slackID === user);

  if (!contributor) {
    return;
  }

  const updates: string[] = (await kv.get("eod:" + contributor.githubUsername)) || [];

  const clear = message.toLowerCase() === "clear updates";

  const newUpdates = clear ? [] : [...updates, message];
  await kv.set("eod:" + contributor.githubUsername, newUpdates);
  if (clear) {
    sendSlackMessage(contributor.slackID, "Your updates have been cleared");
  }
}