/**
 * Dummy data generator plugin for leaderboard development
 *
 * This plugin generates realistic contributors and GitHub-like activities
 * using Faker.js, making it easy to develop and test the leaderboard
 * without needing production data.
 */

import { faker } from "@faker-js/faker";
import type { Plugin, PluginContext } from "@ohcnetwork/leaderboard-api";
import {
  activityDefinitionQueries,
  contributorQueries,
  activityQueries,
  badgeDefinitionQueries,
  contributorAggregateDefinitionQueries,
} from "@ohcnetwork/leaderboard-api";
import { generateContributors } from "./contributors";
import { generateActivities, ACTIVITY_TYPES } from "./activities";
import { mergeConfig, type DummyPluginConfig } from "./config";

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

      ctx.logger.debug(`Registered activity type: ${slug}`);
    }

    ctx.logger.info(
      `Registered ${Object.keys(ACTIVITY_TYPES).length} activity types`
    );

    // Define contributor aggregate definitions
    const aggregateDefinitions = [
      {
        slug: "pr_merged_count",
        name: "PRs Merged",
        description: "Number of pull requests merged",
        hidden: null,
      },
      {
        slug: "code_review_participation",
        name: "Code Review Participation",
        description: "Percentage of PRs reviewed vs created",
        hidden: null,
      },
    ];

    for (const def of aggregateDefinitions) {
      await contributorAggregateDefinitionQueries.upsert(ctx.db, def);
      ctx.logger.debug(`Registered aggregate: ${def.slug}`);
    }

    ctx.logger.info(
      `Registered ${aggregateDefinitions.length} aggregate definitions`
    );

    // Define badge definitions
    const badgeDefinitions: Array<{
      slug: string;
      name: string;
      description: string;
      variants: Record<string, { description: string; svg_url: string }>;
    }> = [
      {
        slug: "activity_milestone",
        name: "Activity Milestone",
        description: "Awarded for reaching activity count milestones",
        variants: {
          bronze: {
            description: "10+ activities",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-activity",
          },
          silver: {
            description: "50+ activities",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=silver-activity",
          },
          gold: {
            description: "100+ activities",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=gold-activity",
          },
          platinum: {
            description: "500+ activities",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=platinum-activity",
          },
        },
      },
      {
        slug: "points_milestone",
        name: "Points Milestone",
        description: "Awarded for reaching points milestones",
        variants: {
          bronze: {
            description: "100+ points",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-points",
          },
          silver: {
            description: "500+ points",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=silver-points",
          },
          gold: {
            description: "1,000+ points",
            svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=gold-points",
          },
          platinum: {
            description: "5,000+ points",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=platinum-points",
          },
        },
      },
      {
        slug: "consistency_champion",
        name: "Consistency Champion",
        description: "Awarded for maintaining activity streaks",
        variants: {
          bronze: {
            description: "7 day streak",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-streak",
          },
          silver: {
            description: "14 day streak",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=silver-streak",
          },
          gold: {
            description: "30 day streak",
            svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=gold-streak",
          },
          platinum: {
            description: "90 day streak",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=platinum-streak",
          },
        },
      },
      {
        slug: "pr_consistency",
        name: "PR Consistency",
        description:
          "Awarded for maintaining a consistent pull request contribution streak",
        variants: {
          bronze: {
            description: "5 day PR streak",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-pr-streak",
          },
          silver: {
            description: "10 day PR streak",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=silver-pr-streak",
          },
          gold: {
            description: "21 day PR streak",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=gold-pr-streak",
          },
        },
      },
      {
        slug: "review_champion",
        name: "Review Champion",
        description: "Awarded for consistent code review participation",
        variants: {
          bronze: {
            description: "4 weeks of reviews",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-review",
          },
          silver: {
            description: "8 weeks of reviews",
            svg_url:
              "https://api.dicebear.com/7.x/shapes/svg?seed=silver-review",
          },
          gold: {
            description: "12 weeks of reviews",
            svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=gold-review",
          },
        },
      },
    ];

    for (const badge of badgeDefinitions) {
      await badgeDefinitionQueries.upsert(ctx.db, badge);
      ctx.logger.debug(`Registered badge: ${badge.slug}`);
    }

    ctx.logger.info(`Registered ${badgeDefinitions.length} badge definitions`);
    ctx.logger.info("✓ Setup complete");
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
