/**
 * Contributor exporter tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import { initializeSchema } from "@ohcnetwork/leaderboard-api";
import { contributorQueries } from "@ohcnetwork/leaderboard-api";
import { exportContributors } from "../../exporters/contributors";
import { createLogger } from "../../logger";
import type { Database } from "@ohcnetwork/leaderboard-api";

const TEST_DATA_DIR = "./test-data-export-contributors";
const logger = createLogger(false);

describe("Contributor Exporter", () => {
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

  it("should export contributors to markdown files", async () => {
    await contributorQueries.upsert(db, {
      username: "alice",
      name: "Alice Smith",
      role: "core",
      title: "Engineer",
      avatar_url: "https://example.com/alice.png",
      bio: "Alice is a software engineer.",
      social_profiles: { github: "https://github.com/alice" },
      joining_date: "2020-01-01",
      meta: { team: "backend" },
    });

    const count = await exportContributors(db, TEST_DATA_DIR, logger);
    expect(count).toBe(1);

    const content = await readFile(
      join(TEST_DATA_DIR, "contributors", "alice.md"),
      "utf-8"
    );
    const parsed = matter(content);

    expect(parsed.data.name).toBe("Alice Smith");
    expect(parsed.content.trim()).toBe("Alice is a software engineer.");
  });

  it("should export multiple contributors", async () => {
    await contributorQueries.upsert(db, {
      username: "alice",
      name: "Alice",
      role: "core",
      title: null,
      avatar_url: null,
      bio: "Alice's bio",
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
      bio: "Bob's bio",
      social_profiles: null,
      joining_date: null,
      meta: null,
    });

    const count = await exportContributors(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2);

    // Check both files exist
    const aliceContent = await readFile(
      join(TEST_DATA_DIR, "contributors", "alice.md"),
      "utf-8"
    );
    const bobContent = await readFile(
      join(TEST_DATA_DIR, "contributors", "bob.md"),
      "utf-8"
    );

    expect(aliceContent).toBeTruthy();
    expect(bobContent).toBeTruthy();
  });

  it("should handle contributors with no bio", async () => {
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

    const count = await exportContributors(db, TEST_DATA_DIR, logger);
    expect(count).toBe(1);

    const content = await readFile(
      join(TEST_DATA_DIR, "contributors", "alice.md"),
      "utf-8"
    );
    const parsed = matter(content);

    expect(parsed.content.trim()).toBe("");
  });
});
