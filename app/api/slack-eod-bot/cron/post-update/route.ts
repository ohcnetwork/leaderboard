import { getContributors } from "@/lib/api";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const preview = params.get("preview");

  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 403 });
  }

  const users = (await getContributors()).filter((c) => !!c.slack);

  for (const user of users) {
    fetch(
      `${process.env.NEXT_PUBLIC_META_URL}/api/slack-eod-bot/cron/post-update/${user.github}${preview === "yes" ? "/preview" : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      },
    );
  }

  return new Response("OK");
};
