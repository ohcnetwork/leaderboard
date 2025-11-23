export interface ActivityDefinition {
  slug: string;
  name: string;
  description: string | null;
  points: number | null;
  icon: string | null;
}

export interface Activity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title: string | null;
  occured_at: Date;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, unknown> | null;
}

interface DurationAggregateValue {
  type: "duration";
  value: number;
}

interface NumberAggregateValue {
  type: "number";
  value: number;
}

interface StringAggregateValue {
  type: "string";
  value: string;
}

interface PercentageAggregateValue {
  type: "percentage";
  value: number; // Float between 0 and 1
}

export type AggregateValue =
  | DurationAggregateValue
  | NumberAggregateValue
  | StringAggregateValue
  | PercentageAggregateValue;

interface AggregateDefinitionBase {
  slug: string;
  name: string;
  description: string | null;
}

export interface GlobalAggregate extends AggregateDefinitionBase {
  value: AggregateValue | null;
}

export type ContributorAggregateDefinition = AggregateDefinitionBase;

export interface ContributorAggregate {
  aggregate: string; // FK to contributor_aggregate_definition.slug
  contributor: string; // FK to contributor.username
  value: AggregateValue;
}

export interface BadgeVariant {
  description: string;
  svg_url: string;
  requirement?: string | null; // Optional description of what's needed to earn this variant
}

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  variants: Record<string, BadgeVariant>;
}

export interface ContributorBadge {
  slug: string; // Composite key: {badge}__{contributor}__{variant}
  badge: string; // FK to badge_definition.slug
  contributor: string; // FK to contributor.username
  variant: string; // Key from badge_definition.variants
  achieved_on: Date;
  meta: Record<string, unknown> | null; // Optional metadata about how the badge was earned
}
