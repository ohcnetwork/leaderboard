/**
 * Generate src/index.ts template
 */

import type { PluginOptions } from "../types.js";

export function generateIndexTs(options: PluginOptions): string {
  return `/**
 * ${options.description}
 */

import type { Plugin, PluginContext } from "@leaderboard/plugin-api";

const plugin: Plugin = {
  name: "${options.packageName}",
  version: "0.1.0",
  
  async setup(ctx: PluginContext) {
    ctx.logger.info("Setting up ${options.pluginName} plugin...");
    
    // TODO: Define activity types here
    // Example:
    // await ctx.db.execute(\`
    //   INSERT OR IGNORE INTO activity_definition 
    //   (slug, name, description, points, icon)
    //   VALUES (?, ?, ?, ?, ?)
    // \`, ['activity_slug', 'Activity Name', 'Description', 10, 'icon-name']);
    
    ctx.logger.info("Setup complete");
  },
  
  async scrape(ctx: PluginContext) {
    ctx.logger.info("Starting ${options.pluginName} data scraping...");
    
    // TODO: Implement your scraping logic here
    // Example:
    // const data = await fetchDataFromSource(ctx.config);
    // for (const item of data) {
    //   await ctx.db.execute(\`
    //     INSERT OR IGNORE INTO activity (...)
    //     VALUES (...)
    //   \`, [...]);
    // }
    
    ctx.logger.info("Scraping complete");
  },
};

export default plugin;
`;
}

