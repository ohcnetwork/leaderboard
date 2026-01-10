/**
 * Badge exporter tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, mkdir, rm, readdir } from "fs/promises";
import { join } from "path";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import { initializeSchema } from "@ohcnetwork/leaderboard-api";
import {
  badgeDefinitionQueries,
  contributorBadgeQueries,
  contributorQueries,
} from "@ohcnetwork/leaderboard-api";
import {
  exportBadgeDefinitions,
  exportContributorBadges,
  exportBadges,
} from "../../exporters/badges";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-export-badges";
const logger = createLogger(false);

describe("Badge Exporters", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
    await mkdir(TEST_DATA_DIR, { recursive: true });
  });

  afterEach(async () => {
    await db.close();
    await rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  describe("exportBadgeDefinitions", () => {
    it("should export badge definitions to JSON", async () => {
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
          gold: {
            description: "100+ activities",
            svg_url: "https://example.com/gold.svg",
          },
        },
      });

      await exportBadgeDefinitions(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        "utf-8"
      );
      const definitions = JSON.parse(content);

      expect(definitions).toHaveLength(1);
      expect(definitions[0].slug).toBe("activity_milestone");
      expect(definitions[0].variants.bronze).toBeDefined();
      expect(definitions[0].variants.silver).toBeDefined();
      expect(definitions[0].variants.gold).toBeDefined();
    });

    it("should export multiple badge definitions", async () => {
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

      await exportBadgeDefinitions(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        "utf-8"
      );
      const definitions = JSON.parse(content);

      expect(definitions).toHaveLength(2);
    });

    it("should handle empty badge definitions", async () => {
      await exportBadgeDefinitions(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        "utf-8"
      );
      const definitions = JSON.parse(content);

      expect(definitions).toHaveLength(0);
    });
  });

  describe("exportContributorBadges", () => {
    beforeEach(async () => {
      // Setup contributors and badge definitions
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

      await badgeDefinitionQueries.upsert(db, {
        slug: "streak_badge",
        name: "Streak Badge",
        description: "Test badge",
        variants: { bronze: { description: "7 days", svg_url: "url" } },
      });
    });

    it("should export contributor badges to JSONL files", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: { auto_awarded: true },
      });

      await contributorBadgeQueries.award(db, {
        slug: "streak_badge__alice__bronze",
        badge: "streak_badge",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-04",
        meta: null,
      });

      await exportContributorBadges(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        "utf-8"
      );
      const lines = content.trim().split("\n");

      expect(lines).toHaveLength(2);

      const badge1 = JSON.parse(lines[0]);
      expect(badge1.contributor).toBe("alice");
      expect(badge1.badge).toBeDefined();
      expect(badge1.variant).toBeDefined();
    });

    it("should create separate files for each contributor", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: null,
      });

      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__bob__silver",
        badge: "activity_milestone",
        contributor: "bob",
        variant: "silver",
        achieved_on: "2025-01-05",
        meta: null,
      });

      await exportContributorBadges(db, TEST_DATA_DIR, logger);

      const files = await readdir(
        join(TEST_DATA_DIR, "badges", "contributors")
      );
      expect(files).toContain("alice.jsonl");
      expect(files).toContain("bob.jsonl");
    });

    it("should preserve badge metadata", async () => {
      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: {
          auto_awarded: true,
          threshold: 10,
          actualValue: 42,
        },
      });

      await exportContributorBadges(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        "utf-8"
      );
      const badge = JSON.parse(content.trim());

      expect(badge.meta).toBeDefined();
      expect(badge.meta.auto_awarded).toBe(true);
      expect(badge.meta.threshold).toBe(10);
    });

    it("should handle contributors with no badges", async () => {
      await exportContributorBadges(db, TEST_DATA_DIR, logger);

      const files = await readdir(
        join(TEST_DATA_DIR, "badges", "contributors")
      );
      expect(files).toHaveLength(0);
    });
  });

  describe("exportBadges", () => {
    it("should export all badge data", async () => {
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
        variants: { bronze: { description: "10+", svg_url: "url" } },
      });

      await contributorBadgeQueries.award(db, {
        slug: "activity_milestone__alice__bronze",
        badge: "activity_milestone",
        contributor: "alice",
        variant: "bronze",
        achieved_on: "2025-01-05",
        meta: null,
      });

      await exportBadges(db, TEST_DATA_DIR, logger);

      // Verify all files were created
      const definitionsContent = await readFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        "utf-8"
      );
      const contributorContent = await readFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        "utf-8"
      );

      expect(JSON.parse(definitionsContent)).toHaveLength(1);
      expect(contributorContent.trim()).toBeTruthy();
    });
  });
});
