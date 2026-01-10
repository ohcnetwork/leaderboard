/**
 * Badge importer tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import { initializeSchema } from "@ohcnetwork/leaderboard-api";
import {
  badgeDefinitionQueries,
  contributorBadgeQueries,
  contributorQueries,
} from "@ohcnetwork/leaderboard-api";
import {
  importBadgeDefinitions,
  importContributorBadges,
  importBadges,
} from "../../importers/badges";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-import-badges";
const logger = createLogger(false);

describe("Badge Importers", () => {
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

  describe("importBadgeDefinitions", () => {
    it("should import badge definitions from JSON", async () => {
      const definitions = [
        {
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
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "badges"), { recursive: true });
      await writeFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        JSON.stringify(definitions),
        "utf-8"
      );

      await importBadgeDefinitions(db, TEST_DATA_DIR, logger);

      const imported = await badgeDefinitionQueries.getAll(db);
      expect(imported).toHaveLength(1);
      expect(imported[0].slug).toBe("activity_milestone");
      expect(imported[0].variants.bronze).toBeDefined();
    });

    it("should import multiple badge definitions", async () => {
      const definitions = [
        {
          slug: "badge1",
          name: "Badge 1",
          description: "Test badge",
          variants: { bronze: { description: "Level 1", svg_url: "url1" } },
        },
        {
          slug: "badge2",
          name: "Badge 2",
          description: "Test badge",
          variants: { silver: { description: "Level 2", svg_url: "url2" } },
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "badges"), { recursive: true });
      await writeFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        JSON.stringify(definitions),
        "utf-8"
      );

      await importBadgeDefinitions(db, TEST_DATA_DIR, logger);

      const imported = await badgeDefinitionQueries.getAll(db);
      expect(imported).toHaveLength(2);
    });

    it("should handle missing definitions file", async () => {
      await importBadgeDefinitions(db, TEST_DATA_DIR, logger);

      const imported = await badgeDefinitionQueries.getAll(db);
      expect(imported).toHaveLength(0);
    });
  });

  describe("importContributorBadges", () => {
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

      await badgeDefinitionQueries.upsert(db, {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "Test badge",
        variants: {
          bronze: { description: "10+", svg_url: "url" },
          silver: { description: "50+", svg_url: "url" },
        },
      });

      await badgeDefinitionQueries.upsert(db, {
        slug: "streak_badge",
        name: "Streak Badge",
        description: "Test badge",
        variants: { bronze: { description: "7 days", svg_url: "url" } },
      });
    });

    it("should import contributor badges from JSONL files", async () => {
      const badges = [
        {
          slug: "activity_milestone__alice__bronze",
          badge: "activity_milestone",
          contributor: "alice",
          variant: "bronze",
          achieved_on: "2025-01-05",
          meta: { auto_awarded: true },
        },
        {
          slug: "streak_badge__alice__bronze",
          badge: "streak_badge",
          contributor: "alice",
          variant: "bronze",
          achieved_on: "2025-01-04",
          meta: null,
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "badges", "contributors"), {
        recursive: true,
      });
      await writeFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        badges.map((b) => JSON.stringify(b)).join("\n") + "\n",
        "utf-8"
      );

      await importContributorBadges(db, TEST_DATA_DIR, logger);

      const imported = await contributorBadgeQueries.getByContributor(
        db,
        "alice"
      );
      expect(imported).toHaveLength(2);
    });

    it("should handle multiple contributor files", async () => {
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

      await mkdir(join(TEST_DATA_DIR, "badges", "contributors"), {
        recursive: true,
      });

      await writeFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        JSON.stringify({
          slug: "activity_milestone__alice__bronze",
          badge: "activity_milestone",
          contributor: "alice",
          variant: "bronze",
          achieved_on: "2025-01-05",
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await writeFile(
        join(TEST_DATA_DIR, "badges", "contributors", "bob.jsonl"),
        JSON.stringify({
          slug: "activity_milestone__bob__silver",
          badge: "activity_milestone",
          contributor: "bob",
          variant: "silver",
          achieved_on: "2025-01-05",
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await importContributorBadges(db, TEST_DATA_DIR, logger);

      const aliceBadges = await contributorBadgeQueries.getByContributor(
        db,
        "alice"
      );
      const bobBadges = await contributorBadgeQueries.getByContributor(
        db,
        "bob"
      );

      expect(aliceBadges).toHaveLength(1);
      expect(bobBadges).toHaveLength(1);
    });

    it("should preserve badge metadata", async () => {
      await mkdir(join(TEST_DATA_DIR, "badges", "contributors"), {
        recursive: true,
      });
      await writeFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        JSON.stringify({
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
        }) + "\n",
        "utf-8"
      );

      await importContributorBadges(db, TEST_DATA_DIR, logger);

      const badge = await contributorBadgeQueries.getByContributorAndBadge(
        db,
        "alice",
        "activity_milestone"
      );

      expect(badge?.meta).toBeDefined();
      expect(badge?.meta?.auto_awarded).toBe(true);
      expect(badge?.meta?.threshold).toBe(10);
    });

    it("should handle missing contributors directory", async () => {
      await importContributorBadges(db, TEST_DATA_DIR, logger);

      const badges = await contributorBadgeQueries.getAll(db);
      expect(badges).toHaveLength(0);
    });
  });

  describe("importBadges", () => {
    it("should import all badge data", async () => {
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

      await mkdir(join(TEST_DATA_DIR, "badges", "contributors"), {
        recursive: true,
      });

      // Badge definitions
      await writeFile(
        join(TEST_DATA_DIR, "badges", "definitions.json"),
        JSON.stringify([
          {
            slug: "activity_milestone",
            name: "Activity Milestone",
            description: "Test badge",
            variants: { bronze: { description: "10+", svg_url: "url" } },
          },
        ]),
        "utf-8"
      );

      // Contributor badges
      await writeFile(
        join(TEST_DATA_DIR, "badges", "contributors", "alice.jsonl"),
        JSON.stringify({
          slug: "activity_milestone__alice__bronze",
          badge: "activity_milestone",
          contributor: "alice",
          variant: "bronze",
          achieved_on: "2025-01-05",
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await importBadges(db, TEST_DATA_DIR, logger);

      const definitions = await badgeDefinitionQueries.getAll(db);
      const contributorBadges = await contributorBadgeQueries.getAll(db);

      expect(definitions).toHaveLength(1);
      expect(contributorBadges).toHaveLength(1);
    });
  });
});
