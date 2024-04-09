import { NextRequest } from "next/server";
import fs from "fs";
import { join } from "path";
import { getHumanReadableUpdates, sendSlackMessage } from "@/lib/slackbotutils";
import { getDailyReport } from "@/lib/contributor";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
    const { username } = params;

    if (process.env.CRON_SECRET && req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const contributorsRoot = join(process.cwd(), "data-repo/contributors");
    const md = fs.readFileSync(join(contributorsRoot, username + ".md")).toString();
    const infoBlock = md.split("---")[1];
    let info: any = {};
    infoBlock.split("\r\n").slice(1, -1).forEach((line: string) => {
        const [key, value] = line.split(": ");
        info[key] = value?.replace('""', "");
    });
    if (!info.slack) {
        return new Response("Slack ID not found", { status: 404 });
    }

    const dailyReport = await getDailyReport(username);
    const updates = getHumanReadableUpdates(dailyReport, info.slack);
    console.log(JSON.stringify(updates));
    const slackMessage = await sendSlackMessage(process.env.SLACK_BOT_EOD_CHANNEL || "", "", updates);
    console.log(await slackMessage.json());
    return new Response("OK");
}