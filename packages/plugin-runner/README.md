# @leaderboard/plugin-runner

Plugin runner CLI for orchestrating data scraping and management in the leaderboard system.

## Installation

```bash
npm install @leaderboard/plugin-runner
```

## Usage

```bash
# Run all phases (import → setup → scrape → aggregate → evaluate → export)
pnpm plugin-runner

# Run individual phases
pnpm plugin-runner import       # Load existing data from data-repo into database
pnpm plugin-runner setup        # Run plugin setup() methods (activity definitions, badge definitions)
pnpm plugin-runner scrape       # Run plugin scrape() methods (fetch new activities)
pnpm plugin-runner aggregate    # Run config + plugin aggregation
pnpm plugin-runner evaluate     # Evaluate config + plugin badge rules
pnpm plugin-runner export       # Export data from database back to data-repo

# Options
pnpm plugin-runner --data-dir=/path/to/data-repo   # Specify data directory
pnpm plugin-runner --debug                          # Enable debug logging
pnpm plugin-runner scrape --debug                   # Combine phase with options
```

## Environment Variables

- `LEADERBOARD_DATA_DIR` - Path to data repository (default: `./data`)
- `LIBSQL_DB_URL` - Custom database URL (default: `file:${LEADERBOARD_DATA_DIR}/.leaderboard.db`)

## Workflow

When run without a phase argument, all phases execute in order:

1. **Import**: Load existing contributors, activities, aggregates, and badges from data-repo
2. **Setup**: Run `setup()` method for all plugins (populates activity definitions, inserts badge definitions from config and plugins)
3. **Scrape**: Run `scrape()` method for all plugins (fetches new activities)
4. **Aggregate**: Calculate standard aggregates, run plugin `aggregate()` methods
5. **Evaluate**: Evaluate config badge rules, then plugin badge rules
6. **Export**: Export updated data back to data-repo

Each phase can be run independently via `pnpm plugin-runner <phase>`.

## License

MIT
