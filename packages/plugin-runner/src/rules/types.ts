/**
 * Badge rule type definitions
 *
 * Declarative rule types (Threshold, Streak, Growth, Composite) are defined in
 * @ohcnetwork/leaderboard-api so plugins can reference them.
 * The CustomBadgeRule type is internal to the plugin-runner.
 */

import type {
  Activity,
  AggregateValue,
  CompositeBadgeRule,
  Contributor,
  BadgeRuleDefinition as DeclarativeBadgeRuleDefinition,
  GrowthBadgeRule,
  StreakBadgeRule,
  ThresholdBadgeRule,
} from "@ohcnetwork/leaderboard-api";

// Re-export declarative rule types for internal use
export type {
  CompositeBadgeRule,
  GrowthBadgeRule,
  StreakBadgeRule,
  ThresholdBadgeRule,
};

/**
 * Base rule interface
 */
export interface BadgeRule {
  type: string;
  badgeSlug: string;
  enabled: boolean;
}

/**
 * Custom function-based rules (internal to plugin-runner, not serializable)
 */
export interface CustomBadgeRule extends BadgeRule {
  type: "custom";
  evaluator: (
    contributor: Contributor,
    aggregates: Map<string, AggregateValue>,
    activities: Activity[],
  ) => {
    shouldAward: boolean;
    variant: string;
    meta?: Record<string, unknown>;
  } | null;
}

/**
 * Full badge rule union type (includes custom rules for internal use)
 */
export type BadgeRuleDefinition =
  | DeclarativeBadgeRuleDefinition
  | CustomBadgeRule;

/**
 * Rule evaluation result
 */
export interface RuleEvaluationResult {
  shouldAward: boolean;
  variant: string;
  achievedOn?: string;
  meta?: Record<string, unknown>;
}
