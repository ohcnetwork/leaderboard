import { getContributors } from "@/lib/api";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 403 });
  }

  const users = (await getContributors()).filter((c) => !!c.slack);

  const headers = {
    Authorization: `Bearer ${process.env.CRON_SECRET}`,
  };

  for (const user of users) {
    fetch(
      `https://contributors.ohc.network/api/slack-eod-bot/cron/post-update/${user.github}/preview`,
      { method: "GET", headers },
    );
  }

  return new Response("OK");
};
