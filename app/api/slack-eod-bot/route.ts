// Handles incoming POST requests from Slack's Event API
import { addEODUpdate } from "@/lib/utils";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";

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
    const signature = "v0=" + createHmac("sha256", process.env.SLACK_SIGNING_SECRET || "").update(basestring).digest("hex");

    if (signature !== incoming_signature) {
        console.log("Invalid signature");
        return new Response("Invalid signature", { status: 400 });
    }

    const body = JSON.parse(raw_body);
    if (body.event.type === "message") {
        const message = body.event.text;
        const user = body.event.user;
        addEODUpdate(message, user)
    }

    return NextResponse.json({
        challenge: body.challenge
    });
}