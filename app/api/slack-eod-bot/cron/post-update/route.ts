import { getSlackContributors } from "@/lib/slackbotutils";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const preview = params.get("preview");
  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const slackContributors = getSlackContributors();

  for (const contributor of slackContributors) {
    fetch(
      `${process.env.NEXT_PUBLIC_META_URL}/api/slack-eod-bot/cron/post-update/${contributor.githubUsername}${preview === "yes" ? "/preview" : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      },
    );
  }

  console.log(slackContributors);

  return new Response("OK");
};
