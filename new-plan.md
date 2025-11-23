### scrapers

scrapers config would contain information on where each scraper is located and any additional configuration that is required for the scraper to run.

```yaml
scrapers:
  - name: GitHub Scraper
    source: git+https://github.com/ohcnetwork/leaderboard-github-scraper.git#main
    config:
      github_token: ${{ env.GITHUB_TOKEN }}
      github_org: ohcnetwork
      
  - name: Slack Scraper
    source: ohcnetwork/leaderboard-slack-scraper#main
    config:
      slack_api_token: ${{ secrets.SLACK_API_TOKEN }}
      slack_channel: ${{ vars.SLACK_EOD_CHANNEL }}
  - name: Slack Scraper
    source: ohcnetwork/leaderboard-slack-scraper
    config:
      slack_api_token: ${{ secrets.SLACK_API_TOKEN }}
      slack_channel: ${{ vars.SLACK_EOD_CHANNEL }}

  - name: Google Sheets Scraper
    source: file:../leaderboard-google-sheets-scraper
    config:
      google_sheets_api_token: ${{ secrets.GOOGLE_SHEETS_API_TOKEN }}
      google_sheets_sheet_id: ${{ vars.GOOGLE_SHEETS_SHEET_ID }}
```

example scraper's entrypoint file:

```tsx
// github-scraper/main.ts
import createManifest from "@leaderboard/core";


const manifest: LeaderboardScraperManifest = {
  activityDefinitions: [
    {
      slug: 'pr_reviewed',
      name: 'Pull Request Reviewed',
      description: 'A pull request was reviewed',
      points: 10,
      icon: 'github'
    },
    {
      slug: 'issue_opened',
      name: 'Issue Opened',
      description: 'An issue was opened',
      points: 5,
      icon: 'github'
    },
  ],

  aggregateDefinitions: {
    global: [
      {
        slug: 'pr_merged_count',
        name: 'Pull Request Merged Count',
        description: 'The number of pull requests merged',
      },
    ],
    contributor: [
      {
        slug: 'pr_merged_count',
        name: 'Pull Request Merged Count',
        description: 'The number of pull requests merged',
      },
      {
        slug: 'issue_opened_count',
        name: 'Issue Opened Count',
        description: 'The number of issues opened',
      },
    ],
  },

  badgeDefinitions: [
    {
      slug: 'eod_streak',
      name: 'EOD Streak',
      description: 'The number of days in a row that the contributor has sent an EOD update',
      variants: {
        bronze: {
          description: '10 days',
          svg_url: 'https://example.com/bronze.svg',
        },
      },
    }
  ],

  computeAggregates: async (config: ScraperConfig, db: PGLite) => {},

  scrape: async (config: ScraperConfig, db: PGLite, scrapeDays: number) => {},
}

export default manifest;


// slack-scraper/main.ts
const manifest: LeaderboardScraperManifest = {
  activityDefinitions: [
    {
      slug: 'eod_update',
      name: 'Slack Message',
      description: 'A message was sent to a slack channel',
      points: 10,
      icon: 'slack'
    },
  ],

  prepare: async (config: ScraperConfig, db: PGLite) => {
      db.exec(`
          CREATE TABLE IF NOT EXISTS slack_eod_message (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              value TEXT NOT NULL
          )
      `)
  },
  scrape: async (config: ScraperConfig, db: PGLite, scrapeDays: number) => {},
  computeAggregates: async (config: ScraperConfig, db: PGLite) => {},

  import: async (config: ScraperConfig, db: PGLite, dataPath: string) => { },
  export: async (config: ScraperConfig, db: PGLite, dataPath: string) => { },
}

export default manifest;
```
