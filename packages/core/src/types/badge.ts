/**
 * Defines a badge and it's variants.
 *
 * @example
 * ```yaml
 * name: EOD Streak
 * description: The number of days in a row that the contributor has sent an EOD update
 * variants:
 *   bronze:
 *     description: 10 days
 *     svg_url: https://example.com/bronze.svg
 *   silver:
 *     description: 20 days
 *     svg_url: https://example.com/silver.svg
 *   gold:
 *     description: 30 days
 *     svg_url: https://example.com/gold.svg
 */
export interface BadgeDefinitionBase {
  /**
   * Name of the badge.
   *
   * @example
   * ```yaml
   * name: EOD Streak
   * ```
   */
  name: string;
  /**
   * Description of the badge.
   *
   * @example
   * ```yaml
   * description: The number of days in a row that the contributor has sent an EOD update
   * ```
   */
  description: string;
  /**
   * Variants of the badge.
   *
   * @example
   * ```yaml
   * variants:
   *   bronze:
   *     description: 10 days
   *     svg_url: https://example.com/bronze.svg
   *   silver:
   *     description: 20 days
   *     svg_url: https://example.com/silver.svg
   *   gold:
   *     description: 30 days
   *     svg_url: https://example.com/gold.svg
   */
  variants: Record<string, BadgeVariant>;
}

/**
 * A badge can have multiple variants. Each variant can be earned by a
 * contributor by achieving a certain level of criteria.
 *
 * @example
 * ```yaml
 * description: Continously posted EOD updates for 10 days
 * svg_url: https://example.com/bronze.svg
 * requirement: Continously post EOD updates for 10 days
 */
export interface BadgeVariant {
  /**
   * Description of the badge variant.
   *
   * @example
   * ```yaml
   * description: Continously posted EOD updates for 10 days
   * ```
   */
  description: string;
  /**
   * URL of the SVG icon for the badge variant.
   *
   * @example
   * ```yaml
   * svg_url: https://example.com/bronze.svg
   * ```
   */
  svg_url: string;
  /**
   * Optional description of what's needed to earn this variant.
   *
   * @example
   * ```yaml
   * requirement: Continously post EOD updates for 10 days
   * ```
   */
  requirement?: string | null;
}

/**
 * A contributor badge is a record of a badge being earned by a contributor.
 * Each contributor can earn multiple badges and multiple variants of the same
 * badge. However, one cannot have the same variant of a badge achieved multiple
 * times.
 *
 * @example
 * ```yaml
 * slug: eod_streak__john_doe__bronze
 * badge: eod_streak
 * contributor: john_doe
 * variant: bronze
 * achieved_on: 2025-01-01
 * meta:
 *   company: Acme Inc.
 *   location: New York, NY
 *   slack_user_id: U0123456789
 *   github_id: 3434343
 * ```
 */
export interface Badge {
  /**
   * Slug referring to the badge definition.
   *
   * @example
   * ```yaml
   * badge: eod_streak
   * ```
   */
  badge: string;
  /**
   * Username of the contributor who earned the badge.
   *
   * @example
   * ```yaml
   * contributor: john_doe
   * ```
   */
  contributor: string;
  /**
   * Variant of the badge earned by the contributor.
   *
   * @example
   * ```yaml
   * variant: bronze
   * ```
   */
  variant: string;
  /**
   * Date the badge was earned by the contributor.
   *
   * @example
   * ```yaml
   * achieved_on: 2025-01-01
   * ```
   */
  achieved_on: Date;
  /**
   * Optional metadata about how the badge was earned. This can be used to store
   * any additional information about the badge earned.
   *
   * @example
   * ```yaml
   * meta:
   *   migration_id: 1234567890
   * ```
   */
  meta: Record<string, unknown> | null;
}
