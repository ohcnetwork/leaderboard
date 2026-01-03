# @leaderboard/db

Database utilities, schema, and query helpers for the leaderboard system.

## Installation

```bash
npm install @leaderboard/db
```

## Usage

### Initialize Database

```typescript
import { createDatabase, initializeSchema } from '@leaderboard/db';

const db = createDatabase('file:./leaderboard.db');
await initializeSchema(db);
```

### Query Helpers

```typescript
import { contributorQueries, activityQueries } from '@leaderboard/db';

// Get all contributors
const contributors = await contributorQueries.getAll(db);

// Get leaderboard
const leaderboard = await activityQueries.getLeaderboard(db, 10);
```

### Generate Seed Data

```bash
pnpm seed --output=./test-data
```

## License

MIT

