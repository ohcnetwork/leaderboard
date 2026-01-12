/**
 * Generate .gitignore for the data repository
 */

/**
 * Generate .gitignore content
 */
export function generateGitignore(): string {
  return `# Database file (auto-generated, not committed)
.leaderboard.db
.leaderboard.db-journal
.leaderboard.db-shm
.leaderboard.db-wal

# Node modules (if using local plugins)
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/

# Build outputs (if building plugins locally)
dist/
build/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
*.tmp
*.temp
.cache/
`;
}
