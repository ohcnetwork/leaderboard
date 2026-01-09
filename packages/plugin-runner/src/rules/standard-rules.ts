/**
 * Standard badge rules that are automatically evaluated
 */

import type { BadgeRuleDefinition } from "./types";

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
      { variant: "bronze", value: 10 },
      { variant: "silver", value: 50 },
      { variant: "gold", value: 100 },
      { variant: "platinum", value: 500 },
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

  // Pull request streak (only PR activities)
  {
    type: "streak",
    badgeSlug: "pr_consistency",
    enabled: false, // Disabled by default, enable in custom config
    streakType: "daily",
    activityDefinitions: ["pull_request_.*"], // Regex pattern
    thresholds: [
      { variant: "bronze", days: 5 },
      { variant: "silver", days: 10 },
      { variant: "gold", days: 21 },
    ],
  },

  // Code review streak
  {
    type: "streak",
    badgeSlug: "review_champion",
    enabled: false, // Disabled by default, enable in custom config
    streakType: "weekly",
    activityDefinitions: ["pull_request_reviewed"], // Exact match
    thresholds: [
      { variant: "bronze", days: 4 },
      { variant: "silver", days: 8 },
      { variant: "gold", days: 12 },
    ],
  },
];
