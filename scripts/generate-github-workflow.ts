import { getConfig } from "@/lib/config";

function generateWorkflow(): string {
  const config = getConfig();

  if (!config.scraper) {
    throw new Error(
      "No scraper configuration found in config.yaml. Please add a scraper section to generate a workflow."
    );
  }

  const { schedule, git, scrapers } = config.scraper;

  // Default git identity
  const gitUserName = git ? git["user.name"] : undefined;
  const gitUserEmail = git ? git["user.email"] : undefined;
  const finalGitUserName = gitUserName || "github-actions[bot]";
  const finalGitUserEmail =
    gitUserEmail || "github-actions[bot]@users.noreply.github.com";

  // Extract all environment variables from all scrapers
  const allEnvs: Record<string, string> = {};
  scrapers.forEach((scraper) => {
    Object.entries(scraper.envs).forEach(([key, value]) => {
      allEnvs[key] = value;
    });
  });

  // Generate scraper paths for environment variable
  const scraperPaths = scrapers
    .map((scraper) => {
      const repoName = scraper.repository.split("/")[1];
      return "$" + "{{ github.workspace }}/" + repoName;
    })
    .join(" ");

  // Generate checkout steps for each scraper
  const scraperCheckoutSteps = scrapers
    .map((scraper) => {
      const repoName = scraper.repository.split("/")[1];
      return (
        `      - name: 📥 Checkout ${scraper.name}
        uses: actions/checkout@v5
        with:
          repository: ${scraper.repository}
          path: $` +
        "{{ github.workspace }}/" +
        repoName +
        `
          fetch-depth: 1`
      );
    })
    .join("\n");

  // Generate cache-dependency-path entries
  const cacheDependencyPaths = [
    "$" + "{{ env.LEADERBOARD_PATH }}/pnpm-lock.yaml",
    ...scrapers.map((scraper) => {
      const repoName = scraper.repository.split("/")[1];
      return "$" + "{{ github.workspace }}/" + repoName + "/pnpm-lock.yaml";
    }),
  ].join("\n            ");

  // Generate environment variables section
  const envVarsSection = Object.entries(allEnvs)
    .map(([key, value]) => `      ${key}: ${value}`)
    .join("\n");

  const workflow = `name: Scraper

on:
  schedule:
    - cron: ${schedule}
  workflow_dispatch:
    inputs:
      days:
        type: number
        description: "Number of days to scrape"
        default: 1

concurrency:
  group: scheduled-data-scraper-\${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  scrape-data:
    name: Scrape data
    runs-on: ubuntu-latest
    permissions:
      contents: write
    env:
      LEADERBOARD_PATH: \${{ github.workspace }}/leaderboard
      LEADERBOARD_DATA_PATH: \${{ github.workspace }}/leaderboard-data
      SCRAPER_PATHS: ${scraperPaths}
      SCRAPE_DAYS: \${{ inputs.days }}
${envVarsSection}
    steps:
      - name: 📥 Checkout Leaderboard
        uses: actions/checkout@v5
        with:
          repository: ohcnetwork/leaderboard
          path: \${{ env.LEADERBOARD_PATH }}
          fetch-depth: 1

${scraperCheckoutSteps}

      - name: 📥 Checkout Leaderboard Data
        uses: actions/checkout@v5
        with:
          path: \${{ env.LEADERBOARD_DATA_PATH }}
          fetch-depth: 1
          persist-credentials: true

      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: "24"
          cache: "pnpm"
          cache-dependency-path: |
            ${cacheDependencyPaths}

      - name: 📦 Install Dependencies on all repositories
        run: |
          for repo in \${{ env.LEADERBOARD_PATH }} \${{ env.SCRAPER_PATHS }}; do
            cd $repo
            pnpm install
          done

      - name: 🚦 Prepare Database
        run: |
          for repo in \${{ env.LEADERBOARD_PATH }} \${{ env.SCRAPER_PATHS }}; do
            cd $repo
            pnpm db:prepare
            echo "✅ DB prepare completed for $repo"
          done;

      - name: 📥 Import from Flat Data to Database
        run: |
          for repo in \${{ env.LEADERBOARD_PATH }} \${{ env.SCRAPER_PATHS }}; do
            cd $repo
            pnpm db:import
            echo "✅ DB import completed for $repo"
          done

      - name: 🔍 Scrape Data
        run: |
          for repo in \${{ env.SCRAPER_PATHS }}; do
            cd $repo
            pnpm db:scrape
            echo "✅ Scraper completed for $repo"
          done

      - name: 📤 Export Data
        run: |
          for repo in \${{ env.LEADERBOARD_PATH }} \${{ env.SCRAPER_PATHS }}; do
            cd $repo
            pnpm db:export
            echo "✅ DB export completed for $repo"
          done

      - name: Setup Git Identity
        run: |
          git config --global user.name "${finalGitUserName}"
          git config --global user.email "${finalGitUserEmail}"

      - name: 📤 Commit and Push Changes to Leaderboard Data
        run: |
          cd \${{ env.LEADERBOARD_DATA_PATH }}
          git add -A
          # commit only if there are actual changes
          if git diff --cached --quiet; then
            echo "No changes to commit"
            exit 0
          fi
          git commit -m "Update leaderboard data"
          # Ensure pushing to the correct branch (default = main)
          git push origin HEAD:main
`;

  return workflow;
}

function main() {
  try {
    const workflow = generateWorkflow();
    console.log(workflow);
  } catch (error) {
    console.error(
      "Error generating workflow:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

main();
