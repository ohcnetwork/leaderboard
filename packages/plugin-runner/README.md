# @leaderboard/plugin-runner

Plugin runner CLI for orchestrating data scraping and management in the leaderboard system.

## Installation

```bash
npm install @leaderboard/plugin-runner
```

## Usage

```bash
# Run with default data directory (./data)
pnpm plugin-runner

# Specify custom data directory
pnpm plugin-runner --data-dir=/path/to/data-repo

# Skip import phase (useful for fresh scrapes)
pnpm plugin-runner --skip-import

# Skip scraping (useful for export-only)
pnpm plugin-runner --skip-scrape

# Enable debug logging
pnpm plugin-runner --debug
```

## Environment Variables

- `LEADERBOARD_DATA_DIR` - Path to data repository (default: `./data`)
- `LIBSQL_DB_URL` - Custom database URL (default: `file:${LEADERBOARD_DATA_DIR}/.leaderboard.db`)

## Workflow

1. **Import Phase**: Load existing contributors and activities from data-repo
2. **Setup Phase**: Run `setup()` method for all plugins (populates activity definitions)
3. **Scrape Phase**: Run `scrape()` method for all plugins (fetches new activities)
4. **Export Phase**: Export updated contributors and activities back to data-repo

## License

MIT

