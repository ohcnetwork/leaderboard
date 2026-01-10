/**
 * Tests for dummy plugin
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { faker } from "@faker-js/faker";
import { createDatabase, initializeSchema } from "@ohcnetwork/leaderboard-api";
import type { Database } from "@ohcnetwork/leaderboard-api";
import { generateContributor, generateContributors } from "../contributors";
import {
  generateActivity,
  generateActivitiesForContributor,
  generateActivities,
  ACTIVITY_TYPES,
} from "../activities";
import { mergeConfig, DEFAULT_CONFIG } from "../config";
import plugin from "../index";

describe("Dummy Plugin", () => {
  describe("Configuration", () => {
    it("should merge configs correctly", () => {
      const config = mergeConfig({
        contributors: {
          count: 20,
        },
      });

      expect(config.contributors.count).toBe(20);
      expect(config.contributors.minActivitiesPerContributor).toBe(
        DEFAULT_CONFIG.contributors.minActivitiesPerContributor
      );
      expect(config.activities.daysBack).toBe(
        DEFAULT_CONFIG.activities.daysBack
      );
    });

    it("should handle empty config", () => {
      const config = mergeConfig();

      expect(config.contributors.count).toBe(DEFAULT_CONFIG.contributors.count);
      expect(config.activities.daysBack).toBe(
        DEFAULT_CONFIG.activities.daysBack
      );
    });

    it("should handle seed configuration", () => {
      const config = mergeConfig({
        activities: {
          seed: 12345,
        },
      });

      expect(config.activities.seed).toBe(12345);
    });
  });

  describe("Contributor Generation", () => {
    it("should generate a single contributor", () => {
      const contributor = generateContributor();

      expect(contributor).toBeDefined();
      expect(contributor.username).toBeTruthy();
      expect(contributor.name).toBeTruthy();
      expect(contributor.avatar_url).toBeTruthy();
      expect(contributor.joining_date).toBeTruthy();
    });

    it("should generate contributors with different roles", () => {
      const contributors = generateContributors(50);
      const roles = new Set(contributors.map((c) => c.role));

      expect(contributors).toHaveLength(50);
      expect(roles.size).toBeGreaterThan(1); // Should have variety
    });

    it("should generate unique usernames", () => {
      const contributors = generateContributors(30);
      const usernames = contributors.map((c) => c.username);
      const uniqueUsernames = new Set(usernames);

      expect(uniqueUsernames.size).toBe(30);
    });

    it("should generate bots with appropriate properties", () => {
      // Generate many contributors to get at least one bot
      const contributors = generateContributors(100);
      const bots = contributors.filter((c) => c.role === "bot");

      if (bots.length > 0) {
        const bot = bots[0];
        expect(bot.bio).toContain("🤖");
        expect(bot.social_profiles).toBeNull();
      }
    });

    it("should generate social profiles for non-bot contributors", () => {
      const contributors = generateContributors(20);
      const nonBots = contributors.filter((c) => c.role !== "bot");

      for (const contributor of nonBots) {
        expect(contributor.social_profiles).toBeDefined();
        expect(contributor.social_profiles?.github).toBeTruthy();
      }
    });
  });

  describe("Activity Generation", () => {
    it("should generate a single activity", () => {
      const activity = generateActivity(
        "testuser",
        "pr_merged",
        "test-org",
        "test-repo",
        new Date()
      );

      expect(activity).toBeDefined();
      expect(activity.contributor).toBe("testuser");
      expect(activity.activity_definition).toBe("pr_merged");
      expect(activity.points).toBe(ACTIVITY_TYPES.pr_merged.points);
      expect(activity.title).toBeTruthy();
      expect(activity.link).toContain("github.com");
    });

    it("should generate activities for a contributor", () => {
      const activities = generateActivitiesForContributor(
        "testuser",
        10,
        30,
        "test-org",
        ["repo1", "repo2"]
      );

      expect(activities).toHaveLength(10);
      expect(activities.every((a) => a.contributor === "testuser")).toBe(true);
    });

    it("should generate activities with valid timestamps", () => {
      const now = new Date();
      const daysBack = 30;
      const activities = generateActivitiesForContributor(
        "testuser",
        20,
        daysBack,
        "test-org",
        ["repo1"]
      );

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysBack);

      for (const activity of activities) {
        const activityDate = new Date(activity.occured_at);
        expect(activityDate.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime()
        );
        expect(activityDate.getTime()).toBeLessThanOrEqual(now.getTime());
      }
    });

    it("should generate activities sorted by date", () => {
      const activities = generateActivitiesForContributor(
        "testuser",
        15,
        60,
        "test-org",
        ["repo1"]
      );

      for (let i = 1; i < activities.length; i++) {
        const prevDate = new Date(activities[i - 1].occured_at);
        const currDate = new Date(activities[i].occured_at);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });

    it("should generate activities for multiple contributors", () => {
      const contributors = ["user1", "user2", "user3"];
      const activitiesMap = generateActivities(
        contributors,
        5,
        10,
        30,
        "test-org",
        ["repo1", "repo2"]
      );

      expect(activitiesMap.size).toBe(3);
      expect(activitiesMap.has("user1")).toBe(true);
      expect(activitiesMap.has("user2")).toBe(true);
      expect(activitiesMap.has("user3")).toBe(true);

      for (const [username, activities] of activitiesMap) {
        expect(activities.length).toBeGreaterThanOrEqual(5);
        expect(activities.length).toBeLessThanOrEqual(10);
      }
    });

    it("should generate all activity types", () => {
      const contributors = ["user1"];
      const activitiesMap = generateActivities(
        contributors,
        100,
        100,
        90,
        "test-org",
        ["repo1"]
      );

      const activities = activitiesMap.get("user1")!;
      const types = new Set(activities.map((a) => a.activity_definition));

      // With 100 activities, we should have good variety
      expect(types.size).toBeGreaterThan(5);
    });

    it("should use reproducible seed", () => {
      // Test that using the same seed produces the same activity type
      faker.seed(12345);
      const type1 = faker.helpers.arrayElement(
        Object.keys(ACTIVITY_TYPES) as Array<keyof typeof ACTIVITY_TYPES>
      );

      faker.seed(12345);
      const type2 = faker.helpers.arrayElement(
        Object.keys(ACTIVITY_TYPES) as Array<keyof typeof ACTIVITY_TYPES>
      );

      expect(type1).toBe(type2);
    });
  });

  describe("Plugin Integration", () => {
    let db: Database;

    beforeEach(async () => {
      db = createDatabase(":memory:");
      await initializeSchema(db);
    });

    afterEach(async () => {
      await db.close();
    });

    it("should have correct plugin metadata", () => {
      expect(plugin.name).toBe("@leaderboard/plugin-dummy");
      expect(plugin.version).toBeTruthy();
      expect(plugin.setup).toBeDefined();
      expect(plugin.scrape).toBeDefined();
    });

    it("should setup activity definitions", async () => {
      const logger = {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
      };

      await plugin.setup!({
        db,
        config: {},
        orgConfig: {
          name: "Test Org",
          description: "Test",
          url: "https://test.com",
          logo_url: "https://test.com/logo.png",
        },
        logger,
      });

      // Check that activity definitions were created
      const result = await db.execute(
        "SELECT COUNT(*) as count FROM activity_definition"
      );
      const count = (result.rows[0] as { count: number }).count;

      expect(count).toBe(Object.keys(ACTIVITY_TYPES).length);
    });

    it("should generate data on scrape", async () => {
      const logger = {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
      };

      // Setup first
      await plugin.setup!({
        db,
        config: {},
        orgConfig: {
          name: "Test Org",
          description: "Test",
          url: "https://test.com",
          logo_url: "https://test.com/logo.png",
        },
        logger,
      });

      // Then scrape
      await plugin.scrape!({
        db,
        config: {
          contributors: {
            count: 10,
            minActivitiesPerContributor: 5,
            maxActivitiesPerContributor: 15,
          },
          activities: {
            daysBack: 30,
            seed: 42,
          },
          organization: {
            name: "test-org",
            repoNames: ["repo1"],
          },
        },
        orgConfig: {
          name: "Test Org",
          description: "Test",
          url: "https://test.com",
          logo_url: "https://test.com/logo.png",
        },
        logger,
      });

      // Check contributors
      const contributorsResult = await db.execute(
        "SELECT COUNT(*) as count FROM contributor"
      );
      const contributorCount = (contributorsResult.rows[0] as { count: number })
        .count;
      expect(contributorCount).toBe(10);

      // Check activities
      const activitiesResult = await db.execute(
        "SELECT COUNT(*) as count FROM activity"
      );
      const activityCount = (activitiesResult.rows[0] as { count: number })
        .count;
      expect(activityCount).toBeGreaterThanOrEqual(50); // 10 * 5 minimum
      expect(activityCount).toBeLessThanOrEqual(150); // 10 * 15 maximum
    });
  });
});
