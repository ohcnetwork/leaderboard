#!/usr/bin/env node
/**
 * Seed script for generating dummy data
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import type { Contributor, ActivityDefinition, Activity } from "./types";

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Henry",
  "Iris",
  "Jack",
  "Kate",
  "Liam",
  "Maya",
  "Noah",
  "Olivia",
  "Peter",
  "Quinn",
  "Rachel",
  "Sam",
  "Tara",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
  "Yara",
  "Zane",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
];

const ROLES = ["core", "intern", "operations", "contributor"];

const ACTIVITY_DEFS: ActivityDefinition[] = [
  {
    slug: "pr_opened",
    name: "PR Opened",
    description: "Opened a pull request",
    points: 5,
    icon: "git-pull-request",
  },
  {
    slug: "pr_merged",
    name: "PR Merged",
    description: "Pull request was merged",
    points: 10,
    icon: "git-merge",
  },
  {
    slug: "pr_reviewed",
    name: "PR Reviewed",
    description: "Reviewed a pull request",
    points: 3,
    icon: "eye",
  },
  {
    slug: "issue_opened",
    name: "Issue Opened",
    description: "Opened an issue",
    points: 2,
    icon: "circle-dot",
  },
  {
    slug: "issue_closed",
    name: "Issue Closed",
    description: "Closed an issue",
    points: 3,
    icon: "check-circle",
  },
  {
    slug: "issue_assigned",
    name: "Issue Assigned",
    description: "Was assigned to an issue",
    points: 1,
    icon: "user-check",
  },
  {
    slug: "commit_pushed",
    name: "Commit Pushed",
    description: "Pushed commits",
    points: 1,
    icon: "git-commit",
  },
  {
    slug: "release_published",
    name: "Release Published",
    description: "Published a release",
    points: 15,
    icon: "tag",
  },
  {
    slug: "doc_updated",
    name: "Documentation Updated",
    description: "Updated documentation",
    points: 5,
    icon: "book",
  },
  {
    slug: "bug_fixed",
    name: "Bug Fixed",
    description: "Fixed a bug",
    points: 8,
    icon: "bug",
  },
  {
    slug: "feature_added",
    name: "Feature Added",
    description: "Added a new feature",
    points: 12,
    icon: "sparkles",
  },
  {
    slug: "test_added",
    name: "Test Added",
    description: "Added test coverage",
    points: 4,
    icon: "check-square",
  },
  {
    slug: "refactor",
    name: "Code Refactored",
    description: "Refactored code",
    points: 6,
    icon: "refresh-cw",
  },
];

const BIO_TEMPLATES = [
  "is a passionate developer specializing in {tech1} and {tech2}. Contributes regularly to open source projects.",
  "has been working on distributed systems and {tech1} for over {years} years. Enjoys solving complex problems.",
  "is an advocate for clean code and best practices. Specializes in {tech1}, {tech2}, and system architecture.",
  "brings expertise in {tech1} and {tech2} to the team. Known for thorough code reviews and mentorship.",
  "focuses on performance optimization and {tech1}. Has contributed to multiple high-impact projects.",
];

const TECH_STACK = [
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Kubernetes",
  "PostgreSQL",
  "React",
  "Node.js",
  "Docker",
  "AWS",
  "GraphQL",
  "Redis",
  "MongoDB",
  "Next.js",
  "TailwindCSS",
  "WebAssembly",
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUsername(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}${lastName.toLowerCase()[0]}${randomInt(
    1,
    99
  )}`;
}

function generateBio(name: string): string {
  const template = randomElement(BIO_TEMPLATES);
  const tech1 = randomElement(TECH_STACK);
  const tech2 = randomElement(TECH_STACK.filter((t) => t !== tech1));
  const years = randomInt(2, 10);

  return `${name} ${template
    .replace("{tech1}", tech1)
    .replace("{tech2}", tech2)
    .replace("{years}", years.toString())}`;
}

function generateContributor(): Contributor {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const username = generateUsername(firstName, lastName);
  const name = `${firstName} ${lastName}`;
  const role = randomElement(ROLES);

  const socialProfiles: Record<string, string> = {
    github: `https://github.com/${username}`,
  };

  if (Math.random() > 0.5) {
    socialProfiles.linkedin = `https://linkedin.com/in/${username}`;
  }

  if (Math.random() > 0.7) {
    socialProfiles.twitter = `https://twitter.com/${username}`;
  }

  const joiningDate = new Date(
    Date.now() - randomInt(30, 365 * 3) * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  return {
    username,
    name,
    role,
    title:
      Math.random() > 0.3
        ? randomElement([
            "Engineer",
            "Senior Engineer",
            "Tech Lead",
            "Architect",
          ])
        : null,
    avatar_url: `https://github.com/${username}.png`,
    bio: generateBio(name),
    social_profiles: socialProfiles,
    joining_date: joiningDate,
    meta: {
      timezone: randomElement(["PST", "EST", "UTC", "IST", "CET"]),
      team: randomElement(["backend", "frontend", "devops", "fullstack"]),
    },
  };
}

function generateActivity(
  contributor: string,
  activityDef: ActivityDefinition,
  index: number
): Activity {
  const daysAgo = randomInt(0, 180);
  const occurredAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    slug: `${contributor}-${activityDef.slug}-${index}`,
    contributor,
    activity_definition: activityDef.slug,
    title: `${activityDef.name} #${index}`,
    occured_at: occurredAt.toISOString(),
    link: `https://github.com/org/repo/pull/${randomInt(1, 9999)}`,
    text: null,
    points: activityDef.points,
    meta: {
      repository: randomElement(["repo-a", "repo-b", "repo-c"]),
    },
  };
}

async function writeContributorMarkdown(
  outputDir: string,
  contributor: Contributor
): Promise<void> {
  const { username, bio, ...frontmatter } = contributor;

  const content = matter.stringify(bio || "", {
    ...frontmatter,
    username,
  });

  const filePath = join(outputDir, "contributors", `${username}.md`);
  await writeFile(filePath, content, "utf8");
}

async function writeActivitiesJsonl(
  outputDir: string,
  username: string,
  activities: Activity[]
): Promise<void> {
  const content = activities.map((a) => JSON.stringify(a)).join("\n");
  const filePath = join(outputDir, "activities", `${username}.jsonl`);
  await writeFile(filePath, content + "\n", "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  const outputDir =
    args.find((arg) => arg.startsWith("--output="))?.split("=")[1] ||
    "./test-data";

  console.log(`Generating seed data to: ${outputDir}`);

  // Create directories
  await mkdir(join(outputDir, "contributors"), { recursive: true });
  await mkdir(join(outputDir, "activities"), { recursive: true });

  // Generate contributors
  const numContributors = randomInt(15, 30);
  const contributors: Contributor[] = [];

  for (let i = 0; i < numContributors; i++) {
    const contributor = generateContributor();
    contributors.push(contributor);
    await writeContributorMarkdown(outputDir, contributor);
  }

  console.log(`✓ Generated ${contributors.length} contributors`);

  // Generate activities for each contributor
  let totalActivities = 0;

  for (const contributor of contributors) {
    const numActivities = randomInt(5, 50);
    const activities: Activity[] = [];

    for (let i = 0; i < numActivities; i++) {
      const activityDef = randomElement(ACTIVITY_DEFS);
      const activity = generateActivity(contributor.username, activityDef, i);
      activities.push(activity);
    }

    // Sort by date
    activities.sort((a, b) => a.occured_at.localeCompare(b.occured_at));

    await writeActivitiesJsonl(outputDir, contributor.username, activities);
    totalActivities += activities.length;
  }

  console.log(`✓ Generated ${totalActivities} activities`);

  // Write activity definitions info (for reference only)
  const defsPath = join(outputDir, "activity_definitions.json");
  await writeFile(defsPath, JSON.stringify(ACTIVITY_DEFS, null, 2), "utf8");
  console.log(
    `✓ Wrote ${ACTIVITY_DEFS.length} activity definitions to ${defsPath}`
  );

  console.log("\n✅ Seed data generation complete!");
  console.log(`\nTo use this data:`);
  console.log(`  1. Set LEADERBOARD_DATA_DIR=${outputDir}`);
  console.log(`  2. Run the plugin-runner to import data`);
}

main().catch((error) => {
  console.error("Error generating seed data:", error);
  process.exit(1);
});
