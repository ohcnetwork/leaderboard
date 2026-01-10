/**
 * Generate README.md template
 */

import type { PluginOptions } from "../types";

export function generateReadme(options: PluginOptions): string {
  const displayName = options.pluginName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `# ${options.packageName}

${options.description}

## Configuration

Add the plugin to your \`config.yaml\`:

\`\`\`yaml
leaderboard:
  plugins:
    ${options.pluginName}:
      source: "${options.packageName}"
      config:
        # TODO: Add your plugin configuration options here
\`\`\`

## Usage

1. Build the plugin:

\`\`\`bash
pnpm build
\`\`\`

2. Add the plugin to your \`config.yaml\` (see Configuration above)

3. Run the plugin runner:

\`\`\`bash
pnpm data:scrape
\`\`\`

## Development

\`\`\`bash
# Build the plugin
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm test:watch
\`\`\`

## License

MIT
`;
}
