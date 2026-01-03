/**
 * Contributor profile information type.
 *
 * @example
 * ```yaml
 * username: john_doe
 * name: John Doe
 * role: developer
 * title: Software Engineer
 * avatar_url: https://github.com/john_doe.png
 * bio: I am a developer
 * social_profiles:
 *   github: https://github.com/john_doe
 *   linkedin: https://linkedin.com/in/john_doe
 * joining_date: 2025-01-01
 * meta:
 *   company: Acme Inc.
 *   location: New York, NY
 *   slack_user_id: U0123456789
 *   github_id: 3434343
 * ```
 */
export interface Contributor {
  /**
   * The contributor's username. Value must be unique.
   *
   * @example
   * ```yaml
   * username: john_doe
   * ```
   */
  username: string;
  /**
   * The contributor's display name.
   *
   * @example
   * ```yaml
   * name: John Doe
   * ```
   */
  name: string | null;
  /**
   * The contributor's role. Value must be one of the roles defined in the
   * `leaderboard.roles` configuration.
   *
   * @example
   * ```yaml
   * role: developer
   * ```
   */
  role: string | null;
  /**
   * The contributor's title.
   *
   * @example
   * ```yaml
   * title: Software Engineer
   * ```
   */
  title: string | null;
  /**
   * The contributor's avatar URL.
   *
   * @example
   * ```yaml
   * avatar_url: https://github.com/john_doe.png
   * ```
   */
  avatar_url: string | null;
  /**
   * Bio of the contributor. This can be a markdown string.
   *
   * @example
   * ```yaml
   * bio: |
   *   I am a *developer* who loves to code and build things.
   * ```
   */
  bio: string | null;
  /**
   * The contributor's social profiles. Value must be one of the social
   * profiles defined in the `leaderboard.social_profiles` configuration.
   *
   * @example
   * ```yaml
   * social_profiles:
   *   github: https://github.com/john_doe
   *   linkedin: https://linkedin.com/in/john_doe
   * ```
   */
  social_profiles: Record<string, string> | null;
  /**
   * The date the contributor joined the organization. Value must be a valid
   * date in the format `YYYY-MM-DD`.
   *
   * @example
   * ```yaml
   * joining_date: 2025-01-01
   * ```
   */
  joining_date: Date | null;
  /**
   * Meta data about the contributor.
   * This can be used to store any additional information about the contributor.
   *
   * @example
   * ```yaml
   * meta:
   *   company: Acme Inc.
   *   location: New York, NY
   *   slack_user_id: U0123456789
   *   github_id: 3434343
   * ```
   */
  meta: Record<string, string> | null;
}
