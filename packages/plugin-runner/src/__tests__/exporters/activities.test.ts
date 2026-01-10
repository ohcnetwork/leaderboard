/**
 * Activity exporter tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import { initializeSchema } from "@ohcnetwork/leaderboard-api";
import {
  contributorQueries,
  activityDefinitionQueries,
  activityQueries,
} from "@ohcnetwork/leaderboard-api";
import { exportActivities } from "../../exporters/activities";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-export-activities";
const logger = createLogger(false);

describe("Activity Exporter", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
    await mkdir(TEST_DATA_DIR, { recursive: true });

    // Set up test data
    await contributorQueries.upsert(db, {
      username: "alice",
      name: "Alice",
      role: "core",
      title: null,
      avatar_url: null,
      bio: null,
      social_profiles: null,
      joining_date: null,
      meta: null,
    });

    await activityDefinitionQueries.insertOrIgnore(db, {
      slug: "pr_merged",
      name: "PR Merged",
      description: "PR merged",
      points: 10,
      icon: null,
    });
  });

  afterEach(async () => {
    await db.close();
    await rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  it("should export activities to sharded JSONL files", async () => {
    await activityQueries.upsert(db, {
      slug: "alice-pr-1",
      contributor: "alice",
      activity_definition: "pr_merged",
      title: "Fix bug",
      occured_at: "2024-01-01T10:00:00Z",
      link: "https://github.com/org/repo/pull/1",
      text: null,
      points: 10,
      meta: null,
    });

    await activityQueries.upsert(db, {
      slug: "alice-pr-2",
      contributor: "alice",
      activity_definition: "pr_merged",
      title: "Add feature",
      occured_at: "2024-01-02T10:00:00Z",
      link: "https://github.com/org/repo/pull/2",
      text: null,
      points: 10,
      meta: null,
    });

    const count = await exportActivities(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2);

    const content = await readFile(
      join(TEST_DATA_DIR, "activities", "alice.jsonl"),
      "utf-8"
    );
    const lines = content.trim().split("\n");

    expect(lines).toHaveLength(2);

    const activities = lines.map((line) => JSON.parse(line));
    const slugs = activities.map((a) => a.slug).sort();
    expect(slugs).toContain("alice-pr-1");
    expect(slugs).toContain("alice-pr-2");
  });

  it("should create separate files for each contributor", async () => {
    await contributorQueries.upsert(db, {
      username: "bob",
      name: "Bob",
      role: "core",
      title: null,
      avatar_url: null,
      bio: null,
      social_profiles: null,
      joining_date: null,
      meta: null,
    });

    await activityQueries.upsert(db, {
      slug: "alice-pr-1",
      contributor: "alice",
      activity_definition: "pr_merged",
      title: "Activity 1",
      occured_at: "2024-01-01T10:00:00Z",
      link: null,
      text: null,
      points: 10,
      meta: null,
    });

    await activityQueries.upsert(db, {
      slug: "bob-pr-1",
      contributor: "bob",
      activity_definition: "pr_merged",
      title: "Activity 2",
      occured_at: "2024-01-01T10:00:00Z",
      link: null,
      text: null,
      points: 10,
      meta: null,
    });

    const count = await exportActivities(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2);

    // Check both files exist
    const aliceContent = await readFile(
      join(TEST_DATA_DIR, "activities", "alice.jsonl"),
      "utf-8"
    );
    const bobContent = await readFile(
      join(TEST_DATA_DIR, "activities", "bob.jsonl"),
      "utf-8"
    );

    expect(aliceContent).toBeTruthy();
    expect(bobContent).toBeTruthy();
  });

  it("should skip contributors with no activities", async () => {
    await contributorQueries.upsert(db, {
      username: "bob",
      name: "Bob",
      role: "core",
      title: null,
      avatar_url: null,
      bio: null,
      social_profiles: null,
      joining_date: null,
      meta: null,
    });

    // Only add activity for alice
    await activityQueries.upsert(db, {
      slug: "alice-pr-1",
      contributor: "alice",
      activity_definition: "pr_merged",
      title: "Activity",
      occured_at: "2024-01-01T10:00:00Z",
      link: null,
      text: null,
      points: 10,
      meta: null,
    });

    const count = await exportActivities(db, TEST_DATA_DIR, logger);
    expect(count).toBe(1);

    // Check that only alice's file exists
    const aliceContent = await readFile(
      join(TEST_DATA_DIR, "activities", "alice.jsonl"),
      "utf-8"
    );
    expect(aliceContent).toBeTruthy();

    // Bob's file should not exist
    try {
      await readFile(join(TEST_DATA_DIR, "activities", "bob.jsonl"), "utf-8");
      expect.fail("Bob's file should not exist");
    } catch (error) {
      expect((error as NodeJS.ErrnoException).code).toBe("ENOENT");
    }
  });
});
