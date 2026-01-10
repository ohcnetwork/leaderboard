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
      expect(retrieved?.role).toBe("core");
      expect(retrieved?.title).toBe("Engineer");
      expect(retrieved?.avatar_url).toBe("https://example.com/alice.png");
      expect(retrieved?.bio).toBe("Alice is a software engineer");
      expect(retrieved?.joining_date).toBe("2020-01-01");

      // Verify JSON fields are parsed as objects
      expect(retrieved?.social_profiles).toEqual({
        github: "https://github.com/alice",
      });
      expect(typeof retrieved?.social_profiles).toBe("object");
      expect(retrieved?.meta).toEqual({ team: "backend" });
      expect(typeof retrieved?.meta).toBe("object");
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
      expect(coreMembers[0].name).toBe("Alice");
      expect(coreMembers[0].role).toBe("core");
      expect(coreMembers[0].title).toBeNull();
      expect(coreMembers[0].avatar_url).toBeNull();
      expect(coreMembers[0].bio).toBeNull();
      expect(coreMembers[0].social_profiles).toBeNull();
      expect(coreMembers[0].joining_date).toBeNull();
      expect(coreMembers[0].meta).toBeNull();
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

    it("should parse JSON fields correctly when getting all contributors", async () => {
      await contributorQueries.upsert(db, {
        username: "alice",
        name: "Alice",
        role: "core",
        title: "Developer",
        avatar_url: "https://example.com/alice.png",
        bio: "Core developer",
        social_profiles: { github: "alice", linkedin: "alice-dev" },
        joining_date: "2023-01-01",
        meta: { skills: ["typescript", "react"], experience: 5 },
      });

      await contributorQueries.upsert(db, {
        username: "bob",
        name: "Bob",
        role: "contributor",
        title: "Designer",
        avatar_url: null,
        bio: null,
        social_profiles: { twitter: "@bob" },
        joining_date: "2023-06-01",
        meta: { department: "design" },
      });

      const all = await contributorQueries.getAll(db);

      expect(all).toHaveLength(2);

      // Check first contributor
      expect(all[0].username).toBe("alice");
      expect(all[0].social_profiles).toEqual({
        github: "alice",
        linkedin: "alice-dev",
      });
      expect(typeof all[0].social_profiles).toBe("object");
      expect(all[0].meta).toEqual({
        skills: ["typescript", "react"],
        experience: 5,
      });
      expect(typeof all[0].meta).toBe("object");

      // Check second contributor
      expect(all[1].username).toBe("bob");
      expect(all[1].social_profiles).toEqual({ twitter: "@bob" });
      expect(typeof all[1].social_profiles).toBe("object");
      expect(all[1].meta).toEqual({ department: "design" });
      expect(typeof all[1].meta).toBe("object");
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

      // Update with new data including JSON fields
      await contributorQueries.upsert(db, {
        ...contributor,
        title: "Senior Engineer",
        social_profiles: {
          github: "https://github.com/alice",
          twitter: "@alice",
        },
        meta: { team: "frontend", level: "senior" },
      });

      const updated = await contributorQueries.getByUsername(db, "alice");
      expect(updated?.username).toBe("alice");
      expect(updated?.name).toBe("Alice Smith");
      expect(updated?.role).toBe("core");
      expect(updated?.title).toBe("Senior Engineer");
      expect(updated?.social_profiles).toEqual({
        github: "https://github.com/alice",
        twitter: "@alice",
      });
      expect(typeof updated?.social_profiles).toBe("object");
      expect(updated?.meta).toEqual({ team: "frontend", level: "senior" });
      expect(typeof updated?.meta).toBe("object");
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
        text: "Fixed critical bug in authentication",
        points: 10,
        meta: { pr_number: 123, lines_changed: 50 },
      };

      await activityQueries.upsert(db, activity);
      const activities = await activityQueries.getByContributor(db, "alice");

      expect(activities).toHaveLength(1);
      expect(activities[0].slug).toBe("alice-pr-1");
      expect(activities[0].contributor).toBe("alice");
      expect(activities[0].activity_definition).toBe("pr_merged");
      expect(activities[0].title).toBe("Fix bug");
      expect(activities[0].occured_at).toBe("2024-01-01T10:00:00Z");
      expect(activities[0].link).toBe("https://github.com/org/repo/pull/1");
      expect(activities[0].text).toBe("Fixed critical bug in authentication");
      expect(activities[0].points).toBe(10);

      // Verify meta is parsed as object
      expect(activities[0].meta).toEqual({ pr_number: 123, lines_changed: 50 });
      expect(typeof activities[0].meta).toBe("object");
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
        meta: { month: "january" },
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
        meta: { month: "february" },
      });

      const activities = await activityQueries.getByDateRange(
        db,
        "2024-01-01T00:00:00Z",
        "2024-01-31T23:59:59Z"
      );

      expect(activities).toHaveLength(1);
      expect(activities[0].slug).toBe("alice-pr-1");
      expect(activities[0].title).toBe("Activity 1");
      expect(activities[0].occured_at).toBe("2024-01-15T10:00:00Z");
      expect(activities[0].points).toBe(10);
      expect(activities[0].meta).toEqual({ month: "january" });
      expect(typeof activities[0].meta).toBe("object");
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

    it("should create aggregates with hidden field", async () => {
      // Create visible aggregate
      await globalAggregateQueries.upsert(db, {
        slug: "visible_metric",
        name: "Visible Metric",
        description: null,
        value: { type: "number", value: 10, format: "integer" },
        hidden: false,
        meta: null,
      });

      // Create hidden aggregate
      await globalAggregateQueries.upsert(db, {
        slug: "hidden_metric",
        name: "Hidden Metric",
        description: null,
        value: { type: "number", value: 20, format: "integer" },
        hidden: true,
        meta: null,
      });

      const visible = await globalAggregateQueries.getBySlug(
        db,
        "visible_metric"
      );
      const hidden = await globalAggregateQueries.getBySlug(
        db,
        "hidden_metric"
      );

      // SQLite returns 0/1 for boolean values
      expect(visible?.hidden).toBeFalsy();
      expect(hidden?.hidden).toBeTruthy();
    });

    it("should filter hidden aggregates with getAllVisible", async () => {
      // Create visible aggregate
      await globalAggregateQueries.upsert(db, {
        slug: "visible1",
        name: "Visible 1",
        description: null,
        value: { type: "number", value: 10, format: "integer" },
        hidden: false,
        meta: null,
      });

      // Create hidden aggregate
      await globalAggregateQueries.upsert(db, {
        slug: "hidden1",
        name: "Hidden 1",
        description: null,
        value: { type: "number", value: 20, format: "integer" },
        hidden: true,
        meta: null,
      });

      // Create another visible aggregate (default hidden = false)
      await globalAggregateQueries.upsert(db, {
        slug: "visible2",
        name: "Visible 2",
        description: null,
        value: { type: "number", value: 30, format: "integer" },
        hidden: null,
        meta: null,
      });

      const allAggregates = await globalAggregateQueries.getAll(db);
      const visibleAggregates = await globalAggregateQueries.getAllVisible(db);

      expect(allAggregates).toHaveLength(3);
      expect(visibleAggregates).toHaveLength(2);
      expect(visibleAggregates.map((a) => a.slug)).toEqual(
        expect.arrayContaining(["visible1", "visible2"])
      );
    });

    it("should default hidden to false when not specified", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "default_aggregate",
        name: "Default Aggregate",
        description: null,
        value: { type: "number", value: 42, format: "integer" },
        hidden: null,
        meta: null,
      });

      const aggregate = await globalAggregateQueries.getBySlug(
        db,
        "default_aggregate"
      );
      // Default should be falsy (0, false, or null - all treated as visible)
      expect(aggregate?.hidden).toBeFalsy();
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

    it("should create definitions with hidden field", async () => {
      // Create visible definition
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "visible_def",
        name: "Visible Definition",
        description: null,
        hidden: false,
      });

      // Create hidden definition
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "hidden_def",
        name: "Hidden Definition",
        description: null,
        hidden: true,
      });

      const visible = await contributorAggregateDefinitionQueries.getBySlug(
        db,
        "visible_def"
      );
      const hidden = await contributorAggregateDefinitionQueries.getBySlug(
        db,
        "hidden_def"
      );

      // SQLite returns 0/1 for boolean values
      expect(visible?.hidden).toBeFalsy();
      expect(hidden?.hidden).toBeTruthy();
    });

    it("should filter hidden definitions with getAllVisible", async () => {
      // Create visible definition
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "visible1",
        name: "Visible 1",
        description: null,
        hidden: false,
      });

      // Create hidden definition
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "hidden1",
        name: "Hidden 1",
        description: null,
        hidden: true,
      });

      // Create another visible definition (default)
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "visible2",
        name: "Visible 2",
        description: null,
        hidden: null,
      });

      const allDefinitions = await contributorAggregateDefinitionQueries.getAll(
        db
      );
      const visibleDefinitions =
        await contributorAggregateDefinitionQueries.getAllVisible(db);

      expect(allDefinitions).toHaveLength(3);
      expect(visibleDefinitions).toHaveLength(2);
      expect(visibleDefinitions.map((d) => d.slug)).toEqual(
        expect.arrayContaining(["visible1", "visible2"])
      );
    });

    it("should default hidden to false when not specified", async () => {
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "default_def",
        name: "Default Definition",
        description: null,
        hidden: null,
      });

      const definition = await contributorAggregateDefinitionQueries.getBySlug(
        db,
        "default_def"
      );
      // Default should be falsy (0, false, or null - all treated as visible)
      expect(definition?.hidden).toBeFalsy();
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

describe("activityQueries", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);

    // Set up test data
    await contributorQueries.upsert(db, {
      username: "test_user",
      name: "Test User",
      title: null,
      joining_date: "2025-01-01",
      avatar_url: null,
      role: null,
      bio: null,
      social_profiles: null,
      meta: null,
    });

    await activityDefinitionQueries.insertOrIgnore(db, {
      slug: "pull_request_opened",
      name: "PR Opened",
      description: "Opened a pull request",
      icon: "git-pull-request",
      points: 10,
    });

    await activityDefinitionQueries.insertOrIgnore(db, {
      slug: "pull_request_merged",
      name: "PR Merged",
      description: "Merged a pull request",
      icon: "git-merge",
      points: 20,
    });

    await activityDefinitionQueries.insertOrIgnore(db, {
      slug: "issue_created",
      name: "Issue Created",
      description: "Created an issue",
      icon: "circle-dot",
      points: 5,
    });
  });

  afterEach(async () => {
    await db.close();
  });

  describe("getByDefinitions", () => {
    it("should filter by multiple activity definitions", async () => {
      await activityQueries.upsert(db, {
        slug: "activity_1",
        contributor: "test_user",
        activity_definition: "pull_request_opened",
        title: "PR 1",
        occured_at: "2025-01-01",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "activity_2",
        contributor: "test_user",
        activity_definition: "pull_request_merged",
        title: "PR 2",
        occured_at: "2025-01-02",
        link: null,
        text: null,
        points: 20,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "activity_3",
        contributor: "test_user",
        activity_definition: "issue_created",
        title: "Issue 1",
        occured_at: "2025-01-03",
        link: null,
        text: null,
        points: 5,
        meta: null,
      });

      const result = await activityQueries.getByDefinitions(db, [
        "pull_request_opened",
        "pull_request_merged",
      ]);

      expect(result).toHaveLength(2);
      expect(result.map((a) => a.activity_definition)).toContain(
        "pull_request_opened"
      );
      expect(result.map((a) => a.activity_definition)).toContain(
        "pull_request_merged"
      );
      expect(result.map((a) => a.activity_definition)).not.toContain(
        "issue_created"
      );
    });

    it("should return all when empty array", async () => {
      await activityQueries.upsert(db, {
        slug: "activity_1",
        contributor: "test_user",
        activity_definition: "pull_request_opened",
        title: "PR 1",
        occured_at: "2025-01-01",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "activity_2",
        contributor: "test_user",
        activity_definition: "issue_created",
        title: "Issue 1",
        occured_at: "2025-01-02",
        link: null,
        text: null,
        points: 5,
        meta: null,
      });

      const result = await activityQueries.getByDefinitions(db, []);

      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getByContributorAndDefinitions", () => {
    it("should filter by contributor and definitions", async () => {
      await contributorQueries.upsert(db, {
        username: "user2",
        name: "User 2",
        joining_date: "2025-01-01",
        title: null,
        avatar_url: null,
        role: null,
        bio: null,
        social_profiles: null,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "activity_1",
        contributor: "test_user",
        activity_definition: "pull_request_opened",
        title: "PR 1",
        occured_at: "2025-01-01",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "activity_2",
        contributor: "test_user",
        activity_definition: "issue_created",
        title: "Issue 1",
        occured_at: "2025-01-02",
        link: null,
        text: null,
        points: 5,
        meta: null,
      });

      await activityQueries.upsert(db, {
        slug: "activity_3",
        contributor: "user2",
        activity_definition: "pull_request_opened",
        title: "PR 2",
        occured_at: "2025-01-03",
        link: null,
        text: null,
        points: 10,
        meta: null,
      });

      const result = await activityQueries.getByContributorAndDefinitions(
        db,
        "test_user",
        ["pull_request_opened"]
      );

      expect(result).toHaveLength(1);
      expect(result[0].contributor).toBe("test_user");
      expect(result[0].activity_definition).toBe("pull_request_opened");
    });
  });

  describe("Optimized Query Methods", () => {
    describe("contributorQueries.getAllUsernames", () => {
      it("should return only usernames", async () => {
        await contributorQueries.upsert(db, {
          username: "alice_username",
          name: "Alice Smith",
          role: "core",
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await contributorQueries.upsert(db, {
          username: "bob_username",
          name: "Bob Jones",
          role: "intern",
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        const usernames = await contributorQueries.getAllUsernames(db);

        expect(usernames.length).toBeGreaterThanOrEqual(2);
        expect(usernames).toContain("alice_username");
        expect(usernames).toContain("bob_username");
        expect(typeof usernames[0]).toBe("string");
      });

      it("should return sorted usernames", async () => {
        await contributorQueries.upsert(db, {
          username: "zebra",
          name: "Zebra",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await contributorQueries.upsert(db, {
          username: "alpha",
          name: "Alpha",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        const usernames = await contributorQueries.getAllUsernames(db);

        const alphaIndex = usernames.indexOf("alpha");
        const zebraIndex = usernames.indexOf("zebra");
        expect(alphaIndex).toBeLessThan(zebraIndex);
      });
    });

    describe("contributorQueries.getLeaderboardWithPoints", () => {
      beforeEach(async () => {
        await activityDefinitionQueries.insertOrIgnore(db, {
          slug: "test_activity",
          name: "Test Activity",
          description: "Test",
          points: 10,
          icon: null,
        });

        await contributorQueries.upsert(db, {
          username: "alice",
          name: "Alice",
          role: "core",
          title: null,
          avatar_url: "https://example.com/alice.png",
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

        await contributorQueries.upsert(db, {
          username: "charlie",
          name: "Charlie",
          role: "bot",
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act1",
          contributor: "alice",
          activity_definition: "test_activity",
          title: "Activity 1",
          occured_at: "2025-01-01",
          link: null,
          text: null,
          points: 100,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act2",
          contributor: "bob",
          activity_definition: "test_activity",
          title: "Activity 2",
          occured_at: "2025-01-02",
          link: null,
          text: null,
          points: 50,
          meta: null,
        });
      });

      it("should return contributors with total points", async () => {
        const result = await contributorQueries.getLeaderboardWithPoints(db);

        expect(result.length).toBeGreaterThanOrEqual(3);

        const alice = result.find((r) => r.username === "alice");
        const bob = result.find((r) => r.username === "bob");
        const charlie = result.find((r) => r.username === "charlie");

        expect(alice?.totalPoints).toBe(100);
        expect(bob?.totalPoints).toBe(50);
        expect(charlie?.totalPoints).toBe(0);
      });

      it("should exclude specified roles", async () => {
        const result = await contributorQueries.getLeaderboardWithPoints(db, [
          "bot",
          "intern",
        ]);

        expect(result.length).toBeGreaterThanOrEqual(1);
        const alice = result.find((r) => r.username === "alice");
        expect(alice).toBeDefined();
        expect(alice?.username).toBe("alice");

        const bob = result.find((r) => r.username === "bob");
        const charlie = result.find((r) => r.username === "charlie");
        expect(bob).toBeUndefined();
        expect(charlie).toBeUndefined();
      });

      it("should include contributor details", async () => {
        const result = await contributorQueries.getLeaderboardWithPoints(db);

        expect(result[0].name).toBe("Alice");
        expect(result[0].avatar_url).toBe("https://example.com/alice.png");
        expect(result[0].role).toBe("core");
      });
    });

    describe("activityQueries.getLeaderboardEnriched", () => {
      beforeEach(async () => {
        await activityDefinitionQueries.insertOrIgnore(db, {
          slug: "test_activity",
          name: "Test Activity",
          description: "Test",
          points: 10,
          icon: null,
        });

        await contributorQueries.upsert(db, {
          username: "alice",
          name: "Alice Smith",
          role: "core",
          title: null,
          avatar_url: "https://example.com/alice.png",
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act1",
          contributor: "alice",
          activity_definition: "test_activity",
          title: "Activity 1",
          occured_at: "2025-01-01T10:00:00Z",
          link: null,
          text: null,
          points: 100,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act2",
          contributor: "alice",
          activity_definition: "test_activity",
          title: "Activity 2",
          occured_at: "2025-01-05T10:00:00Z",
          link: null,
          text: null,
          points: 50,
          meta: null,
        });
      });

      it("should return leaderboard with contributor details", async () => {
        const result = await activityQueries.getLeaderboardEnriched(db);

        expect(result).toHaveLength(1);
        expect(result[0].username).toBe("alice");
        expect(result[0].name).toBe("Alice Smith");
        expect(result[0].avatar_url).toBe("https://example.com/alice.png");
        expect(result[0].role).toBe("core");
        expect(result[0].total_points).toBe(150);
        expect(result[0].activity_count).toBe(2);
      });

      it("should filter by date range", async () => {
        const result = await activityQueries.getLeaderboardEnriched(
          db,
          undefined,
          "2025-01-04T00:00:00Z",
          "2025-01-06T00:00:00Z"
        );

        expect(result).toHaveLength(1);
        expect(result[0].total_points).toBe(50);
        expect(result[0].activity_count).toBe(1);
      });

      it("should respect limit", async () => {
        await contributorQueries.upsert(db, {
          username: "bob",
          name: "Bob",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act3",
          contributor: "bob",
          activity_definition: "test_activity",
          title: "Activity 3",
          occured_at: "2025-01-02T10:00:00Z",
          link: null,
          text: null,
          points: 75,
          meta: null,
        });

        const result = await activityQueries.getLeaderboardEnriched(db, 1);

        expect(result).toHaveLength(1);
        expect(result[0].username).toBe("alice");
      });
    });

    describe("activityQueries.getRecentActivitiesEnriched", () => {
      beforeEach(async () => {
        await activityDefinitionQueries.insertOrIgnore(db, {
          slug: "pr_opened",
          name: "PR Opened",
          description: "Opened a pull request",
          points: 10,
          icon: null,
        });

        await activityDefinitionQueries.insertOrIgnore(db, {
          slug: "issue_created",
          name: "Issue Created",
          description: "Created an issue",
          points: 5,
          icon: null,
        });

        await contributorQueries.upsert(db, {
          username: "alice",
          name: "Alice Smith",
          role: "core",
          title: null,
          avatar_url: "https://example.com/alice.png",
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act1",
          contributor: "alice",
          activity_definition: "pr_opened",
          title: "PR #1",
          occured_at: "2025-01-02T10:00:00Z",
          link: "https://github.com/pr/1",
          text: null,
          points: 10,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act2",
          contributor: "alice",
          activity_definition: "issue_created",
          title: "Issue #1",
          occured_at: "2025-01-03T10:00:00Z",
          link: null,
          text: null,
          points: 5,
          meta: null,
        });
      });

      it("should return enriched activities", async () => {
        const result = await activityQueries.getRecentActivitiesEnriched(
          db,
          "2025-01-01T00:00:00Z",
          "2025-01-05T00:00:00Z"
        );

        expect(result).toHaveLength(2);
        expect(result[0].activity_name).toBe("Issue Created");
        expect(result[0].contributor_name).toBe("Alice Smith");
        expect(result[0].contributor_avatar_url).toBe(
          "https://example.com/alice.png"
        );
        expect(result[1].activity_name).toBe("PR Opened");
      });

      it("should filter by date range", async () => {
        const result = await activityQueries.getRecentActivitiesEnriched(
          db,
          "2025-01-03T00:00:00Z",
          "2025-01-04T00:00:00Z"
        );

        expect(result).toHaveLength(1);
        expect(result[0].activity_definition).toBe("issue_created");
      });
    });

    describe("activityQueries.getTopByActivityEnriched", () => {
      beforeEach(async () => {
        await activityDefinitionQueries.insertOrIgnore(db, {
          slug: "pr_opened",
          name: "PR Opened",
          description: "Opened a pull request",
          points: 10,
          icon: null,
        });

        await contributorQueries.upsert(db, {
          username: "alice",
          name: "Alice",
          role: null,
          title: null,
          avatar_url: "https://example.com/alice.png",
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await contributorQueries.upsert(db, {
          username: "bob",
          name: "Bob",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act1",
          contributor: "alice",
          activity_definition: "pr_opened",
          title: "PR #1",
          occured_at: "2025-01-02T10:00:00Z",
          link: null,
          text: null,
          points: 10,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act2",
          contributor: "alice",
          activity_definition: "pr_opened",
          title: "PR #2",
          occured_at: "2025-01-03T10:00:00Z",
          link: null,
          text: null,
          points: 15,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act3",
          contributor: "bob",
          activity_definition: "pr_opened",
          title: "PR #3",
          occured_at: "2025-01-04T10:00:00Z",
          link: null,
          text: null,
          points: 20,
          meta: null,
        });
      });

      it("should return top contributors for activity", async () => {
        const result = await activityQueries.getTopByActivityEnriched(
          db,
          "pr_opened"
        );

        expect(result).toHaveLength(2);
        expect(result[0].username).toBe("alice");
        expect(result[0].points).toBe(25);
        expect(result[0].count).toBe(2);
        expect(result[1].username).toBe("bob");
        expect(result[1].points).toBe(20);
        expect(result[1].count).toBe(1);
      });

      it("should filter by date range", async () => {
        const result = await activityQueries.getTopByActivityEnriched(
          db,
          "pr_opened",
          "2025-01-03T00:00:00Z",
          "2025-01-05T00:00:00Z"
        );

        expect(result).toHaveLength(2);
        expect(result[0].username).toBe("bob");
        expect(result[0].points).toBe(20);
        expect(result[1].username).toBe("alice");
        expect(result[1].points).toBe(15);
      });

      it("should respect limit", async () => {
        const result = await activityQueries.getTopByActivityEnriched(
          db,
          "pr_opened",
          undefined,
          undefined,
          1
        );

        expect(result).toHaveLength(1);
        expect(result[0].username).toBe("alice");
      });
    });

    describe("activityQueries.getActivityCountByDate", () => {
      beforeEach(async () => {
        await activityDefinitionQueries.insertOrIgnore(db, {
          slug: "test_activity",
          name: "Test Activity",
          description: "Test",
          points: 10,
          icon: null,
        });

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

        await activityQueries.upsert(db, {
          slug: "act1",
          contributor: "alice",
          activity_definition: "test_activity",
          title: "Activity 1",
          occured_at: "2025-01-01T10:00:00Z",
          link: null,
          text: null,
          points: 10,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act2",
          contributor: "alice",
          activity_definition: "test_activity",
          title: "Activity 2",
          occured_at: "2025-01-01T14:00:00Z",
          link: null,
          text: null,
          points: 10,
          meta: null,
        });

        await activityQueries.upsert(db, {
          slug: "act3",
          contributor: "alice",
          activity_definition: "test_activity",
          title: "Activity 3",
          occured_at: "2025-01-02T10:00:00Z",
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      });

      it("should group activities by date", async () => {
        const result = await activityQueries.getActivityCountByDate(
          db,
          "alice"
        );

        expect(result).toHaveLength(2);
        expect(result[0].date).toBe("2025-01-01");
        expect(result[0].count).toBe(2);
        expect(result[1].date).toBe("2025-01-02");
        expect(result[1].count).toBe(1);
      });

      it("should return empty array for contributor with no activities", async () => {
        await contributorQueries.upsert(db, {
          username: "bob",
          name: "Bob",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        const result = await activityQueries.getActivityCountByDate(db, "bob");

        expect(result).toHaveLength(0);
      });
    });

    describe("globalAggregateQueries.getBySlugs", () => {
      beforeEach(async () => {
        await globalAggregateQueries.upsert(db, {
          slug: "total_prs",
          name: "Total PRs",
          description: "Total pull requests",
          value: { type: "number", value: 100 },
          hidden: false,
          meta: null,
        });

        await globalAggregateQueries.upsert(db, {
          slug: "total_issues",
          name: "Total Issues",
          description: "Total issues",
          value: { type: "number", value: 50 },
          hidden: false,
          meta: null,
        });

        await globalAggregateQueries.upsert(db, {
          slug: "hidden_metric",
          name: "Hidden Metric",
          description: "Should not appear",
          value: { type: "number", value: 999 },
          hidden: true,
          meta: null,
        });
      });

      it("should return aggregates by slugs", async () => {
        const result = await globalAggregateQueries.getBySlugs(db, [
          "total_prs",
          "total_issues",
        ]);

        expect(result).toHaveLength(2);
        expect(result[0].slug).toBe("total_issues");
        expect(result[0].value).toEqual({ type: "number", value: 50 });
        expect(result[1].slug).toBe("total_prs");
      });

      it("should filter out hidden aggregates", async () => {
        const result = await globalAggregateQueries.getBySlugs(db, [
          "total_prs",
          "hidden_metric",
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].slug).toBe("total_prs");
      });

      it("should return empty array for empty slugs", async () => {
        const result = await globalAggregateQueries.getBySlugs(db, []);

        expect(result).toHaveLength(0);
      });
    });

    describe("contributorAggregateQueries.getByContributorEnriched", () => {
      beforeEach(async () => {
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
          slug: "pr_count",
          name: "PR Count",
          description: "Number of PRs",
          hidden: false,
        });

        await contributorAggregateDefinitionQueries.upsert(db, {
          slug: "issue_count",
          name: "Issue Count",
          description: "Number of issues",
          hidden: false,
        });

        await contributorAggregateDefinitionQueries.upsert(db, {
          slug: "hidden_stat",
          name: "Hidden Stat",
          description: "Should not appear",
          hidden: true,
        });

        await contributorAggregateQueries.upsert(db, {
          aggregate: "pr_count",
          contributor: "alice",
          value: { type: "number", value: 10 },
          meta: null,
        });

        await contributorAggregateQueries.upsert(db, {
          aggregate: "issue_count",
          contributor: "alice",
          value: { type: "number", value: 5 },
          meta: null,
        });

        await contributorAggregateQueries.upsert(db, {
          aggregate: "hidden_stat",
          contributor: "alice",
          value: { type: "number", value: 999 },
          meta: null,
        });
      });

      it("should return enriched aggregates", async () => {
        const result =
          await contributorAggregateQueries.getByContributorEnriched(
            db,
            "alice",
            ["pr_count", "issue_count"]
          );

        expect(result).toHaveLength(2);
        expect(result[0].aggregate).toBe("issue_count");
        expect(result[0].name).toBe("Issue Count");
        expect(result[0].value).toEqual({ type: "number", value: 5 });
        expect(result[1].aggregate).toBe("pr_count");
      });

      it("should filter out hidden aggregates", async () => {
        const result =
          await contributorAggregateQueries.getByContributorEnriched(
            db,
            "alice",
            ["pr_count", "hidden_stat"]
          );

        expect(result).toHaveLength(1);
        expect(result[0].aggregate).toBe("pr_count");
      });

      it("should return empty array for empty slugs", async () => {
        const result =
          await contributorAggregateQueries.getByContributorEnriched(
            db,
            "alice",
            []
          );

        expect(result).toHaveLength(0);
      });
    });

    describe("contributorBadgeQueries.getRecentEnriched", () => {
      beforeEach(async () => {
        await contributorQueries.upsert(db, {
          username: "alice",
          name: "Alice Smith",
          role: null,
          title: null,
          avatar_url: "https://example.com/alice.png",
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await contributorQueries.upsert(db, {
          username: "bob",
          name: "Bob Jones",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await badgeDefinitionQueries.upsert(db, {
          slug: "contributor",
          name: "Contributor Badge",
          description: "First contribution",
          variants: {
            bronze: { description: "Bronze", svg_url: "/bronze.svg" },
            silver: { description: "Silver", svg_url: "/silver.svg" },
          },
        });

        await contributorBadgeQueries.award(db, {
          slug: "badge1",
          badge: "contributor",
          contributor: "alice",
          variant: "bronze",
          achieved_on: "2025-01-01",
          meta: null,
        });

        await contributorBadgeQueries.award(db, {
          slug: "badge2",
          badge: "contributor",
          contributor: "bob",
          variant: "silver",
          achieved_on: "2025-01-02",
          meta: null,
        });
      });

      it("should return enriched badges", async () => {
        const result = await contributorBadgeQueries.getRecentEnriched(db, 10);

        expect(result).toHaveLength(2);
        expect(result[0].contributor).toBe("bob");
        expect(result[0].contributor_name).toBe("Bob Jones");
        expect(result[0].badge_name).toBe("Contributor Badge");
        expect(result[0].badge_variants).toHaveProperty("bronze");
        expect(result[1].contributor).toBe("alice");
        expect(result[1].contributor_avatar_url).toBe(
          "https://example.com/alice.png"
        );
      });

      it("should respect limit", async () => {
        const result = await contributorBadgeQueries.getRecentEnriched(db, 1);

        expect(result).toHaveLength(1);
        expect(result[0].contributor).toBe("bob");
      });

      it("should sort by achieved_on descending", async () => {
        const result = await contributorBadgeQueries.getRecentEnriched(db);

        expect(
          new Date(result[0].achieved_on).getTime()
        ).toBeGreaterThanOrEqual(new Date(result[1].achieved_on).getTime());
      });
    });

    describe("contributorBadgeQueries.getTopEarnersEnriched", () => {
      beforeEach(async () => {
        await contributorQueries.upsert(db, {
          username: "alice",
          name: "Alice Smith",
          role: null,
          title: null,
          avatar_url: "https://example.com/alice.png",
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await contributorQueries.upsert(db, {
          username: "bob",
          name: "Bob Jones",
          role: null,
          title: null,
          avatar_url: null,
          bio: null,
          social_profiles: null,
          joining_date: null,
          meta: null,
        });

        await badgeDefinitionQueries.upsert(db, {
          slug: "badge1",
          name: "Badge 1",
          description: "First badge",
          variants: { default: { description: "Default", svg_url: "/1.svg" } },
        });

        await badgeDefinitionQueries.upsert(db, {
          slug: "badge2",
          name: "Badge 2",
          description: "Second badge",
          variants: { default: { description: "Default", svg_url: "/2.svg" } },
        });

        await contributorBadgeQueries.award(db, {
          slug: "b1",
          badge: "badge1",
          contributor: "alice",
          variant: "default",
          achieved_on: "2025-01-01",
          meta: null,
        });

        await contributorBadgeQueries.award(db, {
          slug: "b2",
          badge: "badge2",
          contributor: "alice",
          variant: "default",
          achieved_on: "2025-01-02",
          meta: null,
        });

        await contributorBadgeQueries.award(db, {
          slug: "b3",
          badge: "badge1",
          contributor: "bob",
          variant: "default",
          achieved_on: "2025-01-03",
          meta: null,
        });
      });

      it("should return top earners with badge count", async () => {
        const result = await contributorBadgeQueries.getTopEarnersEnriched(
          db,
          10
        );

        expect(result).toHaveLength(2);
        expect(result[0].username).toBe("alice");
        expect(result[0].badge_count).toBe(2);
        expect(result[0].name).toBe("Alice Smith");
        expect(result[1].username).toBe("bob");
        expect(result[1].badge_count).toBe(1);
      });

      it("should respect limit", async () => {
        const result = await contributorBadgeQueries.getTopEarnersEnriched(
          db,
          1
        );

        expect(result).toHaveLength(1);
        expect(result[0].username).toBe("alice");
      });

      it("should sort by badge count descending", async () => {
        const result = await contributorBadgeQueries.getTopEarnersEnriched(db);

        expect(result[0].badge_count).toBeGreaterThanOrEqual(
          result[1].badge_count
        );
      });
    });
  });
});
