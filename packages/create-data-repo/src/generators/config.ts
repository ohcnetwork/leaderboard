/**
 * Generate config.yaml from collected configuration
 */

import yaml from "js-yaml";
import type { DataRepoConfig } from "../types";
import { hasSocials } from "../utils";

/**
 * Generate config.yaml content
 */
export function generateConfigYaml(config: DataRepoConfig): string {
  const yamlConfig: any = {
    org: {
      name: config.orgName,
      description: config.orgDescription,
      url: config.orgUrl,
      logo_url: config.orgLogoUrl,
    },
    meta: {
      title: config.metaTitle,
      description: config.metaDescription,
      image_url: config.metaImageUrl,
      site_url: config.metaSiteUrl,
      favicon_url: config.metaFaviconUrl,
    },
    leaderboard: {
      data_source: config.dataSource,
      roles: {},
    },
  };

  // Add optional org fields
  if (config.orgStartDate) {
    yamlConfig.org.start_date = config.orgStartDate;
  }

  // Add socials if any are provided
  if (hasSocials(config)) {
    yamlConfig.org.socials = {};
    if (config.githubUrl) yamlConfig.org.socials.github = config.githubUrl;
    if (config.slackUrl) yamlConfig.org.socials.slack = config.slackUrl;
    if (config.linkedinUrl)
      yamlConfig.org.socials.linkedin = config.linkedinUrl;
    if (config.youtubeUrl) yamlConfig.org.socials.youtube = config.youtubeUrl;
    if (config.emailContact) yamlConfig.org.socials.email = config.emailContact;
  }

  // Add optional theme
  if (config.themeUrl) {
    yamlConfig.leaderboard.theme = config.themeUrl;
  }

  // Add roles
  for (const role of config.roles) {
    yamlConfig.leaderboard.roles[role.slug] = {
      name: role.name,
    };
    if (role.description) {
      yamlConfig.leaderboard.roles[role.slug].description = role.description;
    }
    if (role.hidden) {
      yamlConfig.leaderboard.roles[role.slug].hidden = true;
    }
  }

  // Generate YAML string
  let yamlString = yaml.dump(yamlConfig, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });

  // Add commented-out plugin examples
  yamlString +=
    "\n  # Example plugin configurations (uncomment and configure as needed):\n";
  yamlString += "  # plugins:\n";
  yamlString += "  #   github:\n";
  yamlString += "  #     name: GitHub Plugin\n";
  yamlString +=
    "  #     source: https://raw.githubusercontent.com/your-org/leaderboard-github-plugin/main/manifest.js\n";
  yamlString += "  #     config:\n";
  yamlString += "  #       githubToken: ${{ env.GITHUB_TOKEN }}\n";
  yamlString += "  #       githubOrg: your-org-name\n";
  yamlString += "  #\n";
  yamlString += "  #   slack:\n";
  yamlString += "  #     name: Slack Plugin\n";
  yamlString +=
    "  #     source: https://raw.githubusercontent.com/your-org/leaderboard-slack-plugin/main/manifest.js\n";
  yamlString += "  #     config:\n";
  yamlString += "  #       slackApiToken: ${{ env.SLACK_API_TOKEN }}\n";
  yamlString += "  #       slackChannel: ${{ env.SLACK_CHANNEL }}\n";
  yamlString += "  #\n";
  yamlString += "  # Optional: Specify aggregates to display\n";
  yamlString += "  # aggregates:\n";
  yamlString += "  #   global:\n";
  yamlString += "  #     - total_activities\n";
  yamlString += "  #     - total_contributors\n";
  yamlString += "  #   contributor:\n";
  yamlString += "  #     - total_activity_points\n";
  yamlString += "  #     - activity_count\n";
  yamlString += "  #\n";
  yamlString += "  # Optional: Specify top contributors sidebar activities\n";
  yamlString += "  # top_contributors:\n";
  yamlString += "  #   - pr_merged\n";
  yamlString += "  #   - pr_opened\n";
  yamlString += "  #   - issue_opened\n";

  return yamlString;
}
