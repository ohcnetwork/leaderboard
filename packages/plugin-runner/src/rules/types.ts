/**
 * Badge rule type definitions
 */

import type {
  Contributor,
  Activity,
  AggregateValue,
} from "@ohcnetwork/leaderboard-api";

/**
 * Base rule interface
 */
export interface BadgeRule {
  type: string;
  badgeSlug: string;
  enabled: boolean;
}

/**
 * Threshold-based rules (e.g., total activities > 100)
 */
export interface ThresholdBadgeRule extends BadgeRule {
  type: "threshold";
  aggregateSlug: string; // which aggregate to check
  thresholds: {
    variant: string; // 'bronze', 'silver', 'gold'
    value: number; // minimum value required
  }[];
}

/**
 * Streak-based rules (consecutive days with activity)
 */
export interface StreakBadgeRule extends BadgeRule {
  type: "streak";
  streakType: "daily" | "weekly" | "monthly";
  activityDefinitions?: string[]; // Optional regex patterns to filter activity types
  thresholds: {
    variant: string;
    days: number; // consecutive days required
  }[];
}

/**
 * Growth-based rules (improvement over time)
 */
export interface GrowthBadgeRule extends BadgeRule {
  type: "growth";
  aggregateSlug: string;
  period: "week" | "month" | "year";
  thresholds: {
    variant: string;
    percentageIncrease: number; // % growth required
  }[];
}

/**
 * Composite rules (multiple conditions)
 */
export interface CompositeBadgeRule extends BadgeRule {
  type: "composite";
  operator: "AND" | "OR";
  conditions: {
    aggregateSlug: string;
    operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
    value: number;
  }[];
  variant: string;
}

/**
 * Custom function-based rules
 */
export interface CustomBadgeRule extends BadgeRule {
  type: "custom";
  evaluator: (
    contributor: Contributor,
    aggregates: Map<string, AggregateValue>,
    activities: Activity[]
  ) => {
    shouldAward: boolean;
    variant: string;
    meta?: Record<string, unknown>;
  } | null;
}

/**
 * Badge rule union type
 */
export type BadgeRuleDefinition =
  | ThresholdBadgeRule
  | StreakBadgeRule
  | GrowthBadgeRule
  | CompositeBadgeRule
  | CustomBadgeRule;

/**
 * Rule evaluation result
 */
export interface RuleEvaluationResult {
  shouldAward: boolean;
  variant: string;
  meta?: Record<string, unknown>;
}
