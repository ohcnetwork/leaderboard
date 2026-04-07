/**
 * Generate README.md template
 */

import type { PluginOptions } from "../types";

export function generateReadme(options: PluginOptions): string {
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
pnpm build:data
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
