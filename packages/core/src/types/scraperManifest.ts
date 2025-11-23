import { PGlite } from "@electric-sql/pglite";

/**
 * Scraper context type.
 * @template TConfig - The type of the scraper config.
 */
export interface ScraperContext<TConfig extends Record<string, unknown>> {
  /**
   * The database connection.
   */
  db: PGlite;
  /**
   * The scraper config.
   */
  config: TConfig;
  /**
   * The number of days to scrape data for.
   */
  scrapeDays: number;
}

type GetRecordsFn<TConfig extends Record<string, unknown>, TRecord> = (
  ctx: ScraperContext<TConfig>
) => Promise<TRecord[]>;

/**
 * Activity definition type.
 */
interface ActivityDefinition<TConfig extends Record<string, unknown>> {
  /**
   * Name of the activity type.
   *
   * @example
   * ```yaml
   * name: Pull Request Reviewed
   * ```
   */
  name: string;
  /**
   * Description of the activity type.
   *
   * @example
   * ```yaml
   * description: A pull request was reviewed
   * ```
   */
  description: string;
  /**
   * Points awarded for the activity type.
   * Can be set to null if the activity type does not award points by default.
   *
   * Note: Points can be overridden by the activity record itself if it is set
   * to a non-null value.
   *
   * @example
   * ```yaml
   * points: 10
   * ```
   */
  points: number | null;
  /**
   * Icon of the activity type.
   * Can be set to null if the activity type does not have an icon by default.
   * @example
   * ```yaml
   * icon: github
   * ```
   */
  icon: string | null;

  /**
   * Callback function to get activities for the activity type.
   *
   * The callback function should return an array of activities for the activity
   * type.
   *
   * If not provided, the scraper will not scrape any activities for this
   * activity type. You can still insert activities for this type in the
   * `getActivities` callback of the scraper manifest instead.
   *
   * @example
   * ```ts
   * getRecords: async ({ db, config }) => {
   *   const activities = getIssuesOpened(config.githubToken);
   *
   *   return result.rows.map((i) => ({
   *     slug: `issue_opened_${row.contributor}_${row.issue_number}`,
   *     contributor: i.username,
   *     occuredAt: new Date(i.occuredAt),
   *     link: i.htmlUrl,
   *     text: i.comment,
   *     points: null, // points can be overridden by the activity record itself if it is set to a non-null value.
   *     meta: {
   *       repository: i.repository.name,
   *     }
   *   }));
   * }
   * ```
   */
  getRecords?: GetRecordsFn<TConfig, Activity>;
}

/**
 * Aggregate definition
 */
interface AggregateDefinition<
  TConfig extends Record<string, unknown>,
  TRecord
> {
  /**
   * Name of the aggregate type.
   */
  name: string;
  /**
   * Description of the aggregate type.
   *
   * @example
   * ```yaml
   * description: The number of pull requests merged
   * ```
   */
  description: string;
  /**
   * Callback function to get aggregates for the aggregate type.
   *
   * The callback function should return an array of aggregates for the aggregate
   * type.
   *
   * If not provided, the scraper will not insert any aggregates for this
   * aggregate type. You can still insert aggregates for this type in the
   * `getAggregates` callback of the scraper manifest instead.
   *
   * @example
   * ```ts
   * getAggregates: async ({ db }) => {
   *   return [{
   *     value: 10,
   *     type: 'number',
   *   }]
   * }
   * ```
   */
  getRecords?: GetRecordsFn<TConfig, TRecord>;
}

/**
 * Badge definition type.
 */
interface BadgeDefinition<TConfig extends Record<string, unknown>> {
  /**
   * Name of the badge type.
   *
   * @example
   * ```yaml
   * name: EOD Streak
   * ```
   */
  name: string;
  /**
   * Description of the badge type.
   *
   * @example
   * ```yaml
   * description: Contributor has consistently sent EOD updates for 10 days
   * ```
   */
  description: string;
  /**
   * Variants of the badge type.
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
   */
  variants: Record<string, { description: string; svg_url: string }>;
  /**
   * Callback function to award badges for the badge type to contributors.
   *
   * The callback function should return an array of badges for the badge type.
   *
   * If not provided, the scraper will not award any badges for this badge type.
   * You can still award badges for this type in the `awardBadges` callback of
   * the scraper manifest instead.
   */
  getRecords?: GetRecordsFn<TConfig, Badge>;
}

/**
 * Scraper manifest type.
 */
export interface ScraperManifest<TConfig extends Record<string, unknown>> {
  /**
   * Activity definitions.
   *
   * @example
   * ```yaml
   * activityDefinitions:
   *   pr_reviewed:
   *     name: Pull Request Reviewed
   *     description: A pull request was reviewed
   *     points: 10
   *     icon: github
   *
   *   issue_opened:
   *     name: Issue Opened
   *     description: An issue was opened
   *     points: 5
   *     icon: github
   * ```
   */
  activityDefinitions: Record<string, ActivityDefinition>;

  /**
   * Aggregate definitions.
   *
   * @example
   * ```yaml
   * aggregateDefinitions:
   *   pr_merged_count:
   *     name: Pull Request Merged Count
   *     description: The number of pull requests merged
   * ```
   */
  aggregateDefinitions: Record<string, AggregateDefinition>;

  /**
   * Badge definitions.
   *
   * @example
   * ```yaml
   * badgeDefinitions:
   *   eod_streak:
   *     name: EOD Streak
   *     description: The number of days in a row that the contributor has sent an EOD update
   *     variants:
   *       bronze:
   *         description: 10 days
   *         svg_url: https://example.com/bronze.svg
   *       silver:
   *         description: 20 days
   *         svg_url: https://example.com/silver.svg
   *       gold:
   *         description: 30 days
   *         svg_url: https://example.com/gold.svg
   * ```
   */
  badgeDefinitions: Record<string, BadgeDefinition>;

  scrape: (ctx: ScraperContext<TConfig>) => Promise<void>;
  import?: (
    config: ScraperConfig,
    db: PGlite,
    dataPath: string
  ) => Promise<void>;
  export?: (
    config: ScraperConfig,
    db: PGlite,
    dataPath: string
  ) => Promise<void>;
}
