import { NextRequest } from "next/server";
import fs from "fs";
import { join } from "path";
import { kv } from "@vercel/kv";
import { sendSlackMessage } from "@/lib/slackbotutils";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  const { username } = params;

  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  const contributorsRoot = join(process.cwd(), "data-repo/contributors");
  const md = fs
    .readFileSync(join(contributorsRoot, username + ".md"))
    .toString();
  const infoBlock = md.split("---")[1];
  let info: any = {};
  infoBlock
    .split("\r\n")
    .slice(1, -1)
    .forEach((line: string) => {
      const [key, value] = line.split(": ");
      info[key] = value?.replace('""', "");
    });
  if (!info.slack) {
    console.log("Slack ID not found");
    return new Response("Slack ID not found", { status: 404 });
  }

  const updates: string[] = (await kv.get("eod:" + username)) || [];

  const readableUpdates =
    updates.length > 0
      ? `
        Hello <@${info.slack}>, here are your updates for today:\n
        ${updates.map((update) => `${update}`).join("\n\n")}\n
        If you wish to add more updates, please reply to this message with your updates.
        If you wish to rewrite all updates, please reply with \`clear updates\` and then specify your updates.
    `
      : `
        Hello <@${info.slack}>, you have not specified any EOD updates for today.
        If you wish to add updates, please reply to this message with your updates.
    `;

  const message = `
        ${readableUpdates}\n
        These updates will be sent to the EOD channel at the end of the working day along with your contribution data.
    `
    .split("\n")
    .map((s) => s.trim())
    .join("\n");

  const slackMessage = await sendSlackMessage(info.slack, message);
  console.log(await slackMessage.json());
  return new Response("OK");
}
