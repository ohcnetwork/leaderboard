export const schema = `
-- Contributor Tables
CREATE TABLE IF NOT EXISTS contributor (
  username                VARCHAR PRIMARY KEY,
  name                    VARCHAR,
  role                    VARCHAR,
  title                   VARCHAR,
  avatar_url              VARCHAR,
  bio                     TEXT,
  social_profiles         JSON,
  joining_date            DATE,
  meta                    JSON NOT NULL DEFAULT '{}'
);


-- Activity related tables
CREATE TABLE IF NOT EXISTS activity_definition_points (
  slug                    VARCHAR PRIMARY KEY,
  points                  SMALLINT
);
CREATE TABLE IF NOT EXISTS activity (
  slug                    VARCHAR PRIMARY KEY,
  contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
  activity_definition     VARCHAR REFERENCES activity_definition_points(slug) NOT NULL,
  title                   VARCHAR,
  occured_at              TIMESTAMP NOT NULL,
  link                    VARCHAR,
  text                    TEXT,
  points                  SMALLINT,
  meta                    JSON
);
CREATE INDEX IF NOT EXISTS idx_activity_occured_at ON activity(occured_at);
CREATE INDEX IF NOT EXISTS idx_activity_contributor ON activity(contributor);
CREATE INDEX IF NOT EXISTS idx_activity_definition ON activity(activity_definition);


-- Aggregates related tables
CREATE TABLE IF NOT EXISTS global_aggregate (
  aggregate               VARCHAR PRIMARY KEY,
  value                   JSON NOT NULL
);
CREATE TABLE IF NOT EXISTS contributor_aggregate (
  contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
  aggregate               VARCHAR NOT NULL,
  value                   JSON NOT NULL,
  PRIMARY KEY (aggregate, contributor)
);
CREATE INDEX IF NOT EXISTS idx_contributor_aggregate_contributor ON contributor_aggregate(contributor);
CREATE INDEX IF NOT EXISTS idx_contributor_aggregate_aggregate ON contributor_aggregate(aggregate);


-- Badge related tables
CREATE TABLE IF NOT EXISTS contributor_badge (
  badge                   VARCHAR NOT NULL,
  contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
  variant                 VARCHAR NOT NULL,
  achieved_on             DATE NOT NULL,
  meta                    JSON,
  PRIMARY KEY (badge, contributor, variant)
);
CREATE INDEX IF NOT EXISTS idx_contributor_badge_badge ON contributor_badge(badge);
CREATE INDEX IF NOT EXISTS idx_contributor_badge_contributor ON contributor_badge(contributor);
CREATE INDEX IF NOT EXISTS idx_contributor_badge_achieved_on ON contributor_badge(achieved_on);
`;
