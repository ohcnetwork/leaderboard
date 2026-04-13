/**
 * Plugin execution orchestrator
 */

import type {
  Database,
  BadgeRuleDefinition as DeclarativeBadgeRuleDefinition,
  Logger,
  Plugin,
  PluginContext,
} from "@ohcnetwork/leaderboard-api";
import { badgeDefinitionQueries } from "@ohcnetwork/leaderboard-api";
import type { Config } from "./config";
import { loadPlugin } from "./loader";
import { evaluateBadgeRules } from "./rules/evaluator";
import type { BadgeRuleDefinition } from "./rules/types";

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
      let parsedConfig = (pluginConfig.config || {}) as Record<string, unknown>;

      if (plugin.configSchema) {
        try {
          parsedConfig = plugin.configSchema.parse(parsedConfig) as Record<
            string,
            unknown
          >;
        } catch (error) {
          logger.error(
            `Plugin config validation failed for ${pluginId}`,
            error as Error,
          );
          throw error;
        }
      }

      loadedPlugins.push({
        id: pluginId,
        plugin,
        config: parsedConfig,
      });
    } catch (error) {
      logger.error(`Failed to load plugin ${pluginId}`, error as Error);
      throw error;
    }
  }

  return loadedPlugins;
}

/**
 * Run setup phase for all plugins.
 * Also inserts badge definitions from config and plugin manifests.
 */
export async function setupPlugins(
  loadedPlugins: LoadedPlugin[],
  config: Config,
  db: Database,
  logger: Logger,
): Promise<void> {
  // Insert badge definitions from config
  const configBadgeDefs = config.leaderboard.badges?.definitions ?? [];
  if (configBadgeDefs.length > 0) {
    logger.info(
      `Inserting ${configBadgeDefs.length} badge definitions from config`,
    );
    for (const badgeDef of configBadgeDefs) {
      await badgeDefinitionQueries.upsert(db, badgeDef);
    }
  }

  logger.info("Running setup phase for all plugins");
  for (const { id, plugin, config: pluginConfig } of loadedPlugins) {
    // Insert plugin badge definitions
    if (plugin.badgeDefinitions && plugin.badgeDefinitions.length > 0) {
      logger.info(
        `Inserting ${plugin.badgeDefinitions.length} badge definitions from plugin: ${plugin.name}`,
      );
      for (const badgeDef of plugin.badgeDefinitions) {
        await badgeDefinitionQueries.upsert(db, badgeDef);
      }
    }

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
 * Run badge evaluation phase.
 * First evaluates badge rules from config, then plugin badge rules.
 */
export async function evaluateAllBadges(
  loadedPlugins: LoadedPlugin[],
  config: Config,
  db: Database,
  logger: Logger,
): Promise<void> {
  // Evaluate badge rules from config
  const configRules = transformConfigBadgeRules(
    config.leaderboard.badges?.rules ?? [],
  );
  if (configRules.length > 0) {
    logger.info(`Evaluating ${configRules.length} badge rules from config`);
    await evaluateBadgeRules(db, logger, configRules);
    logger.info("Config badge evaluation complete");
  }

  // Evaluate plugin badge rules
  for (const { id, plugin } of loadedPlugins) {
    if (plugin.badgeRules && plugin.badgeRules.length > 0) {
      logger.info(
        `Evaluating ${plugin.badgeRules.length} badge rules from plugin: ${plugin.name}`,
      );
      try {
        await evaluateBadgeRules(db, logger, plugin.badgeRules);
        logger.info(`Badge evaluation complete for plugin: ${plugin.name}`);
      } catch (error) {
        logger.error(
          `Badge evaluation failed for plugin ${id}`,
          error as Error,
        );
        throw error;
      }
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

/**
 * Transform config badge rules (snake_case) to BadgeRuleDefinition (camelCase)
 */
function transformConfigBadgeRules(
  configRules: NonNullable<Config["leaderboard"]["badges"]>["rules"],
): BadgeRuleDefinition[] {
  return configRules.map((rule): DeclarativeBadgeRuleDefinition => {
    switch (rule.type) {
      case "threshold":
        return {
          type: "threshold",
          badgeSlug: rule.badge_slug,
          enabled: rule.enabled,
          aggregateSlug: rule.aggregate_slug,
          thresholds: rule.thresholds,
        };
      case "streak":
        return {
          type: "streak",
          badgeSlug: rule.badge_slug,
          enabled: rule.enabled,
          streakType: rule.streak_type,
          activityDefinitions: rule.activity_definitions,
          thresholds: rule.thresholds,
        };
      case "growth":
        return {
          type: "growth",
          badgeSlug: rule.badge_slug,
          enabled: rule.enabled,
          aggregateSlug: rule.aggregate_slug,
          period: rule.period,
          thresholds: rule.thresholds.map((t) => ({
            variant: t.variant,
            percentageIncrease: t.percentage_increase,
          })),
        };
      case "composite":
        return {
          type: "composite",
          badgeSlug: rule.badge_slug,
          enabled: rule.enabled,
          operator: rule.operator,
          conditions: rule.conditions.map((c) => ({
            aggregateSlug: c.aggregate_slug,
            operator: c.operator,
            value: c.value,
          })),
          variant: rule.variant,
        };
    }
  });
}
