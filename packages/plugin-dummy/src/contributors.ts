/**
 * Generate realistic dummy contributors
 */

import { faker } from "@faker-js/faker";
import type { Contributor } from "@ohcnetwork/leaderboard-api";

const ROLES = ["maintainer", "contributor", "intern", "bot", null] as const;
const ROLE_WEIGHTS = [0.1, 0.7, 0.15, 0.03, 0.02]; // Probabilities for each role

/**
 * Generate a GitHub-style username
 */
function generateUsername(): string {
  const style = faker.number.int({ min: 0, max: 2 });

  switch (style) {
    case 0:
      // firstname-lastname
      return `${faker.person.firstName().toLowerCase()}-${faker.person
        .lastName()
        .toLowerCase()}`;
    case 1:
      // firstname + number
      return `${faker.person.firstName().toLowerCase()}${faker.number.int({
        min: 1,
        max: 999,
      })}`;
    default:
      // Random word combination
      return faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
  }
}

/**
 * Generate a realistic developer bio
 */
function generateBio(): string {
  const templates = [
    `${faker.person.jobTitle()} at ${faker.company.name()}. ${faker.hacker.phrase()}.`,
    `Open source enthusiast. ${faker.person.jobTitle()}. ${faker.hacker.phrase()}.`,
    `${faker.person.jobDescriptor()} ${faker.person.jobTitle()}. Love ${faker.hacker.noun()} and ${faker.hacker.noun()}.`,
    `Building ${faker.hacker.adjective()} solutions for ${faker.hacker.noun()}. ${faker.person.jobTitle()}.`,
    `${faker.person.jobTitle()} | ${faker.hacker.phrase()} | Coffee addict ☕`,
  ];

  return faker.helpers.arrayElement(templates);
}

/**
 * Select a role based on weights
 */
function selectRole(): string | null {
  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < ROLES.length; i++) {
    sum += ROLE_WEIGHTS[i];
    if (random < sum) {
      return ROLES[i];
    }
  }

  return "contributor";
}

/**
 * Generate social profiles
 */
function generateSocialProfiles(username: string): Record<string, string> {
  const profiles: Record<string, string> = {
    github: `https://github.com/${username}`,
  };

  // 70% chance to have Twitter/X
  if (faker.datatype.boolean({ probability: 0.7 })) {
    profiles.twitter = `https://twitter.com/${username}`;
  }

  // 50% chance to have LinkedIn
  if (faker.datatype.boolean({ probability: 0.5 })) {
    profiles.linkedin = `https://linkedin.com/in/${username}`;
  }

  // 30% chance to have personal website
  if (faker.datatype.boolean({ probability: 0.3 })) {
    profiles.website = `https://${username}.dev`;
  }

  return profiles;
}

/**
 * Generate a single contributor
 */
export function generateContributor(): Contributor {
  const username = generateUsername();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const role = selectRole();

  // Generate avatar URL using DiceBear API
  const avatarStyle = faker.helpers.arrayElement([
    "adventurer",
    "avataaars",
    "bottts",
    "lorelei",
    "micah",
    "personas",
  ]);
  const avatar_url = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${username}`;

  // Generate joining date (between 2 years ago and 6 months ago)
  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  const joining_date = faker.date
    .between({ from: twoYearsAgo, to: sixMonthsAgo })
    .toISOString();

  return {
    username,
    name,
    role,
    title: role === "bot" ? "Automation Bot" : faker.person.jobTitle(),
    avatar_url,
    bio: role === "bot" ? "🤖 Automated contributor" : generateBio(),
    social_profiles: role === "bot" ? null : generateSocialProfiles(username),
    joining_date,
    meta: null,
  };
}

/**
 * Generate multiple contributors
 */
export function generateContributors(count: number): Contributor[] {
  const contributors: Contributor[] = [];
  const usernames = new Set<string>();

  while (contributors.length < count) {
    const contributor = generateContributor();

    // Ensure unique usernames
    if (!usernames.has(contributor.username)) {
      usernames.add(contributor.username);
      contributors.push(contributor);
    }
  }

  return contributors;
}
