# Real Example - Update Roles and Slack

This document shows a real example using the actual markdown file from the repository.

## Source Data

**URL:** `https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors/07Akashh.md`

**Content:**
```markdown
---
name: Rahul
title: Contributor
github: 07Akashh
twitter: ""
linkedin: ""
slack: ""
joining_date: ""
role: contributor
---

Still waiting for this
```

## Script Execution

### Step 1: Fetch Markdown

```typescript
const url = "https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors/07Akashh.md";
const response = await fetch(url);
const markdown = await response.text();
```

### Step 2: Extract Frontmatter

```typescript
const { role, slack } = extractFrontmatterData(markdown);
// Result:
// role = "contributor"
// slack = null (because it's empty string "")
```

### Step 3: Update Database

Since we have role but slack is null (empty string):

```sql
UPDATE contributor 
SET role = 'contributor' 
WHERE username = '07Akashh';
```

### Console Output

```
Processing: 07Akashh
  ✅ Updated role: contributor
```

## Different Scenarios

### Scenario 1: User with Both Role and Slack

**Markdown:**
```markdown
---
name: John Doe
role: maintainer
slack: U12345ABC
---
```

**Extraction:**
```typescript
{ role: "maintainer", slack: "U12345ABC" }
```

**SQL:**
```sql
UPDATE contributor 
SET role = 'maintainer', 
    meta = COALESCE(meta, '{}'::json)::jsonb || '{"slack_user_id": "U12345ABC"}'::jsonb 
WHERE username = 'johndoe';
```

**Output:**
```
Processing: johndoe
  ✅ Updated role: maintainer, slack_user_id: U12345ABC
```

### Scenario 2: User with Only Slack

**Markdown:**
```markdown
---
name: Jane Smith
slack: U67890DEF
---
```

**Extraction:**
```typescript
{ role: null, slack: "U67890DEF" }
```

**SQL:**
```sql
UPDATE contributor 
SET meta = COALESCE(meta, '{}'::json)::jsonb || '{"slack_user_id": "U67890DEF"}'::jsonb 
WHERE username = 'janesmith';
```

**Output:**
```
Processing: janesmith
  ✅ Updated slack_user_id: U67890DEF
```

### Scenario 3: User with Empty Slack (like 07Akashh)

**Markdown:**
```markdown
---
name: Rahul
role: contributor
slack: ""
---
```

**Extraction:**
```typescript
{ role: "contributor", slack: null }  // Empty string converted to null
```

**SQL:**
```sql
UPDATE contributor 
SET role = 'contributor' 
WHERE username = '07Akashh';
```

**Output:**
```
Processing: 07Akashh
  ✅ Updated role: contributor
```

### Scenario 4: User Not Found

**URL:** `https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors/nonexistent.md`

**Response:** 404 Not Found

**Output:**
```
Processing: nonexistent
  ⚠️  Markdown file not found for nonexistent
```

### Scenario 5: User with No Role or Slack

**Markdown:**
```markdown
---
name: Bob Johnson
title: Developer
---
```

**Extraction:**
```typescript
{ role: null, slack: null }
```

**Output:**
```
Processing: bobjohnson
  ⚠️  No role or slack found in frontmatter for bobjohnson
```

## Database State Changes

### Before Running Script

```sql
SELECT username, role, meta FROM contributor WHERE username = '07Akashh';
```

| username | role | meta |
|----------|------|------|
| 07Akashh | NULL | NULL |

### After Running Script

```sql
SELECT username, role, meta FROM contributor WHERE username = '07Akashh';
```

| username | role        | meta |
|----------|-------------|------|
| 07Akashh | contributor | NULL |

### Example with Slack ID

**Before:**
| username | role | meta |
|----------|------|------|
| bodhish  | NULL | NULL |

**After:**
| username | role       | meta                              |
|----------|------------|-----------------------------------|
| bodhish  | maintainer | {"slack_user_id": "U12345ABC"}   |

## Verifying Results

### Check Updated Roles

```sql
SELECT username, role 
FROM contributor 
WHERE role IS NOT NULL 
ORDER BY username;
```

### Check Updated Slack IDs

```sql
SELECT username, meta->>'slack_user_id' as slack_user_id 
FROM contributor 
WHERE meta->>'slack_user_id' IS NOT NULL 
ORDER BY username;
```

### Check Both

```sql
SELECT 
  username, 
  role, 
  meta->>'slack_user_id' as slack_user_id 
FROM contributor 
WHERE role IS NOT NULL OR meta->>'slack_user_id' IS NOT NULL 
ORDER BY username;
```

## Full Script Run Example

```bash
$ pnpm update-roles

🚀 Starting role update process...

📊 Found 150 contributors in database

Processing: 07Akashh
  ✅ Updated role: contributor

Processing: bodhish
  ✅ Updated role: maintainer, slack_user_id: U12345ABC

Processing: rithviknishad
  ✅ Updated role: maintainer, slack_user_id: U67890DEF

Processing: someuser
  ⚠️  Markdown file not found for someuser

Processing: anotheruser
  ⚠️  No role or slack found in frontmatter for anotheruser

...

==================================================
📈 Summary:
  ✅ Successfully updated: 145
  ⚠️  Markdown not found: 3
  ⚠️  No role or slack in frontmatter: 2
  ❌ Errors: 0
  📊 Total processed: 150
==================================================
```

## TypeScript Usage in Code

```typescript
import { getDb } from "@/lib/db";

async function checkUserData(username: string) {
  const db = getDb();
  
  const result = await db.query<{
    username: string;
    role: string | null;
    slack_user_id: string | null;
  }>(
    `SELECT 
      username, 
      role, 
      meta->>'slack_user_id' as slack_user_id 
    FROM contributor 
    WHERE username = $1`,
    [username]
  );
  
  const user = result.rows[0];
  
  if (user) {
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role || 'Not set'}`);
    console.log(`Slack: ${user.slack_user_id || 'Not set'}`);
  }
}

// Usage
await checkUserData('07Akashh');
// Output:
// Username: 07Akashh
// Role: contributor
// Slack: Not set
```

