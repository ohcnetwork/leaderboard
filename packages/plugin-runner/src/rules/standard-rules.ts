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
];
