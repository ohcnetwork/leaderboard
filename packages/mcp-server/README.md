# Leaderboard MCP Server

A Model Context Protocol (MCP) server for querying leaderboard data. This server exposes comprehensive tools for querying contributors, activities, rankings, badges, and aggregates through a standardized MCP interface.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol created by Anthropic that standardizes how AI assistants connect to data sources and tools. This server implements MCP to make leaderboard data easily accessible to AI assistants like Claude.

## Features

- **20+ Query Tools**: Comprehensive set of tools for querying all aspects of leaderboard data
- **Batch Operations**: Support for querying multiple contributors or stats in a single request
- **Flexible Filtering**: Filter by role, date range, activity type, and more
- **Multiple Transports**: Support for both STDIO (for local use) and HTTP transports
- **Read-Only**: Safe, read-only access to leaderboard data
- **Zero Configuration**: Works out of the box with sensible defaults

## Installation

```bash
# From the monorepo root
pnpm install

# Build the MCP server package
pnpm --filter @leaderboard/mcp-server build
```

## Usage

### STDIO Transport (Recommended for Claude Desktop)

```bash
# Default - uses LEADERBOARD_DATA_DIR environment variable or ./data
leaderboard-mcp

# Specify data directory
leaderboard-mcp --data-dir /path/to/leaderboard/data

# Specify database URL directly
leaderboard-mcp --db-url file:/path/to/database.db
```

### HTTP Transport

```bash
# Run on default port 3001
leaderboard-mcp --transport http

# Run on custom port
leaderboard-mcp --transport http --port 8080
```

## Integration with Claude Desktop

Add this configuration to your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "leaderboard": {
      "command": "node",
      "args": [
        "/path/to/leaderboard/packages/mcp-server/dist/index.js",
        "--data-dir",
        "/path/to/leaderboard/data"
      ]
    }
  }
}
```

After configuration, restart Claude Desktop. The server will be available and Claude can use the tools to query your leaderboard data.

## Available Tools

### Contributor Tools

- **query_contributors**: Query contributors with optional filtering by role and pagination
- **get_contributor**: Get detailed information about a specific contributor
- **get_contributor_stats**: Get comprehensive statistics for a contributor including activities, badges, and aggregates
- **batch_get_contributors**: Get multiple contributors in a single batch request

### Activity Tools

- **query_activities**: Query activities with flexible filtering by contributor, activity type, and date range
- **get_activity**: Get a specific activity by slug
- **get_activity_definitions**: Get activity definitions (types of activities tracked)
- **get_activity_timeline**: Get activity timeline for a contributor grouped by time period
- **search_activities**: Search activities by title or text content

### Leaderboard Tools

- **get_leaderboard**: Get leaderboard rankings with optional filtering
- **get_contributor_ranking**: Get a contributor's ranking position and percentile
- **get_top_by_activity**: Get top contributors for a specific activity type
- **get_active_contributors**: Get contributors who were active in a specific time period

### Badge Tools

- **get_badges**: Get badge definitions or contributor badges
- **get_recent_badges**: Get recently awarded badges
- **get_top_badge_earners**: Get contributors with the most badges

### Aggregate Tools

- **get_global_aggregates**: Get organization-level aggregate metrics
- **get_contributor_aggregates**: Get aggregates for a specific contributor
- **get_aggregate_definitions**: Get contributor aggregate definitions
- **batch_get_contributor_stats**: Get statistics for multiple contributors in batch

## Example Queries

Here are some example natural language queries you can ask Claude:

- "Show me the top 10 contributors this month"
- "What activities did alice complete last week?"
- "Who has earned the most badges?"
- "Get me detailed stats for user john_doe"
- "Find all pull requests merged in January 2024"
- "Show the contribution timeline for bob grouped by month"
- "What's alice's current ranking?"
- "Compare the stats of alice, bob, and charlie"

## Configuration

### Environment Variables

- `LEADERBOARD_DATA_DIR`: Path to leaderboard data directory (default: `./data`)
- `LIBSQL_DB_URL`: Database URL (overrides data directory)

### Command Line Options

```
Options:
  --transport <type>    Transport type: stdio (default) or http
  --port <number>       HTTP port (default: 3001, only for HTTP transport)
  --data-dir <path>     Path to leaderboard data directory
  --db-url <url>        Database URL (overrides data-dir)
  --help, -h            Show this help message
```

## Tool Schemas

All tools accept and return structured JSON data. Input parameters are validated using Zod schemas. Here's an example of the `get_contributor_stats` tool:

**Input:**
```json
{
  "username": "alice"
}
```

**Output:**
```json
{
  "contributor": {
    "username": "alice",
    "name": "Alice Smith",
    "role": "core",
    "avatar_url": "https://...",
    ...
  },
  "stats": {
    "totalPoints": 1250,
    "activityCount": 45,
    "badgeCount": 5
  },
  "recentActivities": [...],
  "aggregates": [...],
  "badges": [...],
  "activityByDate": [...]
}
```

## Development

### Build

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Run Tests

```bash
pnpm test
```

### Development Mode

```bash
# Watch mode with hot reload
pnpm dev

# HTTP transport in development
pnpm dev:http
```

## Architecture

```
┌─────────────────┐
│   MCP Client    │  (Claude Desktop, MCP Inspector, etc.)
│  (AI Assistant) │
└────────┬────────┘
         │ MCP Protocol (JSON-RPC)
         │
┌────────┴────────┐
│   MCP Server    │
│  (This Package) │
├─────────────────┤
│ • Tool Handlers │
│ • Validation    │
│ • Error Handling│
└────────┬────────┘
         │
┌────────┴────────┐
│  Leaderboard    │
│      API        │
│ (@ohcnetwork/   │
│  leaderboard-   │
│      api)       │
└────────┬────────┘
         │
┌────────┴────────┐
│  LibSQL         │
│  Database       │
└─────────────────┘
```

## Security

- **Read-Only**: All operations are read-only. No write, update, or delete operations are exposed.
- **Input Validation**: All inputs are validated using Zod schemas.
- **Error Handling**: Comprehensive error handling with structured error messages.
- **Trusted Environment**: Designed for use in trusted environments. No authentication required.

## Performance

- **Optimized Queries**: Uses existing optimized queries from the leaderboard API
- **Pagination**: Support for pagination to handle large result sets
- **Batch Operations**: Efficient batch operations to reduce round trips
- **Database Indexes**: Leverages database indexes for fast queries

## Troubleshooting

### Server won't start

1. Check that the data directory exists and contains a `.leaderboard.db` file
2. Verify environment variables are set correctly
3. Ensure the database file has read permissions

### Tools return empty results

1. Verify the database contains data by running: `sqlite3 data/.leaderboard.db "SELECT COUNT(*) FROM contributor"`
2. Check that the data directory path is correct
3. Try querying without filters first

### Claude Desktop doesn't show the server

1. Check the config file path is correct for your OS
2. Verify the JSON syntax in `claude_desktop_config.json`
3. Restart Claude Desktop after making config changes
4. Check Claude Desktop logs for error messages

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## License

MIT © Open Healthcare Network

## Support

- [Documentation](../../docs/)
- [Issues](https://github.com/ohcnetwork/leaderboard/issues)
- [Discussions](https://github.com/ohcnetwork/leaderboard/discussions)
