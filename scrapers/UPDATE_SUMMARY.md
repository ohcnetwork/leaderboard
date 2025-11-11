# Update Roles and Slack Script - Summary

## What Was Built

A comprehensive script to automatically update contributor roles and Slack user IDs from the [ohcnetwork/leaderboard-data](https://github.com/ohcnetwork/leaderboard-data) repository.

## Key Features

### 1. **Dual Data Extraction**
- Extracts both `role` and `slack` fields from markdown frontmatter
- Handles partial data (only role, only slack, or both)
- Treats empty strings as null values

### 2. **Smart Database Updates**
- Updates `role` column directly
- Stores `slack_user_id` in the `meta` JSON column
- Preserves existing meta data when adding slack_user_id
- Uses conditional logic to update only available fields

### 3. **Robust Error Handling**
- Continues processing even if individual contributors fail
- Handles 404s, network errors, missing frontmatter
- Provides detailed logging for each contributor
- Summary statistics at the end

### 4. **Well Tested**
- 10 comprehensive test cases covering all scenarios
- Tests for quotes, whitespace, empty values, partial data
- All tests passing ✅

## Files Created/Modified

### Created Files
1. **`scrapers/update-roles.ts`** - Main script (183 lines)
2. **`tests/update-roles.test.ts`** - Test suite (182 lines, 10 tests)
3. **`scrapers/UPDATE_ROLES_README.md`** - Comprehensive documentation
4. **`scrapers/EXAMPLE_USAGE.md`** - Usage examples and troubleshooting
5. **`scrapers/UPDATE_SUMMARY.md`** - This file

### Modified Files
1. **`package.json`** - Added `update-roles` script
2. **`test.ts`** - Updated to show slack_user_id

## Usage

```bash
# Run the script
pnpm update-roles

# Run tests
pnpm test tests/update-roles.test.ts

# Check current data
tsx test.ts
```

## Example Output

```
🚀 Starting role update process...

📊 Found 150 contributors in database

Processing: 07Akashh
  ✅ Updated role: contributor, slack_user_id: U12345ABC

Processing: bodhish
  ✅ Updated role: maintainer, slack_user_id: U67890DEF

Processing: user-no-slack
  ✅ Updated role: contributor

Processing: user-only-slack
  ✅ Updated slack_user_id: U11111GHI

==================================================
📈 Summary:
  ✅ Successfully updated: 145
  ⚠️  Markdown not found: 3
  ⚠️  No role or slack in frontmatter: 2
  ❌ Errors: 0
  📊 Total processed: 150
==================================================
```

## Technical Implementation

### Data Extraction
```typescript
interface FrontmatterData {
  role: string | null;
  slack: string | null;
}

function extractFrontmatterData(markdown: string): FrontmatterData {
  // Regex-based extraction from YAML frontmatter
  // Handles quotes, whitespace, empty strings
}
```

### Database Updates

**Both role and slack:**
```sql
UPDATE contributor 
SET role = $1, 
    meta = COALESCE(meta, '{}'::json)::jsonb || $2::jsonb 
WHERE username = $3;
```

**Only role:**
```sql
UPDATE contributor SET role = $1 WHERE username = $2;
```

**Only slack:**
```sql
UPDATE contributor 
SET meta = COALESCE(meta, '{}'::json)::jsonb || $1::jsonb 
WHERE username = $2;
```

## Database Schema

The script works with the existing schema:

```sql
CREATE TABLE contributor (
    username                VARCHAR PRIMARY KEY,
    name                    VARCHAR,
    role                    VARCHAR,          -- Updated directly
    avatar_url              VARCHAR,
    profile_url             VARCHAR,
    email                   VARCHAR,
    bio                     TEXT,
    meta                    JSON              -- slack_user_id stored here
);
```

## Querying Updated Data

```sql
-- Get all contributors with roles
SELECT username, role FROM contributor WHERE role IS NOT NULL;

-- Get all contributors with Slack IDs
SELECT username, meta->>'slack_user_id' as slack_user_id 
FROM contributor 
WHERE meta->>'slack_user_id' IS NOT NULL;

-- Get both
SELECT username, role, meta->>'slack_user_id' as slack_user_id 
FROM contributor 
WHERE role IS NOT NULL OR meta->>'slack_user_id' IS NOT NULL;
```

## Benefits

1. **Automated**: No manual data entry required
2. **Reliable**: Comprehensive error handling and testing
3. **Maintainable**: Well-documented with examples
4. **Flexible**: Handles partial data gracefully
5. **Safe**: Idempotent, can be run multiple times
6. **Preserves Data**: Merges into meta without overwriting other fields

## Future Enhancements

Potential improvements:
- Add rate limiting for large datasets
- Support for more frontmatter fields (twitter, linkedin, etc.)
- Dry-run mode to preview changes
- Diff output showing what changed
- GitHub API authentication for higher rate limits
- Parallel processing for faster execution

