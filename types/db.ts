export interface Contributor {
  username: string;
  name: string | null;
  role: string | null;
  title: string | null;
  avatar_url: string | null;
  bio: string | null;
  social_profiles: Record<string, string> | null;
  joining_date: Date | null;
  meta: Record<string, string> | null;
}

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

export type AggregateValue =
  | DurationAggregateValue
  | NumberAggregateValue
  | StringAggregateValue;

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
