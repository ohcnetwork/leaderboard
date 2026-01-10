/**
 * Activity importer tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import { initializeSchema } from "@ohcnetwork/leaderboard-api";
import {
  contributorQueries,
  activityDefinitionQueries,
  activityQueries,
} from "@ohcnetwork/leaderboard-api";
import { importActivities } from "../../importers/activities";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-activities";
const logger = createLogger(false);

describe("Activity Importer", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
    await mkdir(join(TEST_DATA_DIR, "activities"), { recursive: true });

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

  it("should import activities from JSONL file", async () => {
    const activities = [
      JSON.stringify({
        slug: "alice-pr-1",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Fix bug",
        occured_at: "2024-01-01T10:00:00Z",
        link: "https://github.com/org/repo/pull/1",
        text: null,
        points: 10,
        meta: null,
      }),
      JSON.stringify({
        slug: "alice-pr-2",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Add feature",
        occured_at: "2024-01-02T10:00:00Z",
        link: "https://github.com/org/repo/pull/2",
        text: null,
        points: 10,
        meta: null,
      }),
    ].join("\n");

    await writeFile(
      join(TEST_DATA_DIR, "activities", "alice.jsonl"),
      activities + "\n",
      "utf-8"
    );

    const count = await importActivities(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2);

    const imported = await activityQueries.getByContributor(db, "alice");
    expect(imported).toHaveLength(2);
    expect(imported[0].title).toBe("Add feature"); // Should be ordered by date DESC
  });

  it("should handle multiple JSONL files", async () => {
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

    const aliceActivities = [
      JSON.stringify({
        slug: "alice-pr-1",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Activity 1",
        occured_at: "2024-01-01T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      }),
    ].join("\n");

    const bobActivities = [
      JSON.stringify({
        slug: "bob-pr-1",
        contributor: "bob",
        activity_definition: "pr_merged",
        title: "Activity 2",
        occured_at: "2024-01-01T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      }),
    ].join("\n");

    await writeFile(
      join(TEST_DATA_DIR, "activities", "alice.jsonl"),
      aliceActivities + "\n",
      "utf-8"
    );
    await writeFile(
      join(TEST_DATA_DIR, "activities", "bob.jsonl"),
      bobActivities + "\n",
      "utf-8"
    );

    const count = await importActivities(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2);

    const allActivities = await activityQueries.getAll(db);
    expect(allActivities).toHaveLength(2);
  });

  it("should handle missing activities directory", async () => {
    const emptyDir = "./test-data-empty";
    await mkdir(emptyDir, { recursive: true });

    const count = await importActivities(db, emptyDir, logger);
    expect(count).toBe(0);

    await rm(emptyDir, { recursive: true, force: true });
  });

  it("should skip invalid JSON lines", async () => {
    const content = [
      JSON.stringify({
        slug: "alice-pr-1",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Valid",
        occured_at: "2024-01-01T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      }),
      "invalid json line",
      JSON.stringify({
        slug: "alice-pr-2",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Also valid",
        occured_at: "2024-01-02T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      }),
    ].join("\n");

    await writeFile(
      join(TEST_DATA_DIR, "activities", "alice.jsonl"),
      content + "\n",
      "utf-8"
    );

    const count = await importActivities(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2); // Only valid lines imported
  });
});
