# Leaderboard Project - Specialized Agent Workflows

This document provides specialized workflows for different types of tasks in the leaderboard system. Each agent represents a specific role with its own workflow, considerations, and best practices.

---

## Agent: Plugin Developer

**Purpose**: Create and test new data source plugins for the leaderboard system.

### Workflow

1. **Scaffold Plugin Project**
   ```bash
   pnpm create-leaderboard-plugin <path>
   # Example: pnpm create-leaderboard-plugin ../leaderboard-github-plugin
   ```
   
   The CLI will prompt for:
   - Plugin name (e.g., 'github', 'slack', 'jira')
   - Plugin description
   - Author name
   
   This generates a complete project structure with:
   - `package.json` with correct dependencies
   - `tsconfig.json` with proper configuration
   - `vitest.config.ts` for testing
   - `src/index.ts` with plugin template
   - `src/__tests__/plugin.test.ts` with test examples
   - `README.md` with documentation

2. **Implement Setup Method**
   
   Define activity types in the `setup()` method:
   ```typescript
   import { activityDefinitionQueries } from "@ohcnetwork/leaderboard-api";
   
   async setup(ctx: PluginContext): Promise<void> {
     // Define all activity types your plugin will track
     await activityDefinitionQueries.upsert(ctx.db, {
       slug: "pr_opened",
       name: "Pull Request Opened",
       description: "Opened a pull request",
       points: 5,
       meta: { icon: "git-pull-request" },
     });
     
     await activityDefinitionQueries.upsert(ctx.db, {
       slug: "pr_merged",
       name: "Pull Request Merged",
       description: "Had a pull request merged",
       points: 10,
       meta: { icon: "git-merge" },
     });
   }
   ```

3. **Implement Scrape Method**
   
   Fetch and store activities:
   ```typescript
   import { activityQueries, contributorQueries } from "@ohcnetwork/leaderboard-api";
   
   async scrape(ctx: PluginContext): Promise<void> {
     const { apiToken, organization } = ctx.config;
     
     // Fetch data from external API
     const prs = await fetchPullRequests(apiToken, organization);
     
     for (const pr of prs) {
       // Ensure contributor exists
       await contributorQueries.upsert(ctx.db, {
         username: pr.author.login,
         name: pr.author.name,
         role: "contributor", // or determine from your logic
         avatar_url: pr.author.avatar_url,
       });
       
       // Store activity
       await activityQueries.create(ctx.db, {
         slug: `pr-${pr.id}`,
         contributor: pr.author.login,
         activity_definition: pr.merged ? "pr_merged" : "pr_opened",
         title: pr.title,
         occured_at: pr.created_at,
         link: pr.html_url,
         points: pr.merged ? 10 : 5,
         meta: {
           repository: pr.repository,
           additions: pr.additions,
           deletions: pr.deletions,
         },
       });
     }
     
     ctx.logger.info(`Processed ${prs.length} pull requests`);
   }
   ```

4. **Use Query Builders**
   
   Always use provided query builders from the API package:
   - `contributorQueries`: create, upsert, getByUsername, getAll, etc.
   - `activityQueries`: create, getByContributor, getByDateRange, etc.
   - `activityDefinitionQueries`: upsert, getBySlug, getAll, etc.

5. **Write Tests**
   
   Create comprehensive tests in `src/__tests__/plugin.test.ts`:
   ```typescript
   import { describe, it, expect, beforeEach, afterEach } from "vitest";
   import { createDatabase, initializeSchema } from "@ohcnetwork/leaderboard-api";
   import plugin from "../index";
   
   describe("My Plugin", () => {
     let db: Database;
     
     beforeEach(async () => {
       db = createDatabase(":memory:");
       await initializeSchema(db);
     });
     
     afterEach(async () => {
       await db.close();
     });
     
     it("should define activity types in setup", async () => {
       const ctx = {
         db,
         config: {},
         orgConfig: { /* mock org config */ },
         logger: createLogger(false),
       };
       
       await plugin.setup(ctx);
       
       const definitions = await activityDefinitionQueries.getAll(db);
       expect(definitions.length).toBeGreaterThan(0);
     });
     
     // More tests...
   });
   ```

6. **Export as ES Module**
   
   Ensure your plugin exports correctly:
   ```typescript
   import type { Plugin } from "@ohcnetwork/leaderboard-api";
   
   export default {
     name: "my-plugin",
     version: "1.0.0",
     setup,
     scrape,
   } satisfies Plugin;
   ```

7. **Test with Plugin Runner**
   
   Build and test your plugin:
   ```bash
   pnpm build
   pnpm test
   
   # Test with actual plugin runner
   cd /path/to/leaderboard-monorepo
   # Update config.yaml to point to your plugin
   pnpm data:scrape
   ```

8. **Deploy and Configure**
   
   - Build your plugin: `pnpm build`
   - Deploy `dist/index.js` to a accessible URL (GitHub raw, CDN, etc.)
   - Configure in data repository's `config.yaml`:
     ```yaml
     leaderboard:
       plugins:
         my-plugin:
           name: My Plugin
           source: https://example.com/plugins/my-plugin/manifest.js
           config:
             apiToken: ${{ env.MY_API_TOKEN }}
             organization: my-org
     ```

### Key Files
- [`docs/plugins/creating-plugins.mdx`](docs/plugins/creating-plugins.mdx) - Complete plugin development guide
- [`packages/plugin-dummy/src/index.ts`](packages/plugin-dummy/src/index.ts) - Reference implementation
- [`packages/api/src/types.ts`](packages/api/src/types.ts) - Plugin interface and types
- [`packages/api/src/queries.ts`](packages/api/src/queries.ts) - Available query builders

### Tips
- Keep plugins focused on one data source
- Use bulk operations for better performance
- Log progress for debugging
- Handle API rate limits gracefully
- Cache responses when appropriate
- Use environment variables for secrets
- Test with realistic data volumes

---

## Agent: Data Repository Manager

**Purpose**: Set up and manage data repositories for organizations using the leaderboard system.

### Workflow

1. **Initialize Data Repository**
   ```bash
   pnpm create-data-repo <path>
   # Example: pnpm create-data-repo ../my-org-leaderboard-data
   ```
   
   Interactive prompts will collect:
   - Organization name, description, URL, logo
   - Social media links (GitHub, Slack, LinkedIn, YouTube, email)
   - SEO metadata (title, description, images, site URL)
   - Data source repository URL
   - Optional custom theme CSS URL
   - Roles (with option for defaults: core, contributor)

2. **Review Generated Structure**
   ```
   my-org-leaderboard-data/
   ├── config.yaml           # Organization configuration
   ├── README.md            # Repository documentation
   ├── .gitignore           # Git ignore rules
   ├── contributors/        # Contributor profiles (empty)
   └── activities/          # Activity records (empty)
   ```

3. **Configure Plugins**
   
   Edit `config.yaml` to uncomment and configure plugins:
   ```yaml
   leaderboard:
     plugins:
       github:
         name: GitHub Plugin
         source: https://raw.githubusercontent.com/org/plugin/main/manifest.js
         config:
           githubToken: ${{ env.GITHUB_TOKEN }}
           githubOrg: my-org
           repositories:
             - repo1
             - repo2
       
       slack:
         name: Slack Plugin
         source: https://raw.githubusercontent.com/org/plugin/main/manifest.js
         config:
           slackApiToken: ${{ env.SLACK_API_TOKEN }}
           slackChannel: ${{ env.SLACK_CHANNEL }}
   ```

4. **Set Environment Variables**
   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
   export SLACK_API_TOKEN=xoxb-xxxxxxxxxxxxx
   export LEADERBOARD_DATA_DIR=/path/to/my-org-leaderboard-data
   ```

5. **Add Contributor Profiles (Optional)**
   
   Manually create contributor Markdown files if needed:
   ```bash
   cd contributors
   cat > alice.md << 'EOF'
   ---
   username: alice
   name: Alice Smith
   role: core
   title: Senior Engineer
   avatar_url: https://github.com/alice.png
   social_profiles:
     github: https://github.com/alice
     linkedin: https://linkedin.com/in/alice-smith
   joining_date: 2020-01-15
   ---
   
   Alice is a senior engineer specializing in backend systems.
   EOF
   ```

6. **Run Data Collection**
   ```bash
   cd /path/to/leaderboard-monorepo
   pnpm data:scrape
   ```
   
   This will:
   - Import existing contributors and activities
   - Run plugin setup methods
   - Scrape new activities from configured sources
   - Compute aggregates
   - Evaluate badge rules
   - Export updated data back to files

7. **Commit and Push**
   ```bash
   cd /path/to/my-org-leaderboard-data
   git add contributors/ activities/ aggregates/ badges/
   git commit -m "Update leaderboard data"
   git push
   ```

8. **Configure Aggregates (Optional)**
   
   Create `aggregates/definitions.json` for custom metrics:
   ```json
   {
     "definitions": [
       {
         "slug": "custom_metric",
         "name": "Custom Metric",
         "description": "A custom metric",
         "type": "contributor",
         "query": "SELECT COUNT(*) FROM activity WHERE contributor = :username"
       }
     ]
   }
   ```

9. **Configure Badges (Optional)**
   
   Create `badges/definitions.json` for achievements:
   ```json
   {
     "badges": [
       {
         "slug": "early_bird",
         "name": "Early Bird",
         "description": "Joined in the first year",
         "icon": "star",
         "rule": {
           "type": "count",
           "min": 1,
           "filter": {
             "joining_date_before": "2021-01-01"
           }
         }
       }
     ]
   }
   ```

### Key Files
- [`docs/getting-started/index.mdx`](docs/getting-started/index.mdx) - Setup guide
- [`docs/data-management.mdx`](docs/data-management.mdx) - Data management patterns
- [`docs/getting-started/configuration.mdx`](docs/getting-started/configuration.mdx) - Config reference
- [`apps/leaderboard-web/config.example.yaml`](apps/leaderboard-web/config.example.yaml) - Example configuration

### Tips
- Use environment variables for all secrets
- Keep data repository separate from code repository
- Commit contributor and activity files to git
- Run scraping on a schedule (cron job, GitHub Actions)
- Review generated data before committing
- Use custom themes for branding
- Document your organization's specific setup

---

## Agent: Query Optimizer

**Purpose**: Optimize database queries and aggregations for performance.

### Workflow

1. **Identify Slow Queries**
   
   Enable debug logging to see query execution:
   ```bash
   DEBUG=true pnpm data:scrape
   ```
   
   Look for log messages showing query duration.

2. **Use Query Builders First**
   
   Start with provided query builders from [`packages/api/src/queries.ts`](packages/api/src/queries.ts):
   ```typescript
   import { contributorQueries, activityQueries } from "@ohcnetwork/leaderboard-api";
   
   // Optimized queries with proper indexes
   const activities = await activityQueries.getByContributor(db, "alice");
   const recentActivities = await activityQueries.getByDateRange(
     db,
     new Date("2024-01-01"),
     new Date("2024-12-31")
   );
   ```

3. **Write Custom SQL for Complex Queries**
   
   For complex aggregations not covered by query builders:
   ```typescript
   const result = await db.execute(`
     SELECT 
       c.username,
       c.name,
       COUNT(a.id) as activity_count,
       SUM(ad.points) as total_points,
       MAX(a.occured_at) as last_activity
     FROM contributor c
     LEFT JOIN activity a ON c.username = a.contributor
     LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
     WHERE c.role = ?
       AND a.occured_at >= ?
     GROUP BY c.username, c.name
     ORDER BY total_points DESC
     LIMIT 100
   `, ["core", "2024-01-01"]);
   ```

4. **Add Indexes for Performance**
   
   If modifying schema, add indexes for frequently queried columns:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_activity_contributor 
     ON activity(contributor);
   
   CREATE INDEX IF NOT EXISTS idx_activity_occurred_at 
     ON activity(occured_at);
   
   CREATE INDEX IF NOT EXISTS idx_activity_definition 
     ON activity(activity_definition);
   ```

5. **Test with Realistic Data**
   
   Generate large datasets for testing:
   ```bash
   pnpm setup:dev --contributors 100 --days 365
   ```
   
   Measure query performance:
   ```typescript
   const start = Date.now();
   const result = await expensiveQuery(db);
   console.log(`Query took ${Date.now() - start}ms`);
   ```

6. **Add Tests**
   
   Add performance tests in [`packages/api/src/__tests__/queries.test.ts`](packages/api/src/__tests__/queries.test.ts):
   ```typescript
   it("should query large datasets efficiently", async () => {
     // Insert 10k activities
     for (let i = 0; i < 10000; i++) {
       await activityQueries.create(db, { /* ... */ });
     }
     
     const start = Date.now();
     const result = await activityQueries.getByContributor(db, "alice");
     const duration = Date.now() - start;
     
     expect(duration).toBeLessThan(100); // Should complete in <100ms
   });
   ```

### Considerations
- **Database**: SQLite (LibSQL) - optimized for reads
- **Workload**: Read-heavy at build time, not runtime
- **Optimize for**: Static site generation speed
- **Indexes**: Critical for large datasets
- **Batch Operations**: Use `db.batch()` for bulk inserts
- **Memory**: Consider memory usage with large result sets

### Key Files
- [`packages/api/src/queries.ts`](packages/api/src/queries.ts) - Query builders
- [`packages/api/src/schema.ts`](packages/api/src/schema.ts) - Database schema
- [`packages/api/src/__tests__/queries.test.ts`](packages/api/src/__tests__/queries.test.ts) - Query tests

### Tips
- Use `EXPLAIN QUERY PLAN` to understand query execution
- Limit result sets with proper WHERE clauses
- Use pagination for large lists
- Cache computed results when appropriate
- Profile with realistic data volumes
- Consider denormalization for complex aggregations

---

## Agent: Badge System Developer

**Purpose**: Create and modify badge rules and achievements.

### Workflow

1. **Define Badge in Definitions**
   
   Create or edit `badges/definitions.json` in your data repository:
   ```json
   {
     "badges": [
       {
         "slug": "prolific_contributor",
         "name": "Prolific Contributor",
         "description": "Completed 100+ activities",
         "icon": "trophy",
         "rule": {
           "type": "count",
           "min": 100
         }
       },
       {
         "slug": "point_master",
         "name": "Point Master",
         "description": "Earned 1000+ points",
         "icon": "star",
         "rule": {
           "type": "total_points",
           "min": 1000
         }
       },
       {
         "slug": "streak_champion",
         "name": "Streak Champion",
         "description": "30-day activity streak",
         "icon": "flame",
         "rule": {
           "type": "streak",
           "min": 30
         }
       }
     ]
   }
   ```

2. **Understand Rule Types**

   **Count Rule**: Number of activities matching filters
   ```json
   {
     "slug": "pr_expert",
     "name": "PR Expert",
     "rule": {
       "type": "count",
       "min": 50,
       "filter": {
         "activity_definitions": ["pr_merged", "pr_opened"],
         "role": "core",
         "date_from": "2024-01-01",
         "date_to": "2024-12-31"
       }
     }
   }
   ```

   **Total Points Rule**: Sum of points from matching activities
   ```json
   {
     "slug": "top_scorer",
     "name": "Top Scorer",
     "rule": {
       "type": "total_points",
       "min": 500,
       "filter": {
         "date_from": "2024-01-01"
       }
     }
   }
   ```

   **Streak Rule**: Consecutive days with activity
   ```json
   {
     "slug": "daily_contributor",
     "name": "Daily Contributor",
     "rule": {
       "type": "streak",
       "min": 7,
       "filter": {
         "activity_definitions": ["*"],  // All activities
         "date_from": "2024-01-01"
       }
     }
   }
   ```

   **Per-Activity-Definition Streak**: Streak for specific activity types
   ```json
   {
     "slug": "pr_streak",
     "name": "PR Streak",
     "rule": {
       "type": "streak",
       "min": 5,
       "filter": {
         "activity_definitions": ["pr_merged"],  // Only merged PRs
       }
     }
   }
   ```

   **Multiple Activity Definition Streak**: Combined streak
   ```json
   {
     "slug": "code_review_streak",
     "name": "Code Review Streak",
     "rule": {
       "type": "streak",
       "min": 10,
       "filter": {
         "activity_definitions": ["pr_reviewed", "pr_commented"]
       }
     }
   }
   ```

   **Regex Pattern Matching**: Match activity definitions with regex
   ```json
   {
     "slug": "github_all_star",
     "name": "GitHub All Star",
     "rule": {
       "type": "count",
       "min": 100,
       "filter": {
         "activity_definitions": ["^github_.*"]  // All GitHub activities
       }
     }
   }
   ```

3. **Configure Filters**
   
   Available filters:
   - `activity_definitions`: Array of activity slugs or regex patterns (`["*"]` for all)
   - `role`: Filter by contributor role
   - `date_from`: ISO date string (YYYY-MM-DD)
   - `date_to`: ISO date string (YYYY-MM-DD)

4. **Test Badge Evaluation**
   
   Run badge evaluation:
   ```bash
   pnpm data:scrape  # Includes badge evaluation
   ```
   
   Check results in `badges/contributors/{username}.json`:
   ```json
   {
     "username": "alice",
     "badges": [
       {
         "slug": "prolific_contributor",
         "earned_at": "2024-03-15T10:30:00Z",
         "value": 150
       }
     ]
   }
   ```

5. **Debug Badge Rules**
   
   Enable debug logging:
   ```bash
   DEBUG=true pnpm data:scrape
   ```
   
   Review logs for badge evaluation details.

### Rule Types Reference

| Type | Description | Value Meaning |
|------|-------------|---------------|
| `count` | Number of matching activities | Activity count |
| `total_points` | Sum of points from activities | Total points |
| `streak` | Consecutive days with activity | Streak length (days) |

### Key Files
- [`docs/badges.mdx`](docs/badges.mdx) - Badge system documentation
- [`packages/plugin-runner/src/rules/evaluator.ts`](packages/plugin-runner/src/rules/evaluator.ts) - Badge evaluation logic
- [`packages/plugin-runner/src/rules/__tests__/evaluator.test.ts`](packages/plugin-runner/src/rules/__tests__/evaluator.test.ts) - Badge tests

### Tips
- Start with simple rules, add complexity as needed
- Test with various contributor profiles
- Use date filters for time-bound badges
- Combine multiple activity definitions for versatile badges
- Use regex patterns for flexible matching
- Document badge meanings clearly
- Consider badge hierarchy (bronze/silver/gold variants)

---

## Agent: UI Developer

**Purpose**: Modify and enhance the Next.js frontend application.

### Workflow

1. **Understand Constraints**
   - **Static Export Only**: No server-side runtime features
   - **SSG at Build Time**: All data loaded during `next build`
   - **No API Routes**: Cannot use Next.js API routes
   - **Unoptimized Images**: Image optimization disabled
   - **Data from Database**: All data from LibSQL at build time

2. **Page Structure**
   
   All pages in [`apps/leaderboard-web/app/`](apps/leaderboard-web/app/):
   ```typescript
   // app/leaderboard/page.tsx
   import { getAllContributors } from "@/lib/data/loader";
   
   export default async function LeaderboardPage() {
     // Data loaded at build time (SSG)
     const contributors = await getAllContributors();
     
     return (
       <div>
         {contributors.map(c => (
           <ContributorCard key={c.username} contributor={c} />
         ))}
       </div>
     );
   }
   ```

3. **Data Loading**
   
   Use data loaders from [`apps/leaderboard-web/lib/data/loader.ts`](apps/leaderboard-web/lib/data/loader.ts):
   ```typescript
   import {
     getAllContributors,
     getContributorByUsername,
     getActivitiesByContributor,
     getActivityDefinitions,
     getAggregates,
   } from "@/lib/data/loader";
   ```

4. **Components**
   
   Use shadcn/ui components from [`apps/leaderboard-web/components/ui/`](apps/leaderboard-web/components/ui/):
   ```typescript
   import { Button } from "@/components/ui/button";
   import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
   import { Badge } from "@/components/ui/badge";
   ```

5. **Styling**
   
   Use Tailwind CSS classes:
   ```tsx
   <div className="container mx-auto px-4 py-8">
     <h1 className="text-4xl font-bold mb-6">Leaderboard</h1>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {/* Content */}
     </div>
   </div>
   ```

6. **Theme Customization**
   
   Users can override styles via `data/theme.css`:
   ```css
   :root {
     --primary: 220 90% 56%;
     --primary-foreground: 0 0% 100%;
     /* ... other CSS variables */
   }
   ```

7. **Dynamic Routes**
   
   Generate static paths at build time:
   ```typescript
   // app/[username]/page.tsx
   import { getAllContributors, getContributorByUsername } from "@/lib/data/loader";
   
   export async function generateStaticParams() {
     const contributors = await getAllContributors();
     return contributors.map(c => ({
       username: c.username,
     }));
   }
   
   export default async function ContributorPage({
     params,
   }: {
     params: { username: string };
   }) {
     const contributor = await getContributorByUsername(params.username);
     return <div>{/* Profile content */}</div>;
   }
   ```

8. **Documentation Pages**
   
   Documentation uses Fumadocs, defined in MDX files in [`docs/`](docs/).

### Constraints Summary
- ✅ Server Components (for SSG)
- ✅ Client Components (with 'use client')
- ✅ Static generation (generateStaticParams)
- ✅ Tailwind CSS
- ❌ Server-side runtime (no SSR)
- ❌ API routes
- ❌ Image optimization
- ❌ Dynamic data at runtime

### Key Files
- [`apps/leaderboard-web/app/`](apps/leaderboard-web/app/) - Pages and layouts
- [`apps/leaderboard-web/components/`](apps/leaderboard-web/components/) - React components
- [`apps/leaderboard-web/lib/data/loader.ts`](apps/leaderboard-web/lib/data/loader.ts) - Data loading
- [`apps/leaderboard-web/lib/config/`](apps/leaderboard-web/lib/config/) - Configuration
- [`apps/leaderboard-web/next.config.ts`](apps/leaderboard-web/next.config.ts) - Next.js config

### Tips
- All data must be available at build time
- Use client components sparingly (only for interactivity)
- Optimize bundle size (tree shaking, code splitting)
- Test static export: `pnpm build && pnpm start`
- Preview locally before deploying
- Use semantic HTML for accessibility
- Test responsive design at various breakpoints

---

## Agent: Test Writer

**Purpose**: Write comprehensive tests for the leaderboard system.

### Standards

- **Framework**: Vitest with TypeScript
- **Location**: `src/__tests__/` directories
- **Naming**: `{module-name}.test.ts`
- **Coverage**: Happy path and edge cases
- **Isolation**: Use in-memory database
- **Cleanup**: Always clean up resources

### Test Pattern

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createDatabase, initializeSchema } from "@ohcnetwork/leaderboard-api";
import type { Database } from "@ohcnetwork/leaderboard-api";
import { createLogger } from "../logger";

describe("Feature Name", () => {
  let db: Database;
  const logger = createLogger(false); // Disable logging in tests
  
  beforeEach(async () => {
    // Setup: Create fresh database
    db = createDatabase(":memory:");
    await initializeSchema(db);
    
    // Additional setup (seed data, etc.)
  });
  
  afterEach(async () => {
    // Cleanup: Close database
    await db.close();
    
    // Remove test files if created
    // await rm(testDir, { recursive: true, force: true });
  });
  
  it("should handle happy path", async () => {
    // Arrange: Set up test data
    const input = { username: "alice", name: "Alice" };
    
    // Act: Execute the function
    const result = await functionUnderTest(db, input);
    
    // Assert: Verify results
    expect(result).toBeDefined();
    expect(result.username).toBe("alice");
  });
  
  it("should handle empty input", async () => {
    const result = await functionUnderTest(db, []);
    expect(result).toHaveLength(0);
  });
  
  it("should handle errors gracefully", async () => {
    await expect(
      functionUnderTest(db, null)
    ).rejects.toThrow("Invalid input");
  });
  
  it("should validate constraints", async () => {
    // Test database constraints, validations, etc.
  });
});
```

### Test Categories

**Unit Tests**: Test individual functions in isolation
```typescript
describe("contributorQueries.getByUsername", () => {
  it("should return contributor by username", async () => {
    await contributorQueries.create(db, { username: "alice", /* ... */ });
    const result = await contributorQueries.getByUsername(db, "alice");
    expect(result).not.toBeNull();
  });
  
  it("should return null for non-existent username", async () => {
    const result = await contributorQueries.getByUsername(db, "nonexistent");
    expect(result).toBeNull();
  });
});
```

**Integration Tests**: Test multiple components together
```typescript
describe("Plugin Integration", () => {
  it("should import, scrape, and export data", async () => {
    // Import existing data
    await importContributors(db, dataDir, logger);
    
    // Run plugin
    await plugin.setup(ctx);
    await plugin.scrape(ctx);
    
    // Export data
    await exportActivities(db, dataDir, logger);
    
    // Verify exported files
    const exported = await readdir(join(dataDir, "activities"));
    expect(exported.length).toBeGreaterThan(0);
  });
});
```

**Edge Cases**: Test boundary conditions
```typescript
describe("Edge Cases", () => {
  it("should handle very long usernames", async () => {
    const longUsername = "a".repeat(255);
    await contributorQueries.create(db, { username: longUsername });
    const result = await contributorQueries.getByUsername(db, longUsername);
    expect(result?.username).toBe(longUsername);
  });
  
  it("should handle special characters in slugs", async () => {
    // Test with special characters
  });
  
  it("should handle large datasets efficiently", async () => {
    // Insert 10k records and verify performance
  });
});
```

### Mocking External APIs

```typescript
import { vi } from "vitest";

describe("Plugin with API calls", () => {
  it("should fetch data from API", async () => {
    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([{ id: 1, title: "Test" }]),
    });
    
    global.fetch = mockFetch;
    
    await plugin.scrape(ctx);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api.example.com")
    );
  });
});
```

### File System Tests

```typescript
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";

describe("File Operations", () => {
  const testDir = "./test-data-temp";
  
  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it("should read and parse markdown files", async () => {
    await writeFile(
      join(testDir, "test.md"),
      "---\nusername: alice\n---\nContent",
      "utf-8"
    );
    
    const result = await importFromMarkdown(testDir);
    expect(result).toHaveLength(1);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test path/to/test.test.ts

# Generate coverage report
pnpm test:coverage
```

### Tips
- Test one thing per test case
- Use descriptive test names
- Arrange-Act-Assert pattern
- Mock external dependencies
- Test error conditions
- Clean up all resources
- Use in-memory database for speed
- Verify database state after operations

---

## Agent: Documentation Writer

**Purpose**: Create and maintain documentation for the leaderboard system.

### Documentation Locations

1. **System Documentation**: [`docs/`](docs/) directory
   - Written in MDX (Markdown + JSX)
   - Powered by Fumadocs
   - Deployed with the web app

2. **Package Documentation**: README files in each package
   - [`packages/api/README.md`](packages/api/README.md)
   - [`packages/plugin-runner/README.md`](packages/plugin-runner/README.md)
   - etc.

3. **API Documentation**: JSDoc comments in source code
   - Inline documentation for functions, types, interfaces
   - Picked up by TypeScript language server

### MDX Documentation Style

```mdx
---
title: Feature Name
description: Brief description of the feature
---

# Feature Name

Brief introduction paragraph explaining what this feature does and why it's useful.

## Overview

High-level explanation of the feature.

## Quick Start

\`\`\`bash
# Quick example to get started
pnpm install
pnpm build
\`\`\`

## Detailed Guide

### Step 1: Setup

Detailed instructions...

### Step 2: Configuration

More details...

## Examples

### Example 1: Basic Usage

\`\`\`typescript
import { feature } from "@package/name";

const result = await feature.doSomething();
\`\`\`

### Example 2: Advanced Usage

\`\`\`typescript
// More complex example
\`\`\`

## API Reference

### `functionName(param: Type): ReturnType`

Description of what the function does.

**Parameters:**
- `param` - Description of parameter

**Returns:**
- Description of return value

**Example:**
\`\`\`typescript
const result = functionName("value");
\`\`\`

## Architecture

\`\`\`mermaid
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
\`\`\`

## Best Practices

- Do this
- Don't do that
- Consider this

## Troubleshooting

### Problem: Error message

**Solution:** How to fix it.

## Related

- [Related Doc 1](/docs/related)
- [Related Doc 2](/docs/other)
```

### Mermaid Diagrams

Use Mermaid for visualizing architecture and flows:

```mermaid
graph TB
    DataSource[Data Source] --> Plugin[Plugin]
    Plugin --> Database[(Database)]
    Database --> NextJS[Next.js]
    NextJS --> StaticSite[Static Site]
```

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Plugin
    participant Database
    
    User->>CLI: Run scrape command
    CLI->>Plugin: Load plugin
    Plugin->>Database: Setup activity definitions
    Plugin->>Database: Scrape and store activities
    CLI->>Database: Export to files
```

### JSDoc Style

```typescript
/**
 * Fetch all contributors from the database
 * 
 * @param db - Database instance
 * @param filter - Optional filter criteria
 * @returns Array of contributors
 * 
 * @example
 * ```typescript
 * const contributors = await getAllContributors(db);
 * const coreMembers = await getAllContributors(db, { role: "core" });
 * ```
 */
export async function getAllContributors(
  db: Database,
  filter?: ContributorFilter
): Promise<Contributor[]> {
  // Implementation
}
```

### Documentation Checklist

- [ ] Clear title and description
- [ ] Quick start example
- [ ] Step-by-step instructions
- [ ] Code examples that work
- [ ] Architecture diagrams where helpful
- [ ] API reference for public functions
- [ ] Links to related documentation
- [ ] Troubleshooting section
- [ ] Examples are up-to-date with codebase
- [ ] No broken links
- [ ] Proper formatting and structure

### Tips
- Write for different audiences (beginners, advanced users)
- Include working code examples
- Use diagrams to explain complex concepts
- Keep examples up-to-date
- Link to relevant source files
- Test code examples before publishing
- Use consistent terminology
- Include troubleshooting for common issues

---

## General Tips for All Agents

1. **Read First**: Review existing code and documentation before starting
2. **Follow Conventions**: Adhere to established patterns in the codebase
3. **Test Thoroughly**: Write and run tests for all changes
4. **Document Changes**: Update documentation when making significant changes
5. **Use Type Safety**: Leverage TypeScript's type system
6. **Handle Errors**: Always handle errors gracefully with proper logging
7. **Ask Questions**: When in doubt, ask for clarification
8. **Review Changes**: Double-check your work before considering it complete
9. **Keep It Simple**: Prefer simple solutions over complex ones
10. **Be Consistent**: Match the style and patterns of surrounding code
