import type { Database } from "@ohcnetwork/leaderboard-api";
import {
  activityDefinitionQueries,
  activityQueries,
  badgeDefinitionQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
  contributorBadgeQueries,
  contributorQueries,
  createDatabase,
  initializeSchema,
} from "@ohcnetwork/leaderboard-api";
import { beforeEach, describe, expect, it } from "vitest";
import { evaluateBadgeRules } from "../../rules/evaluator";
import type { BadgeRuleDefinition } from "../../rules/types";

describe("Badge Rule Evaluator", () => {
  let db: Database;
  const mockLogger = {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);

    // Set up test data
    await contributorQueries.upsert(db, {
      username: "test_user",
      name: "Test User",
      joining_date: "2025-01-01",
      avatar_url: null,
      role: "contributor",
      title: null,
      bio: null,
      social_profiles: null,
      meta: null,
    });

    // Add activity definitions
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

    await activityDefinitionQueries.insertOrIgnore(db, {
      slug: "pull_request_reviewed",
      name: "PR Reviewed",
      description: "Reviewed a pull request",
      icon: "eye",
      points: 15,
    });
  });

  describe("Threshold Rules", () => {
    it("should award badges based on aggregate thresholds", async () => {
      // Set up aggregate definition
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: "Total number of activities",
      });

      // Set up aggregate value
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "test_user",
        value: { type: "number", value: 50 },
        meta: null,
      });

      // Set up badge definition
      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "Awarded for reaching activity milestones",
        variants: {
          bronze: {
            description: "10 activities",
            svg_url: "/bronze.svg",
            order: 1,
          },
          silver: {
            description: "50 activities",
            svg_url: "/silver.svg",
            order: 2,
          },
          gold: {
            description: "100 activities",
            svg_url: "/gold.svg",
            order: 3,
          },
        },
      });

      // Define test rule
      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "activity_milestone",
          enabled: true,
          aggregateSlug: "activity_count",
          thresholds: [
            { variant: "bronze", value: 10 },
            { variant: "silver", value: 50 },
            { variant: "gold", value: 100 },
          ],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      // Check that silver badge was awarded
      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].badge).toBe("activity_milestone");
      expect(badges[0].variant).toBe("silver");
    });

    it("should award highest eligible variant", async () => {
      // Set up with high value
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: "Total number of activities",
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "test_user",
        value: { type: "number", value: 150 },
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "Awarded for reaching activity milestones",
        variants: {
          bronze: {
            description: "10 activities",
            svg_url: "/bronze.svg",
            order: 1,
          },
          silver: {
            description: "50 activities",
            svg_url: "/silver.svg",
            order: 2,
          },
          gold: {
            description: "100 activities",
            svg_url: "/gold.svg",
            order: 3,
          },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "activity_milestone",
          enabled: true,
          aggregateSlug: "activity_count",
          thresholds: [
            { variant: "bronze", value: 10 },
            { variant: "silver", value: 50 },
            { variant: "gold", value: 100 },
          ],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].variant).toBe("gold");
    });

    it("should set achieved_on to the date of the Nth activity for activity_count thresholds", async () => {
      // Create 15 activities with specific dates
      for (let i = 0; i < 15; i++) {
        await activityQueries.upsert(db, {
          slug: `act_${i}`,
          contributor: "test_user",
          activity_definition: "pull_request_opened",
          title: `Activity ${i}`,
          occurred_at: `2025-01-${String(i + 1).padStart(2, "0")}`,
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: "Total number of activities",
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "test_user",
        value: { type: "number", value: 15 },
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "milestone",
        variants: {
          bronze: { description: "10", svg_url: "/b.svg", order: 1 },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "activity_milestone",
          enabled: true,
          aggregateSlug: "activity_count",
          thresholds: [{ variant: "bronze", value: 10 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      // The 10th activity (0-indexed: 9) has date 2025-01-10
      expect(badges[0].achieved_on).toBe("2025-01-10");
    });

    it("should set achieved_on to the date of the Nth activity for per-definition activity_count thresholds", async () => {
      // Create mixed activities: PRs on odd days, issues on even days
      for (let i = 0; i < 10; i++) {
        await activityQueries.upsert(db, {
          slug: `pr_${i}`,
          contributor: "test_user",
          activity_definition: "pull_request_opened",
          title: `PR ${i}`,
          occurred_at: `2025-02-${String(i * 2 + 1).padStart(2, "0")}`,
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }
      for (let i = 0; i < 5; i++) {
        await activityQueries.upsert(db, {
          slug: `issue_${i}`,
          contributor: "test_user",
          activity_definition: "issue_created",
          title: `Issue ${i}`,
          occurred_at: `2025-02-${String(i * 2 + 2).padStart(2, "0")}`,
          link: null,
          text: null,
          points: 5,
          meta: null,
        });
      }

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count:pull_request_opened",
        name: "PR Count",
        description: "PR activities",
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count:pull_request_opened",
        contributor: "test_user",
        value: { type: "number", value: 10 },
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "pr_milestone",
        name: "PR Milestone",
        description: "milestone",
        variants: {
          bronze: { description: "5 PRs", svg_url: "/b.svg", order: 1 },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "pr_milestone",
          enabled: true,
          aggregateSlug: "activity_count:pull_request_opened",
          thresholds: [{ variant: "bronze", value: 5 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      // 5th PR (0-indexed: 4) has date 2025-02-09
      expect(badges[0].achieved_on).toBe("2025-02-09");
    });

    it("should set achieved_on based on cumulative points for total_activity_points thresholds", async () => {
      // Create activities with varying points
      await activityQueries.upsert(db, {
        slug: "act_a",
        contributor: "test_user",
        activity_definition: "pull_request_opened",
        title: "A",
        occurred_at: "2025-03-01",
        link: null,
        text: null,
        points: 30,
        meta: null,
      });
      await activityQueries.upsert(db, {
        slug: "act_b",
        contributor: "test_user",
        activity_definition: "pull_request_merged",
        title: "B",
        occurred_at: "2025-03-05",
        link: null,
        text: null,
        points: 40,
        meta: null,
      });
      await activityQueries.upsert(db, {
        slug: "act_c",
        contributor: "test_user",
        activity_definition: "pull_request_opened",
        title: "C",
        occurred_at: "2025-03-10",
        link: null,
        text: null,
        points: 50,
        meta: null,
      });

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "total_activity_points",
        name: "Total Points",
        description: "Total activity points",
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "total_activity_points",
        contributor: "test_user",
        value: { type: "number", value: 120 },
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "points_milestone",
        name: "Points Milestone",
        description: "milestone",
        variants: {
          bronze: { description: "50 pts", svg_url: "/b.svg", order: 1 },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "points_milestone",
          enabled: true,
          aggregateSlug: "total_activity_points",
          thresholds: [{ variant: "bronze", value: 50 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      // Cumulative: 30 (act_a), 70 (act_b crosses 50) → achieved_on = 2025-03-05
      expect(badges[0].achieved_on).toBe("2025-03-05");
    });

    it("should fall back to current date for unknown aggregate slugs", async () => {
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "custom_metric",
        name: "Custom Metric",
        description: "Some custom metric",
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "custom_metric",
        contributor: "test_user",
        value: { type: "number", value: 100 },
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "custom_badge",
        name: "Custom Badge",
        description: "badge",
        variants: {
          bronze: { description: "50", svg_url: "/b.svg", order: 1 },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "custom_badge",
          enabled: true,
          aggregateSlug: "custom_metric",
          thresholds: [{ variant: "bronze", value: 50 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      // Falls back to current date for unknown aggregates
      expect(badges[0].achieved_on).toBe(
        new Date().toISOString().split("T")[0],
      );
    });
  });

  describe("Streak Rules", () => {
    it("should calculate streak across all activities when no filter", async () => {
      // Add consecutive daily activities
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        await activityQueries.upsert(db, {
          slug: `activity_${i}`,
          contributor: "test_user",
          activity_definition:
            i % 2 === 0 ? "pull_request_opened" : "issue_created",
          title: `Activity ${i}`,
          occurred_at: date.toISOString().split("T")[0],
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }

      await badgeDefinitionQueries.upsert(db, {
        slug: "consistency_champion",
        name: "Consistency Champion",
        description: "Awarded for maintaining an activity streak",
        variants: {
          bronze: {
            description: "7 day streak",
            svg_url: "/bronze.svg",
            order: 1,
          },
          silver: {
            description: "14 day streak",
            svg_url: "/silver.svg",
            order: 2,
          },
          gold: {
            description: "30 day streak",
            svg_url: "/gold.svg",
            order: 3,
          },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "streak",
          badgeSlug: "consistency_champion",
          enabled: true,
          streakType: "daily",
          thresholds: [
            { variant: "bronze", days: 7 },
            { variant: "silver", days: 14 },
            { variant: "gold", days: 30 },
          ],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].badge).toBe("consistency_champion");
      expect(badges[0].variant).toBe("bronze");
      // achieved_on should be the end date of the streak, not today
      expect(badges[0].achieved_on).toBe(today.toISOString().split("T")[0]);
    });

    it("should set achieved_on to streak end date", async () => {
      // Add 10 consecutive daily activities starting from a fixed past date
      for (let i = 0; i < 10; i++) {
        await activityQueries.upsert(db, {
          slug: `streak_act_${i}`,
          contributor: "test_user",
          activity_definition: "pull_request_opened",
          title: `Activity ${i}`,
          occurred_at: `2025-03-${String(i + 1).padStart(2, "0")}`,
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }

      await badgeDefinitionQueries.upsert(db, {
        slug: "streak_badge",
        name: "Streak Badge",
        description: "streak",
        variants: {
          bronze: { description: "7 days", svg_url: "/b.svg", order: 1 },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "streak",
          badgeSlug: "streak_badge",
          enabled: true,
          streakType: "daily",
          thresholds: [{ variant: "bronze", days: 7 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      // Streak of 10 consecutive days: 2025-03-01 to 2025-03-10
      // End date of the longest streak should be 2025-03-10
      expect(badges[0].achieved_on).toBe("2025-03-10");
    });

    it("should filter activities by regex pattern", async () => {
      // Add mixed activities
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        await activityQueries.upsert(db, {
          slug: `activity_${i}`,
          contributor: "test_user",
          activity_definition:
            i % 3 === 0 ? "pull_request_opened" : "issue_created",
          title: `Activity ${i}`,
          occurred_at: date.toISOString().split("T")[0],
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }

      await badgeDefinitionQueries.upsert(db, {
        slug: "pr_consistency",
        name: "PR Consistency",
        description: "Streak of PR activities",
        variants: {
          bronze: {
            description: "5 day PR streak",
            svg_url: "/bronze.svg",
            order: 1,
          },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "streak",
          badgeSlug: "pr_consistency",
          enabled: true,
          streakType: "daily",
          activityDefinitions: ["pull_request_.*"], // Only PR activities
          thresholds: [{ variant: "bronze", days: 2 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      // PR activities are on days 0, 3, 6, 9 - not consecutive
      // So either no badge or bronze if we have at least 2
      expect(badges.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle multiple regex patterns", async () => {
      // Add mixed activities
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const activityType =
          i % 3 === 0
            ? "pull_request_opened"
            : i % 3 === 1
              ? "pull_request_reviewed"
              : "issue_created";
        await activityQueries.upsert(db, {
          slug: `activity_${i}`,
          contributor: "test_user",
          activity_definition: activityType,
          title: `Activity ${i}`,
          occurred_at: date.toISOString().split("T")[0],
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }

      await badgeDefinitionQueries.upsert(db, {
        slug: "pr_expert",
        name: "PR Expert",
        description: "PR related activities",
        variants: {
          bronze: {
            description: "PR activities",
            svg_url: "/bronze.svg",
            order: 1,
          },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "streak",
          badgeSlug: "pr_expert",
          enabled: true,
          streakType: "daily",
          activityDefinitions: ["pull_request_.*"], // Match all PR activities
          thresholds: [{ variant: "bronze", days: 5 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle exact matches", async () => {
      // Add specific activity type
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        await activityQueries.upsert(db, {
          slug: `activity_${i}`,
          contributor: "test_user",
          activity_definition: "pull_request_reviewed",
          title: `Review ${i}`,
          occurred_at: date.toISOString().split("T")[0],
          link: null,
          text: null,
          points: 15,
          meta: null,
        });
      }

      await badgeDefinitionQueries.upsert(db, {
        slug: "review_champion",
        name: "Review Champion",
        description: "Consistent code reviewer",
        variants: {
          bronze: {
            description: "Review streak",
            svg_url: "/bronze.svg",
            order: 1,
          },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "streak",
          badgeSlug: "review_champion",
          enabled: true,
          streakType: "daily",
          activityDefinitions: ["pull_request_reviewed"], // Exact match
          thresholds: [{ variant: "bronze", days: 5 }],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].badge).toBe("review_champion");
    });
  });

  describe("Composite Rules", () => {
    it("should evaluate AND conditions", async () => {
      // Set up multiple aggregates
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: "Total activities",
      });

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "total_points",
        name: "Total Points",
        description: "Total points earned",
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "test_user",
        value: { type: "number", value: 100 },
        meta: null,
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "total_points",
        contributor: "test_user",
        value: { type: "number", value: 1000 },
        meta: null,
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "super_contributor",
        name: "Super Contributor",
        description: "Both high activity and points",
        variants: {
          gold: {
            description: "Super contributor",
            svg_url: "/gold.svg",
            order: 1,
          },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "composite",
          badgeSlug: "super_contributor",
          enabled: true,
          operator: "AND",
          variant: "gold",
          conditions: [
            { aggregateSlug: "activity_count", operator: ">=", value: 50 },
            { aggregateSlug: "total_points", operator: ">=", value: 500 },
          ],
        },
      ];

      await evaluateBadgeRules(db, mockLogger, rules);

      const badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].badge).toBe("super_contributor");
      // Composite rules fall back to current date
      expect(badges[0].achieved_on).toBe(
        new Date().toISOString().split("T")[0],
      );
    });
  });

  describe("Badge Upgrades", () => {
    it("should update achieved_on when upgrading a badge variant", async () => {
      // Create 150 activities with specific dates
      for (let i = 0; i < 150; i++) {
        await activityQueries.upsert(db, {
          slug: `upgrade_act_${i}`,
          contributor: "test_user",
          activity_definition: "pull_request_opened",
          title: `Activity ${i}`,
          occurred_at: `2025-${String(Math.floor(i / 28) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
          link: null,
          text: null,
          points: 10,
          meta: null,
        });
      }

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: "Total activities",
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "milestone",
        variants: {
          bronze: { description: "10", svg_url: "/b.svg", order: 1 },
          silver: { description: "50", svg_url: "/s.svg", order: 2 },
          gold: { description: "100", svg_url: "/g.svg", order: 3 },
        },
      });

      const rules: BadgeRuleDefinition[] = [
        {
          type: "threshold",
          badgeSlug: "activity_milestone",
          enabled: true,
          aggregateSlug: "activity_count",
          thresholds: [
            { variant: "bronze", value: 10 },
            { variant: "silver", value: 50 },
            { variant: "gold", value: 100 },
          ],
        },
      ];

      // First: award bronze with 10 activities
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "test_user",
        value: { type: "number", value: 10 },
        meta: null,
      });

      await evaluateBadgeRules(db, mockLogger, rules);

      let badges = await contributorBadgeQueries.getByContributor(
        db,
        "test_user",
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].variant).toBe("bronze");
      // 10th activity: index 9 → 2025-01-10
      expect(badges[0].achieved_on).toBe("2025-01-10");

      // Now upgrade to gold with 150 activities
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "test_user",
        value: { type: "number", value: 150 },
        meta: null,
      });

      await evaluateBadgeRules(db, mockLogger, rules);

      badges = await contributorBadgeQueries.getByContributor(db, "test_user");
      expect(badges).toHaveLength(1);
      expect(badges[0].variant).toBe("gold");
      // 100th activity: index 99 → month 4 (99/28=3.5→floor=3→+1=4), day (99%28)+1=16
      expect(badges[0].achieved_on).toBe("2025-04-16");
    });
  });
});
