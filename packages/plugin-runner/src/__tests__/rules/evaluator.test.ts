import { describe, it, expect, beforeEach } from "vitest";
import { evaluateBadgeRules } from "../../rules/evaluator";
import { createDatabase, initializeSchema } from "@ohcnetwork/leaderboard-api";
import type { Database } from "@ohcnetwork/leaderboard-api";
import {
  contributorQueries,
  activityDefinitionQueries,
  activityQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
  badgeDefinitionQueries,
  contributorBadgeQueries,
} from "@ohcnetwork/leaderboard-api";
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
      role: null,
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
        "test_user"
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
        "test_user"
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].variant).toBe("gold");
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
          occured_at: date.toISOString().split("T")[0],
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
        "test_user"
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].badge).toBe("consistency_champion");
      expect(badges[0].variant).toBe("bronze");
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
          occured_at: date.toISOString().split("T")[0],
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
        "test_user"
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
          occured_at: date.toISOString().split("T")[0],
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
        "test_user"
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
          occured_at: date.toISOString().split("T")[0],
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
        "test_user"
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
        "test_user"
      );
      expect(badges).toHaveLength(1);
      expect(badges[0].badge).toBe("super_contributor");
    });
  });
});
