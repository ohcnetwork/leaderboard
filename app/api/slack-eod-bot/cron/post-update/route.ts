import { getContributors } from "@/lib/api";
import { getPullRequestReviews } from "@/lib/contributor";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const preview = params.get("preview") === "yes";

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

  if (preview) {
    for (const user of users) {
      fetch(
        `https://contributors.ohc.network/api/slack-eod-bot/cron/post-update/${user.github}/preview`,
        { method: "GET", headers },
      );
    }
  } else {
    const reviews = await getPullRequestReviews();
    for (const user of users) {
      fetch(
        `https://contributors.ohc.network/api/slack-eod-bot/cron/post-update/${user.github}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            reviews: reviews.filter((r) => r.author === user.github),
          }),
        },
      );
    }
  }

  return new Response("OK");
};
