# @leaderboard/plugin-dummy

Dummy data generator plugin for leaderboard development. This plugin generates realistic contributors and GitHub-like activities using Faker.js, making it easy to develop and test the leaderboard without needing production data.

## Features

- 🎭 **Realistic Contributors**: Generates contributors with GitHub-style usernames, bios, avatars, and social profiles
- 📊 **GitHub-like Activities**: Simulates PRs, issues, commits, releases, and documentation updates
- ⚙️ **Highly Configurable**: Control number of contributors, activity frequency, and time periods
- 🎲 **Reproducible**: Use seed values for consistent data generation
- 📈 **Varied Activity Levels**: Some contributors are very active, others occasional

## Activity Types

The plugin generates the following activity types:

| Activity | Points | Description |
|----------|--------|-------------|
| `pr_opened` | 5 | Opened a pull request |
| `pr_merged` | 10 | Pull request was merged |
| `pr_reviewed` | 3 | Reviewed a pull request |
| `issue_opened` | 5 | Opened an issue |
| `issue_closed` | 8 | Closed an issue |
| `issue_commented` | 1 | Commented on an issue |
| `commit_pushed` | 2 | Pushed commits |
| `release_published` | 20 | Published a release |
| `docs_updated` | 5 | Updated documentation |

## Configuration

```yaml
leaderboard:
  plugins:
    dummy:
      source: "@leaderboard/plugin-dummy"
      config:
        contributors:
          count: 50                           # Number of contributors
          minActivitiesPerContributor: 5      # Minimum activities per person
          maxActivitiesPerContributor: 100    # Maximum activities per person
        activities:
          daysBack: 90                        # Generate activities for last N days
          seed: 12345                         # Optional: for reproducible data
        organization:
          name: "Example Org"                 # Organization name for GitHub URLs
          repoNames:
            - "main-app"
            - "docs"
            - "api"
```

## Usage

### With Setup Script

The easiest way to use this plugin is with the development setup script:

```bash
pnpm setup:dev
```

### Manual Configuration

1. Add the plugin to your `config.yaml`:

```yaml
leaderboard:
  data_source: https://github.com/example-org/leaderboard-data
  plugins:
    dummy:
      source: "@leaderboard/plugin-dummy"
      config:
        contributors:
          count: 30
        activities:
          daysBack: 60
```

2. Run the plugin runner:

```bash
pnpm data:scrape
```

## Development

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## Generated Data Structure

### Contributors

- **Username**: GitHub-style (e.g., `john-doe`, `alice123`)
- **Name**: Realistic full names
- **Role**: Weighted distribution (maintainer, contributor, intern, bot)
- **Avatar**: Generated via DiceBear API
- **Bio**: Realistic developer bios
- **Social**: GitHub, Twitter/X, LinkedIn, personal websites
- **Joining Date**: Spread over past 2 years

### Activities

- **Titles**: Realistic PR/issue/commit messages
- **Links**: Fake GitHub URLs
- **Timestamps**: Distributed over specified time period with recency bias
- **Meta**: Includes repo names, labels, commit counts, etc.

## Examples

### Minimal Configuration

```yaml
leaderboard:
  plugins:
    dummy:
      source: "@leaderboard/plugin-dummy"
```

Uses all defaults: 50 contributors, 5-100 activities each, last 90 days.

### Reproducible Data

```yaml
leaderboard:
  plugins:
    dummy:
      source: "@leaderboard/plugin-dummy"
      config:
        activities:
          seed: 42  # Same seed = same data every time
```

### Small Test Dataset

```yaml
leaderboard:
  plugins:
    dummy:
      source: "@leaderboard/plugin-dummy"
      config:
        contributors:
          count: 10
          minActivitiesPerContributor: 2
          maxActivitiesPerContributor: 20
        activities:
          daysBack: 30
```

## License

MIT

