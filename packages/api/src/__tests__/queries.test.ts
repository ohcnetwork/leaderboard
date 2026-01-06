/**
 * Database query tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createDatabase } from "../client";
import { initializeSchema, clearAllData } from "../schema";
import {
  contributorQueries,
  activityDefinitionQueries,
  activityQueries,
  globalAggregateQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
  badgeDefinitionQueries,
  contributorBadgeQueries,
} from "../queries";
import type {
  Database,
  Contributor,
  ActivityDefinition,
  Activity,
} from "../types";

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
      const retrieved = await activityDefinitionQueries.getBySlug(
        db,
        "pr_merged"
      );

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
      await activityDefinitionQueries.insertOrIgnore(db, {
        ...def,
        points: 20,
      });

      const count = await activityDefinitionQueries.count(db);
      expect(count).toBe(1);

      const retrieved = await activityDefinitionQueries.getBySlug(
        db,
        "pr_merged"
      );
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

      const totalPoints = await activityQueries.getTotalPointsByContributor(
        db,
        "alice"
      );
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

  describe("globalAggregateQueries", () => {
    it("should insert and retrieve a global aggregate", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "total_contributors",
        name: "Total Contributors",
        description: "Total number of contributors",
        value: {
          type: "number",
          value: 42,
          format: "integer",
        },
        meta: { calculated_at: "2025-01-05T12:00:00Z" },
      });

      const aggregate = await globalAggregateQueries.getBySlug(
        db,
        "total_contributors"
      );

      expect(aggregate).not.toBeNull();
      expect(aggregate?.slug).toBe("total_contributors");
      expect(aggregate?.value.type).toBe("number");
      if (aggregate?.value.type === "number") {
        expect(aggregate.value.value).toBe(42);
      }
    });

    it("should get all global aggregates", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "total_contributors",
        name: "Total Contributors",
        description: null,
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      await globalAggregateQueries.upsert(db, {
        slug: "total_activities",
        name: "Total Activities",
        description: null,
        value: { type: "number", value: 100, format: "integer" },
        meta: null,
      });

      const aggregates = await globalAggregateQueries.getAll(db);
      expect(aggregates).toHaveLength(2);
    });

    it("should update existing global aggregate", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "total_contributors",
        name: "Total Contributors",
        description: null,
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      await globalAggregateQueries.upsert(db, {
        slug: "total_contributors",
        name: "Total Contributors",
        description: null,
        value: { type: "number", value: 50, format: "integer" },
        meta: null,
      });

      const aggregate = await globalAggregateQueries.getBySlug(
        db,
        "total_contributors"
      );
      if (aggregate?.value.type === "number") {
        expect(aggregate.value.value).toBe(50);
      }
    });

    it("should handle different aggregate value types", async () => {
      // String aggregate
      await globalAggregateQueries.upsert(db, {
        slug: "status",
        name: "Status",
        description: null,
        value: { type: "string", value: "Active" },
        meta: null,
      });

      // Statistics aggregate
      await globalAggregateQueries.upsert(db, {
        slug: "activity_stats",
        name: "Activity Statistics",
        description: null,
        value: {
          type: "statistics/number",
          min: 1,
          max: 100,
          mean: 42.5,
          count: 50,
          highlightMetric: "mean",
        },
        meta: null,
      });

      const stringAgg = await globalAggregateQueries.getBySlug(db, "status");
      const statsAgg = await globalAggregateQueries.getBySlug(
        db,
        "activity_stats"
      );

      expect(stringAgg?.value.type).toBe("string");
      expect(statsAgg?.value.type).toBe("statistics/number");
    });
  });

  describe("contributorAggregateDefinitionQueries", () => {
    it("should insert and retrieve aggregate definition", async () => {
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "pr_merged_count",
        name: "PRs Merged",
        description: "Number of pull requests merged",
      });

      const definition = await contributorAggregateDefinitionQueries.getBySlug(
        db,
        "pr_merged_count"
      );

      expect(definition).not.toBeNull();
      expect(definition?.name).toBe("PRs Merged");
    });

    it("should get all aggregate definitions", async () => {
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "pr_merged_count",
        name: "PRs Merged",
        description: null,
      });

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "code_review_count",
        name: "Code Reviews",
        description: null,
      });

      const definitions = await contributorAggregateDefinitionQueries.getAll(
        db
      );
      expect(definitions).toHaveLength(2);
    });
  });

  describe("contributorAggregateQueries", () => {
    beforeEach(async () => {
      // Setup contributor and aggregate definition
      await contributorQueries.upsert(db, {
        username: "alice",
        name: "Alice",
        role: null,
        title: null,
        avatar_url: null,
        bio: null,
        social_profiles: null,
        joining_date: null,
        meta: null,
      });

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: null,
      });
    });

    it("should insert and retrieve contributor aggregate", async () => {
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "alice",
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      const aggregate =
        await contributorAggregateQueries.getByContributorAndAggregate(
          db,
          "alice",
          "activity_count"
        );

      expect(aggregate).not.toBeNull();
      if (aggregate?.value.type === "number") {
        expect(aggregate.value.value).toBe(42);
      }
    });

    it("should get all aggregates for a contributor", async () => {
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "total_points",
        name: "Total Points",
        description: null,
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "alice",
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "total_points",
        contributor: "alice",
        value: { type: "number", value: 250, format: "integer" },
        meta: null,
      });

      const aggregates = await contributorAggregateQueries.getByContributor(
        db,
        "alice"
      );
      expect(aggregates).toHaveLength(2);
    });

    it("should handle aggregate with units", async () => {
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "alice",
        value: {
          type: "number",
          value: 7200000,
          unit: "ms",
          format: "duration",
        },
        meta: null,
      });

      const aggregate =
        await contributorAggregateQueries.getByContributorAndAggregate(
          db,
          "alice",
          "activity_count"
        );

      if (aggregate?.value.type === "number") {
        expect(aggregate.value.unit).toBe("ms");
        expect(aggregate.value.format).toBe("duration");
      }
    });
  });

  describe("badgeDefinitionQueries", () => {
    it("should insert and retrieve badge definition", async () => {
      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "Awarded for reaching activity milestones",
        variants: {
          bronze: {
            description: "10+ activities",
            svg_url: "https://example.com/bronze.svg",
          },
          silver: {
            description: "50+ activities",
            svg_url: "https://example.com/silver.svg",
          },
        },
      });

      const badge = await badgeDefinitionQueries.getBySlug(
        db,
        "activity_milestone"
      );

      expect(badge).not.toBeNull();
      expect(badge?.name).toBe("Activity Milestone");
      expect(badge?.variants.bronze).toBeDefined();
      expect(badge?.variants.silver).toBeDefined();
    });

    it("should get all badge definitions", async () => {
      await badgeDefinitionQueries.upsert(db, {
        slug: "badge1",
        name: "Badge 1",
        description: "Test badge",
        variants: { bronze: { description: "Level 1", svg_url: "url1" } },
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "badge2",
        name: "Badge 2",
        description: "Test badge",
        variants: { silver: { description: "Level 2", svg_url: "url2" } },
      });

      const badges = await badgeDefinitionQueries.getAll(db);
      expect(badges).toHaveLength(2);
    });
  });

  describe("contributorBadgeQueries", () => {
    beforeEach(async () => {
      // Setup contributor and badge definition
      await contributorQueries.upsert(db, {
        username: "alice",
        name: "Alice",
        role: null,
        title: null,
        avatar_url: null,
        bio: null,
        social_profiles: null,
        joining_date: null,
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "Test badge",
        variants: {
          bronze: { description: "10+", svg_url: "url" },
          silver: { description: "50+", svg_url: "url" },
          gold: { description: "100+", svg_url: "url" },
        },
      });
    });

    it("should award and retrieve a badge", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: { auto_awarded: true },
      });

      const badge = await contributorBadgeQueries.getByContributorAndBadge(
        db,
        "alice",
        "activity_milestone"
      );

      expect(badge).not.toBeNull();
      expect(badge?.variant).toBe("bronze");
      expect(badge?.achieved_on).toBe("2025-01-05");
    });

    it("should get all badges for a contributor", async () => {
      await badgeDefinitionQueries.upsert(db, {
        slug: "streak_badge",
        name: "Streak Badge",
        description: "Test badge",
        variants: { bronze: { description: "7 days", svg_url: "url" } },
      });

      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: null,
      });

      await contributorBadgeQueries.award(db, {
        slug: "streak_badge__alice__bronze",
        badge: "streak_badge",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-04",
        meta: null,
      });

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "alice"
      );
      expect(badges).toHaveLength(2);
    });

    it("should check if badge exists", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: null,
      });

      const exists = await contributorBadgeQueries.exists(
        db,
        "alice",
        "activity_milestone",
        "bronze"
      );
      expect(exists).toBe(true);

      const notExists = await contributorBadgeQueries.exists(
        db,
        "alice",
        "activity_milestone",
        "gold"
      );
      expect(notExists).toBe(false);
    });

    it("should upgrade a badge variant", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-01",
        meta: null,
      });

      await contributorBadgeQueries.upgrade(
        db,
        "activity_milestone__alice__bronze",
        "silver",
        { upgraded: true }
      );

      const badge = await contributorBadgeQueries.getByContributorAndBadge(
        db,
        "alice",
        "activity_milestone"
      );

      expect(badge?.variant).toBe("silver");
      expect(badge?.meta?.upgraded).toBe(true);
    });

    it("should not award duplicate badges", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: null,
      });

      // Try to award same badge again (should be ignored due to INSERT OR IGNORE)
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-06",
        meta: null,
      });

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "alice"
      );
      expect(badges).toHaveLength(1);
    });
  });
});
