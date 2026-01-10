/**
 * Data loader tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createDatabase,
  initializeSchema,
  contributorQueries,
  activityDefinitionQueries,
  activityQueries,
  type Database,
} from "@ohcnetwork/leaderboard-api";

import {
  getAllContributors,
  getContributor,
  getAllActivityDefinitions,
  getActivities,
  getContributorStats,
  getRecentActivitiesGroupedByType,
  getAllContributorUsernames,
  getContributorProfile,
  listActivityDefinitions,
  getAllContributorsWithAvatars,
  getLeaderboard,
} from "../loader";

// Mock the database client
vi.mock("../../../lib/db/client", () => ({
  getDatabase: () => db,
  closeDatabase: vi.fn(),
}));

let db: Database;

describe("Data Loader", () => {
  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);

    // Set up test data
    await contributorQueries.upsert(db, {
      username: "alice",
      name: "Alice Smith",
      role: "core",
      title: "Engineer",
      avatar_url: "https://example.com/alice.png",
      bio: "Alice is a software engineer",
      social_profiles: { github: "https://github.com/alice" },
      joining_date: "2020-01-01",
      meta: null,
    });

    await contributorQueries.upsert(db, {
      username: "bob",
      name: "Bob Jones",
      role: "intern",
      title: null,
      avatar_url: "https://example.com/bob.png",
      bio: null,
      social_profiles: null,
      joining_date: "2021-01-01",
      meta: null,
    });

    await contributorQueries.upsert(db, {
      username: "hidden",
      name: "Hidden User",
      role: "bot",
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
      description: "Pull request merged",
      points: 10,
      icon: "git-merge",
    });

    await activityDefinitionQueries.insertOrIgnore(db, {
      slug: "issue_opened",
      name: "Issue Opened",
      description: "Opened an issue",
      points: 5,
      icon: "circle-dot",
    });

    // Add some activities
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    await activityQueries.upsert(db, {
      slug: "alice-pr-1",
      contributor: "alice",
      activity_definition: "pr_merged",
      title: "Fix bug",
      occured_at: now.toISOString(),
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
      occured_at: yesterday.toISOString(),
      link: "https://github.com/org/repo/pull/2",
      text: null,
      points: 10,
      meta: null,
    });

    await activityQueries.upsert(db, {
      slug: "bob-issue-1",
      contributor: "bob",
      activity_definition: "issue_opened",
      title: "Report bug",
      occured_at: now.toISOString(),
      link: "https://github.com/org/repo/issues/1",
      text: null,
      points: 5,
      meta: null,
    });

    await activityQueries.upsert(db, {
      slug: "alice-old",
      contributor: "alice",
      activity_definition: "pr_merged",
      title: "Old PR",
      occured_at: lastWeek.toISOString(),
      link: null,
      text: null,
      points: 10,
      meta: null,
    });
  });

  afterEach(async () => {
    await db.close();
  });

  describe("getAllContributors", () => {
    it("should return all contributors", async () => {
      const contributors = await getAllContributors();
      expect(contributors).toHaveLength(3);
      expect(contributors.map((c) => c.username).sort()).toEqual([
        "alice",
        "bob",
        "hidden",
      ]);
    });
  });

  describe("getContributor", () => {
    it("should return a specific contributor", async () => {
      const contributor = await getContributor("alice");
      expect(contributor).not.toBeNull();
      expect(contributor?.name).toBe("Alice Smith");
    });

    it("should return null for non-existent contributor", async () => {
      const contributor = await getContributor("nonexistent");
      expect(contributor).toBeNull();
    });
  });

  describe("getAllActivityDefinitions", () => {
    it("should return all activity definitions", async () => {
      const definitions = await getAllActivityDefinitions();
      expect(definitions).toHaveLength(2);
      expect(definitions.map((d) => d.slug).sort()).toEqual([
        "issue_opened",
        "pr_merged",
      ]);
    });
  });

  describe("getActivities", () => {
    it("should return all activities", async () => {
      const activities = await getActivities();
      expect(activities).toHaveLength(4);
    });

    it("should filter by contributor", async () => {
      const activities = await getActivities({ contributor: "alice" });
      expect(activities).toHaveLength(3);
      expect(activities.every((a) => a.contributor === "alice")).toBe(true);
    });

    it("should limit results", async () => {
      const activities = await getActivities({ limit: 2 });
      expect(activities).toHaveLength(2);
    });
  });

  describe("getLeaderboard", () => {
    it("should return leaderboard rankings with contributor data", async () => {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const leaderboard = await getLeaderboard(
        weekAgo.toISOString(),
        now.toISOString()
      );

      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0].username).toBe("alice");
      expect(leaderboard[0].total_points).toBeGreaterThan(0);
      expect(leaderboard[0].name).toBe("Alice Smith");
      expect(leaderboard[0].avatar_url).toBeTruthy();
    });
  });

  describe("getContributorStats", () => {
    it("should return contributor stats", async () => {
      const stats = await getContributorStats("alice");

      expect(stats.totalPoints).toBe(30); // 3 PRs x 10 points
      expect(stats.activityCount).toBe(3);
      expect(stats.activities).toHaveLength(3);
    });
  });

  describe("getRecentActivitiesGroupedByType", () => {
    it("should group activities by type", async () => {
      const grouped = await getRecentActivitiesGroupedByType(7);

      expect(grouped.length).toBeGreaterThan(0);

      const prGroup = grouped.find(
        (g) => g.activity_definition === "pr_merged"
      );
      expect(prGroup).toBeDefined();
      expect(prGroup?.activity_name).toBe("PR Merged");
      expect(prGroup?.activities.length).toBeGreaterThan(0);
    });

    it("should only include activities from specified days", async () => {
      const grouped = await getRecentActivitiesGroupedByType(1);

      // Should only have activities from today
      const totalActivities = grouped.reduce(
        (sum, g) => sum + g.activities.length,
        0
      );
      expect(totalActivities).toBeLessThan(4); // Less than all 4 activities
    });
  });

  describe("getAllContributorUsernames", () => {
    it("should return all usernames", async () => {
      const usernames = await getAllContributorUsernames();
      expect(usernames).toHaveLength(3);
      expect(usernames.sort()).toEqual(["alice", "bob", "hidden"]);
    });
  });

  describe("getContributorProfile", () => {
    it("should return complete contributor profile", async () => {
      const profile = await getContributorProfile("alice");

      expect(profile.contributor).not.toBeNull();
      expect(profile.contributor?.username).toBe("alice");
      expect(profile.totalPoints).toBe(30);
      expect(profile.activities).toHaveLength(3);
      expect(Object.keys(profile.activityByDate).length).toBeGreaterThan(0);
    });

    it("should return null for non-existent contributor", async () => {
      const profile = await getContributorProfile("nonexistent");

      expect(profile.contributor).toBeNull();
      expect(profile.activities).toHaveLength(0);
      expect(profile.totalPoints).toBe(0);
    });

    it("should enrich activities with definition names", async () => {
      const profile = await getContributorProfile("alice");

      expect(profile.activities[0]).toHaveProperty("activity_name");
      expect(profile.activities[0].activity_name).toBe("PR Merged");
    });
  });

  describe("listActivityDefinitions", () => {
    it("should list all activity definitions", async () => {
      const definitions = await listActivityDefinitions();
      expect(definitions).toHaveLength(2);
      expect(definitions[0]).toHaveProperty("slug");
      expect(definitions[0]).toHaveProperty("name");
    });
  });

  describe("getAllContributorsWithAvatars", () => {
    it("should return contributors with avatars", async () => {
      const contributors = await getAllContributorsWithAvatars([]);

      expect(contributors).toHaveLength(3);
      expect(contributors[0]).toHaveProperty("username");
      expect(contributors[0]).toHaveProperty("avatar_url");
      expect(contributors[0]).toHaveProperty("totalPoints");
    });

    it("should filter out hidden roles", async () => {
      const contributors = await getAllContributorsWithAvatars(["bot"]);

      expect(contributors).toHaveLength(2);
      expect(contributors.every((c) => c.role !== "bot")).toBe(true);
    });

    it("should sort by total points descending", async () => {
      const contributors = await getAllContributorsWithAvatars([]);

      expect(contributors[0].username).toBe("alice"); // Alice has most points
      expect(contributors[0].totalPoints).toBeGreaterThan(
        contributors[1].totalPoints
      );
    });
  });
});
