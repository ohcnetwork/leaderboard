/**
 * Generate realistic GitHub-like activities
 */

import { faker } from "@faker-js/faker";
import type { Activity } from "@ohcnetwork/leaderboard-api";

/**
 * Activity type definitions with GitHub-like attributes
 */
export const ACTIVITY_TYPES = {
  pr_opened: {
    name: "PR Opened",
    description: "Opened a pull request",
    points: 5,
    icon: "git-pull-request",
  },
  pr_merged: {
    name: "PR Merged",
    description: "Pull request was merged",
    points: 10,
    icon: "git-merge",
  },
  pr_reviewed: {
    name: "PR Reviewed",
    description: "Reviewed a pull request",
    points: 3,
    icon: "eye",
  },
  issue_opened: {
    name: "Issue Opened",
    description: "Opened an issue",
    points: 5,
    icon: "circle-dot",
  },
  issue_closed: {
    name: "Issue Closed",
    description: "Closed an issue",
    points: 8,
    icon: "circle-check",
  },
  issue_commented: {
    name: "Issue Commented",
    description: "Commented on an issue",
    points: 1,
    icon: "message-square",
  },
  commit_pushed: {
    name: "Commit Pushed",
    description: "Pushed commits to repository",
    points: 2,
    icon: "git-commit",
  },
  release_published: {
    name: "Release Published",
    description: "Published a new release",
    points: 20,
    icon: "package",
  },
  docs_updated: {
    name: "Docs Updated",
    description: "Updated documentation",
    points: 5,
    icon: "book-open",
  },
} as const;

/**
 * Generate realistic PR titles
 */
function generatePRTitle(): string {
  const templates = [
    () => `Fix ${faker.hacker.noun()} ${faker.hacker.verb()} issue`,
    () => `Add ${faker.hacker.adjective()} ${faker.hacker.noun()} support`,
    () => `Update ${faker.hacker.noun()} implementation`,
    () => `Improve ${faker.hacker.noun()} performance`,
    () => `Refactor ${faker.hacker.noun()} module`,
    () => `Remove deprecated ${faker.hacker.noun()} API`,
    () => `Implement ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    () => `Fix memory leak in ${faker.hacker.noun()} handler`,
    () => `Add tests for ${faker.hacker.noun()} feature`,
    () => `Update dependencies for ${faker.hacker.noun()}`,
  ];

  return faker.helpers.arrayElement(templates)();
}

/**
 * Generate realistic issue titles
 */
function generateIssueTitle(): string {
  const templates = [
    () => `Bug: ${faker.hacker.noun()} not ${faker.hacker.ingverb()} correctly`,
    () =>
      `Feature Request: Add ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    () => `${faker.hacker.noun()} ${faker.hacker.verb()} throws error`,
    () => `Improve ${faker.hacker.noun()} ${faker.hacker.verb()} performance`,
    () => `Question: How to ${faker.hacker.verb()} ${faker.hacker.noun()}?`,
    () => `Documentation: ${faker.hacker.noun()} needs examples`,
    () => `${faker.hacker.adjective()} ${faker.hacker.noun()} causes crash`,
    () => `Memory leak in ${faker.hacker.noun()} module`,
  ];

  return faker.helpers.arrayElement(templates)();
}

/**
 * Generate realistic commit message
 */
function generateCommitMessage(): string {
  const types = ["feat", "fix", "docs", "style", "refactor", "test", "chore"];
  const type = faker.helpers.arrayElement(types);
  const scope = faker.hacker.noun();
  const message = faker.hacker.phrase();

  return `${type}(${scope}): ${message}`;
}

/**
 * Generate realistic release notes
 */
function generateReleaseTitle(): string {
  const major = faker.number.int({ min: 0, max: 5 });
  const minor = faker.number.int({ min: 0, max: 20 });
  const patch = faker.number.int({ min: 0, max: 50 });

  return `v${major}.${minor}.${patch}`;
}

/**
 * Generate realistic documentation title
 */
function generateDocsTitle(): string {
  const templates = [
    () => `Update ${faker.hacker.noun()} documentation`,
    () => `Add examples for ${faker.hacker.noun()}`,
    () => `Fix typos in ${faker.hacker.noun()} guide`,
    () => `Improve ${faker.hacker.noun()} tutorial`,
    () => `Add API reference for ${faker.hacker.noun()}`,
  ];

  return faker.helpers.arrayElement(templates)();
}

/**
 * Generate activity title based on type
 */
function generateActivityTitle(type: string): string {
  switch (type) {
    case "pr_opened":
    case "pr_merged":
    case "pr_reviewed":
      return generatePRTitle();
    case "issue_opened":
    case "issue_closed":
    case "issue_commented":
      return generateIssueTitle();
    case "commit_pushed":
      return generateCommitMessage();
    case "release_published":
      return generateReleaseTitle();
    case "docs_updated":
      return generateDocsTitle();
    default:
      return faker.hacker.phrase();
  }
}

/**
 * Generate GitHub URL based on activity type
 */
function generateActivityLink(
  type: string,
  orgName: string,
  repoName: string,
  id: number
): string {
  const baseUrl = `https://github.com/${orgName}/${repoName}`;

  switch (type) {
    case "pr_opened":
    case "pr_merged":
    case "pr_reviewed":
      return `${baseUrl}/pull/${id}`;
    case "issue_opened":
    case "issue_closed":
    case "issue_commented":
      return `${baseUrl}/issues/${id}`;
    case "commit_pushed":
      return `${baseUrl}/commit/${faker.git.commitSha()}`;
    case "release_published":
      return `${baseUrl}/releases/tag/v${faker.system.semver()}`;
    case "docs_updated":
      return `${baseUrl}/commit/${faker.git.commitSha()}`;
    default:
      return baseUrl;
  }
}

/**
 * Generate meta information based on activity type
 */
function generateActivityMeta(
  type: string,
  repoName: string
): Record<string, unknown> | null {
  const meta: Record<string, unknown> = {
    repo: repoName,
  };

  // Add labels for issues and PRs
  if (type.startsWith("issue_") || type.startsWith("pr_")) {
    const labelOptions = [
      ["bug"],
      ["enhancement"],
      ["documentation"],
      ["bug", "priority:high"],
      ["enhancement", "good-first-issue"],
      ["documentation", "help-wanted"],
    ];
    meta.labels = faker.helpers.arrayElement(labelOptions);
  }

  // Add commit count for PRs
  if (type === "pr_merged" || type === "pr_opened") {
    meta.commits = faker.number.int({ min: 1, max: 25 });
    meta.additions = faker.number.int({ min: 10, max: 500 });
    meta.deletions = faker.number.int({ min: 5, max: 200 });
  }

  // Add release type
  if (type === "release_published") {
    meta.releaseType = faker.helpers.arrayElement(["major", "minor", "patch"]);
  }

  return meta;
}

/**
 * Generate a single activity
 */
export function generateActivity(
  contributor: string,
  type: keyof typeof ACTIVITY_TYPES,
  orgName: string,
  repoName: string,
  date: Date
): Activity {
  const id = faker.number.int({ min: 1, max: 9999 });
  const title = generateActivityTitle(type);
  const link = generateActivityLink(type, orgName, repoName, id);
  const meta = generateActivityMeta(type, repoName);

  // Generate slug
  const slug = `${contributor}-${type}-${date.getTime()}-${faker.string.alphanumeric(
    6
  )}`;

  return {
    slug,
    contributor,
    activity_definition: type,
    title,
    occured_at: date.toISOString(),
    link,
    text: null, // Could add descriptions for some activities
    points: ACTIVITY_TYPES[type].points,
    meta,
  };
}

/**
 * Generate activities for a contributor
 */
export function generateActivitiesForContributor(
  contributor: string,
  count: number,
  daysBack: number,
  orgName: string,
  repoNames: string[]
): Activity[] {
  const activities: Activity[] = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysBack);

  // Generate activity distribution (more recent = more likely)
  const activityTypes = Object.keys(ACTIVITY_TYPES) as Array<
    keyof typeof ACTIVITY_TYPES
  >;

  for (let i = 0; i < count; i++) {
    // Generate date with bias towards recent dates
    const randomFactor = Math.pow(Math.random(), 0.7); // Bias towards 1 (recent)
    const timeRange = now.getTime() - startDate.getTime();
    const activityTime = startDate.getTime() + timeRange * randomFactor;
    const date = new Date(activityTime);

    // Select random activity type
    const type = faker.helpers.arrayElement(activityTypes);

    // Select random repo
    const repoName = faker.helpers.arrayElement(repoNames);

    const activity = generateActivity(
      contributor,
      type,
      orgName,
      repoName,
      date
    );
    activities.push(activity);
  }

  // Sort by date
  activities.sort(
    (a, b) =>
      new Date(a.occured_at).getTime() - new Date(b.occured_at).getTime()
  );

  return activities;
}

/**
 * Generate activities for all contributors
 */
export function generateActivities(
  contributors: string[],
  minActivitiesPerContributor: number,
  maxActivitiesPerContributor: number,
  daysBack: number,
  orgName: string,
  repoNames: string[]
): Map<string, Activity[]> {
  const activitiesByContributor = new Map<string, Activity[]>();

  for (const contributor of contributors) {
    const activityCount = faker.number.int({
      min: minActivitiesPerContributor,
      max: maxActivitiesPerContributor,
    });

    const activities = generateActivitiesForContributor(
      contributor,
      activityCount,
      daysBack,
      orgName,
      repoNames
    );

    activitiesByContributor.set(contributor, activities);
  }

  return activitiesByContributor;
}
