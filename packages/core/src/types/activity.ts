/**
 * An activity is a record of an activity being performed by a contributor.
 *
 * @template TActivityDefinition - The type of the activity definition.
 *
 * @example
 * ```yaml
 * slug: eod_update__john_doe__2025-01-01
 * contributor: john_doe
 * activity_definition: eod_update
 * title: EOD Update
 * occured_at: 2025-01-01T00:00:00Z
 * link: https://example.com/eod-update#1234567890
 * text: I have updated the EOD update for today.
 * points: 2
 * meta:
 *   _scraper: slack-eod-update
 *   migration_id: 1234567890
 */
export interface Activity<TActivityDefinition = string> {
  /**
   * Slug of the activity. Value must be unique.
   *
   * Typically, the slug is a combination of the activity definition slug and
   * other dependecies to uniquely identify an activity, so that de-duplication
   * can be performed easily.
   *
   * @example
   * ```yaml
   * slug: eod_update__john_doe__2025-01-01
   * ```
   */
  slug: string;
  /**
   * Username of the contributor who performed the activity.
   *
   * @example
   * ```yaml
   * contributor: john_doe
   * ```
   */
  contributor: string;
  /**
   * Slug referring to the activity definition.
   *
   * @example
   * ```yaml
   * activity_definition: eod_update
   * ```
   */
  activity_definition: TActivityDefinition;
  /**
   * Title of the activity. This can be used to display the activity in a UI.
   *
   * @example
   * ```yaml
   * title: EOD Update
   * ```
   */
  title: string | null;
  /**
   * Date and time the activity was performed.
   *
   * @example
   * ```yaml
   * occured_at: 2025-01-01T00:00:00Z
   * ```
   */
  occured_at: Date;
  /**
   * HTML link to the activity. For example, link to a GitHub PR's page, or a
   * Slack message, etc.
   *
   * @example
   * ```yaml
   * link: https://github.com/ohcnetwork/care/pull/12`
   * ```
   */
  link: string | null;
  /**
   * Text of the activity. This can be used to display the activity in a UI.
   *
   * @example
   * ```yaml
   * text: I have updated the EOD update for today.
   * ```
   */
  text: string | null;
  /**
   * Points awarded for the activity. If null, the points are determined by the
   * activity definition.
   *
   * @example
   * ```yaml
   * points: 2
   * ```
   */
  points: number | null;
  /**
   * Optional metadata about the activity. This can be used to store any
   * additional information about the activity.
   *
   * @example
   * ```yaml
   * meta:
   *   _scraper: slack-eod-update
   *   migration_id: 1234567890
   * ```
   */
  meta: Record<string, unknown> | null;
}
