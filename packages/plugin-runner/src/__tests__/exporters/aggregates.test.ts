/**
 * Aggregate exporter tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, mkdir, rm, readdir } from "fs/promises";
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
  exportGlobalAggregates,
  exportContributorAggregateDefinitions,
  exportContributorAggregates,
  exportAggregates,
} from "../../exporters/aggregates";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-export-aggregates";
const logger = createLogger(false);

describe("Aggregate Exporters", () => {
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

  describe("exportGlobalAggregates", () => {
    it("should export global aggregates to JSON", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "total_contributors",
        name: "Total Contributors",
        description: "Total number of contributors",
        value: { type: "number", value: 42, format: "integer" },
        meta: { calculated_at: "2025-01-05T12:00:00Z" },
      });

      await globalAggregateQueries.upsert(db, {
        slug: "total_activities",
        name: "Total Activities",
        description: null,
        value: { type: "number", value: 100, format: "integer" },
        meta: null,
      });

      await exportGlobalAggregates(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        "utf-8"
      );
      const aggregates = JSON.parse(content);

      expect(aggregates).toHaveLength(2);
      expect(aggregates[0].slug).toBeDefined();
      expect(aggregates[0].value.type).toBe("number");
    });

    it("should handle empty global aggregates", async () => {
      await exportGlobalAggregates(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        "utf-8"
      );
      const aggregates = JSON.parse(content);

      expect(aggregates).toHaveLength(0);
    });

    it("should preserve aggregate value types", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "stats",
        name: "Statistics",
        description: null,
        value: {
          type: "statistics/number",
          min: 1,
          max: 100,
          mean: 50,
          count: 42,
          highlightMetric: "mean",
        },
        meta: null,
      });

      await exportGlobalAggregates(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        "utf-8"
      );
      const aggregates = JSON.parse(content);

      expect(aggregates[0].value.type).toBe("statistics/number");
      expect(aggregates[0].value.mean).toBe(50);
    });
  });

  describe("exportContributorAggregateDefinitions", () => {
    it("should export aggregate definitions to JSON", async () => {
      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "pr_merged_count",
        name: "PRs Merged",
        description: "Number of pull requests merged",
      });

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "code_review_count",
        name: "Code Reviews",
        description: null,
      });

      await exportContributorAggregateDefinitions(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "aggregates", "definitions.json"),
        "utf-8"
      );
      const definitions = JSON.parse(content);

      expect(definitions).toHaveLength(2);
      expect(definitions[0].slug).toBeDefined();
      expect(definitions[0].name).toBeDefined();
    });
  });

  describe("exportContributorAggregates", () => {
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

    it("should export contributor aggregates to JSONL files", async () => {
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "alice",
        value: { type: "number", value: 42, format: "integer" },
        meta: { calculated_at: "2025-01-05T12:00:00Z" },
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "total_points",
        contributor: "alice",
        value: { type: "number", value: 250, format: "integer" },
        meta: null,
      });

      await exportContributorAggregates(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        "utf-8"
      );
      const lines = content.trim().split("\n");

      expect(lines).toHaveLength(2);

      const aggregate1 = JSON.parse(lines[0]);
      expect(aggregate1.contributor).toBe("alice");
      expect(aggregate1.value.type).toBe("number");
    });

    it("should create separate files for each contributor", async () => {
      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "alice",
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "bob",
        value: { type: "number", value: 30, format: "integer" },
        meta: null,
      });

      await exportContributorAggregates(db, TEST_DATA_DIR, logger);

      const files = await readdir(
        join(TEST_DATA_DIR, "aggregates", "contributors")
      );
      expect(files).toContain("alice.jsonl");
      expect(files).toContain("bob.jsonl");
    });

    it("should handle aggregates with units", async () => {
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

      await exportContributorAggregates(db, TEST_DATA_DIR, logger);

      const content = await readFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        "utf-8"
      );
      const aggregate = JSON.parse(content.trim());

      expect(aggregate.value.unit).toBe("ms");
      expect(aggregate.value.format).toBe("duration");
    });
  });

  describe("exportAggregates", () => {
    it("should export all aggregate data", async () => {
      await globalAggregateQueries.upsert(db, {
        slug: "total_contributors",
        name: "Total Contributors",
        description: null,
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      await contributorAggregateDefinitionQueries.upsert(db, {
        slug: "activity_count",
        name: "Activity Count",
        description: null,
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

      await contributorAggregateQueries.upsert(db, {
        aggregate: "activity_count",
        contributor: "alice",
        value: { type: "number", value: 42, format: "integer" },
        meta: null,
      });

      await exportAggregates(db, TEST_DATA_DIR, logger);

      // Verify all files were created
      const globalContent = await readFile(
        join(TEST_DATA_DIR, "aggregates", "global.json"),
        "utf-8"
      );
      const definitionsContent = await readFile(
        join(TEST_DATA_DIR, "aggregates", "definitions.json"),
        "utf-8"
      );
      const contributorContent = await readFile(
        join(TEST_DATA_DIR, "aggregates", "contributors", "alice.jsonl"),
        "utf-8"
      );

      expect(JSON.parse(globalContent)).toHaveLength(1);
      expect(JSON.parse(definitionsContent)).toHaveLength(1);
      expect(contributorContent.trim()).toBeTruthy();
    });
  });
});
