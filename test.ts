import {
  createTables,
  getContributor,
  listActivities,
  listActivityDefinitions,
  listContributors,
  upsertActivity,
  upsertActivityDefinitions,
  upsertContributor,
} from "@/lib/db";

async function main() {
  await createTables();

  const result = await upsertActivityDefinitions(
    {
      name: "Comment Created",
      description: "Commented on an Issue/PR",
      points: 0,
      slug: "comment_created",
    },
    {
      name: "Issue Assigned",
      description: "Got an issue assigned",
      points: 0,
      slug: "issue_assigned",
    }
  );

  console.log(result);

  console.log(await listActivityDefinitions());

  await upsertContributor({
    username: "testuser",
    name: "Test User",
    role: "contributor",
    avatar_url: "https://test.org/avatar.png",
    profile_url: "https://test.org/profile",
    email: "test@test.org",
    bio: "Test bio",
    meta: {
      test: "test",
    },
  });

  console.log(await listContributors());

  console.log(await getContributor("testuser"));
  console.log(await getContributor("notfound"));

  await upsertActivity({
    slug: "test_activity",
    contributor: "testuser",
    activity_definition: "comment_created",
    title: "Test Activity",
    occured_at: new Date().toISOString(),
    link: "https://test.org/activity",
    text: "Test activity",
    points: 10,
    meta: {
      test: "test",
    },
  });

  console.log(await listActivities());
}

main();
