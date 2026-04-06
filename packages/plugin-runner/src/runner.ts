/**
 * Plugin execution orchestrator
 */

import type {
  Database,
  Logger,
  Plugin,
  PluginContext,
} from "@ohcnetwork/leaderboard-api";
import type { Config } from "./config";
import { loadPlugin } from "./loader";

/**
 * A loaded plugin with its resolved config
 */
export interface LoadedPlugin {
  id: string;
  plugin: Plugin;
  config: Record<string, unknown>;
}

/**
 * Load all plugins from config
 */
export async function loadAllPlugins(
  config: Config,
  logger: Logger,
): Promise<LoadedPlugin[]> {
  const plugins = config.leaderboard.plugins || {};
  const pluginEntries = Object.entries(plugins);

  if (pluginEntries.length === 0) {
    logger.warn("No plugins configured");
    return [];
  }

  logger.info(`Loading ${pluginEntries.length} plugins`);

  const loadedPlugins: LoadedPlugin[] = [];

  for (const [pluginId, pluginConfig] of pluginEntries) {
    try {
      const plugin = await loadPlugin(pluginConfig.source, logger);
      loadedPlugins.push({
        id: pluginId,
        plugin,
        config: (pluginConfig.config || {}) as Record<string, unknown>,
      });
    } catch (error) {
      logger.error(`Failed to load plugin ${pluginId}`, error as Error);
      throw error;
    }
  }

  return loadedPlugins;
}

/**
 * Run setup phase for all plugins
 */
export async function setupPlugins(
  loadedPlugins: LoadedPlugin[],
  config: Config,
  db: Database,
  logger: Logger,
): Promise<void> {
  logger.info("Running setup phase for all plugins");
  for (const { id, plugin, config: pluginConfig } of loadedPlugins) {
    if (plugin.setup) {
      try {
        logger.info(`Running setup for plugin: ${plugin.name}`);
        const ctx: PluginContext = {
          db,
          config: pluginConfig,
          orgConfig: config.org as any,
          logger,
        };
        await plugin.setup(ctx);
        logger.info(`Setup complete for plugin: ${plugin.name}`);
      } catch (error) {
        logger.error(`Setup failed for plugin ${id}`, error as Error);
        throw error;
      }
    } else {
      logger.debug(`No setup method for plugin: ${plugin.name}`);
    }
  }
}

/**
 * Run scrape phase for all plugins
 */
export async function scrapePlugins(
  loadedPlugins: LoadedPlugin[],
  config: Config,
  db: Database,
  logger: Logger,
): Promise<void> {
  logger.info("Running scrape phase for all plugins");
  for (const { id, plugin, config: pluginConfig } of loadedPlugins) {
    try {
      logger.info(`Running scrape for plugin: ${plugin.name}`);
      const ctx: PluginContext = {
        db,
        config: pluginConfig,
        orgConfig: config.org as any,
        logger,
      };
      await plugin.scrape(ctx);
      logger.info(`Scrape complete for plugin: ${plugin.name}`);
    } catch (error) {
      logger.error(`Scrape failed for plugin ${id}`, error as Error);
      throw error;
    }
  }
}

/**
 * Run aggregate phase for all plugins that define an aggregate method.
 * This runs after the main leaderboard aggregation so plugins can
 * build on top of standard aggregates.
 */
export async function aggregatePlugins(
  loadedPlugins: LoadedPlugin[],
  config: Config,
  db: Database,
  logger: Logger,
): Promise<void> {
  logger.info("Running aggregate phase for all plugins");
  for (const { id, plugin, config: pluginConfig } of loadedPlugins) {
    if (plugin.aggregate) {
      try {
        logger.info(`Running aggregate for plugin: ${plugin.name}`);
        const ctx: PluginContext = {
          db,
          config: pluginConfig,
          orgConfig: config.org as any,
          logger,
        };
        await plugin.aggregate(ctx);
        logger.info(`Aggregate complete for plugin: ${plugin.name}`);
      } catch (error) {
        logger.error(`Aggregate failed for plugin ${id}`, error as Error);
        throw error;
      }
    } else {
      logger.debug(`No aggregate method for plugin: ${plugin.name}`);
    }
  }
}

/**
 * Run all plugins (load, setup, scrape)
 * Note: Does not run aggregate phase — use aggregatePlugins() separately
 * after the main leaderboard aggregation has completed.
 */
export async function runPlugins(
  config: Config,
  db: Database,
  logger: Logger,
): Promise<LoadedPlugin[]> {
  const loadedPlugins = await loadAllPlugins(config, logger);

  if (loadedPlugins.length === 0) {
    return loadedPlugins;
  }

  await setupPlugins(loadedPlugins, config, db, logger);
  await scrapePlugins(loadedPlugins, config, db, logger);

  logger.info("All plugins setup and scrape completed successfully");
  return loadedPlugins;
}
