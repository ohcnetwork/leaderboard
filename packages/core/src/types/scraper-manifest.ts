import {
  Activity,
  AggregateDefinitionBase,
  AggregateValue,
  BadgeDefinitionBase,
  Config,
  ContributorAggregate,
  ContributorBadge,
} from "@/src/types";
import { PGlite } from "@electric-sql/pglite";

/**
 * Scraper context type.
 * @template TConfig - The type of the scraper config.
 */
export interface ScraperContext<TConfig extends object> {
  /**
   * The database connection.
   */
  db: PGlite;
  /**
   * The scraper config.
   */
  scraperConfig: TConfig;
  /**
   * The leaderboard config. This is useful for accessing the leaderboard's
   * config values.
   */
  leaderboardConfig: Config;
  /**
   * The number of days to scrape data for.
   */
  scrapeDays?: number;
  /**
   * The path to store or read data files. This is useful for import/export.
   */
  dataPath?: string;
  /**
   * The reason for the interacting with the scraper.
   * It can be used to determine the behavior of the scraper.
   *
   * - `'scrape'` - *For scraping data.*
   * - `'build'` - *For building the leaderboard site.*
   * - `undefined` - *For unknown reason.*
   */
  reason?: "scrape" | "build";
}

export interface ScraperConfig {
  config: Record<string, any>;
}
/**
 * Activity definition type.
 */
interface ActivityDefinition<TConfig extends object> {
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
   * getActivities: async ({ db, config }) => {
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
  getActivities?: (
    ctx: ScraperContext<TConfig>
  ) => Promise<Omit<Activity, "activity_definition">[]>;
}

/**
 * Global aggregate definition type.
 */
interface GlobalAggregate extends AggregateDefinitionBase {
  /**
   * Slug of the global aggregate.
   *
   * @example
   * ```yaml
   * slug: pr_merged_count
   * ```
   */
  slug: string;
  /**
   * The value of the global aggregate.
   */
  value: AggregateValue;
}

/**
 * Contributor aggregate definition type.
 */
interface ContributorAggregateDefinition<TConfig extends object>
  extends AggregateDefinitionBase {
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
  getAggregates?: (
    ctx: ScraperContext<TConfig>
  ) => Promise<({ contributor: string } & AggregateValue)[]>;
}

/**
 * Badge definition type.
 */
interface BadgeDefinition<TConfig extends object> extends BadgeDefinitionBase {
  /**
   * Callback function to award badges for the badge type to contributors.
   *
   * The callback function should return an array of badges for the badge type.
   *
   * If not provided, the scraper will not award any badges for this badge type.
   * You can still award badges for this type in the `awardBadges` callback of
   * the scraper manifest instead.
   *
   * @example
   * ```ts
   * awardBadges: async ({ db }) => {
   *   // compute logic goes here....
   *
   *   return [{
   *     contributor: 'john_doe',
   *     variant: 'bronze',
   *     achieved_on: new Date(),
   *   }]
   * }
   * ```
   */
  awardBadges?: (
    ctx: ScraperContext<TConfig>
  ) => Promise<({ contributor: string } & ContributorBadge)[]>;
}

/**
 * Scraper manifest type.
 */
export interface ScraperManifest<TConfig extends object> {
  /**
   * This function is called to validate the scraper's config.
   * Scraper should throw an error if the config is invalid.
   *
   * You can also use this callback to inject additional config values into the
   * scraper's config. This can be useful for example to inject a default value
   * for a config value if it is not provided. All other callbacks will receive
   * the validated config.
   *
   * @example
   * ```ts
   * async getValidatedConfig({ scraperConfig }) => {
   *   const result = configSchema.safeParse(scraperConfig);
   *   if (!result.success) {
   *     throw new Error(result.error.message);
   *   }
   *
   *   return {
   *     ...scraperConfig,
   *
   *     octokit: new Octokit({
   *       auth: scraperConfig.githubToken,
   *       userAgent: 'Leaderboard GitHub Scraper/1.0',
   *     }),
   *   };
   * }
   * ```
   *
   * If not provided, the scraper will not validate the config.
   *
   * @param ctx - The scraper context.
   */
  getValidatedConfig?: (ctx: ScraperContext<TConfig>) => Promise<TConfig>;

  /**
   * This function is called when the leaderboard is initialized.
   *
   * This is useful for performing validations for the scraper's config or
   * setting up any required resources.
   *
   * You can even create ephermal tables in the database that can be used during
   * the scraping process.
   *
   * @param ctx - The scraper context.
   */
  initialize?: (ctx: ScraperContext<TConfig>) => Promise<void>;

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
  activityDefinitions?: Record<string, ActivityDefinition<TConfig>>;

  /**
   * Callback function to get activities.
   *
   * If not provided, the scraper will only scrape activities defined in the
   * activity definitions.
   *
   * You can use this callback to scrape multiple activity types in one go.
   * This can be useful for efficiently scraping data from external APIs.
   *
   * @example
   * ```ts
   * getActivities: async ({ db, config }) => {
   *   const prsAndReviews = getPullRequestAndReviews(config.githubToken);
   *
   *   const activities: Activity[] = [];
   *
   *   for (const item of prsAndReviews) {
   *     // custom logic to push activities
   *   }
   *
   *   return activities;
   * }
   * ```
   */
  getActivities?: (ctx: ScraperContext<TConfig>) => Promise<Activity[]>;

  /**
   * Callback function to get global aggregates.
   *
   * If not provided, the scraper will only insert global aggregates defined in
   * the aggregate definitions.
   *
   * You can use this callback to insert multiple global aggregate types in one
   * go. This can be useful for efficiently computing aggregates or other
   * reasons.
   *
   * @example
   * ```ts
   * getGlobalAggregates: async ({ db }) => {
   *   return [{
   *     aggregate: 'pr_merged_count',
   *     value: 100,
   *     type: 'number',
   *   }]
   * }
   * ```
   */
  getGlobalAggregates?: (
    ctx: ScraperContext<TConfig>
  ) => Promise<GlobalAggregate[]>;

  /**
   * Contributor aggregate definitions.
   *
   * @example
   * ```yaml
   * contributorAggregateDefinitions:
   *   pr_merged_count:
   *     name: Pull Request Merged Count
   *     description: The number of pull requests merged by the contributor
   * ```
   */
  contributorAggregateDefinitions?: Record<
    string,
    ContributorAggregateDefinition<TConfig>
  >;

  /**
   * Callback function to get contributor aggregates.
   *
   * If not provided, the scraper will only insert contributor aggregates
   * defined in the aggregate definitions.
   *
   * You can use this callback to insert multiple contributor aggregate types in
   * one go. This can be useful for efficiently computing aggregates or other
   * reasons.
   *
   * @example
   * ```ts
   * getContributorAggregates: async ({ db }) => {
   *   return [{
   *     aggregate: 'pr_merged_count',
   *     contributor: 'john_doe',
   *     value: 10,
   *     type: 'number',
   *   }]
   * }
   * ```
   */
  getContributorAggregates?: (
    ctx: ScraperContext<TConfig>
  ) => Promise<ContributorAggregate[]>;

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
  badgeDefinitions?: Record<string, BadgeDefinition<TConfig>>;

  /**
   * Callback function to award badges.
   *
   * If not provided, the scraper will only award badges defined in the badge
   * definitions.
   *
   * You can use this callback to award multiple badge types in one go. This can
   * be useful for efficiently computing badge awards or other reasons.
   *
   * @example
   * ```ts
   * awardBadges: async ({ db }) => {
   *   // compute logic goes here....
   *
   *   return [{
   *     badge: 'eod_streak',
   *     contributor: 'john_doe',
   *     variant: 'bronze',
   *     achieved_on: new Date(),
   *   }]
   * }
   * ```
   */
  awardBadges?: (
    ctx: ScraperContext<TConfig>
  ) => Promise<({ contributor: string } & ContributorBadge)[]>;

  /**
   * Callback function to import data. Activities will be imported by
   * leaderboard automatically from the specified data path, but this can be used
   * to import other data that has been exported by the custom exporter.
   *
   * For example, if the scraper has created ephermal tables during
   * initialization or scraping, those tables can be imported here.
   */
  import?: (ctx: ScraperContext<TConfig>) => Promise<void>;

  /**
   * Callback function to export data. Activities will be exported by
   * leaderboard automatically to the specified data path, but this can be used
   * to export other data as needed.
   *
   * For example, if the scraper has created ephermal tables during
   * initialization or scraping, those tables can be exported here.
   */
  export?: (ctx: ScraperContext<TConfig>) => Promise<void>;
}
