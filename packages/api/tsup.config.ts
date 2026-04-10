import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/seed.ts"],
  format: ["esm"],
  dts: true,
  splitting: true,
  clean: true,
  outDir: "dist",
  tsconfig: "tsconfig.build.json",
});
