import { getContributors } from "@/lib/api";
import { isAuthenticatedForCron } from "@/lib/auth";
import { getAllEODUpdates, sendSlackMessage } from "@/lib/slackbotutils";
import { Contributor } from "@/lib/types";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  if (!isAuthenticatedForCron(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const users = (await getContributors()).filter((c) => !!c.slack);
  const eodUpdates = await getAllEODUpdates();

  await Promise.all(users.map((c) => remind(c, eodUpdates[c.github])));

  return new Response("OK");
};

const remind = async (contributor: Contributor, updates?: string[]) => {
  await sendSlackMessage(
    contributor.slack,
    `
Good Evening <@${contributor.slack}> :wave:,
${formatUpdatesMessage(updates)}`,
  );
};

const formatUpdatesMessage = (updates?: string[]) => {
  if (updates?.length) {
    return `
Here are your updates for today:

${updates.map((update, i) => `${i + 1}. ${update}`).join("\n")}

_If you wish to add more updates, *send each of the update as an individual message*._
_If you wish to clear or re-write your updates, message *\`clear updates\`*._
_These updates will be sent to the channel at the end of the working day along with your contribution data from GitHub._
`;
  }

  return `
You have not specified any EOD updates for today.
If you wish to add updates, *send each of the update as an individual message*.`;
};
