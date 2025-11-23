import { PGlite } from "@electric-sql/pglite";

export interface ScraperConfig {
  config: Record<string, any>;
}

export interface ActivityDefinition {
  slug: string;
  name: string;
  description: string;
  points: number;
  icon: string;
}

export interface AggregateDefinition {
  slug: string;
  name: string;
  description: string;
}

export interface BadgeVariant {
  description: string;
  svg_url: string;
}

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  variants: {
    [key: string]: BadgeVariant;
  };
}

export interface AggregateDefinitions {
  global: AggregateDefinition[];
  contributor: AggregateDefinition[];
}

export interface LeaderboardScraperManifest {
  activityDefinitions: ActivityDefinition[];
  aggregateDefinitions: AggregateDefinitions;
  badgeDefinitions: BadgeDefinition[];
  computeAggregates: (config: ScraperConfig, db: PGlite) => Promise<void>;
  scrape: (
    config: ScraperConfig,
    db: PGlite,
    scrapeDays: number
  ) => Promise<void>;
  import?: (
    config: ScraperConfig,
    db: PGlite,
    dataPath: string
  ) => Promise<void>;
  export?: (
    config: ScraperConfig,
    db: PGlite,
    dataPath: string
  ) => Promise<void>;
}
