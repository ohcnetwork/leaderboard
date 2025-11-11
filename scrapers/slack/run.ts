import prepare from "@/scrapers/slack/prepare";
import { subDays } from "date-fns";
import {
  addActivities,
  addContributors,
  getDb,
  transformSlackMessagesToActivities,
} from "./utils/db";
import { getSlackChannel, getSlackMessages } from "./utils/slack-api";

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let lookbackDays = 7; // Default to 7 days, matching GitHub scraper

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--lookback_days" && i + 1 < args.length) {
      const parsed = parseInt(args[i + 1], 10);
      if (!isNaN(parsed) && parsed >= 0) {
        lookbackDays = parsed;
      } else {
        console.warn(
          `Invalid lookback_days value: ${
            args[i + 1]
          }. Using default: ${lookbackDays}`
        );
      }
      i++; // Skip the next argument since we've consumed it
    }
  }

  return { lookbackDays };
}

async function main() {
  const { lookbackDays } = parseArgs();
  const channel = getSlackChannel();

  console.log(`Starting Slack scraper...`);
  console.log(`Channel: ${channel}`);
  console.log(`Lookback days: ${lookbackDays}`);

  // Initialize database and ensure activity definitions exist
  const db = getDb();
  await prepare(db);

  // Calculate date range
  const latest = new Date();
  const oldest = subDays(latest, lookbackDays);

  console.log(
    `Fetching messages from ${oldest.toISOString()} to ${latest.toISOString()}`
  );

  try {
    // Fetch Slack messages
    const messages = await getSlackMessages(channel, oldest, latest);

    if (messages.length === 0) {
      console.log("No messages found in the specified date range.");
      return;
    }

    console.log(`Found ${messages.length} messages to process`);

    // Transform messages to activities
    const activities = transformSlackMessagesToActivities(messages, channel);

    // Extract unique contributors
    const contributors = [...new Set(messages.map((m) => m.user))];
    console.log(`Found ${contributors.length} unique contributors`);

    // Add contributors to database
    await addContributors(contributors);

    // Add activities to database
    await addActivities(activities);

    console.log("Slack scraper completed successfully!");
  } catch (error) {
    console.error("Error running Slack scraper:", error);
    throw error;
  }
}

main();
