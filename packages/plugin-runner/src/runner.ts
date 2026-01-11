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

  const pluginOrder = resolvePluginOrder(pluginEntries);
  logger.info(`Resolved plugin order: ${pluginOrder.join(", ")}`);

  // Load all plugins
  const loadedPlugins: Array<{
    id: string;
    plugin: Plugin;
    config: Record<string, unknown>;
  }> = [];
  const loadedById = new Map<string, {
    id: string;
    plugin: Plugin;
    config: Record<string, unknown>;
  }>();

  for (const pluginId of pluginOrder) {
    const pluginConfig = plugins[pluginId];
    try {
      const plugin = await loadPlugin(pluginConfig.source, logger);
      const entry = {
        id: pluginId,
        plugin,
        config: (pluginConfig.config || {}) as Record<string, unknown>,
      };
      loadedPlugins.push(entry);
      loadedById.set(pluginId, entry);
    } catch (error) {
      logger.error(`Failed to load plugin ${pluginId}`, error as Error);
      throw error;
    }
  }

  // Run setup phase for all plugins
  logger.info("Running setup phase for all plugins");
  for (const pluginId of pluginOrder) {
    const entry = loadedById.get(pluginId);
    if (!entry) {
      throw new Error(`Loaded plugin entry missing for ${pluginId}`);
    }
    const { id, plugin, config: pluginConfig } = entry;
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
  for (const pluginId of pluginOrder) {
    const entry = loadedById.get(pluginId);
    if (!entry) {
      throw new Error(`Loaded plugin entry missing for ${pluginId}`);
    }
    const { id, plugin, config: pluginConfig } = entry;
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

/**
 * Resolve a valid execution order for plugins based on their declared dependencies.
 *
 * Each entry in {@link pluginEntries} is a tuple of the plugin identifier and its
 * configuration object. The configuration may declare a `depends_on` property,
 * which, when present and an array, lists the identifiers of other plugins that
 * must run before the current plugin.
 *
 * The function validates that all declared dependencies refer to known plugins,
 * that no plugin depends on itself, and that there are no circular dependency
 * chains. If validation passes, it returns the list of plugin identifiers in an
 * order that satisfies all dependency constraints.
 *
 * @param pluginEntries - Array of `[pluginId, pluginConfig]` tuples where
 *   `pluginConfig.depends_on` (if present) is expected to be an array of plugin
 *   identifiers that the plugin depends on.
 * @returns An array of plugin identifiers ordered so that each plugin appears
 *   after all of the plugins it depends on.
 * @throws {Error} If a plugin declares a dependency on an unknown plugin.
 * @throws {Error} If a plugin declares a dependency on itself.
 * @throws {Error} If a circular dependency between plugins is detected.
 */
export function resolvePluginOrder(
  pluginEntries: Array<[string, { depends_on?: unknown }]>
): string[] {
  const pluginIds = pluginEntries.map(([id]) => id);
  const idSet = new Set(pluginIds);
  const deps = new Map<string, string[]>();
  const indexById = new Map<string, number>();

  pluginIds.forEach((id, idx) => indexById.set(id, idx));

  for (const [id, pluginConfig] of pluginEntries) {
    const rawDeps = Array.isArray(pluginConfig.depends_on)
      ? pluginConfig.depends_on
      : [];

    const uniqueDeps = Array.from(new Set(rawDeps));

    for (const depId of uniqueDeps) {
      if (!idSet.has(depId)) {
        throw new Error(
          `Plugin "${id}" depends on unknown plugin "${depId}"`
        );
      }

      if (depId === id) {
        throw new Error(`Plugin "${id}" cannot depend on itself`);
      }
    }

    deps.set(id, uniqueDeps);
  }

  // Detect cycles with DFS to produce a readable path
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const visit = (id: string) => {
    if (visited.has(id)) return;

    if (visiting.has(id)) {
      const cycleStart = stack.indexOf(id);
      const cyclePath = [...stack.slice(cycleStart), id].join(" -> ");
      throw new Error(`Circular dependency detected: ${cyclePath}`);
    }

    visiting.add(id);
    stack.push(id);

    for (const depId of deps.get(id) || []) {
      visit(depId);
    }

    stack.pop();
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of pluginIds) {
    visit(id);
  }

  // Kahn's algorithm with stable, insertion-order tie-breaking
  const indegree = new Map<string, number>();
  for (const id of pluginIds) {
    indegree.set(id, 0);
  }
  for (const [id, depList] of deps.entries()) {
    for (const depId of depList) {
      indegree.set(depId, (indegree.get(depId) || 0) + 1);
    }
  }

  const queue: string[] = pluginIds.filter((id) => (indegree.get(id) || 0) === 0);
  queue.sort((a, b) => (indexById.get(a) || 0) - (indexById.get(b) || 0));

  const order: string[] = [];

  while (queue.length > 0) {
    const next = queue.shift() as string;
    order.push(next);

    for (const [id, depList] of deps.entries()) {
      if (depList.includes(next)) {
        const current = (indegree.get(id) || 0) - 1;
        indegree.set(id, current);
        if (current === 0) {
          queue.push(id);
        }
      }
    }

    queue.sort((a, b) => (indexById.get(a) || 0) - (indexById.get(b) || 0));
  }

  if (order.length !== pluginIds.length) {
    throw new Error("Circular dependency detected while ordering plugins");
  }

  return order;
}
