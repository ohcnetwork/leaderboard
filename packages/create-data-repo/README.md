# create-leaderboard-data-repo

CLI tool to initialize leaderboard data repositories for new organizations.

## Usage

```bash
# Create data repository with interactive prompts
pnpm create-data-repo

# Specify target directory
pnpm create-data-repo ./my-org-data

# Create in current directory
pnpm create-data-repo .
```

## Features

- Interactive prompts for organization configuration
- Generates properly structured data repository
- Creates config.yaml with all necessary fields
- Includes README and .gitignore
- Initializes git repository automatically
- Validates inputs (URLs, dates, slugs)

## What Gets Created

```
data-repo/
├── config.yaml           # Organization configuration
├── README.md            # Repository documentation
├── .gitignore           # Git ignore rules
├── contributors/        # Contributor profiles (empty)
└── activities/          # Activity records (empty)
```

## License

MIT
