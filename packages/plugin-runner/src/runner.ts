/**
 * Plugin execution orchestrator
 */

import type {
  Plugin,
  PluginContext,
  Database,
  Logger,
} from "@ohcnetwork/leaderboard-api";
import type { Config } from "./config";
import { loadPlugin } from "./loader";

/**
 * Run all plugins
 */
export async function runPlugins(
  config: Config,
  db: Database,
  logger: Logger
): Promise<void> {
  const plugins = config.leaderboard.plugins || {};
  const pluginEntries = Object.entries(plugins);

  if (pluginEntries.length === 0) {
    logger.warn("No plugins configured");
    return;
  }

  logger.info(`Running ${pluginEntries.length} plugins`);

  // Load all plugins
  const loadedPlugins: Array<{
    id: string;
    plugin: Plugin;
    config: Record<string, unknown>;
  }> = [];

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

  // Run setup phase for all plugins
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

  // Run scrape phase for all plugins
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

  logger.info("All plugins completed successfully");
}
