# @ohcnetwork/leaderboard-api

Unified API package combining database utilities, schema definitions, query helpers, and plugin type definitions for the leaderboard system.

## Installation

```bash
npm install @ohcnetwork/leaderboard-api
```

## Usage

### Plugin Development

```typescript
import type { Plugin, PluginContext } from '@ohcnetwork/leaderboard-api';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  async setup(ctx: PluginContext) {
    // Initialize activity definitions
    await ctx.db.execute(`
      INSERT OR IGNORE INTO activity_definition (slug, name, description, points)
      VALUES (?, ?, ?, ?)
    `, ['my_activity', 'My Activity', 'Description', 10]);
  },
  
  async scrape(ctx: PluginContext) {
    // Fetch and store activities
    const data = await fetchData(ctx.config);
    // Insert activities into database
  },
};

export default myPlugin;
```

### Database Usage

```typescript
import { createDatabase, initializeSchema } from '@ohcnetwork/leaderboard-api';

const db = createDatabase('file:./leaderboard.db');
await initializeSchema(db);
```

### Query Helpers

```typescript
import { contributorQueries, activityQueries } from '@ohcnetwork/leaderboard-api';

// Get all contributors
const contributors = await contributorQueries.getAll(db);

// Get leaderboard
const leaderboard = await activityQueries.getLeaderboard(db, 10);
```

### Generate Seed Data

```bash
pnpm seed --output=./test-data
```

## Type Definitions

This package exports all core types used throughout the leaderboard system:

- `Database` - Database interface abstraction
- `Plugin` - Plugin interface
- `PluginContext` - Context passed to plugin methods
- `Contributor` - Contributor data structure
- `Activity` - Activity data structure
- `ActivityDefinition` - Activity definition data structure
- And more...

## License

MIT

