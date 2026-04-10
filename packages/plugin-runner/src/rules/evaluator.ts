/**
 * Badge rule evaluation engine
 */

import type {
  Activity,
  ActivityDefinition,
  Database,
  Logger,
} from "@ohcnetwork/leaderboard-api";
import {
  activityDefinitionQueries,
  activityQueries,
  badgeDefinitionQueries,
  contributorAggregateQueries,
  contributorBadgeQueries,
  contributorQueries,
} from "@ohcnetwork/leaderboard-api";
import type {
  BadgeRuleDefinition,
  CompositeBadgeRule,
  GrowthBadgeRule,
  RuleEvaluationResult,
  StreakBadgeRule,
  ThresholdBadgeRule,
} from "./types";

/**
 * Match activity definitions using regex patterns
 * @param patterns Array of regex patterns (e.g., ["pull_request_.*", "issue_.*"])
 * @param definitions All activity definitions
 * @returns Matched activity definition slugs
 */
function matchActivityDefinitions(
  patterns: string[] | undefined,
  definitions: ActivityDefinition[],
): string[] {
  // Empty/undefined = all definitions
  if (!patterns || patterns.length === 0) {
    return definitions.map((d) => d.slug);
  }

  const regexes = patterns.map((p) => new RegExp(p));

  return definitions
    .filter((def) => regexes.some((regex) => regex.test(def.slug)))
    .map((d) => d.slug);
}

/**
 * Evaluate badge rules and award badges to contributors
 */
export async function evaluateBadgeRules(
  db: Database,
  logger: Logger,
  rules: BadgeRuleDefinition[],
): Promise<void> {
  logger.info("Evaluating badge rules", { ruleCount: rules.length });

  // Load all contributors
  const contributors = await contributorQueries.getAll(db);

  // Load badge definitions
  const badgeDefinitions = await badgeDefinitionQueries.getAll(db);

  // Load all activity definitions (for streak rule filtering)
  const activityDefinitions = await activityDefinitionQueries.getAll(db);

  let awardsGiven = 0;
  let upgradesGiven = 0;

  for (const contributor of contributors) {
    // Evaluate each rule
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const result = await evaluateRule(
        db,
        rule,
        contributor.username,
        activityDefinitions,
      );

      if (!result) continue;

      const { shouldAward, variant, achievedOn, meta } = result;

      if (!shouldAward) continue;

      const resolvedAchievedOn =
        achievedOn ?? new Date().toISOString().split("T")[0];

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
          rule.badgeSlug,
        );

      if (!existingBadge) {
        // Award new badge
        await contributorBadgeQueries.award(db, {
          slug: `${rule.badgeSlug}__${contributor.username}__${variant}`,
          badge: rule.badgeSlug,
          contributor: contributor.username,
          variant,
          achieved_on: resolvedAchievedOn,
          meta: { ...meta, rule_type: rule.type, auto_awarded: true },
        });
        awardsGiven++;
        logger.debug(
          `Awarded ${rule.badgeSlug} (${variant}) to ${contributor.username}`,
        );
      } else {
        // Check if we should upgrade
        const variantOrder = Object.keys(badgeDef.variants);
        const existingVariantIndex = variantOrder.indexOf(
          existingBadge.variant,
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
            },
            resolvedAchievedOn,
          );
          upgradesGiven++;
          logger.debug(
            `Upgraded ${rule.badgeSlug} for ${contributor.username}: ${existingBadge.variant} → ${variant}`,
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
  db: Database,
  rule: BadgeRuleDefinition,
  contributor: string,
  activityDefinitions: ActivityDefinition[],
): Promise<RuleEvaluationResult | null> {
  switch (rule.type) {
    case "threshold":
      return evaluateThresholdRule(db, rule, contributor);
    case "streak":
      return evaluateStreakRule(db, rule, contributor, activityDefinitions);
    case "composite":
      return evaluateCompositeRule(db, rule, contributor);
    case "growth":
      return evaluateGrowthRule(db, rule, contributor);
    case "custom":
      // For custom rules, load data and call evaluator
      const [aggregates, activities, contributorData] = await Promise.all([
        contributorAggregateQueries.getByContributor(db, contributor),
        activityQueries.getByContributor(db, contributor),
        contributorQueries.getByUsername(db, contributor),
      ]);
      if (!contributorData) return null;
      const aggregateMap = new Map(
        aggregates.map((a) => [a.aggregate, a.value]),
      );
      return rule.evaluator(contributorData, aggregateMap, activities);
    default:
      return null;
  }
}

/**
 * Evaluate threshold-based rule using SQL filtering
 */
async function evaluateThresholdRule(
  db: Database,
  rule: ThresholdBadgeRule,
  contributor: string,
): Promise<RuleEvaluationResult | null> {
  // Get contributor's aggregate value using SQL
  const contributors =
    await contributorAggregateQueries.getContributorsAboveThreshold(
      db,
      rule.aggregateSlug,
      Math.min(...rule.thresholds.map((t) => t.value)), // Minimum threshold
    );

  // Find this contributor
  const contributorData = contributors.find(
    (c) => c.contributor === contributor,
  );
  if (!contributorData) return null;

  // Sort thresholds by value descending to get highest eligible variant
  const sortedThresholds = [...rule.thresholds].sort(
    (a, b) => b.value - a.value,
  );

  for (const threshold of sortedThresholds) {
    if (contributorData.value >= threshold.value) {
      // Determine achieved_on from the activity that crossed the threshold
      const achievedOn = await resolveThresholdAchievedOn(
        db,
        contributor,
        rule.aggregateSlug,
        threshold.value,
      );

      return {
        shouldAward: true,
        variant: threshold.variant,
        achievedOn,
        meta: {
          threshold: threshold.value,
          actualValue: contributorData.value,
        },
      };
    }
  }

  return null;
}

/**
 * Resolve the achieved_on date for a threshold rule by finding the activity
 * that caused the contributor to cross the threshold.
 *
 * Supports:
 * - `activity_count` — date of the Nth activity
 * - `activity_count:<definition>` — date of the Nth activity of that type
 * - `total_activity_points` — date when cumulative points crossed the threshold
 * - Other aggregates — returns undefined (falls back to current date)
 */
async function resolveThresholdAchievedOn(
  db: Database,
  contributor: string,
  aggregateSlug: string,
  thresholdValue: number,
): Promise<string | undefined> {
  if (aggregateSlug === "activity_count") {
    return (
      (await activityQueries.getDateAtOffset(
        db,
        contributor,
        thresholdValue - 1,
      )) ?? undefined
    );
  }

  if (aggregateSlug.startsWith("activity_count:")) {
    const activityDefinition = aggregateSlug.slice("activity_count:".length);
    return (
      (await activityQueries.getDateAtOffset(
        db,
        contributor,
        thresholdValue - 1,
        activityDefinition,
      )) ?? undefined
    );
  }

  if (aggregateSlug === "total_activity_points") {
    return (
      (await activityQueries.getDateAtPointsThreshold(
        db,
        contributor,
        thresholdValue,
      )) ?? undefined
    );
  }

  return undefined;
}

/**
 * Evaluate streak-based rule with activity definition filtering
 */
async function evaluateStreakRule(
  db: Database,
  rule: StreakBadgeRule,
  contributor: string,
  allActivityDefinitions: ActivityDefinition[],
): Promise<RuleEvaluationResult | null> {
  // Match activity definitions using regex patterns
  const matchedSlugs = matchActivityDefinitions(
    rule.activityDefinitions,
    allActivityDefinitions,
  );

  if (matchedSlugs.length === 0) return null;

  // Fetch filtered activities using SQL
  const activities = await activityQueries.getByContributorAndDefinitions(
    db,
    contributor,
    matchedSlugs,
  );

  if (activities.length === 0) return null;

  // Calculate longest streak (union of all matched activities)
  const { streak: longestStreak, endDate: streakEndDate } =
    calculateLongestStreak(activities, rule.streakType);

  // Sort thresholds by days descending
  const sortedThresholds = [...rule.thresholds].sort((a, b) => b.days - a.days);

  for (const threshold of sortedThresholds) {
    if (longestStreak >= threshold.days) {
      return {
        shouldAward: true,
        variant: threshold.variant,
        achievedOn: streakEndDate,
        meta: {
          streakDays: longestStreak,
          requiredDays: threshold.days,
          activityDefinitions: matchedSlugs,
        },
      };
    }
  }

  return null;
}

/**
 * Calculate the longest streak of consecutive days with activity.
 * Returns both the streak length and the end date of the longest streak.
 */
function calculateLongestStreak(
  activities: Activity[],
  streakType: "daily" | "weekly" | "monthly",
): { streak: number; endDate: string | undefined } {
  if (activities.length === 0) return { streak: 0, endDate: undefined };

  // Get unique dates
  const uniqueDates = Array.from(
    new Set(activities.map((a) => a.occurred_at.split("T")[0])),
  ).sort();

  if (uniqueDates.length === 0) return { streak: 0, endDate: undefined };

  let maxStreak = 1;
  let maxStreakEndIndex = 0;
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
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakEndIndex = i;
        }
      } else {
        currentStreak = 1;
      }
    } else if (streakType === "weekly") {
      // For weekly, consider within 7 days as consecutive
      if (diffDays <= 7) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakEndIndex = i;
        }
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
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakEndIndex = i;
        }
      } else {
        currentStreak = 1;
      }
    }
  }

  return { streak: maxStreak, endDate: uniqueDates[maxStreakEndIndex] };
}

/**
 * Evaluate growth-based rule
 * Note: This is a simplified implementation
 * A full implementation would require historical aggregate data
 */
async function evaluateGrowthRule(
  db: Database,
  rule: GrowthBadgeRule,
  contributor: string,
): Promise<RuleEvaluationResult | null> {
  // For now, return null as we don't have historical data
  // This would require storing aggregate values over time
  return null;
}

/**
 * Evaluate composite rule (multiple conditions) using SQL queries
 */
async function evaluateCompositeRule(
  db: Database,
  rule: CompositeBadgeRule,
  contributor: string,
): Promise<RuleEvaluationResult | null> {
  const results: boolean[] = [];

  for (const condition of rule.conditions) {
    // Fetch aggregate from DB
    const aggregates =
      await contributorAggregateQueries.getContributorsWithAggregate(
        db,
        condition.aggregateSlug,
      );

    const contributorAggregate = aggregates.find(
      (a) => a.contributor === contributor,
    );
    if (!contributorAggregate || contributorAggregate.value.type !== "number") {
      results.push(false);
      continue;
    }

    // Evaluate condition
    let conditionMet = false;
    const value = contributorAggregate.value.value;

    switch (condition.operator) {
      case ">":
        conditionMet = value > condition.value;
        break;
      case "<":
        conditionMet = value < condition.value;
        break;
      case ">=":
        conditionMet = value >= condition.value;
        break;
      case "<=":
        conditionMet = value <= condition.value;
        break;
      case "==":
        conditionMet = value === condition.value;
        break;
      case "!=":
        conditionMet = value !== condition.value;
        break;
    }

    results.push(conditionMet);
  }

  // Evaluate based on operator
  const shouldAward =
    rule.operator === "AND" ? results.every((r) => r) : results.some((r) => r);

  return shouldAward
    ? {
        shouldAward: true,
        variant: rule.variant,
        meta: { conditions: rule.conditions },
      }
    : null;
}
