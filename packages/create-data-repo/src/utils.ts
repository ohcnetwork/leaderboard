/**
 * Utility functions
 */

/**
 * Check if any social links are provided in config
 */
export function hasSocials(config: {
  githubUrl?: string;
  slackUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  emailContact?: string;
}): boolean {
  return !!(
    config.githubUrl ||
    config.slackUrl ||
    config.linkedinUrl ||
    config.youtubeUrl ||
    config.emailContact
  );
}

/**
 * Extract organization name from GitHub URL for suggestions
 */
export function suggestDataSource(githubUrl?: string): string {
  if (!githubUrl) {
    return "https://github.com/your-org/leaderboard-data";
  }

  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter((p) => p);
    if (parts.length > 0) {
      const org = parts[0];
      return `https://github.com/${org}/leaderboard-data`;
    }
  } catch {
    // Invalid URL
  }

  return "https://github.com/your-org/leaderboard-data";
}
