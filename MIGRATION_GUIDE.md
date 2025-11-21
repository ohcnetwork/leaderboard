# PostgreSQL + Prisma Migration Guide

This project has been migrated from PGlite to PostgreSQL with Prisma ORM. Follow these steps to set up and use the new database system.

## Prerequisites

- PostgreSQL server (version 12 or higher)
- Node.js and pnpm installed

## Setup Instructions

### 1. Install Dependencies

First, install the new dependencies including Prisma:

```bash
pnpm install
```

### 2. Set Up PostgreSQL Database

Create a PostgreSQL database for the leaderboard:

```bash
# Using psql
createdb leaderboard

# Or using SQL
psql -U postgres -c "CREATE DATABASE leaderboard;"
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/leaderboard"
LEADERBOARD_DATA_PATH="./data-repo"
```

### 4. Run Prisma Migrations

Generate the Prisma Client and run migrations to create the database schema:

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations (development)
pnpm prisma:migrate

# Or for production deployment
pnpm prisma:deploy
```

### 5. Import Existing Data (Optional)

If you have existing contributor data in the data repository:

```bash
pnpm db:import
```

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

The `prebuild` script will automatically run `prisma generate` before starting the dev server.

### Building for Production

```bash
pnpm build
```

This will:
1. Generate Prisma Client
2. Import configuration
3. Generate icons and theme
4. Build the Next.js static site

**Note:** The PostgreSQL database must be accessible during the build process as data is fetched at build time for static generation.

### Database Management

#### View and Edit Data with Prisma Studio

```bash
pnpm prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit database records.

#### Create a New Migration

After modifying the Prisma schema:

```bash
pnpm prisma:migrate
```

#### Export Data to Flat Files

```bash
pnpm db:export
```

## Key Changes from PGlite

### Database Connection

- **Before:** PGlite embedded database with `PGLITE_DB_PATH`
- **After:** PostgreSQL server with `DATABASE_URL`

### Schema Management

- **Before:** SQL DDL in `createTables()` function
- **After:** Prisma schema in `prisma/schema.prisma`

### Type System

- **Before:** Manual type definitions in `types/db.ts`
- **After:** Auto-generated types from Prisma Client

### Query API

- **Before:** Raw SQL queries with PGlite
- **After:** Type-safe Prisma Client API

### Scripts

- **Removed:**
  - `scripts/db-prepare.ts` → Use `pnpm prisma:migrate`
  - `scripts/db-exec-stdin.ts` → Use Prisma Studio or raw SQL tools
  - `scripts/db-sql-dump.ts` → Use Prisma migrate commands

- **Updated:**
  - `scripts/db-import.ts` → Now uses Prisma Client
  - `scripts/db-export.ts` → Now uses Prisma Client
  - `scripts/generate-github-workflow.ts` → Updated for Prisma

## Prisma Schema

The database schema is defined in `prisma/schema.prisma` with the following models:

- `Contributor` - User profiles
- `ActivityDefinition` - Types of activities
- `Activity` - Individual activity records
- `GlobalAggregate` - Global statistics
- `ContributorAggregateDefinition` - Contributor metric definitions
- `ContributorAggregate` - Contributor-specific metrics
- `BadgeDefinition` - Badge types and variants
- `ContributorBadge` - Earned badges

## CI/CD Updates

The GitHub Actions workflow has been updated to:

1. Use `DATABASE_URL` secret instead of `PGLITE_DB_PATH`
2. Run `pnpm prisma:deploy` instead of `pnpm db:prepare`
3. Require PostgreSQL database access during workflow execution

Make sure to add `DATABASE_URL` to your GitHub repository secrets.

## Troubleshooting

### "Prisma Client not generated"

Run:
```bash
pnpm prisma:generate
```

### "Can't reach database server"

Check that:
1. PostgreSQL is running
2. `DATABASE_URL` is correctly set in `.env`
3. Database exists and credentials are correct

### Migration conflicts

If you encounter migration conflicts:
```bash
# Reset the database (WARNING: destroys all data)
pnpm prisma migrate reset

# Or resolve conflicts manually
pnpm prisma migrate resolve
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

