# Leaderboard

A flexible, plugin-based leaderboard system for tracking and visualizing contributor activities across multiple data sources.

## Features

- 🔌 **Plugin Architecture**: Extensible system for adding new data sources
- 📊 **Multiple Views**: Leaderboards, profiles, timelines, and custom metrics
- 🎨 **Customizable**: Theme overrides and configurable roles
- 📝 **Human-Editable**: Contributor profiles in Markdown format
- 🚀 **Static Export**: Deploy to any static hosting service
- 🔒 **Self-Hosted**: Complete control over your data

## Quick Start for Development

Get started with development in under 1 minute:

```bash
# Clone the repository
git clone https://github.com/ohcnetwork/leaderboard.git
cd leaderboard

# Install dependencies
pnpm install

# Build packages
pnpm build

# Setup development environment with dummy data
pnpm setup:dev

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see your leaderboard with realistic dummy data!

### What does `setup:dev` do?

The setup script:
1. Creates a `data/` directory with example configuration
2. Generates 30 contributors with realistic profiles
3. Creates activities for the last 90 days
4. Initializes the database with activity definitions

### Customizing dummy data

```bash
# Generate more contributors
pnpm setup:dev --contributors 50

# Change time period
pnpm setup:dev --days 30

# Use reproducible data (same seed = same data)
pnpm setup:dev --seed 12345

# Force regenerate
pnpm setup:dev --force
```

### Reset development data

```bash
# Remove data directory
pnpm clean:dev

# Clean and regenerate
pnpm reset:dev
```

## Quick Start (Production)

### Prerequisites

- Node.js v20+
- pnpm v10+

### Installation

```bash
# Clone the repository
git clone https://github.com/ohcnetwork/leaderboard.git
cd leaderboard

# Install dependencies
pnpm install

# Generate seed data (for testing)
pnpm db:seed --output=./data

# Run plugin runner
pnpm data:scrape

# Build the site
pnpm build

# Start development server
cd apps/leaderboard-web
pnpm dev
```

Visit `http://localhost:3000` to see your leaderboard.

## Project Structure

```
leaderboard/
├── apps/
│   └── leaderboard-web/          # Next.js application
├── packages/
│   ├── plugin-api/               # Plugin type definitions
│   ├── db/                       # Database utilities
│   └── plugin-runner/            # CLI tool for data collection
├── docs/                         # Documentation (MDX)
└── package.json                  # Root package.json
```

## Architecture

```
Data Sources → Plugin Runner → LibSQL Database → Next.js Build → Static Site
```

### Components

1. **Plugin Runner** (`@leaderboard/plugin-runner`): CLI tool that orchestrates data collection
2. **Database Layer** (`@leaderboard/db`): LibSQL database for efficient querying
3. **Plugin API** (`@leaderboard/plugin-api`): Stable interface for plugin developers
4. **Next.js App** (`apps/leaderboard-web`): Static site generator

## Data Storage

The system uses a hybrid storage approach:

| Data Type | Format | Rationale |
|-----------|--------|-----------|
| Contributors | Markdown + YAML frontmatter | Human-editable profiles |
| Activity Definitions | Database only | Managed by plugins |
| Activities | Sharded JSONL | Efficient for large datasets |

## Configuration

Create a `config.yaml` file in your data repository:

```yaml
org:
  name: My Organization
  description: A great organization
  url: https://example.com
  logo_url: https://example.com/logo.png

meta:
  title: My Leaderboard
  description: Track our amazing contributors
  image_url: https://example.com/og-image.png
  site_url: https://leaderboard.example.com
  favicon_url: https://example.com/favicon.ico

leaderboard:
  roles:
    core:
      name: Core Team
    contributor:
      name: Contributor
  
  plugins:
    github:
      source: https://example.com/plugins/github.js
      config:
        githubToken: ${{ env.GITHUB_TOKEN }}
        githubOrg: your-org
```

## Available Scripts

### Data Management

```bash
# Import existing data
pnpm data:import

# Run plugins to scrape new data
pnpm data:scrape

# Export data to files
pnpm data:export

# Generate seed data for testing
pnpm db:seed --output=./data
```

### Development

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Watch mode for tests
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Clean build artifacts
pnpm clean
```

## Creating Plugins

Plugins are JavaScript modules that fetch data from external sources:

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  
  async setup(ctx) {
    // Define activity types
    await ctx.db.execute(`
      INSERT OR IGNORE INTO activity_definition 
      (slug, name, description, points)
      VALUES ('my_activity', 'My Activity', 'Description', 10)
    `);
  },
  
  async scrape(ctx) {
    // Fetch and store activities
    const data = await fetchFromAPI(ctx.config.apiKey);
    
    for (const item of data) {
      await ctx.db.execute(`
        INSERT OR IGNORE INTO activity (...) VALUES (...)
      `, [...]);
    }
  },
};
```

See the [Plugin Development Guide](./docs/plugins/creating-plugins.mdx) for details.

## Deployment

Deploy to various platforms:

### Netlify

```bash
netlify deploy --prod
```

### Vercel

```bash
vercel --prod
```

### GitHub Pages

See [Deployment Guide](./docs/deployment.mdx) for GitHub Actions workflow.

## Documentation

Full documentation is available in the `/docs` folder and at your deployed site under `/docs`.

- [Getting Started](./docs/getting-started/index.mdx)
- [Architecture](./docs/architecture.mdx)
- [Plugin Development](./docs/plugins/creating-plugins.mdx)
- [Configuration Reference](./docs/getting-started/configuration.mdx)
- [Data Management](./docs/data-management.mdx)
- [Deployment](./docs/deployment.mdx)
- [Testing](./docs/testing.mdx)

## Environment Variables

```bash
# Data repository location
LEADERBOARD_DATA_DIR=./data

# Database URL (optional)
LIBSQL_DB_URL=file:./data/.leaderboard.db

# Plugin-specific variables
GITHUB_TOKEN=your_token
SLACK_API_TOKEN=your_token
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Open Healthcare Network](https://ohc.network)

## Support

- [Documentation](./docs/index.mdx)
- [Issues](https://github.com/ohcnetwork/leaderboard/issues)
- [Discussions](https://github.com/ohcnetwork/leaderboard/discussions)

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [LibSQL](https://github.com/tursodatabase/libsql) - SQLite-compatible database
- [Fumadocs](https://fumadocs.vercel.app/) - Documentation framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

