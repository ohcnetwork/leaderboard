import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { addSlackEodMessages, prepare } from "./scrapers/slack/utils/db";
import { toHTML } from "slack-markdown";

interface SlackMessage {
  client_msg_id?: string;
  type: string;
  text: string;
  user: string;
  ts: string; // Unix timestamp as string
  team: string;
  [key: string]: string | undefined;
}

interface SlackUserData {
  [date: string]: SlackMessage[];
}

async function main() {
  const slackDataDir = "/home/nikhila-c/leaderboard-data/data/slack";

  console.log("Starting to read Slack user data files...");

  // Prepare the database table
  await prepare();
  console.log("Database table prepared.");

  // Read all JSON files from the directory
  const files = readdirSync(slackDataDir).filter((file) =>
    file.endsWith(".json")
  );

  console.log(`Found ${files.length} JSON files to process.`);

  let totalMessages = 0;
  const allMessages: {
    id: number;
    user_id: string;
    timestamp: Date;
    text: string;
  }[] = [];

  // Process each file
  for (const file of files) {
    const filePath = join(slackDataDir, file);

    try {
      const content = readFileSync(filePath, "utf-8");
      const userData: SlackUserData = JSON.parse(content);

      // Process each date group in the file
      for (const [date, messages] of Object.entries(userData)) {
        for (const message of messages) {
          const originalText = message.text.trim();

          // Skip messages with text length less than 5
          if (originalText.length < 5) {
            continue;
          }

          // Convert Slack timestamp to Date
          const timestamp = new Date(parseFloat(message.ts) * 1000);

          // Generate a unique ID from the timestamp
          // Using the original timestamp as microseconds for ID
          const id = Math.floor(parseFloat(message.ts) * 1000000);

          // Convert Slack markdown to HTML
          const htmlText = toHTML(originalText);

          allMessages.push({
            id: id,
            user_id: message.user,
            timestamp: timestamp,
            text: htmlText,
          });

          totalMessages++;
        }
      }

      console.log(`Processed file: ${file}`);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  console.log(`Total messages collected: ${totalMessages}`);

  // Insert all messages into the database
  if (allMessages.length > 0) {
    console.log("Inserting messages into database...");
    await addSlackEodMessages(allMessages);
    console.log("All messages inserted successfully!");
  } else {
    console.log("No messages to insert.");
  }
}

main().catch(console.error);
