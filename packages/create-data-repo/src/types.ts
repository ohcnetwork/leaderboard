/**
 * Data repository configuration interface
 */
export interface DataRepoConfig {
  // Organization
  orgName: string;
  orgDescription: string;
  orgUrl: string;
  orgLogoUrl: string;
  orgStartDate?: string;

  // Socials (optional)
  githubUrl?: string;
  slackUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  emailContact?: string;

  // Meta/SEO
  metaTitle: string;
  metaDescription: string;
  metaImageUrl: string;
  metaSiteUrl: string;
  metaFaviconUrl: string;

  // Leaderboard
  dataSource: string;
  themeUrl?: string;

  // Roles - at least one required
  roles: Array<{
    slug: string;
    name: string;
    description?: string;
    hidden?: boolean;
  }>;
}

/**
 * Role configuration interface
 */
export interface RoleConfig {
  slug: string;
  name: string;
  description?: string;
  hidden?: boolean;
}
