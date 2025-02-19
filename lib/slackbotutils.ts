import { kv } from "@vercel/kv";
import { formatDuration as _formatDuration } from "date-fns";
import { getDailyReport } from "./contributor";
import { Contributor } from "@/lib/types";

const slackApiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.SLACK_EOD_BOT_TOKEN}`,
};

export const reactToMessage = async (
  channel: string,
  timestamp: string,
  reaction: string,
) => {
  const res = await fetch("https://slack.com/api/reactions.add", {
    method: "POST",
    headers: slackApiHeaders,
    body: JSON.stringify({
      channel,
      timestamp,
      name: reaction,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error(data);
  }
};

const getAllEODUpdatesKeys = async () => {
  const keys: string[] = [];
  for await (const key of kv.scanIterator({ match: "eod:*", count: 100 })) {
    keys.push(key);
  }
  return keys;
};

export const getAllEODUpdates = async () => {
  const userUpdates: Record<string, string[]> = {};

  const keys = await getAllEODUpdatesKeys();

  if (keys.length) {
    const values: string[][] = await kv.mget(...keys);
    for (let i = 0; i < keys.length; i++) {
      userUpdates[keys[i].replace("eod:", "")] = Array.from(new Set(values[i]));
    }
  }

  return userUpdates;
};

export const clearAllEODUpdates = async () => {
  const keys = await getAllEODUpdatesKeys();
  return kv.del(...keys);
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
