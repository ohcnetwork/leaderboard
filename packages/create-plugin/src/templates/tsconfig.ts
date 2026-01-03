/**
 * Generate tsconfig.json template
 */

export function generateTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "../plugin-api" },
    { "path": "../db" }
  ]
}
`;
}

