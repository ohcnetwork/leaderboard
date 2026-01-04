/**
 * Dummy data generator plugin for leaderboard development
 * 
 * This plugin generates realistic contributors and GitHub-like activities
 * using Faker.js, making it easy to develop and test the leaderboard
 * without needing production data.
 */

import { faker } from "@faker-js/faker";
import type { Plugin, PluginContext } from "@leaderboard/api";
import { activityDefinitionQueries, contributorQueries, activityQueries } from "@leaderboard/api";
import { generateContributors } from "./contributors.js";
import { generateActivities, ACTIVITY_TYPES } from "./activities.js";
import { mergeConfig, type DummyPluginConfig } from "./config.js";

const plugin: Plugin = {
  name: "@leaderboard/plugin-dummy",
  version: "0.1.0",
  
  async setup(ctx: PluginContext) {
    ctx.logger.info("Setting up dummy plugin...");
    
    // Register all activity definitions
    for (const [slug, definition] of Object.entries(ACTIVITY_TYPES)) {
      await activityDefinitionQueries.insertOrIgnore(ctx.db, {
        slug,
        name: definition.name,
        description: definition.description,
        points: definition.points,
        icon: definition.icon,
      });
      
      ctx.logger.info(`Registered activity type: ${slug}`);
    }
    
    ctx.logger.info(`Setup complete: ${Object.keys(ACTIVITY_TYPES).length} activity types registered`);
  },
  
  async scrape(ctx: PluginContext) {
    ctx.logger.info("Starting dummy data generation...");
    
    // Parse and merge configuration
    const config = mergeConfig(ctx.config as DummyPluginConfig);
    
    // Set faker seed if provided
    if (config.activities.seed !== undefined) {
      faker.seed(config.activities.seed);
      ctx.logger.info(`Using seed: ${config.activities.seed}`);
    }
    
    ctx.logger.info(`Generating ${config.contributors.count} contributors...`);
    
    // Generate contributors
    const contributors = generateContributors(config.contributors.count);
    let contributorCount = 0;
    
    for (const contributor of contributors) {
      await contributorQueries.upsert(ctx.db, contributor);
      contributorCount++;
    }
    
    ctx.logger.info(`✓ Generated ${contributorCount} contributors`);
    
    // Generate activities
    ctx.logger.info("Generating activities...");
    const contributorUsernames = contributors.map((c) => c.username);
    
    const activitiesByContributor = generateActivities(
      contributorUsernames,
      config.contributors.minActivitiesPerContributor,
      config.contributors.maxActivitiesPerContributor,
      config.activities.daysBack,
      config.organization.name,
      config.organization.repoNames
    );
    
    let totalActivities = 0;
    
    for (const [username, activities] of activitiesByContributor.entries()) {
      for (const activity of activities) {
        await activityQueries.upsert(ctx.db, activity);
        totalActivities++;
      }
    }
    
    ctx.logger.info(`✓ Generated ${totalActivities} activities`);
    
    // Calculate and log statistics
    const avgActivities = Math.round(totalActivities / contributorCount);
    const totalPoints = contributors.reduce((sum, _) => {
      const activities = activitiesByContributor.get(_.username) || [];
      return sum + activities.reduce((s, a) => s + (a.points || 0), 0);
    }, 0);
    
    ctx.logger.info("──────────────────────────────────");
    ctx.logger.info("Generation Summary:");
    ctx.logger.info(`  Contributors: ${contributorCount}`);
    ctx.logger.info(`  Activities: ${totalActivities}`);
    ctx.logger.info(`  Avg activities per contributor: ${avgActivities}`);
    ctx.logger.info(`  Total points: ${totalPoints.toLocaleString()}`);
    ctx.logger.info(`  Time period: Last ${config.activities.daysBack} days`);
    ctx.logger.info("──────────────────────────────────");
    ctx.logger.info("✓ Dummy data generation complete!");
  },
};

export default plugin;

