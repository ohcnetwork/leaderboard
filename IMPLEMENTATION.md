# Leaderboard Implementation Summary

This document provides an overview of the leaderboard implementation completed according to the plan.

## ✅ Completed Tasks

### 1. Database Schema
- **File**: `scrapers/prepare.ts`
- Updated contributor table with:
  - `role` column for contributor roles
  - `avatar_url`, `profile_url`, `email`, `bio` fields
- Added database indexes on:
  - `activity.occured_at`
  - `activity.contributor`
  - `activity.activity_definition`
- Fixed syntax error (trailing comma)

### 2. Type Definitions
- **File**: `types/index.ts`
- Defined comprehensive TypeScript interfaces:
  - Database models: `Contributor`, `Activity`, `ActivityDefinition`
  - Configuration types: `Config`, `OrgConfig`, `MetaConfig`, `RoleConfig`, etc.
  - Leaderboard types: `LeaderboardEntry`, `ContributorStats`, `ActivityBreakdown`
  - Time filter types: `TimeFilter`, `TimeRange`
  - Enriched types: `EnrichedActivity`

### 3. Configuration Loader
- **File**: `lib/config.ts`
- Loads and parses `config.yaml` at build time
- Handles environment variable substitution (e.g., `${{ GITHUB_TOKEN }}`)
- Caches configuration for performance

### 4. Database Utility Module
- **File**: `lib/db.ts`
- PGlite database connection management
- Query helpers:
  - `getAllContributors()` - Fetch all contributors
  - `getContributor()` - Fetch single contributor
  - `getActivities()` - Fetch activities with filters
  - `getEnrichedActivities()` - Fetch activities with joined data
  - `countActivities()` - Count activities
  - `getContributorsWithStats()` - Get contributors with points and activity counts
- Time-range filtering support (all-time, weekly, monthly, yearly, custom)
- `timeFilterToRange()` - Convert time filters to date ranges

### 5. Leaderboard Logic
- **File**: `lib/leaderboard.ts`
- `getLeaderboard()` - Calculate rankings with time filters
- `getContributorStats()` - Get detailed stats for a contributor
- `getTopContributors()` - Get top N contributors
- `getContributorRank()` - Get rank for specific time period
- Points calculation: Uses `activity.points` if set, else falls back to `activity_definition.points`
- Proper ranking with tie handling

### 6. UI Components
Created shadcn/ui base components:
- `components/ui/avatar.tsx` - Avatar component
- `components/ui/badge.tsx` - Badge component
- `components/ui/table.tsx` - Table components
- `components/ui/tabs.tsx` - Tabs component

Created custom components:
- `components/ContributorCard.tsx` - Display contributor info in cards
- `components/ActivityItem.tsx` - Display single activity in feed
- `components/LeaderboardTable.tsx` - Table for leaderboard rankings
- `components/StatCard.tsx` - Display statistics
- `components/TimeFilter.tsx` - Time period filter tabs

### 7. Layout and Navigation
- **File**: `app/layout.tsx`
- Added navigation header with links to all pages
- Integrated theme provider for dark mode
- Added footer with org info and social links
- Configured metadata and Open Graph tags from config

**Navigation Component**: `components/Navigation.tsx`
- Logo and org name
- Links to Home, Leaderboard, People, Feed
- Theme selector

**Footer Component**: `components/Footer.tsx`
- Organization info and description
- Quick links to all pages
- Social media icons (GitHub, LinkedIn, YouTube, Email)
- Copyright notice

### 8. Pages

#### Home Page (`app/page.tsx`)
- Hero section with org name and description
- Stats cards (total contributors, activities, points)
- Top 6 contributors with cards
- Recent 10 activities feed
- About section with links

#### Leaderboard Page (`app/leaderboard/[[...filter]]/page.tsx`)
- Dynamic route supporting:
  - `/leaderboard` (default: all-time)
  - `/leaderboard/all-time`
  - `/leaderboard/weekly`
  - `/leaderboard/monthly`
  - `/leaderboard/yearly`
- Time filter tabs for switching periods
- Full leaderboard table with:
  - Rank (with trophy icons for top 3)
  - Contributor info with avatar
  - Role badge
  - Activity count and total points
  - Top activity breakdown
- Static generation for all filter variants

#### People Page (`app/people/`)
- **Layout**: `app/people/layout.tsx` - Server component that fetches data
- **Page**: `app/people/page.tsx` - Client component with interactivity
- Search functionality (by name, username, bio)
- Filter by role using tabs
- Grid of contributor cards
- Shows total contributors found

#### Contributor Page (`app/contributors/[username]/page.tsx`)
- Profile header with avatar, name, bio, role
- Email and profile links
- Stats cards:
  - Total points
  - Total activities
  - All-time rank
  - Monthly rank
- Activity breakdown by type
- Recent activity timeline (last 50 activities)
- Static generation for all contributors

#### Feed Page (`app/feed/page.tsx`)
- Displays all recent activities (last 200)
- Chronological order (newest first)
- Each activity shows:
  - Contributor with avatar
  - Activity type
  - Title and description
  - Points earned
  - Timestamp
  - Link to original activity

### 9. Sitemap Generation
- **File**: `app/sitemap.ts`
- Generates sitemap.xml with:
  - All static routes
  - All leaderboard filter pages
  - All contributor pages
- Proper change frequency and priority settings
- Uses `meta.site_url` from config as base URL

### 10. Build Configuration
- **File**: `next.config.ts`
- Configured for static export: `output: "export"`
- Trailing slash enabled for better static hosting
- Image optimization disabled for static export
- Ready for deployment to static hosting services

## Architecture Overview

### Data Flow
1. **Scrapers** (external) → Update PGlite database
2. **Database** (`./db-data`) → Stores all data
3. **Next.js Build** → Reads from database at build time
4. **Static Pages** → Generated with all data embedded
5. **Deployment** → Static files served from CDN

### Time Filters
- **All-time**: No date filtering
- **Weekly**: Last 7 days from start of week
- **Monthly**: Last month from start of month
- **Yearly**: Last year from start of year
- **Custom**: User-specified date range (via query params)

### Points Calculation
- Each activity has an optional `points` field
- If `activity.points` is set, use it
- Otherwise, fall back to `activity_definition.points`
- Default to 0 if both are null

### Static Generation
All pages are pre-rendered at build time:
- Home page: Single static page
- Leaderboard: 5 variants (default + 4 time filters)
- People: Single static page with client-side filtering
- Contributors: One page per contributor
- Feed: Single static page with recent activities
- Sitemap: Generated dynamically at build time

## Configuration

### Required Files
- `config.yaml` - Main configuration file
- `config.schema.json` - JSON schema for validation
- `./db-data/` - PGlite database directory

### Environment Variables
Environment variables can be used in `config.yaml`:
```yaml
scrapers:
  github:
    token: ${{ GITHUB_TOKEN }}
  slack:
    api_key: ${{ SLACK_API_KEY }}
```

## Dependencies Added
- `js-yaml` - YAML parsing
- `@types/js-yaml` - TypeScript types for js-yaml
- `@radix-ui/react-tabs` - Tabs component
- `date-fns` - Date manipulation (already present)

## Build and Deployment

### Build Process
```bash
# 1. Run scrapers (external process)
# 2. Build Next.js app
pnpm build

# Output will be in ./out directory
```

### Deployment
The `./out` directory contains all static files and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## Next Steps (Not Implemented)

1. **Scraper Implementation**: Complete the GitHub and Slack scrapers
2. **Testing**: Add unit and integration tests
3. **CI/CD**: Set up automated scraping and deployment
4. **Analytics**: Add page view tracking
5. **Custom Date Ranges**: Implement UI for custom date range selection
6. **Pagination**: Add pagination for large activity feeds
7. **Export**: Add CSV/JSON export functionality
8. **Notifications**: Email notifications for rank changes

## Notes

- All pages use server-side rendering at build time (SSG)
- No runtime database queries - all data is embedded in static pages
- Theme switching works client-side (no page reload needed)
- Search and filtering on People page is client-side
- Images are unoptimized for static export compatibility

