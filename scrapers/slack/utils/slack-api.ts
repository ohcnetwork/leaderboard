/**
 * Slack API client and message fetching utilities
 */

import {
  prepare,
  addSlackEodMessages,
  insertActivitiesFromSlackEod,
} from "./db";

const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL ?? "C02U0A47JUQ";

if (!SLACK_API_TOKEN) {
  throw new Error("SLACK_API_TOKEN environment variable is not set");
}

interface SlackMessage {
  type: string;
  user?: string;
  text?: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  subtype?: string;
  bot_id?: string;
}

interface SlackConversationHistoryResponse {
  ok: boolean;
  messages: SlackMessage[];
  has_more: boolean;
  pin_count?: number;
  response_metadata?: {
    next_cursor?: string;
  };
  error?: string;
}

export interface SlackMessageData {
  id?: string;
  user: string;
  text: string;
  ts: string;
  permalink: string;
  timestamp: Date;
}

/**
 * Generate Unix timestamp from a Date object
 */
function generateTimestamp(date: Date): string {
  return (date.getTime() / 1000).toString();
}

/**
 * Get permalink for a Slack message
 */
async function getPermalink(
  channel: string,
  messageTs: string
): Promise<string> {
  try {
    const url = new URL("https://slack.com/api/chat.getPermalink");
    url.searchParams.append("channel", channel);
    url.searchParams.append("message_ts", messageTs);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SLACK_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.ok) {
      console.warn(
        `Failed to get permalink for message ${messageTs}: ${data.error}`
      );
      return `https://slack.com/archives/${channel}/p${messageTs.replace(
        ".",
        ""
      )}`;
    }

    return data.permalink;
  } catch (error) {
    console.warn(`Error getting permalink for message ${messageTs}:`, error);
    // Return a fallback permalink format
    return `https://slack.com/archives/${channel}/p${messageTs.replace(
      ".",
      ""
    )}`;
  }
}

/**
 * Fetch Slack messages for a given date range
 * @param channel - Slack channel ID
 * @param oldest - Start date for message retrieval
 * @param latest - End date for message retrieval
 * @returns Array of Slack messages with user, text, timestamp, and permalink
 */
export async function getSlackMessages(
  channel: string,
  oldest: Date,
  latest: Date
): Promise<SlackMessageData[]> {
  const messages: SlackMessageData[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  console.log(
    `Fetching Slack messages from ${channel} between ${oldest.toISOString()} and ${latest.toISOString()}...`
  );

  while (hasMore) {
    const url = new URL("https://slack.com/api/conversations.history");
    url.searchParams.append("channel", channel);
    url.searchParams.append("oldest", generateTimestamp(oldest));
    url.searchParams.append("latest", generateTimestamp(latest));
    url.searchParams.append("limit", "200");

    if (cursor) {
      url.searchParams.append("cursor", cursor);
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SLACK_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Slack API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: SlackConversationHistoryResponse = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API Error: ${data.error}`);
      }

      // Process messages
      for (const message of data.messages) {
        // Skip messages without user (e.g., bot messages, system messages)
        if (!message.user || !message.text) {
          continue;
        }

        // Skip subtypes like channel_join, channel_leave, etc.
        if (message.subtype) {
          continue;
        }

        // Get permalink for the message
        const permalink = await getPermalink(channel, message.ts);

        messages.push({
          user: message.user,
          text: message.text,
          ts: message.ts,
          permalink,
          timestamp: new Date(parseFloat(message.ts) * 1000),
        });
      }

      // Check for pagination
      cursor = data.response_metadata?.next_cursor;
      hasMore = !!cursor && cursor.length > 0;

      console.log(
        `Fetched ${data.messages.length} messages (${messages.length} valid user messages so far)`
      );
    } catch (error) {
      console.error("Error fetching Slack messages:", error);
      throw error;
    }
  }

  console.log(`Total valid messages fetched: ${messages.length}`);
  return messages;
}

/**
 * Get Slack messages since a specific date
 * @param since - The date to start fetching messages from (optional, defaults to current date)
 * @returns Array of Slack messages
 */
export async function getSlackMessagesForDate(
  since?: string
): Promise<SlackMessageData[]> {
  const startDate = since ? new Date(since) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return getSlackMessages(SLACK_CHANNEL, startDate, endDate);
}

async function main() {
  const since = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago, similar to gh-apis.ts

  // Prepare database (create table and upsert activity definitions in parallel)
  await prepare();

  // Fetch messages
  const messages = await getSlackMessagesForDate(since);
  console.log(`Fetched ${messages.length} messages`);

  // Write messages to slack_eod table
  await addSlackEodMessages(messages);

  await insertActivitiesFromSlackEod(SLACK_CHANNEL);
}

main();
