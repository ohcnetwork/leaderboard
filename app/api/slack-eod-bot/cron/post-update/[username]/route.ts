import { NextRequest } from "next/server";
import { getHumanReadableUpdates, sendSlackMessage } from "@/lib/slackbotutils";
import { getDailyReport } from "@/lib/contributor";
import { getContributorBySlug } from "@/lib/api";
import { kv } from "@vercel/kv";

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
  if (!contributor.slack) {
    return new Response("Slack ID not found", { status: 404 });
  }

  const dailyReport = await getDailyReport(username);
  const generalUpdates: string[] = (await kv.get("eod:" + username)) || [];
  const updates = getHumanReadableUpdates(
    dailyReport,
    generalUpdates,
    contributor.slack,
  );
  console.log(JSON.stringify(updates));
  const slackMessage = await sendSlackMessage(
    process.env.SLACK_BOT_EOD_CHANNEL || "",
    "",
    updates,
  );
  console.log(await slackMessage.json());
  return new Response("OK");
}
