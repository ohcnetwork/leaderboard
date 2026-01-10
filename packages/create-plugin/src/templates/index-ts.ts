/**
 * Generate src/index.ts template
 */

import type { PluginOptions } from "../types";

export function generateIndexTs(options: PluginOptions): string {
  return `/**
 * ${options.description}
 */

import {
  activityDefinitionQueries,
  activityQueries,
  contributorQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
  badgeDefinitionQueries,
  contributorBadgeQueries,
  type Plugin,
  type PluginContext,
} from "@ohcnetwork/leaderboard-api";

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
    
    // TODO: Define contributor aggregate definitions (optional)
    // Example:
    // await contributorAggregateDefinitionQueries.upsert(ctx.db, {
    //   slug: "custom_metric",
    //   name: "Custom Metric",
    //   description: "Example custom metric",
    // });
    
    // TODO: Define badge definitions (optional)
    // Example:
    // await badgeDefinitionQueries.upsert(ctx.db, {
    //   slug: "example_badge",
    //   name: "Example Badge",
    //   description: "Achievement badge for custom criteria",
    //   variants: {
    //     bronze: {
    //       description: "Level 1",
    //       svg_url: "https://example.com/bronze.svg",
    //     },
    //     silver: {
    //       description: "Level 2",
    //       svg_url: "https://example.com/silver.svg",
    //     },
    //     gold: {
    //       description: "Level 3",
    //       svg_url: "https://example.com/gold.svg",
    //     },
    //   },
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
    
    // TODO: Set custom aggregates (optional)
    // Example:
    // await contributorAggregateQueries.upsert(ctx.db, {
    //   aggregate: "custom_metric",
    //   contributor: "username",
    //   value: {
    //     type: "number",
    //     value: 42,
    //     unit: "items",
    //     format: "integer",
    //   },
    //   meta: { source: "external_api" },
    // });
    
    // TODO: Award custom badges (optional)
    // Example:
    // await contributorBadgeQueries.award(ctx.db, {
    //   slug: \`example_badge__username__bronze\`,
    //   badge: "example_badge",
    //   contributor: "username",
    //   variant: "bronze",
    //   achieved_on: new Date().toISOString().split("T")[0],
    //   meta: { reason: "Custom criteria met" },
    // });
    
    ctx.logger.info("Scraping complete");
  },
};

export default plugin;
`;
}
