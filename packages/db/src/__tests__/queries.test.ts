/**
 * Database query tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createDatabase } from "../client.js";
import { initializeSchema, clearAllData } from "../schema.js";
import { contributorQueries, activityDefinitionQueries, activityQueries } from "../queries.js";
import type { Database, Contributor, ActivityDefinition, Activity } from "@leaderboard/plugin-api";

describe("Database Queries", () => {
  let db: Database;

  beforeEach(async () => {
    // Use in-memory database for tests
    db = createDatabase(":memory:");
    await initializeSchema(db);
  });

  afterEach(async () => {
    await db.close();
  });

  describe("contributorQueries", () => {
    it("should insert and retrieve a contributor", async () => {
      const contributor: Contributor = {
        username: "alice",
        name: "Alice Smith",
        role: "core",
        title: "Engineer",
        avatar_url: "https://example.com/alice.png",
        bio: "Alice is a software engineer",
        social_profiles: { github: "https://github.com/alice" },
        joining_date: "2020-01-01",
        meta: { team: "backend" },
      };

      await contributorQueries.upsert(db, contributor);
      const retrieved = await contributorQueries.getByUsername(db, "alice");

      expect(retrieved).not.toBeNull();
      expect(retrieved?.username).toBe("alice");
      expect(retrieved?.name).toBe("Alice Smith");
    });

    it("should get contributors by role", async () => {
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

      await contributorQueries.upsert(db, {
        username: "bob",
        name: "Bob",
        role: "intern",
        title: null,
        avatar_url: null,
        bio: null,
        social_profiles: null,
        joining_date: null,
        meta: null,
      });

      const coreMembers = await contributorQueries.getByRole(db, "core");
      expect(coreMembers).toHaveLength(1);
      expect(coreMembers[0].username).toBe("alice");
    });

    it("should count contributors", async () => {
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

      const count = await contributorQueries.count(db);
      expect(count).toBe(1);
    });

    it("should update existing contributor", async () => {
      const contributor: Contributor = {
        username: "alice",
        name: "Alice Smith",
        role: "core",
        title: "Engineer",
        avatar_url: null,
        bio: null,
        social_profiles: null,
        joining_date: null,
        meta: null,
      };

      await contributorQueries.upsert(db, contributor);

      // Update
      await contributorQueries.upsert(db, {
        ...contributor,
        title: "Senior Engineer",
      });

      const updated = await contributorQueries.getByUsername(db, "alice");
      expect(updated?.title).toBe("Senior Engineer");
    });
  });

  describe("activityDefinitionQueries", () => {
    it("should insert and retrieve activity definitions", async () => {
      const def: ActivityDefinition = {
        slug: "pr_merged",
        name: "PR Merged",
        description: "Pull request was merged",
        points: 10,
        icon: "git-merge",
      };

      await activityDefinitionQueries.insertOrIgnore(db, def);
      const retrieved = await activityDefinitionQueries.getBySlug(db, "pr_merged");

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("PR Merged");
      expect(retrieved?.points).toBe(10);
    });

    it("should not duplicate definitions with insertOrIgnore", async () => {
      const def: ActivityDefinition = {
        slug: "pr_merged",
        name: "PR Merged",
        description: "Pull request was merged",
        points: 10,
        icon: null,
      };

      await activityDefinitionQueries.insertOrIgnore(db, def);
      await activityDefinitionQueries.insertOrIgnore(db, { ...def, points: 20 });

      const count = await activityDefinitionQueries.count(db);
      expect(count).toBe(1);

      const retrieved = await activityDefinitionQueries.getBySlug(db, "pr_merged");
      expect(retrieved?.points).toBe(10); // Should keep original
    });
  });

  describe("activityQueries", () => {
    beforeEach(async () => {
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

    it("should insert and retrieve activities", async () => {
      const activity: Activity = {
        slug: "alice-pr-1",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Fix bug",
        occured_at: "2024-01-01T10:00:00Z",
        link: "https://github.com/org/repo/pull/1",
        text: null,
        points: 10,
        meta: null,
      };

      await activityQueries.upsert(db, activity);
      const activities = await activityQueries.getByContributor(db, "alice");

      expect(activities).toHaveLength(1);
      expect(activities[0].title).toBe("Fix bug");
    });

    it("should get activities by date range", async () => {
      await activityQueries.upsert(db, {
        slug: "alice-pr-1",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Activity 1",
        occured_at: "2024-01-15T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "alice-pr-2",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Activity 2",
        occured_at: "2024-02-15T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      const activities = await activityQueries.getByDateRange(
        db,
        "2024-01-01T00:00:00Z",
        "2024-01-31T23:59:59Z"
      );

      expect(activities).toHaveLength(1);
      expect(activities[0].title).toBe("Activity 1");
    });

    it("should calculate total points for contributor", async () => {
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
        slug: "alice-pr-2",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Activity 2",
        occured_at: "2024-01-02T10:00:00Z",
        link: null,
        text: null,
        points: 15,
        meta: null,
      });

      const totalPoints = await activityQueries.getTotalPointsByContributor(db, "alice");
      expect(totalPoints).toBe(25);
    });

    it("should generate leaderboard", async () => {
      // Add another contributor
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

      // Add activities
      await activityQueries.upsert(db, {
        slug: "alice-pr-1",
        contributor: "alice",
        activity_definition: "pr_merged",
        title: "Activity 1",
        occured_at: "2024-01-01T10:00:00Z",
        link: null,
        text: null,
        points: 20,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "bob-pr-1",
        contributor: "bob",
        activity_definition: "pr_merged",
        title: "Activity 2",
        occured_at: "2024-01-02T10:00:00Z",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      const leaderboard = await activityQueries.getLeaderboard(db);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].contributor).toBe("alice");
      expect(leaderboard[0].total_points).toBe(20);
      expect(leaderboard[1].contributor).toBe("bob");
      expect(leaderboard[1].total_points).toBe(10);
    });
  });
});

