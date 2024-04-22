import { NextRequest } from "next/server";
import {
  EODUpdatesManager,
  getHumanReadableUpdates,
  sendSlackMessage,
} from "@/lib/slackbotutils";
import { getDailyReport } from "@/lib/contributor";
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

  const eodUpdatesManager = EODUpdatesManager(contributor);
  const report = await getDailyReport(username);
  const eodUpdates = await eodUpdatesManager.get();

  const updates = getHumanReadableUpdates(
    report,
    eodUpdates,
    contributor.slack,
  );

  sendSlackMessage(process.env.SLACK_EOD_BOT_CHANNEL || "", "", updates);
  eodUpdatesManager.clear();
  return new Response("OK");
}
