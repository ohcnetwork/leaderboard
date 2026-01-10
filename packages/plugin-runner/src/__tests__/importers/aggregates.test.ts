/**
 * Aggregate importer tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import { initializeSchema } from "@ohcnetwork/leaderboard-api";
import {
  globalAggregateQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
  contributorQueries,
} from "@ohcnetwork/leaderboard-api";
import {
  importGlobalAggregates,
  importContributorAggregateDefinitions,
  importContributorAggregates,
  importAggregates,
} from "../../importers/aggregates";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-import-aggregates";
const logger = createLogger(false);

describe("Aggregate Importers", () => {
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

  describe("importGlobalAggregates", () => {
    it("should import global aggregates from JSON", async () => {
      const aggregates = [
        {
          slug: "total_contributors",
          name: "Total Contributors",
          description: "Total number of contributors",
          value: { type: "number", value: 42, format: "integer" },
          meta: { calculated_at: "2025-01-05T12:00:00Z" },
        },
        {
          slug: "total_activities",
          name: "Total Activities",
          description: null,
          value: { type: "number", value: 100, format: "integer" },
          meta: null,
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "aggregates"), { recursive: true });
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        JSON.stringify(aggregates),
        "utf-8"
      );

      await importGlobalAggregates(db, TEST_DATA_DIR, logger);

      const imported = await globalAggregateQueries.getAll(db);
      expect(imported).toHaveLength(2);
      const slugs = imported.map((a) => a.slug).sort();
      expect(slugs).toContain("total_contributors");
      expect(slugs).toContain("total_activities");
    });

    it("should handle missing global aggregates file", async () => {
      await importGlobalAggregates(db, TEST_DATA_DIR, logger);

      const imported = await globalAggregateQueries.getAll(db);
      expect(imported).toHaveLength(0);
    });

    it("should handle different aggregate value types", async () => {
      const aggregates = [
        {
          slug: "status",
          name: "Status",
          description: null,
          value: { type: "string", value: "Active" },
          meta: null,
        },
        {
          slug: "stats",
          name: "Statistics",
          description: null,
          value: {
            type: "statistics/number",
            min: 1,
            max: 100,
            mean: 50,
            highlightMetric: "mean",
          },
          meta: null,
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "aggregates"), { recursive: true });
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        JSON.stringify(aggregates),
        "utf-8"
      );

      await importGlobalAggregates(db, TEST_DATA_DIR, logger);

      const stringAgg = await globalAggregateQueries.getBySlug(db, "status");
      const statsAgg = await globalAggregateQueries.getBySlug(db, "stats");

      expect(stringAgg?.value.type).toBe("string");
      expect(statsAgg?.value.type).toBe("statistics/number");
    });
  });

  describe("importContributorAggregateDefinitions", () => {
    it("should import aggregate definitions from JSON", async () => {
      const definitions = [
        {
          slug: "pr_merged_count",
          name: "PRs Merged",
          description: "Number of pull requests merged",
        },
        {
          slug: "code_review_count",
          name: "Code Reviews",
          description: null,
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "aggregates"), { recursive: true });
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "definitions.json"),
        JSON.stringify(definitions),
        "utf-8"
      );

      await importContributorAggregateDefinitions(db, TEST_DATA_DIR, logger);

      const imported = await contributorAggregateDefinitionQueries.getAll(db);
      expect(imported).toHaveLength(2);
      const slugs = imported.map((d) => d.slug).sort();
      expect(slugs).toContain("pr_merged_count");
      expect(slugs).toContain("code_review_count");
    });

    it("should handle missing definitions file", async () => {
      await importContributorAggregateDefinitions(db, TEST_DATA_DIR, logger);

      const imported = await contributorAggregateDefinitionQueries.getAll(db);
      expect(imported).toHaveLength(0);
    });
  });

  describe("importContributorAggregates", () => {
    beforeEach(async () => {
      // Setup contributors and definitions
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

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "total_points",
        name: "Total Points",
        description: null,
      });
    });

    it("should import contributor aggregates from JSONL files", async () => {
      const aggregates = [
        {
          aggregate: "activity_count",
          contributor: "alice",
          value: { type: "number", value: 42, format: "integer" },
          meta: { calculated_at: "2025-01-05T12:00:00Z" },
        },
        {
          aggregate: "total_points",
          contributor: "alice",
          value: { type: "number", value: 250, format: "integer" },
          meta: null,
        },
      ];

      await mkdir(join(TEST_DATA_DIR, "aggregates", "contributors"), {
        recursive: true,
      });
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        aggregates.map((a) => JSON.stringify(a)).join("\n") + "\n",
        "utf-8"
      );

      await importContributorAggregates(db, TEST_DATA_DIR, logger);

      const imported = await contributorAggregateQueries.getByContributor(
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

      await mkdir(join(TEST_DATA_DIR, "aggregates", "contributors"), {
        recursive: true,
      });

      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        JSON.stringify({
          aggregate: "activity_count",
          contributor: "alice",
          value: { type: "number", value: 42, format: "integer" },
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "bob.jsonl"),
        JSON.stringify({
          aggregate: "activity_count",
          contributor: "bob",
          value: { type: "number", value: 30, format: "integer" },
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await importContributorAggregates(db, TEST_DATA_DIR, logger);

      const aliceAggs = await contributorAggregateQueries.getByContributor(
        db,
        "alice"
      );
      const bobAggs = await contributorAggregateQueries.getByContributor(
        db,
        "bob"
      );

      expect(aliceAggs).toHaveLength(1);
      expect(bobAggs).toHaveLength(1);
    });

    it("should handle aggregates with units", async () => {
      await mkdir(join(TEST_DATA_DIR, "aggregates", "contributors"), {
        recursive: true,
      });
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        JSON.stringify({
          aggregate: "activity_count",
          contributor: "alice",
          value: {
            type: "number",
            value: 7200000,
            unit: "ms",
            format: "duration",
          },
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await importContributorAggregates(db, TEST_DATA_DIR, logger);

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

    it("should handle missing contributors directory", async () => {
      await importContributorAggregates(db, TEST_DATA_DIR, logger);

      const aggregates = await contributorAggregateQueries.getAll(db);
      expect(aggregates).toHaveLength(0);
    });
  });

  describe("importAggregates", () => {
    it("should import all aggregate data", async () => {
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

      await mkdir(join(TEST_DATA_DIR, "aggregates", "contributors"), {
        recursive: true,
      });

      // Global aggregates
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        JSON.stringify([
          {
            slug: "total_contributors",
            name: "Total Contributors",
            description: null,
            value: { type: "number", value: 1, format: "integer" },
            meta: null,
          },
        ]),
        "utf-8"
      );

      // Definitions
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "definitions.json"),
        JSON.stringify([
          {
            slug: "activity_count",
            name: "Activity Count",
            description: null,
          },
        ]),
        "utf-8"
      );

      // Contributor aggregates
      await writeFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        JSON.stringify({
          aggregate: "activity_count",
          contributor: "alice",
          value: { type: "number", value: 42, format: "integer" },
          meta: null,
        }) + "\n",
        "utf-8"
      );

      await importAggregates(db, TEST_DATA_DIR, logger);

      const globalAggs = await globalAggregateQueries.getAll(db);
      const definitions = await contributorAggregateDefinitionQueries.getAll(
        db
      );
      const contributorAggs = await contributorAggregateQueries.getAll(db);

      expect(globalAggs).toHaveLength(1);
      expect(definitions).toHaveLength(1);
      expect(contributorAggs).toHaveLength(1);
    });
  });
});
