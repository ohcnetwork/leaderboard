/**
 * Base interface for aggregate definitions.
 */
export interface AggregateDefinitionBase {
  /**
   * Name of the aggregate definition.
   *
   * @example
   * ```yaml
   * name: Pull Request Merged Count
   * ```
   */
  name: string;
  /**
   * Icon of the aggregate definition.
   * Can be set to null if the aggregate definition does not have an icon.
   * @example
   * ```yaml
   * icon: github
   * ```
   */
  icon: string | null;
  /**
   * Description of the aggregate definition.
   *
   * @example
   * ```yaml
   * description: The number of pull requests merged
   * ```
   */
  description: string | null;
}

/**
 * Number aggregate value type.
 */
interface NumberAggregateValue {
  type: "number";
  /**
   * Number value.
   *
   * @example
   * ```yaml
   * value: 10
   * ```
   */
  value: number;
}

/**
 * Number statistics aggregate value type.
 * This is a more detailed version of the number aggregate value type.
 */
interface NumberStatisticsAggregateValue {
  type: "statistics/number";
  /**
   * The minimum value.
   * If null, the minimum value will not be shown.
   */
  min?: number;
  /**
   * The maximum value.
   * If null, the maximum value will not be shown.
   */
  max?: number;
  /**
   * The mean value.
   * If null, the mean value will not be shown.
   */
  mean?: number;
  /**
   * The variance value.
   * If null, the variance value will not be shown.
   */
  variance?: number;
  /**
   * The sum value.
   * If null, the sum value will not be shown.
   */
  sum?: number;
  /**
   * The count value.
   * If null, the count value will not be shown.
   */
  count?: number;

  /**
   * The metric to highlight in the leaderboard.
   *
   * @example
   * ```yaml
   * highlightMetric: "mean"
   * ```
   */
  highlightMetric?: "min" | "max" | "mean" | "variance" | "sum" | "count";
}

/**
 * Duration aggregate value type.
 */
interface DurationAggregateValue {
  type: "duration";
  /**
   * Duration value in milliseconds.
   *
   * @example
   * ```yaml
   * value: 10000
   * ```
   */
  value: number;
}

/**
 * Duration statistics aggregate value type.
 */
interface DurationStatisticsAggregateValue {
  type: "statistics/duration";
  /**
   * The minimum value in milliseconds.
   */
  min?: number;
  /**
   * The maximum value in milliseconds.
   */
  max?: number;
  /**
   * The mean value in milliseconds.
   */
  mean?: number;
  /**
   * The variance value in milliseconds.
   */
  variance?: number;
  /**
   * The sum value in milliseconds.
   */
  sum?: number;
  /**
   * The count value.
   * If null, the count value will not be shown.
   */
  count?: number;

  /**
   * The metric to highlight in the leaderboard.
   *
   * @example
   * ```yaml
   * highlightMetric: "mean"
   * ```
   */
  highlightMetric?: "min" | "max" | "mean" | "variance" | "sum" | "count";
}

/**
 * String aggregate value type.
 */
interface StringAggregateValue {
  type: "string";
  /**
   * String value.
   *
   * @example
   * ```yaml
   * value: "Hello, world!"
   * ```
   */
  value: string;
}

/**
 * Percentage aggregate value type.
 */
interface PercentageAggregateValue {
  type: "percentage";
  /**
   * Value between 0 and 1.
   *
   * @example
   * ```yaml
   * value: 0.5
   * ```
   */
  value: number;
}

/**
 * Aggregate value type.
 *
 * @example
 * ```yaml
 * value:
 *   type: number
 *   value: 10
 *
 * value:
 *   type: duration
 *   value: 10000
 *
 * value:
 *   type: string
 *   value: "Hello, world!"
 *
 * value:
 *   type: percentage
 *   value: 0.5
 * ```
 */
export type AggregateValue =
  | NumberAggregateValue
  | NumberStatisticsAggregateValue
  | DurationAggregateValue
  | DurationStatisticsAggregateValue
  | StringAggregateValue
  | PercentageAggregateValue;

/**
 * Aggregate result value for a contributor.
 *
 * @example
 * ```yaml
 * aggregate: pr_merged_count
 * contributor: nikhila
 * value:
 *   type: number
 *   value: 10
 * ```
 */
export interface ContributorAggregate {
  /**
   * The aggregate definition slug. (ForeignKey to contributor_aggregate_definition.slug)
   */
  aggregate: string;
  /**
   * The contributor username. (ForeignKey to contributor.username)
   */
  contributor: string;
  /**
   * The aggregate value.
   */
  value: AggregateValue;
}
