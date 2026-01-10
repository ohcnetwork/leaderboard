/**
 * Plugin manifest loader
 * Fetches and validates plugin manifests from URLs
 */

import type { Plugin, PluginManifest } from "@ohcnetwork/leaderboard-api";
import type { Logger } from "@ohcnetwork/leaderboard-api";
import { readFile } from "fs/promises";
import { pathToFileURL } from "url";

/**
 * Load plugin from URL (http://, https://, file://), or package name
 */
export async function loadPlugin(
  source: string,
  logger: Logger
): Promise<Plugin> {
  logger.debug(`Loading plugin from: ${source}`);

  try {
    // Check if it's a package name (starts with @ or is a simple name without protocol)
    if (
      source.startsWith("@") ||
      (!source.includes("://") && !source.startsWith("/"))
    ) {
      // Load as npm package
      logger.debug(`Loading plugin as package: ${source}`);
      const module = (await import(source)) as PluginManifest;

      if (!module.default) {
        throw new Error("Plugin must export a default object");
      }

      const plugin = module.default;
      validatePlugin(plugin);
      logger.info(`Loaded plugin: ${plugin.name} v${plugin.version}`);
      return plugin;
    }

    if (source.startsWith("file://")) {
      // Load from local file using dynamic import (supports module resolution)
      logger.debug(`Loading plugin from file: ${source}`);
      const module = (await import(source)) as PluginManifest;

      if (!module.default) {
        throw new Error("Plugin must export a default object");
      }

      const plugin = module.default;
      validatePlugin(plugin);
      logger.info(`Loaded plugin: ${plugin.name} v${plugin.version}`);
      return plugin;
    }

    if (source.startsWith("http://") || source.startsWith("https://")) {
      // Fetch from URL and evaluate
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch plugin: ${response.status} ${response.statusText}`
        );
      }
      const code = await response.text();
      logger.debug(`Fetched plugin code from URL: ${source}`);

      // Parse and validate plugin
      const plugin = await evaluatePluginCode(code, source);
      validatePlugin(plugin);
      logger.info(`Loaded plugin: ${plugin.name} v${plugin.version}`);
      return plugin;
    }

    throw new Error(`Unsupported source format: ${source}`);
  } catch (error) {
    logger.error(`Failed to load plugin from ${source}`, error as Error);
    throw error;
  }
}

/**
 * Evaluate plugin code safely
 */
async function evaluatePluginCode(
  code: string,
  sourceUrl: string
): Promise<Plugin> {
  // Create a dynamic module from the code
  // Using data URL import is safer than eval
  const dataUrl = `data:text/javascript,${encodeURIComponent(code)}`;

  try {
    const module = (await import(dataUrl)) as PluginManifest;

    if (!module.default) {
      throw new Error("Plugin must export a default object");
    }

    return module.default;
  } catch (error) {
    throw new Error(
      `Failed to evaluate plugin code: ${(error as Error).message}`
    );
  }
}

/**
 * Validate plugin structure
 */
function validatePlugin(plugin: unknown): asserts plugin is Plugin {
  if (typeof plugin !== "object" || plugin === null) {
    throw new Error("Plugin must be an object");
  }

  const p = plugin as Record<string, unknown>;

  if (typeof p.name !== "string" || !p.name) {
    throw new Error("Plugin must have a 'name' string property");
  }

  if (typeof p.version !== "string" || !p.version) {
    throw new Error("Plugin must have a 'version' string property");
  }

  if (typeof p.scrape !== "function") {
    throw new Error("Plugin must have a 'scrape' function");
  }

  if (p.setup !== undefined && typeof p.setup !== "function") {
    throw new Error("Plugin 'setup' must be a function if provided");
  }
}
