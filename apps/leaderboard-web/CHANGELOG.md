# leaderboard-web

## 0.5.0

### Minor Changes

- 13b8f0d: Optimize how avatars are loaded

### Patch Changes

- e82ff67: Redesign badges page UI
- 776d8ec: Fixes SQL query run shortcut key not working
- 8001421: Fix issues with rendering badges and exclude hidden roles in recent achievements
- f6bbfde: Adds link to edit profile content
- Updated dependencies [e82ff67]
- Updated dependencies [8001421]
  - @ohcnetwork/leaderboard-api@0.3.1

## 0.4.0

### Minor Changes

- 4b560d2: Adds MCP server for querying leaderboard's data
- 42aff67: Support serving assets from data repository

### Patch Changes

- 6371553: Show all roles (including hidden) in People page
- cb065da: show more KPI cards in home page
- e32a214: fix activity overview width in contributor profile page
- Updated dependencies [4b560d2]
- Updated dependencies [9b99625]
  - @ohcnetwork/leaderboard-api@0.3.0

## 0.3.1

### Patch Changes

- 2fb0602: Show activity's text in relevant places (leaderboard podium and home page recent activities)
- 85b124c: fix docs ui and adds support for rendering mermaid charts
- 31fdd1b: Improve SQL REPL editor to use CodeMirror and auto completions
- Updated dependencies [afadc3d]
  - @ohcnetwork/leaderboard-api@0.2.0

## 0.3.0

### Minor Changes

- 9ce56a1: Add Data Explorer page, write SQL queries to inspect leaderboard's database

### Patch Changes

- eb696f7: Improve profile activity overview, add year filter, and other minor fixes
- 2ca9a94: fix typo for field: occurred_at
- 4045dfb: fix rendering date and time information (render in client side for accuracy)
- 94cc2db: Schema change, make role non-nullable
- baeab78: Redesigned Leaderboard page UI
- be971b7: Improve usages of primary color
- 61905cd: Redesigned home page and footer
- 4815f43: Allow customizing contributor role badge and show role's name and description instead of slug
- 6219a13: Improve People page UI to show grouped by roles and Gallery view
- dd78aa9: Support for configuring which all activity counts are shown in leaderboard's all contributors table
- Updated dependencies [2ca9a94]
- Updated dependencies [94cc2db]
- Updated dependencies [f5592cb]
- Updated dependencies [fdb708d]
  - @ohcnetwork/leaderboard-api@0.1.1
