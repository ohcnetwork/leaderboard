/**
 * Standard badge rules that are automatically evaluated
 */

import type { BadgeDefinition } from "@ohcnetwork/leaderboard-api";
import type { BadgeRuleDefinition } from "./types";

/**
 * Standard badge definitions
 * These are inserted into the database during the setup phase
 */
export const STANDARD_BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "activity_milestone",
    name: "Activity Milestone",
    description: "Awarded for reaching activity count milestones",
    variants: {
      bronze: {
        description: "10+ activities",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-activity",
      },
      silver: {
        description: "50+ activities",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=silver-activity",
      },
      gold: {
        description: "100+ activities",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=gold-activity",
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
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-points",
      },
      silver: {
        description: "500+ points",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=silver-points",
      },
      gold: {
        description: "1,000+ points",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=gold-points",
      },
      platinum: {
        description: "5,000+ points",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=platinum-points",
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
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=bronze-streak",
      },
      silver: {
        description: "14 day streak",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=silver-streak",
      },
      gold: {
        description: "30 day streak",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=gold-streak",
      },
      platinum: {
        description: "90 day streak",
        svg_url: "https://api.dicebear.com/7.x/shapes/svg?seed=platinum-streak",
      },
    },
  },
];

/**
 * Standard badge rules
 * These are evaluated automatically during the aggregation phase
 */
export const STANDARD_BADGE_RULES: BadgeRuleDefinition[] = [
  // Activity milestone badge
  {
    type: "threshold",
    badgeSlug: "activity_milestone",
    enabled: true,
    aggregateSlug: "activity_count",
    thresholds: [
      { variant: "bronze", value: 256 },
      { variant: "silver", value: 1024 },
      { variant: "gold", value: 4096 },
      { variant: "platinum", value: 65536 },
    ],
  },

  // Points milestone badge
  {
    type: "threshold",
    badgeSlug: "points_milestone",
    enabled: true,
    aggregateSlug: "total_activity_points",
    thresholds: [
      { variant: "bronze", value: 100 },
      { variant: "silver", value: 500 },
      { variant: "gold", value: 1000 },
      { variant: "platinum", value: 5000 },
    ],
  },

  // Activity streak badge (consecutive days)
  {
    type: "streak",
    badgeSlug: "consistency_champion",
    enabled: true,
    streakType: "daily",
    thresholds: [
      { variant: "bronze", days: 7 },
      { variant: "silver", days: 14 },
      { variant: "gold", days: 30 },
      { variant: "platinum", days: 90 },
    ],
  },
];
