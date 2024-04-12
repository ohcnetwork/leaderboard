// Handles incoming POST requests from Slack's Event API
import { addEODUpdate, updateAppHome } from "@/lib/slackbotutils";
import { createHmac } from "crypto";

export const POST = async (req: Request) => {
  const timestamp = req.headers.get("X-Slack-Request-Timestamp") || "0";

  const raw_body = await req.text();

  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 60 * 5) {
    console.log("Request is too old");
    return new Response("Request is too old", { status: 400 });
  }

  const incoming_signature = req.headers.get("X-Slack-Signature") || "";
  const basestring = ["v0", timestamp, raw_body].join(":");
  const signature =
    "v0=" +
    createHmac("sha256", process.env.SLACK_SIGNING_SECRET || "")
      .update(basestring)
      .digest("hex");

  if (signature !== incoming_signature) {
    console.log("Invalid signature");
    return new Response("Invalid signature", { status: 403 });
  }

  const body = JSON.parse(raw_body);

  if (body.type === "url_verification") {
    return Response.json({
      challenge: body.challenge,
    });
  }

  if (body.event.type === "message") {
    const message = body.event.text;
    const user = body.event.user;
    addEODUpdate(message, user);
  }

  if (body.event.type === "app_home_opened") {
    const user = body.event.user;
    updateAppHome(user);
  }

  return new Response(null, { status: 204 });
};
