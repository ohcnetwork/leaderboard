/**
 * Badge rule evaluation engine
 */

import type {
  Database,
  Logger,
  Contributor,
  Activity,
  AggregateValue,
} from "@leaderboard/api";
import {
  contributorQueries,
  activityQueries,
  contributorAggregateQueries,
  badgeDefinitionQueries,
  contributorBadgeQueries,
} from "@leaderboard/api";
import type {
  BadgeRuleDefinition,
  ThresholdBadgeRule,
  StreakBadgeRule,
  GrowthBadgeRule,
  CompositeBadgeRule,
  RuleEvaluationResult,
} from "./types";
import { STANDARD_BADGE_RULES } from "./standard-rules";

/**
 * Evaluate badge rules and award badges to contributors
 */
export async function evaluateBadgeRules(
  db: Database,
  logger: Logger,
  rules: BadgeRuleDefinition[] = STANDARD_BADGE_RULES
): Promise<void> {
  logger.info("Evaluating badge rules", { ruleCount: rules.length });

  // Load all contributors
  const contributors = await contributorQueries.getAll(db);

  // Load badge definitions
  const badgeDefinitions = await badgeDefinitionQueries.getAll(db);

  let awardsGiven = 0;
  let upgradesGiven = 0;

  for (const contributor of contributors) {
    // Load contributor's aggregates
    const aggregates = await contributorAggregateQueries.getByContributor(
      db,
      contributor.username
    );
    const aggregateMap = new Map(aggregates.map((a) => [a.aggregate, a.value]));

    // Load contributor's activities (for streak calculation)
    const activities = await activityQueries.getByContributor(
      db,
      contributor.username
    );

    // Evaluate each rule
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const result = await evaluateRule(
        rule,
        contributor,
        aggregateMap,
        activities
      );

      if (!result) continue;

      const { shouldAward, variant, meta } = result;

      if (!shouldAward) continue;

      // Check if badge definition exists
      const badgeDef = badgeDefinitions.find((b) => b.slug === rule.badgeSlug);
      if (!badgeDef) {
        logger.warn(`Badge definition not found: ${rule.badgeSlug}`);
        continue;
      }

      // Check if variant exists in badge definition
      if (!badgeDef.variants[variant]) {
        logger.warn(`Variant ${variant} not found for badge ${rule.badgeSlug}`);
        continue;
      }

      // Check existing badges
      const existingBadge =
        await contributorBadgeQueries.getByContributorAndBadge(
          db,
          contributor.username,
          rule.badgeSlug
        );

      if (!existingBadge) {
        // Award new badge
        await contributorBadgeQueries.award(db, {
          slug: `${rule.badgeSlug}__${contributor.username}__${variant}`,
          badge: rule.badgeSlug,
          contributor: contributor.username,
          variant,
          achieved_on: new Date().toISOString().split("T")[0],
          meta: { ...meta, rule_type: rule.type, auto_awarded: true },
        });
        awardsGiven++;
        logger.debug(
          `Awarded ${rule.badgeSlug} (${variant}) to ${contributor.username}`
        );
      } else {
        // Check if we should upgrade
        const variantOrder = Object.keys(badgeDef.variants);
        const existingVariantIndex = variantOrder.indexOf(
          existingBadge.variant
        );
        const newVariantIndex = variantOrder.indexOf(variant);

        if (newVariantIndex > existingVariantIndex) {
          // Upgrade badge
          await contributorBadgeQueries.upgrade(
            db,
            existingBadge.slug,
            variant,
            {
              ...meta,
              rule_type: rule.type,
              auto_awarded: true,
              upgraded: true,
            }
          );
          upgradesGiven++;
          logger.debug(
            `Upgraded ${rule.badgeSlug} for ${contributor.username}: ${existingBadge.variant} → ${variant}`
          );
        }
      }
    }
  }

  logger.info("Badge evaluation complete", {
    awardsGiven,
    upgradesGiven,
    totalBadges: awardsGiven + upgradesGiven,
  });
}

/**
 * Evaluate a single rule for a contributor
 */
async function evaluateRule(
  rule: BadgeRuleDefinition,
  contributor: Contributor,
  aggregates: Map<string, AggregateValue>,
  activities: Activity[]
): Promise<RuleEvaluationResult | null> {
  switch (rule.type) {
    case "threshold":
      return evaluateThresholdRule(rule, aggregates);
    case "streak":
      return evaluateStreakRule(rule, activities);
    case "growth":
      return evaluateGrowthRule(rule, aggregates);
    case "composite":
      return evaluateCompositeRule(rule, aggregates);
    case "custom":
      return rule.evaluator(contributor, aggregates, activities);
    default:
      return null;
  }
}

/**
 * Evaluate threshold-based rule
 */
function evaluateThresholdRule(
  rule: ThresholdBadgeRule,
  aggregates: Map<string, AggregateValue>
): RuleEvaluationResult | null {
  const aggregate = aggregates.get(rule.aggregateSlug);
  if (!aggregate || aggregate.type !== "number") return null;

  // Sort thresholds by value descending to get highest eligible variant
  const sortedThresholds = [...rule.thresholds].sort(
    (a, b) => b.value - a.value
  );

  for (const threshold of sortedThresholds) {
    if (aggregate.value >= threshold.value) {
      return {
        shouldAward: true,
        variant: threshold.variant,
        meta: { threshold: threshold.value, actualValue: aggregate.value },
      };
    }
  }

  return null;
}

/**
 * Evaluate streak-based rule
 */
function evaluateStreakRule(
  rule: StreakBadgeRule,
  activities: Activity[]
): RuleEvaluationResult | null {
  if (activities.length === 0) return null;

  // Sort activities by date
  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(a.occured_at).getTime() - new Date(b.occured_at).getTime()
  );

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(
    sortedActivities,
    rule.streakType
  );

  // Sort thresholds by days descending
  const sortedThresholds = [...rule.thresholds].sort((a, b) => b.days - a.days);

  for (const threshold of sortedThresholds) {
    if (longestStreak >= threshold.days) {
      return {
        shouldAward: true,
        variant: threshold.variant,
        meta: { streakDays: longestStreak, requiredDays: threshold.days },
      };
    }
  }

  return null;
}

/**
 * Calculate the longest streak of consecutive days with activity
 */
function calculateLongestStreak(
  activities: Activity[],
  streakType: "daily" | "weekly" | "monthly"
): number {
  if (activities.length === 0) return 0;

  // Get unique dates
  const uniqueDates = Array.from(
    new Set(activities.map((a) => a.occured_at.split("T")[0]))
  ).sort();

  if (uniqueDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);

    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (streakType === "daily") {
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    } else if (streakType === "weekly") {
      // For weekly, consider within 7 days as consecutive
      if (diffDays <= 7) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    } else if (streakType === "monthly") {
      // For monthly, check if in consecutive months
      const prevMonth = prevDate.getMonth();
      const currMonth = currDate.getMonth();
      const prevYear = prevDate.getFullYear();
      const currYear = currDate.getFullYear();

      if (
        (currYear === prevYear && currMonth === prevMonth + 1) ||
        (currYear === prevYear + 1 && currMonth === 0 && prevMonth === 11)
      ) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
  }

  return maxStreak;
}

/**
 * Evaluate growth-based rule
 * Note: This is a simplified implementation
 * A full implementation would require historical aggregate data
 */
function evaluateGrowthRule(
  rule: GrowthBadgeRule,
  aggregates: Map<string, AggregateValue>
): RuleEvaluationResult | null {
  // For now, return null as we don't have historical data
  // This would require storing aggregate values over time
  return null;
}

/**
 * Evaluate composite rule (multiple conditions)
 */
function evaluateCompositeRule(
  rule: CompositeBadgeRule,
  aggregates: Map<string, AggregateValue>
): RuleEvaluationResult | null {
  const results: boolean[] = [];

  for (const condition of rule.conditions) {
    const aggregate = aggregates.get(condition.aggregateSlug);
    if (!aggregate || aggregate.type !== "number") {
      results.push(false);
      continue;
    }

    let conditionMet = false;
    switch (condition.operator) {
      case ">":
        conditionMet = aggregate.value > condition.value;
        break;
      case "<":
        conditionMet = aggregate.value < condition.value;
        break;
      case ">=":
        conditionMet = aggregate.value >= condition.value;
        break;
      case "<=":
        conditionMet = aggregate.value <= condition.value;
        break;
      case "==":
        conditionMet = aggregate.value === condition.value;
        break;
      case "!=":
        conditionMet = aggregate.value !== condition.value;
        break;
    }

    results.push(conditionMet);
  }

  // Evaluate based on operator
  let shouldAward = false;
  if (rule.operator === "AND") {
    shouldAward = results.every((r) => r);
  } else if (rule.operator === "OR") {
    shouldAward = results.some((r) => r);
  }

  if (shouldAward) {
    return {
      shouldAward: true,
      variant: rule.variant,
      meta: { conditions: rule.conditions },
    };
  }

  return null;
}
