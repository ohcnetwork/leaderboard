# Update Roles and Slack Script

This script updates contributor roles and Slack user IDs in the database by fetching information from the [leaderboard-data repository](https://github.com/ohcnetwork/leaderboard-data).

## Overview

The script performs the following steps:

1. **Fetches all contributors** from the local database
2. **For each contributor**, fetches their markdown file from:
   ```
   https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors/{username}.md
   ```
3. **Extracts the role and slack** from the markdown frontmatter
4. **Updates the role and slack_user_id** in the database (role in `role` column, slack in `meta.slack_user_id`)

## Usage

Run the script using npm/pnpm:

```bash
pnpm update-roles
```

Or directly with tsx:

```bash
tsx scrapers/update-roles.ts
```

## Markdown Format

The script expects markdown files with YAML frontmatter in the following format:

```markdown
---
name: Rahul
title: Contributor
github: 07Akashh
twitter: ""
linkedin: ""
slack: U12345ABC
joining_date: ""
role: contributor
---

Additional content here...
```

The script extracts the `role` and `slack` fields from the frontmatter.

- **`role`**: Stored directly in the `contributor.role` column
- **`slack`**: Stored in the `contributor.meta` JSON column as `slack_user_id` (only if not empty)

## Supported Role Values

The script can handle any role value, including but not limited to:
- `contributor`
- `maintainer`
- `admin`
- `reviewer`
- `mentor`

## Output

The script provides detailed console output showing:
- Progress for each contributor
- Success/failure status
- Summary statistics at the end

Example output:

```
🚀 Starting role update process...

📊 Found 150 contributors in database

Processing: 07Akashh
  ✅ Updated role: contributor, slack_user_id: U12345ABC

Processing: bodhish
  ✅ Updated role: maintainer, slack_user_id: U67890DEF

Processing: user-no-slack
  ✅ Updated role: contributor

Processing: unknown-user
  ⚠️  Markdown file not found for unknown-user

==================================================
📈 Summary:
  ✅ Successfully updated: 145
  ⚠️  Markdown not found: 3
  ⚠️  No role or slack in frontmatter: 2
  ❌ Errors: 0
  📊 Total processed: 150
==================================================
```

## Error Handling

The script handles various error scenarios:

- **404 Not Found**: If a contributor's markdown file doesn't exist
- **No Frontmatter**: If the markdown file doesn't have frontmatter
- **Missing Role and Slack**: If the frontmatter doesn't contain `role` or `slack` fields
- **Empty Slack**: Empty slack values (`""`) are treated as null and not stored
- **Network Errors**: If there are issues fetching from GitHub

All errors are logged but don't stop the script from processing other contributors.

The script will update:
- **Both role and slack** if both are present
- **Only role** if slack is missing or empty
- **Only slack** if role is missing
- **Skip** if both are missing

## Testing

The role extraction logic is tested in `tests/update-roles.test.ts`. Run tests with:

```bash
pnpm test tests/update-roles.test.ts
```

## Implementation Details

### Data Extraction

The script uses regex to extract role and slack from YAML frontmatter:

1. Matches frontmatter between `---` delimiters
2. Finds the `role:` and `slack:` fields
3. Extracts and trims the values
4. Removes surrounding quotes if present
5. Treats empty strings as null

### Database Update

The script uses parameterized SQL queries to safely update data:

**Update both role and slack:**
```sql
UPDATE contributor 
SET role = $1, 
    meta = COALESCE(meta, '{}'::json)::jsonb || $2::jsonb 
WHERE username = $3;
```

**Update only role:**
```sql
UPDATE contributor SET role = $1 WHERE username = $2;
```

**Update only slack:**
```sql
UPDATE contributor 
SET meta = COALESCE(meta, '{}'::json)::jsonb || $1::jsonb 
WHERE username = $2;
```

The slack ID is stored in the `meta` JSON column as `slack_user_id`. The `COALESCE` function ensures existing meta data is preserved and merged with the new slack_user_id.

This prevents SQL injection and handles special characters properly.

## Dependencies

- `@/lib/db` - Database functions
- `fetch` - Built-in Node.js fetch for HTTP requests

No additional dependencies are required.

