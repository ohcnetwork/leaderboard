/**
 * Slack API client and message fetching utilities
 */

import { subDays } from "date-fns";
import {
  addActivities,
  addSlackEodMessages,
  deleteSlackEodMessages,
  getContributorsBySlackUserIds,
  getPendingEodUpdates,
  prepare,
} from "./db";
import { slack } from "@/scrapers/slack/utils/slack-web-client";
import { toHTML } from "slack-markdown";
import { Activity } from "@/types/db";

const SLACK_CHANNEL = process.env.SLACK_CHANNEL!;

interface ConversationHistoryResponse {
  messages: {
    type: string;
    user?: string;
    text?: string;
    ts: string;
  }[];
}

/**
 * Generate Unix timestamp from a Date object
 */
function generateTimestamp(date: Date): string {
  return (date.getTime() / 1000).toString();
}

/**
 * Get the date range for the Slack messages since a specific date
 * @param since - The date to start fetching messages from (optional, defaults to current date)
 * @returns An object with the oldest and latest dates
 */
function getDateRange(since?: Date) {
  const oldest = since ? new Date(since) : new Date();
  oldest.setHours(0, 0, 0, 0);

  const latest = new Date();
  latest.setHours(23, 59, 59, 999);

  return { oldest, latest };
}

/**
 * Fetch Slack messages for a given date range
 * @param oldest - Start date for message retrieval
 * @param latest - End date for message retrieval
 * @returns Array of Slack messages with user, text, timestamp, and permalink
 */
export async function getSlackMessages(since?: Date) {
  const { oldest, latest } = getDateRange(since);

  console.log(
    `Fetching Slack messages from ${SLACK_CHANNEL} between ${oldest.toISOString()} and ${latest.toISOString()}...`
  );

  for await (const page of slack.paginate("conversations.history", {
    channel: SLACK_CHANNEL!,
    oldest: generateTimestamp(oldest),
    latest: generateTimestamp(latest),
    limit: 100,
  })) {
    const messages = (page as unknown as ConversationHistoryResponse).messages
      .filter(
        (msg) =>
          msg.type === "message" &&
          msg.user &&
          msg.text &&
          msg.text.trim().length > 5 // ignore very short messages
      )
      .map((msg) => ({
        id: parseInt((parseFloat(msg.ts) * 1000).toString()), // slack's ts is a float, so we multiply by 1000 to get the timestamp in milliseconds
        user_id: msg.user!,
        text: toHTML(msg.text ?? ""),
        timestamp: new Date(Number(msg.ts) * 1000),
      }));

    console.log(`Writing ${messages.length} messages to database`);
    await addSlackEodMessages(messages);
  }
}

/**
 * Process pending EOD updates from the queue and convert them to activities
 * Matches Slack user IDs to contributors and creates activities for matched users
 * Optimized to use a single bulk query for contributor lookups
 */
export async function ingestEodUpdates() {
  console.log("Starting EOD updates ingestion...");

  const pendingUpdates = await getPendingEodUpdates();
  console.log(`Found ${pendingUpdates.length} users with pending EOD updates`);

  if (pendingUpdates.length === 0) {
    console.log("No pending EOD updates to process.");
    return;
  }

  // Bulk lookup all contributors by their Slack user IDs in a single query
  const slackUserIds = pendingUpdates.map((u) => u.user_id);
  const contributorMap = await getContributorsBySlackUserIds(slackUserIds);

  let processedCount = 0;
  let skippedCount = 0;
  const warnings: string[] = [];
  const allActivities: Activity[] = [];
  const processedMessageIds: number[] = [];

  for (const userUpdate of pendingUpdates) {
    const { user_id, ids, texts, timestamps } = userUpdate;

    // Look up the contributor from our pre-fetched map
    const contributorUsername = contributorMap.get(user_id);

    if (!contributorUsername) {
      console.warn(
        `⚠️  No contributor found with slack_user_id: ${user_id} (${ids.length} messages skipped)`
      );
      warnings.push(user_id);
      skippedCount += ids.length;
      continue;
    }

    // Group messages by date (YYYY-MM-DD)
    const messagesByDate = new Map<
      string,
      { texts: string[]; timestamp: Date; ids: number[] }
    >();

    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const text = texts[i];
      const id = ids[i];

      if (!timestamp || text === undefined || id === undefined) continue;

      const date = timestamp.toISOString().split("T")[0];
      if (!date) continue;

      if (!messagesByDate.has(date)) {
        messagesByDate.set(date, {
          texts: [],
          timestamp: timestamp,
          ids: [],
        });
      }

      const dateEntry = messagesByDate.get(date);
      if (dateEntry) {
        dateEntry.texts.push(text);
        dateEntry.ids.push(id);
      }
    }

    // Create activities for each date
    for (const [date, { texts: dayTexts, timestamp }] of messagesByDate) {
      const mergedText = dayTexts.join("\n\n");

      allActivities.push({
        slug: `eod_update_${date}_${contributorUsername}`,
        contributor: contributorUsername,
        activity_definition: "eod_update",
        title: "EOD Update",
        occured_at: timestamp,
        link: null,
        text: mergedText,
        points: null,
        meta: null,
      });
    }

    console.log(
      `✓ Prepared ${messagesByDate.size} EOD activities for ${contributorUsername}`
    );

    // Track processed message IDs for bulk deletion
    processedMessageIds.push(...ids);
    processedCount += ids.length;
  }

  // Bulk insert all activities at once
  if (allActivities.length > 0) {
    await addActivities(allActivities);
    console.log(`\n✓ Inserted ${allActivities.length} total EOD activities`);
  }

  // Bulk delete all processed messages at once
  if (processedMessageIds.length > 0) {
    await deleteSlackEodMessages(processedMessageIds);
  }

  console.log("\n=== EOD Ingestion Summary ===");
  console.log(`Processed: ${processedCount} messages`);
  console.log(`Skipped: ${skippedCount} messages`);
  if (warnings.length > 0) {
    console.log(
      `\nUnmatched Slack user IDs (${warnings.length}): ${warnings.join(", ")}`
    );
  }
  console.log("=============================\n");
}

async function main() {
  const since = subDays(new Date(), 30); // TODO: make this configurable

  console.log(`Preparing database...`);
  await prepare();

  await getSlackMessages(since);
  await ingestEodUpdates();
}

main();
