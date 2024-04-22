// Handles incoming POST requests from Slack's Event API
import { getContributors } from "@/lib/api";
import {
  EODUpdatesManager,
  reactToMessage,
  updateAppHome,
} from "@/lib/slackbotutils";
import { createHmac } from "crypto";

export const maxDuration = 300;

export const POST = async (req: Request) => {
  const timestamp = req.headers.get("X-Slack-Request-Timestamp") || "0";

  const raw_body = await req.text();

  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 60 * 5) {
    console.error("Request is too old");
    return new Response("Request is too old", { status: 400 });
  }

  const incoming_signature = req.headers.get("X-Slack-Signature") || "";
  const basestring = ["v0", timestamp, raw_body].join(":");
  const signature =
    "v0=" +
    createHmac("sha256", process.env.SLACK_EOD_BOT_SIGNING_SECRET || "")
      .update(basestring)
      .digest("hex");

  if (signature !== incoming_signature) {
    console.error("Invalid signature");
    return new Response("Invalid signature", { status: 403 });
  }

  const body = JSON.parse(raw_body);
  if (body.type === "url_verification") {
    return Response.json({
      challenge: body.challenge,
    });
  }

  if (body.event.bot_profile) {
    return new Response(null, { status: 200 });
  }

  const contributor = await getContributor(body.event.user);
  if (!contributor) {
    console.error(`Unauthorized user ${body.event.user}`);
    return new Response("Unauthorized", { status: 403 });
  }

  if (body.event.type === "message") {
    const eodUpdates = EODUpdatesManager(contributor);
    const message = body.event.text;

    if (message.toLowerCase() === "clear updates") {
      console.debug(`clearing updates for ${contributor.github}`);
      await eodUpdates.clear();
    } else {
      console.debug(`adding updates for ${contributor.github}`);
      await eodUpdates.append(message);
    }

    await reactToMessage(body.event.channel, body.event.ts, "white_check_mark");
  }

  if (body.event.type === "app_home_opened") {
    console.debug(`updating app home for ${contributor.github}`);
    await updateAppHome(contributor);
  }

  return new Response(null, { status: 204 });
};

const getContributor = async (slackUserID: string) => {
  const contributors = await getContributors();
  return contributors.find((c) => c.slack === slackUserID);
};
