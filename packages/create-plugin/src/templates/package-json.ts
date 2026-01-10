/**
 * Generate package.json template
 */

import type { PluginOptions } from "../types";

export function generatePackageJson(options: PluginOptions): string {
  // Use JSON.stringify to safely escape strings
  const pkg = {
    name: options.packageName,
    version: "0.1.0",
    description: options.description,
    type: "module",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    scripts: {
      build: "tsc",
      test: "vitest run",
      "test:watch": "vitest",
    },
    keywords: ["leaderboard", "plugin"],
    dependencies: {
      "@ohcnetwork/leaderboard-api": "^0.1.0",
    },
    devDependencies: {
      "@types/node": "^20.19.27",
      typescript: "^5.7.3",
      vitest: "^4.0.16",
    },
    author: options.author,
    license: "MIT",
  };

  return JSON.stringify(pkg, null, 2) + "\n";
}
