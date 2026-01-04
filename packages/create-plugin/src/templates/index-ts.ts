/**
 * Generate src/index.ts template
 */

import type { PluginOptions } from "../types.js";

export function generateIndexTs(options: PluginOptions): string {
  return `/**
 * ${options.description}
 */

import {
  activityDefinitionQueries,
  activityQueries,
  contributorQueries,
  type Plugin,
  type PluginContext,
} from "@leaderboard/api";

const plugin: Plugin = {
  name: "${options.packageName}",
  version: "0.1.0",
  
  async setup(ctx: PluginContext) {
    ctx.logger.info("Setting up ${options.pluginName} plugin...");
    
    // TODO: Define activity types here
    // Example:
    // await activityDefinitionQueries.insertOrIgnore(ctx.db, {
    //   slug: "activity_slug",
    //   name: "Activity Name",
    //   description: "Activity description",
    //   points: 10,
    //   icon: "icon-name",
    // });
    
    ctx.logger.info("Setup complete");
  },
  
  async scrape(ctx: PluginContext) {
    ctx.logger.info("Starting ${options.pluginName} data scraping...");
    
    // TODO: Implement your scraping logic here
    // Example:
    // const data = await fetchDataFromSource(ctx.config);
    // 
    // for (const item of data) {
    //   // Ensure contributor exists
    //   await contributorQueries.upsert(ctx.db, {
    //     username: item.user.username,
    //     name: item.user.name,
    //     role: null,
    //     title: null,
    //     avatar_url: item.user.avatar_url,
    //     bio: null,
    //     social_profiles: null,
    //     joining_date: null,
    //     meta: null,
    //   });
    //
    //   // Insert activity
    //   await activityQueries.upsert(ctx.db, {
    //     slug: \`activity-\${item.id}\`,
    //     contributor: item.user.username,
    //     activity_definition: "activity_slug",
    //     title: item.title,
    //     occured_at: new Date(item.timestamp).toISOString(),
    //     link: item.url,
    //     text: item.description,
    //     points: null, // Uses default from activity_definition
    //     meta: null,
    //   });
    // }
    
    ctx.logger.info("Scraping complete");
  },
};

export default plugin;
`;
}

