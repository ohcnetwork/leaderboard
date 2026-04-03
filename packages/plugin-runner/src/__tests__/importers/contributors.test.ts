/**
 * Contributor importer tests
 */

import type { Database } from "@ohcnetwork/leaderboard-api";
import {
  contributorQueries,
  createDatabase,
  initializeSchema,
} from "@ohcnetwork/leaderboard-api";
import { mkdir, rm, writeFile } from "fs/promises";
import matter from "gray-matter";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importContributors } from "../../importers/contributors";
import { createLogger } from "../../logger";

const TEST_DATA_DIR = "./test-data-contributors";
const logger = createLogger(false);

describe("Contributor Importer", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
    await mkdir(join(TEST_DATA_DIR, "contributors"), { recursive: true });
  });

  afterEach(async () => {
    await db.close();
    await rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  it("should import contributors from markdown files", async () => {
    const contributor = matter.stringify("Alice is a software engineer.", {
      username: "alice",
      name: "Alice Smith",
      role: "core",
      title: "Engineer",
      avatar_url: "https://example.com/alice.png",
      social_profiles: {
        github: "https://github.com/alice",
      },
      joining_date: "2020-01-01",
    });

    await writeFile(
      join(TEST_DATA_DIR, "contributors", "alice.md"),
      contributor,
      "utf-8",
    );

    const count = await importContributors(db, TEST_DATA_DIR, logger);
    expect(count).toBe(1);

    const imported = await contributorQueries.getByUsername(db, "alice");
    expect(imported).not.toBeNull();
    expect(imported?.name).toBe("Alice Smith");
    expect(imported?.bio).toBe("Alice is a software engineer.");
  });

  it("should handle multiple contributor files", async () => {
    const alice = matter.stringify("Alice's bio", {
      username: "alice",
      name: "Alice",
      role: "core",
    });

    const bob = matter.stringify("Bob's bio", {
      username: "bob",
      name: "Bob",
      role: "intern",
    });

    await writeFile(
      join(TEST_DATA_DIR, "contributors", "alice.md"),
      alice,
      "utf-8",
    );
    await writeFile(
      join(TEST_DATA_DIR, "contributors", "bob.md"),
      bob,
      "utf-8",
    );

    const count = await importContributors(db, TEST_DATA_DIR, logger);
    expect(count).toBe(2);

    const allContributors = await contributorQueries.getAll(db);
    expect(allContributors).toHaveLength(2);
  });

  it("should handle missing contributors directory", async () => {
    const emptyDir = join(tmpdir(), `test-data-empty-${Date.now()}`);
    await mkdir(emptyDir, { recursive: true });

    const count = await importContributors(db, emptyDir, logger);
    expect(count).toBe(0);

    await rm(emptyDir, { recursive: true, force: true });
  });
});
