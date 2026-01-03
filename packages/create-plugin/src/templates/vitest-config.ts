/**
 * Generate vitest.config.ts template
 */

export function generateVitestConfig(): string {
  return `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
`;
}

