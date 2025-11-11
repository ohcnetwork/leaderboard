# Example Usage: Update Roles and Slack Script

## Quick Start

```bash
# Run the script to update all contributor roles and Slack IDs
pnpm update-roles
```

## What Happens

The script will:

1. Connect to your local PGlite database
2. Fetch all contributors from the `contributor` table
3. For each contributor:
   - Fetch their markdown file from GitHub
   - Extract the `role` and `slack` fields from the frontmatter
   - Update their role and slack_user_id in the database

## Example Scenario

Let's say you have these contributors in your database:

| Username | Name | Role (before) | Meta (before) |
|----------|------|---------------|---------------|
| 07Akashh | NULL | NULL | NULL |
| bodhish | NULL | NULL | NULL |
| rithviknishad | NULL | NULL | NULL |

After running `pnpm update-roles`, the script will:

1. Fetch `https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors/07Akashh.md`
2. Extract role: `contributor`, slack: `U12345ABC`
3. Update database:
   ```sql
   UPDATE contributor 
   SET role = 'contributor', 
       meta = COALESCE(meta, '{}'::json)::jsonb || '{"slack_user_id": "U12345ABC"}'::jsonb 
   WHERE username = '07Akashh'
   ```

And repeat for all contributors.

Final result:

| Username | Name | Role (after) | Meta (after) |
|----------|------|--------------|--------------|
| 07Akashh | NULL | contributor | {"slack_user_id": "U12345ABC"} |
| bodhish | NULL | maintainer | {"slack_user_id": "U67890DEF"} |
| rithviknishad | NULL | maintainer | {"slack_user_id": "U11111GHI"} |

## Testing the Script

Before running on your production database, you can test with a single user:

```typescript
// test-single-user.ts
import { getDb } from "@/lib/db";

async function testSingleUser() {
  const db = getDb();
  
  // Check current role and meta
  const before = await db.query(
    "SELECT username, role, meta FROM contributor WHERE username = $1",
    ["07Akashh"]
  );
  console.log("Before:", before.rows[0]);
  
  // Run update-roles script here...
  
  // Check updated role and meta
  const after = await db.query(
    "SELECT username, role, meta FROM contributor WHERE username = $1",
    ["07Akashh"]
  );
  console.log("After:", after.rows[0]);
}

testSingleUser();
```

## Handling Edge Cases

### Missing Markdown Files

If a contributor doesn't have a markdown file in the leaderboard-data repo:

```
Processing: unknown-user
  ⚠️  Markdown file not found for unknown-user
```

The script will skip this user and continue with the next one.

### Missing Role and Slack Fields

If a markdown file exists but doesn't have `role` or `slack` fields:

```
Processing: incomplete-profile
  ⚠️  No role or slack found in frontmatter for incomplete-profile
```

The script will skip this user and their data will remain unchanged.

### Partial Data

If only one field is present, the script will update only that field:

```
Processing: user-with-only-role
  ✅ Updated role: contributor

Processing: user-with-only-slack
  ✅ Updated slack_user_id: U12345ABC
```

### Network Errors

If there's a network issue:

```
Processing: some-user
  ❌ Error fetching markdown for some-user: fetch failed
```

The script will log the error and continue with the next user.

## Verifying Results

After running the script, you can verify the results:

```bash
# Check updated roles in database
tsx test.ts
```

Or query directly:

```typescript
import { getDb } from "@/lib/db";

const db = getDb();
const result = await db.query(
  "SELECT username, role, meta FROM contributor WHERE role IS NOT NULL LIMIT 10"
);
console.log(result.rows);

// To check slack_user_id specifically
const withSlack = await db.query(
  "SELECT username, role, meta->>'slack_user_id' as slack_user_id FROM contributor WHERE meta->>'slack_user_id' IS NOT NULL LIMIT 10"
);
console.log(withSlack.rows);
```

## Re-running the Script

The script is idempotent - you can run it multiple times safely. It will:
- Update roles and slack IDs that have changed
- Skip users with no markdown file
- Overwrite existing roles with new values from GitHub
- Merge slack_user_id into existing meta data (preserves other meta fields)

## Automation

You can add this to your CI/CD pipeline or run it on a schedule:

```yaml
# .github/workflows/update-roles.yml
name: Update Contributor Roles

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:  # Manual trigger

jobs:
  update-roles:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm update-roles
```

## Troubleshooting

### Database Not Found

```
Error: Failed to initialize PGlite
```

**Solution**: Make sure you've run the scrapers to populate the database first.

### Rate Limiting

If you have many contributors, GitHub may rate limit your requests.

**Solution**: Add a delay between requests or use GitHub API with authentication.

### TypeScript Errors

```
Cannot find module '@/lib/db'
```

**Solution**: Make sure you're running from the project root and tsconfig paths are configured correctly.

