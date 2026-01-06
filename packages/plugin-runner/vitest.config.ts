import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "forks", // Use forks instead of threads to avoid stack overflow
    poolOptions: {
      forks: {
        singleFork: true, // Run tests in a single fork to avoid issues
      },
    },
  },
});

