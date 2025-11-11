# Scrapers Directory

This directory contains scripts for scraping and updating contributor data.

## Available Scripts

### 1. Update Roles and Slack (`update-roles.ts`)

Automatically updates contributor roles and Slack user IDs from the [ohcnetwork/leaderboard-data](https://github.com/ohcnetwork/leaderboard-data) repository.

#### Quick Start

```bash
pnpm update-roles
```

#### What It Does

- Fetches all contributors from the database
- For each contributor, fetches their markdown file from GitHub
- Extracts `role` and `slack` fields from the frontmatter
- Updates the database:
  - `role` → stored in `contributor.role` column
  - `slack` → stored in `contributor.meta.slack_user_id`

#### Documentation

- 📖 **[UPDATE_ROLES_README.md](./UPDATE_ROLES_README.md)** - Comprehensive documentation
- 📝 **[EXAMPLE_USAGE.md](./EXAMPLE_USAGE.md)** - Usage examples and troubleshooting
- 🔄 **[FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md)** - Visual flow diagrams
- 🎯 **[REAL_EXAMPLE.md](./REAL_EXAMPLE.md)** - Real-world examples
- 📊 **[UPDATE_SUMMARY.md](./UPDATE_SUMMARY.md)** - Technical summary

#### Features

✅ Extracts both role and Slack ID  
✅ Handles partial data (only role or only slack)  
✅ Robust error handling  
✅ Detailed logging and statistics  
✅ 10 comprehensive tests (all passing)  
✅ Idempotent (safe to run multiple times)  
✅ Preserves existing meta data  

#### Example Output

```
🚀 Starting role update process...

📊 Found 150 contributors in database

Processing: 07Akashh
  ✅ Updated role: contributor

Processing: bodhish
  ✅ Updated role: maintainer, slack_user_id: U12345ABC

==================================================
📈 Summary:
  ✅ Successfully updated: 145
  ⚠️  Markdown not found: 3
  ⚠️  No role or slack in frontmatter: 2
  ❌ Errors: 0
  📊 Total processed: 150
==================================================
```

### 2. GitHub Scrapers (`github/`)

Scripts for scraping GitHub activity data.

### 3. Slack Scrapers (`slack/`)

Scripts for scraping Slack activity data.

### 4. Prepare Script (`prepare.ts`)

Preparation script for setting up the database.

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/update-roles.test.ts

# Run with coverage
pnpm test:coverage
```

## Development

### Adding a New Scraper

1. Create a new TypeScript file in the appropriate directory
2. Follow the existing patterns for error handling and logging
3. Add tests in the `tests/` directory
4. Document your scraper in this README
5. Add a script entry in `package.json` if needed

### Code Style

- Use TypeScript with strict type checking
- Add JSDoc comments for functions
- Handle errors gracefully
- Provide detailed logging
- Write tests for new functionality

## Database Schema

The scrapers work with the following schema:

```sql
CREATE TABLE contributor (
    username                VARCHAR PRIMARY KEY,
    name                    VARCHAR,
    role                    VARCHAR,
    avatar_url              VARCHAR,
    profile_url             VARCHAR,
    email                   VARCHAR,
    bio                     TEXT,
    meta                    JSON
);

CREATE TABLE activity_definition (
    slug                    VARCHAR PRIMARY KEY,
    name                    VARCHAR,
    description             TEXT,
    points                  SMALLINT
);

CREATE TABLE activity (
    slug                    VARCHAR PRIMARY KEY,
    contributor             VARCHAR REFERENCES contributor(username),
    activity_definition     VARCHAR REFERENCES activity_definition(slug),
    title                   VARCHAR,
    occured_at              TIMESTAMP,
    link                    VARCHAR,
    text                    TEXT,
    points                  SMALLINT,
    meta                    JSON
);
```

## Common Tasks

### Check Current Data

```bash
tsx test.ts
```

### Update All Roles and Slack IDs

```bash
pnpm update-roles
```

### Query Database

```typescript
import { getDb } from "@/lib/db";

const db = getDb();

// Get all contributors with roles
const result = await db.query(
  "SELECT username, role, meta->>'slack_user_id' as slack_user_id FROM contributor"
);
console.log(result.rows);
```

## Troubleshooting

### Database Not Found

Make sure you've initialized the database first by running the appropriate setup scripts.

### Network Errors

If you're hitting rate limits, consider:
- Adding delays between requests
- Using GitHub API with authentication
- Running the script during off-peak hours

### TypeScript Errors

Ensure you're running from the project root and all dependencies are installed:

```bash
pnpm install
```

## Contributing

When contributing new scrapers:

1. Follow the existing code patterns
2. Add comprehensive error handling
3. Write tests for your code
4. Document your changes
5. Update this README

## License

MIT - See LICENSE file for details

