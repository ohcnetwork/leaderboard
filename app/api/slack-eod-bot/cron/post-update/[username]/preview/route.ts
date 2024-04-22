import { NextRequest } from "next/server";
import { EODUpdatesManager, sendSlackMessage } from "@/lib/slackbotutils";
import { getContributorBySlug } from "@/lib/api";

export const maxDuration = 300;

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

  const contributor = await getContributorBySlug(`${username}.md`);
  if (!contributor?.slack) {
    return new Response("Contributor not found", { status: 404 });
  }

  const eodUdpates = await EODUpdatesManager(contributor).get();

  const readableUpdates =
    eodUdpates.length > 0
      ? `
        Hello <@${contributor.slack}>, here are your updates for today:\n
        ${eodUdpates.map((update) => `${update}`).join("\n\n")}\n
        If you wish to add more updates, please reply to this message with your updates.
        If you wish to rewrite all updates, please reply with \`clear updates\` and then specify your updates.
    `
      : `
        Hello <@${contributor.slack}>, you have not specified any EOD updates for today.
        If you wish to add updates, please reply to this message with your updates.
    `;

  const message = `
        ${readableUpdates}\n
        These updates will be sent to the EOD channel at the end of the working day along with your contribution data.
    `
    .split("\n")
    .map((s) => s.trim())
    .join("\n");

  await sendSlackMessage(contributor.slack, message);

  return new Response("OK");
}
