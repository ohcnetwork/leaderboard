import {
  getContributors,
  getEODUpdates,
  sendSlackMessage,
  withRetry,
} from "./utils.mjs";

const remind = async ({ slackId, updates }) => {
  await sendSlackMessage(
    slackId,
    `
  Good Evening <@${slackId}> :wave:,
  ${formatUpdatesMessage(updates)}`,
  );
};

const formatUpdatesMessage = (updates) => {
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

async function main() {
  const allContributors = await getContributors();
  console.info(`⚙️ Found ${Object.keys(allContributors).length} contributors`);

  console.info("⚙️ Fetching General EOD updates");
  const eodUpdates = await getEODUpdates();

  console.info("⚙️ Reminding users...");
  for (const [githubId, slackId] of Object.entries(allContributors)) {
    await withRetry(() => remind({ slackId, updates: eodUpdates[githubId] }), {
      attempts: 3,
    });
  }
  console.info("✅ Completed!");
}

main();
