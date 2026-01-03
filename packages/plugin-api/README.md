# @leaderboard/plugin-api

Plugin API types and interfaces for the leaderboard system.

## Installation

```bash
npm install @leaderboard/plugin-api
```

## Usage

```typescript
import type { Plugin, PluginContext } from '@leaderboard/plugin-api';

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

## License

MIT

