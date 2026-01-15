/**
 * Generate README.md for the data repository
 */

import type { DataRepoConfig } from "../types";

/**
 * Generate README content
 */
export function generateReadme(config: DataRepoConfig): string {
  return `# ${config.orgName} Leaderboard Data

This repository contains contributor and activity data for the ${
    config.orgName
  } leaderboard.

## Repository Structure

\`\`\`
.
├── config.yaml           # Leaderboard configuration
├── .leaderboard.db      # SQLite database (auto-generated)
├── contributors/         # Contributor profiles (Markdown files)
└── activities/          # Activity records (JSONL files)
\`\`\`

## Getting Started

### 1. Configure Plugins

Edit \`config.yaml\` and uncomment the plugin configurations you want to use. Make sure to:
- Set the correct plugin source URLs
- Configure environment variables for API tokens
- Update organization-specific settings

### 2. Run Data Scraping

\`\`\`bash
# Using the leaderboard CLI (from your leaderboard monorepo)
pnpm --filter @leaderboard/plugin-runner scrape --data-dir .

# Or if you have the CLI installed globally
leaderboard-scrape --data-dir .
\`\`\`

### 3. Commit Changes

After scraping, contributor profiles and activities will be exported to files:

\`\`\`bash
git add contributors/ activities/
git commit -m "Update leaderboard data"
git push
\`\`\`

## Contributor Profiles

Contributor profiles are stored as Markdown files with YAML frontmatter in the \`contributors/\` directory:

\`\`\`markdown
---
username: alice
name: Alice Smith
role: core
avatar_url: https://example.com/avatar.jpg
social_profiles:
  github: https://github.com/alice
  linkedin: https://linkedin.com/in/alice
---

Alice is a core contributor specializing in backend development...
\`\`\`

### Profile Fields

- \`username\` (required) - Unique identifier
- \`name\` - Full name
- \`role\` - Role identifier (must match config.yaml)
- \`title\` - Job title or designation
- \`avatar_url\` - Profile picture URL
- \`social_profiles\` - Social media links
- \`joining_date\` (YYYY-MM-DD) - Join date
- \`meta\` - Custom metadata

## Activities

Activities are stored as JSONL (JSON Lines) files in the \`activities/\` directory, one file per contributor:

\`\`\`jsonl
{"slug":"alice-pr-1","contributor":"alice","activity_definition":"pr_merged","title":"Fix authentication bug","occured_at":"2024-01-15T10:00:00Z","link":"https://github.com/org/repo/pull/123","points":10}
{"slug":"alice-issue-1","contributor":"alice","activity_definition":"issue_opened","title":"Add rate limiting","occured_at":"2024-01-16T14:20:00Z","link":"https://github.com/org/repo/issues/45","points":5}
\`\`\`

### Activity Fields

- \`slug\` (required) - Unique identifier
- \`contributor\` (required) - Username
- \`activity_definition\` (required) - Activity type slug
- \`title\` - Activity title
- \`occured_at\` (required) - ISO 8601 timestamp
- \`link\` - URL to activity
- \`text\` - Additional text/description
- \`points\` - Points awarded
- \`meta\` - Custom metadata

## Configuration

The \`config.yaml\` file contains all leaderboard configuration:

- **Organization**: Name, description, logo, social links
- **Meta/SEO**: Site title, description, images for social sharing
- **Roles**: Define contributor roles (core, contributor, bot, etc.)
- **Plugins**: Configure data source plugins (GitHub, Slack, etc.)
- **Aggregates**: Specify which metrics to display
- **Theme**: Optional custom CSS for branding

## Roles

Current roles configured:

${config.roles
  .map(
    (role) =>
      `- **${role.name}** (\`${role.slug}\`)${
        role.description ? `: ${role.description}` : ""
      }${role.hidden ? " _(hidden)_" : ""}`
  )
  .join("\n")}

## Documentation

For more information about the leaderboard system:

- [Leaderboard Documentation](https://github.com/ohcnetwork/leaderboard)
- [Creating Plugins](https://github.com/ohcnetwork/leaderboard/blob/main/docs/plugins/creating-plugins.mdx)
- [Data Management](https://github.com/ohcnetwork/leaderboard/blob/main/docs/data-management.mdx)

## License

MIT
`;
}
