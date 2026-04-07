/**
 * Plugin runner phase function tests
 */

import {
  createDatabase,
  initializeSchema,
  type Database,
} from "@ohcnetwork/leaderboard-api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../config";
import { createLogger } from "../logger";
import {
  aggregatePlugins,
  loadAllPlugins,
  scrapePlugins,
  setupPlugins,
  type LoadedPlugin,
} from "../runner";

const logger = createLogger(false);

function makeConfig(plugins: Config["leaderboard"]["plugins"] = {}): Config {
  return {
    org: {
      name: "Test Org",
      description: "A test org",
      url: "https://example.com",
    },
    leaderboard: {
      plugins,
    },
  } as Config;
}

function makeLoadedPlugin(overrides?: Partial<LoadedPlugin>): LoadedPlugin {
  return {
    id: "test-plugin",
    plugin: {
      name: "test-plugin",
      version: "1.0.0",
      scrape: vi.fn(async () => {}),
    },
    config: {},
    ...overrides,
  };
}

describe("loadAllPlugins", () => {
  it("should return empty array when no plugins configured", async () => {
    const config = makeConfig({});
    const result = await loadAllPlugins(config, logger);
    expect(result).toEqual([]);
  });

  it("should return empty array when plugins is undefined", async () => {
    const config = makeConfig(undefined);
    const result = await loadAllPlugins(config, logger);
    expect(result).toEqual([]);
  });
});

describe("setupPlugins", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it("should call setup on plugins that have it", async () => {
    const setupFn = vi.fn(async () => {});
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "with-setup",
          version: "1.0.0",
          setup: setupFn,
          scrape: vi.fn(async () => {}),
        },
      }),
    ];
    const config = makeConfig();

    await setupPlugins(loaded, config, db, logger);

    expect(setupFn).toHaveBeenCalledOnce();
    expect(setupFn).toHaveBeenCalledWith(
      expect.objectContaining({ db, logger }),
    );
  });

  it("should skip plugins without setup method", async () => {
    const scrapeFn = vi.fn(async () => {});
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "no-setup",
          version: "1.0.0",
          scrape: scrapeFn,
        },
      }),
    ];
    const config = makeConfig();

    await setupPlugins(loaded, config, db, logger);

    expect(scrapeFn).not.toHaveBeenCalled();
  });

  it("should pass plugin config in context", async () => {
    const setupFn = vi.fn(async () => {});
    const pluginConfig = { apiToken: "test-token", org: "test-org" };
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "with-config",
          version: "1.0.0",
          setup: setupFn,
          scrape: vi.fn(async () => {}),
        },
        config: pluginConfig,
      }),
    ];
    const config = makeConfig();

    await setupPlugins(loaded, config, db, logger);

    expect(setupFn).toHaveBeenCalledWith(
      expect.objectContaining({ config: pluginConfig }),
    );
  });

  it("should throw when setup fails", async () => {
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "failing-setup",
          version: "1.0.0",
          setup: vi.fn(async () => {
            throw new Error("Setup failed");
          }),
          scrape: vi.fn(async () => {}),
        },
      }),
    ];
    const config = makeConfig();

    await expect(setupPlugins(loaded, config, db, logger)).rejects.toThrow(
      "Setup failed",
    );
  });
});

describe("scrapePlugins", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it("should call scrape on all plugins", async () => {
    const scrape1 = vi.fn(async () => {});
    const scrape2 = vi.fn(async () => {});
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        id: "plugin-1",
        plugin: { name: "plugin-1", version: "1.0.0", scrape: scrape1 },
      }),
      makeLoadedPlugin({
        id: "plugin-2",
        plugin: { name: "plugin-2", version: "1.0.0", scrape: scrape2 },
      }),
    ];
    const config = makeConfig();

    await scrapePlugins(loaded, config, db, logger);

    expect(scrape1).toHaveBeenCalledOnce();
    expect(scrape2).toHaveBeenCalledOnce();
  });

  it("should pass db and config in context", async () => {
    const scrapeFn = vi.fn(async () => {});
    const pluginConfig = { repo: "test-repo" };
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: { name: "test", version: "1.0.0", scrape: scrapeFn },
        config: pluginConfig,
      }),
    ];
    const config = makeConfig();

    await scrapePlugins(loaded, config, db, logger);

    expect(scrapeFn).toHaveBeenCalledWith(
      expect.objectContaining({ db, config: pluginConfig, logger }),
    );
  });

  it("should throw when scrape fails", async () => {
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "failing",
          version: "1.0.0",
          scrape: vi.fn(async () => {
            throw new Error("Scrape failed");
          }),
        },
      }),
    ];
    const config = makeConfig();

    await expect(scrapePlugins(loaded, config, db, logger)).rejects.toThrow(
      "Scrape failed",
    );
  });
});

describe("aggregatePlugins", () => {
  let db: Database;

  beforeEach(async () => {
    db = createDatabase(":memory:");
    await initializeSchema(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it("should call aggregate on plugins that have it", async () => {
    const aggregateFn = vi.fn(async () => {});
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "with-aggregate",
          version: "1.0.0",
          scrape: vi.fn(async () => {}),
          aggregate: aggregateFn,
        },
      }),
    ];
    const config = makeConfig();

    await aggregatePlugins(loaded, config, db, logger);

    expect(aggregateFn).toHaveBeenCalledOnce();
    expect(aggregateFn).toHaveBeenCalledWith(
      expect.objectContaining({ db, logger }),
    );
  });

  it("should skip plugins without aggregate method", async () => {
    const scrapeFn = vi.fn(async () => {});
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "no-aggregate",
          version: "1.0.0",
          scrape: scrapeFn,
        },
      }),
    ];
    const config = makeConfig();

    await aggregatePlugins(loaded, config, db, logger);

    expect(scrapeFn).not.toHaveBeenCalled();
  });

  it("should run aggregate for multiple plugins in order", async () => {
    const callOrder: string[] = [];
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        id: "first",
        plugin: {
          name: "first",
          version: "1.0.0",
          scrape: vi.fn(async () => {}),
          aggregate: vi.fn(async () => {
            callOrder.push("first");
          }),
        },
      }),
      makeLoadedPlugin({
        id: "second",
        plugin: {
          name: "second",
          version: "1.0.0",
          scrape: vi.fn(async () => {}),
          aggregate: vi.fn(async () => {
            callOrder.push("second");
          }),
        },
      }),
    ];
    const config = makeConfig();

    await aggregatePlugins(loaded, config, db, logger);

    expect(callOrder).toEqual(["first", "second"]);
  });

  it("should throw when aggregate fails", async () => {
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        plugin: {
          name: "failing",
          version: "1.0.0",
          scrape: vi.fn(async () => {}),
          aggregate: vi.fn(async () => {
            throw new Error("Aggregate failed");
          }),
        },
      }),
    ];
    const config = makeConfig();

    await expect(aggregatePlugins(loaded, config, db, logger)).rejects.toThrow(
      "Aggregate failed",
    );
  });

  it("should handle mix of plugins with and without aggregate", async () => {
    const aggregateFn = vi.fn(async () => {});
    const loaded: LoadedPlugin[] = [
      makeLoadedPlugin({
        id: "no-aggregate",
        plugin: {
          name: "no-aggregate",
          version: "1.0.0",
          scrape: vi.fn(async () => {}),
        },
      }),
      makeLoadedPlugin({
        id: "with-aggregate",
        plugin: {
          name: "with-aggregate",
          version: "1.0.0",
          scrape: vi.fn(async () => {}),
          aggregate: aggregateFn,
        },
      }),
    ];
    const config = makeConfig();

    await aggregatePlugins(loaded, config, db, logger);

    expect(aggregateFn).toHaveBeenCalledOnce();
  });
});
