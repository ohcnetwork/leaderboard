# MCP Server Usage Guide

This guide provides examples and best practices for using the Leaderboard MCP Server.

## Quick Start

### 1. Build and Install

```bash
# From the monorepo root
pnpm install
pnpm --filter @leaderboard/mcp-server build
```

### 2. Run the Server

**STDIO Transport (for Claude Desktop):**
```bash
leaderboard-mcp --data-dir ./data
```

**HTTP Transport:**
```bash
leaderboard-mcp --transport http --port 3001
```

## Claude Desktop Integration

### Configuration

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent on your OS:

```json
{
  "mcpServers": {
    "leaderboard": {
      "command": "node",
      "args": [
        "/absolute/path/to/leaderboard/packages/mcp-server/dist/index.js",
        "--data-dir",
        "/absolute/path/to/leaderboard/data"
      ]
    }
  }
}
```

### Restart Claude Desktop

After saving the configuration, restart Claude Desktop for the changes to take effect.

## Example Queries

Once configured, you can ask Claude questions like:

### Contributor Queries

```
"Show me all core team members"
"Get detailed stats for alice"
"Compare the contributions of alice, bob, and charlie"
"Who joined in the last month?"
```

### Activity Queries

```
"What activities did john_doe complete last week?"
"Find all pull requests merged in January 2024"
"Show me recent code reviews"
"Search for activities mentioning 'bug fix'"
```

### Leaderboard Queries

```
"Show me the top 10 contributors this month"
"What's alice's current ranking?"
"Who are the most active contributors this quarter?"
"Show leaderboard excluding maintainer role"
```

### Badge Queries

```
"What badges has alice earned?"
"Show me recently awarded badges"
"Who has the most badges?"
"What badge types are available?"
```

### Aggregate Queries

```
"What are the organization-level metrics?"
"Show alice's aggregate statistics"
"What's our total contribution count?"
"Show contributor streak information"
```

### Timeline and Analytics

```
"Show alice's contribution pattern over the last 6 months"
"Who opened the most pull requests this quarter?"
"Group bob's activities by week"
"Show active contributors in Q1 2024"
```

## Tool Reference

### Contributor Tools

#### query_contributors
Get a list of contributors with optional filtering.

**Parameters:**
- `role` (optional): Filter by contributor role
- `limit` (optional): Maximum results (1-1000, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```
"Show me all contributors with role 'core'"
```

#### get_contributor
Get detailed information about a specific contributor.

**Parameters:**
- `username` (required): Contributor username

**Example:**
```
"Get details for contributor alice"
```

#### get_contributor_stats
Get comprehensive statistics including activities, badges, and aggregates.

**Parameters:**
- `username` (required): Contributor username

**Example:**
```
"Show me detailed stats for alice"
```

#### batch_get_contributors
Get multiple contributors in a single request.

**Parameters:**
- `usernames` (required): Array of usernames

**Example:**
```
"Get information for alice, bob, and charlie"
```

### Activity Tools

#### query_activities
Query activities with flexible filtering.

**Parameters:**
- `contributor` (optional): Filter by username
- `activity_type` (optional): Filter by activity definition slug
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Maximum results (1-1000)
- `offset` (optional): Pagination offset

**Example:**
```
"Show activities from alice in the last week"
```

#### get_activity
Get a specific activity by its slug.

**Parameters:**
- `slug` (required): Activity slug

#### get_activity_definitions
Get all activity types tracked by the system.

**Parameters:**
- `slug` (optional): Get specific definition

**Example:**
```
"What types of activities are tracked?"
```

#### get_activity_timeline
Get activity timeline grouped by time period.

**Parameters:**
- `username` (required): Contributor username
- `group_by` (optional): 'day', 'week', or 'month' (default: 'day')

**Example:**
```
"Show alice's activity timeline grouped by month"
```

#### search_activities
Search activities by title or text.

**Parameters:**
- `query` (required): Search query
- `limit` (optional): Maximum results

**Example:**
```
"Search for activities mentioning 'authentication'"
```

### Leaderboard Tools

#### get_leaderboard
Get current leaderboard rankings.

**Parameters:**
- `exclude_roles` (optional): Array of roles to exclude
- `start_date` (optional): Filter by date range
- `end_date` (optional): Filter by date range
- `limit` (optional): Maximum results

**Example:**
```
"Show top 10 contributors this month"
```

#### get_contributor_ranking
Get a contributor's rank and percentile.

**Parameters:**
- `username` (required): Contributor username
- `exclude_roles` (optional): Roles to exclude from ranking

**Example:**
```
"What's alice's current ranking?"
```

#### get_top_by_activity
Get top contributors for a specific activity type.

**Parameters:**
- `activity_type` (required): Activity definition slug
- `limit` (optional): Maximum results (1-100)
- `start_date` (optional): Filter by date range
- `end_date` (optional): Filter by date range

**Example:**
```
"Who opened the most pull requests this quarter?"
```

#### get_active_contributors
Get contributors active in a time period.

**Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `exclude_roles` (optional): Roles to exclude
- `limit` (optional): Maximum results

**Example:**
```
"Show active contributors in January 2024"
```

### Badge Tools

#### get_badges
Get badge definitions or contributor badges.

**Parameters:**
- `username` (optional): Get badges for specific contributor
- `badge_slug` (optional): Get specific badge definition

**Example:**
```
"What badges has alice earned?"
"What badge types exist?"
```

#### get_recent_badges
Get recently awarded badges.

**Parameters:**
- `limit` (optional): Maximum results (1-100, default: 20)

**Example:**
```
"Show recently awarded badges"
```

#### get_top_badge_earners
Get contributors with the most badges.

**Parameters:**
- `limit` (optional): Maximum results (1-100, default: 10)

**Example:**
```
"Who has earned the most badges?"
```

### Aggregate Tools

#### get_global_aggregates
Get organization-level aggregate metrics.

**Parameters:**
- `slugs` (optional): Filter by specific aggregate slugs

**Example:**
```
"Show organization-level metrics"
```

#### get_contributor_aggregates
Get aggregates for a specific contributor.

**Parameters:**
- `username` (required): Contributor username
- `slugs` (optional): Filter by specific aggregate slugs

**Example:**
```
"Show alice's aggregate statistics"
```

#### get_aggregate_definitions
Get available aggregate metric definitions.

**Parameters:**
- `visible_only` (optional): Only visible definitions (default: true)

**Example:**
```
"What aggregate metrics are tracked?"
```

#### batch_get_contributor_stats
Get stats for multiple contributors efficiently.

**Parameters:**
- `usernames` (required): Array of usernames
- `include_aggregates` (optional): Include aggregates (default: false)
- `include_badges` (optional): Include badges (default: false)

**Example:**
```
"Get stats for alice, bob, and charlie with aggregates"
```

## Best Practices

### 1. Use Batch Operations

When querying multiple contributors, use batch operations instead of individual queries:

**Good:**
```
"Get stats for alice, bob, and charlie"
→ Uses batch_get_contributors or batch_get_contributor_stats
```

**Less Efficient:**
```
"Get stats for alice"
"Get stats for bob"
"Get stats for charlie"
→ Three separate queries
```

### 2. Use Date Filters

For time-based queries, always specify date ranges for better performance:

**Good:**
```
"Show activities from last week" (implies date range)
```

**Less Efficient:**
```
"Show all activities" (queries entire database)
```

### 3. Use Pagination

For large result sets, use pagination:

```
"Show first 50 contributors"
"Show next 50 contributors (offset 50)"
```

### 4. Filter Early

Apply filters to reduce result size:

```
"Show top 10 contributors excluding 'bot' role this month"
```

### 5. Use Specific Queries

Use the most specific tool for your needs:

**Good:**
```
"What's alice's ranking?"
→ Uses get_contributor_ranking (optimized)
```

**Less Efficient:**
```
"Get the full leaderboard and find alice"
→ Queries entire leaderboard
```

## Troubleshooting

### Problem: Server not appearing in Claude

**Solution:**
1. Check config file path is correct for your OS
2. Verify JSON syntax
3. Use absolute paths, not relative paths
4. Restart Claude Desktop
5. Check Claude Desktop logs

### Problem: Empty results

**Solution:**
1. Verify database has data
2. Check date range filters aren't too restrictive
3. Try querying without filters first
4. Check contributor/activity exists

### Problem: Performance issues

**Solution:**
1. Use pagination for large result sets
2. Apply filters to reduce data volume
3. Use batch operations for multiple queries
4. Check database indexes are in place

## Advanced Usage

### Custom Scripts

You can also use the MCP server programmatically:

```typescript
import { createMCPServer } from '@leaderboard/mcp-server';

const server = createMCPServer({
  name: 'leaderboard-mcp',
  version: '0.1.0',
  transport: 'stdio',
  dataDir: './data'
});

// Server is now ready to accept MCP requests
```

### HTTP API

When running in HTTP mode, the server exposes MCP over HTTP:

```bash
# Start server
leaderboard-mcp --transport http --port 3001

# Server listens on http://localhost:3001
```

## Support

- [Main Documentation](../../README.md)
- [MCP Server README](./README.md)
- [Issues](https://github.com/ohcnetwork/leaderboard/issues)
- [Model Context Protocol Docs](https://modelcontextprotocol.io)
