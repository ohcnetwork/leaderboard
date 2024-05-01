const {
  getContributors,
  getEvents,
  getEODUpdates,
  postEODMessage,
  mergeUpdates,
  flushEODUpdates,
} = require("./utils");

async function main() {
  const allContributors = await getContributors();
  console.info(`⚙️ Found ${Object.keys(allContributors).length} contributors`);

  console.info("⚙️ Fetching events from GitHub");
  const allEvents = await getEvents(Object.keys(allContributors));

  console.info("⚙️ Fetching General EOD updates");
  const allEodUpdates = await getEODUpdates();

  console.info("⚙️ Ready to post EOD updates onto Slack Channel");
  for (const [github, slack] of Object.entries(allContributors)) {
    const events = allEvents[github] ?? [];
    const eodUpdates = allEodUpdates[github] ?? [];

    const activityCount = events.length + eodUpdates.length;
    if (activityCount === 0) {
      console.info(`- ⏭️ ${github}: Skipping due to no activity.`);
      continue;
    }

    await postEODMessage({
      github,
      slack,
      updates: mergeUpdates(events, eodUpdates),
    });
    console.info(`- ✅ ${github}: Posted ${activityCount} updates.`);
  }

  // console.info("Flushing EOD updates from cache.");
  // await flushEODUpdates();

  console.info("✅ Completed!");
}

main();
