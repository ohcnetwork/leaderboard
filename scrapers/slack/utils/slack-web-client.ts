import { WebClient } from "@slack/web-api";

function getSlackWebClient() {
  const channel = process.env.SLACK_CHANNEL;
  const token = process.env.SLACK_API_TOKEN;

  if (!channel) {
    throw new Error("SLACK_CHANNEL environment variable is not set");
  }

  if (!token) {
    throw new Error("SLACK_API_TOKEN environment variable is not set");
  }

  return new WebClient(token);
}

export const slack = getSlackWebClient();
