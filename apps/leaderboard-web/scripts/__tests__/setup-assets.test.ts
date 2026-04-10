/**
 * Setup assets script tests
 */

import { exec } from "child_process";
import { access, mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const execAsync = promisify(exec);

const testDir = path.resolve(__dirname, "../../.test-assets");
const testDataDir = path.join(testDir, "data");
const testAssetsSource = path.join(testDataDir, "assets");
const testPublicDir = path.join(testDir, "public");
const testAssetsDestination = path.join(testPublicDir, "assets");

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe("setup-assets script", () => {
  beforeEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  it("should copy assets from data/assets to public/assets when assets directory exists", async () => {
    // Create test data structure
    await mkdir(testAssetsSource, { recursive: true });
    await mkdir(testPublicDir, { recursive: true });

    // Create test files in assets directory
    await writeFile(path.join(testAssetsSource, "logo.png"), "fake image data");
    await writeFile(
      path.join(testAssetsSource, "banner.jpg"),
      "fake banner data",
    );

    // Create nested directory with file
    await mkdir(path.join(testAssetsSource, "icons"), { recursive: true });
    await writeFile(
      path.join(testAssetsSource, "icons", "favicon.ico"),
      "fake favicon",
    );

    // Run the setup-assets script with test environment
    const scriptPath = path.resolve(__dirname, "../setup-assets.ts");
    await execAsync(`tsx ${scriptPath}`, {
      cwd: testDir,
      env: {
        ...process.env,
        LEADERBOARD_DATA_DIR: testDataDir,
        LEADERBOARD_PUBLIC_DIR: testPublicDir,
      },
    });

    // Verify assets were copied
    expect(await directoryExists(testAssetsDestination)).toBe(true);
    expect(await fileExists(path.join(testAssetsDestination, "logo.png"))).toBe(
      true,
    );
    expect(
      await fileExists(path.join(testAssetsDestination, "banner.jpg")),
    ).toBe(true);
    expect(
      await fileExists(
        path.join(testAssetsDestination, "icons", "favicon.ico"),
      ),
    ).toBe(true);
  });

  it("should not fail when assets directory does not exist", async () => {
    // Create test data directory without assets
    await mkdir(testDataDir, { recursive: true });
    await mkdir(testPublicDir, { recursive: true });

    // Run the setup-assets script
    const scriptPath = path.resolve(__dirname, "../setup-assets.ts");
    const { stdout } = await execAsync(`tsx ${scriptPath}`, {
      cwd: testDir,
      env: {
        ...process.env,
        LEADERBOARD_DATA_DIR: testDataDir,
        LEADERBOARD_PUBLIC_DIR: testPublicDir,
      },
    });

    // Verify script completed without error
    expect(stdout).toContain("No assets directory found");

    // Verify no assets directory was created
    expect(await directoryExists(testAssetsDestination)).toBe(false);
  });

  it("should clean existing assets directory before copying", async () => {
    // Create test data structure
    await mkdir(testAssetsSource, { recursive: true });
    await mkdir(testPublicDir, { recursive: true });

    // Create old assets directory with existing files
    await mkdir(testAssetsDestination, { recursive: true });
    await writeFile(
      path.join(testAssetsDestination, "old-file.txt"),
      "old content",
    );

    // Create new assets in source
    await writeFile(path.join(testAssetsSource, "new-logo.png"), "new image");

    // Run the setup-assets script
    const scriptPath = path.resolve(__dirname, "../setup-assets.ts");
    await execAsync(`tsx ${scriptPath}`, {
      cwd: testDir,
      env: {
        ...process.env,
        LEADERBOARD_DATA_DIR: testDataDir,
        LEADERBOARD_PUBLIC_DIR: testPublicDir,
      },
    });

    // Verify old file was removed and new file was added
    expect(
      await fileExists(path.join(testAssetsDestination, "old-file.txt")),
    ).toBe(false);
    expect(
      await fileExists(path.join(testAssetsDestination, "new-logo.png")),
    ).toBe(true);
  });

  it("should respect LEADERBOARD_DATA_DIR environment variable", async () => {
    const customDataDir = path.join(testDir, "custom-data");
    const customAssetsSource = path.join(customDataDir, "assets");

    // Create test data structure in custom location
    await mkdir(customAssetsSource, { recursive: true });
    await mkdir(testPublicDir, { recursive: true });
    await writeFile(path.join(customAssetsSource, "custom.png"), "custom data");

    // Run the setup-assets script with custom data directory
    const scriptPath = path.resolve(__dirname, "../setup-assets.ts");
    await execAsync(`tsx ${scriptPath}`, {
      cwd: testDir,
      env: {
        ...process.env,
        LEADERBOARD_DATA_DIR: customDataDir,
        LEADERBOARD_PUBLIC_DIR: testPublicDir,
      },
    });

    // Verify assets were copied from custom location
    expect(
      await fileExists(path.join(testAssetsDestination, "custom.png")),
    ).toBe(true);
  });
});
