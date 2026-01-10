/**
 * Generate tsconfig.json template
 */

export function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "rootDir": ".",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },
    "noUncheckedIndexedAccess": true,
    "strictNullChecks": true
  },
  "include": ["**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}

`;
}
