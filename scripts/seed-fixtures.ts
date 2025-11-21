import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/db";

// Configuration
const CONFIG = {
  contributors: 15,
  activityDefinitions: 8,
  activitiesPerContributor: { min: 5, max: 20 },
  daysBack: 90,
  badgeDefinitions: 4,
  badgesPerContributor: { min: 0, max: 3 },
};

// Predefined activity types
const ACTIVITY_TYPES = [
  { slug: "commit", name: "Code Commit", description: "Committed code to repository", points: 5, icon: "git-commit" },
  { slug: "pull-request", name: "Pull Request", description: "Created a pull request", points: 10, icon: "git-pull-request" },
  { slug: "code-review", name: "Code Review", description: "Reviewed a pull request", points: 8, icon: "eye" },
  { slug: "issue-created", name: "Issue Created", description: "Created an issue", points: 3, icon: "circle-dot" },
  { slug: "issue-resolved", name: "Issue Resolved", description: "Resolved an issue", points: 7, icon: "check-circle" },
  { slug: "documentation", name: "Documentation", description: "Updated documentation", points: 6, icon: "book" },
  { slug: "bug-fix", name: "Bug Fix", description: "Fixed a bug", points: 12, icon: "bug" },
  { slug: "feature", name: "Feature Implementation", description: "Implemented a new feature", points: 15, icon: "sparkles" },
];

// Predefined badge definitions
const BADGE_DEFINITIONS = [
  {
    slug: "contributor-level",
    name: "Contributor Level",
    description: "Recognition for contribution milestones",
    variants: {
      bronze: { description: "Bronze Contributor - 100+ points", svg_url: "/badges/bronze.svg" },
      silver: { description: "Silver Contributor - 500+ points", svg_url: "/badges/silver.svg" },
      gold: { description: "Gold Contributor - 1000+ points", svg_url: "/badges/gold.svg" },
    },
  },
  {
    slug: "early-adopter",
    name: "Early Adopter",
    description: "One of the first contributors to the project",
    variants: {
      default: { description: "Joined in the first month", svg_url: "/badges/early-adopter.svg" },
    },
  },
  {
    slug: "code-reviewer",
    name: "Code Reviewer",
    description: "Excellence in code review",
    variants: {
      bronze: { description: "10+ code reviews", svg_url: "/badges/reviewer-bronze.svg" },
      silver: { description: "50+ code reviews", svg_url: "/badges/reviewer-silver.svg" },
      gold: { description: "100+ code reviews", svg_url: "/badges/reviewer-gold.svg" },
    },
  },
  {
    slug: "bug-hunter",
    name: "Bug Hunter",
    description: "Found and fixed critical bugs",
    variants: {
      default: { description: "Fixed 5+ critical bugs", svg_url: "/badges/bug-hunter.svg" },
    },
  },
];

// Roles for contributors
const ROLES = ["maintainer", "contributor", "reviewer", "documentation", null];

/**
 * Generate a random date within the last N days
 */
function randomDateInPast(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: past, to: now });
}

/**
 * Seed activity definitions
 */
async function seedActivityDefinitions() {
  console.log("\n📝 Seeding activity definitions...");
  
  const definitions = ACTIVITY_TYPES.slice(0, CONFIG.activityDefinitions);
  
  for (const def of definitions) {
    await prisma.activityDefinition.upsert({
      where: { slug: def.slug },
      update: def,
      create: def,
    });
  }
  
  console.log(`✅ Created ${definitions.length} activity definitions`);
  return definitions;
}

/**
 * Seed contributors
 */
async function seedContributors() {
  console.log("\n👥 Seeding contributors...");
  
  const contributors = [];
  
  for (let i = 0; i < CONFIG.contributors; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    
    const contributor = await prisma.contributor.upsert({
      where: { username },
      update: {},
      create: {
        username,
        name: `${firstName} ${lastName}`,
        role: faker.helpers.arrayElement(ROLES),
        title: faker.person.jobTitle(),
        avatarUrl: faker.image.avatar(),
        bio: faker.lorem.paragraph(),
        socialProfiles: {
          github: username,
          twitter: faker.datatype.boolean() ? `@${username}` : null,
          linkedin: faker.datatype.boolean() ? username : null,
        } as any,
        joiningDate: randomDateInPast(CONFIG.daysBack * 2),
        meta: {
          location: faker.location.city(),
          timezone: faker.location.timeZone(),
        } as any,
      },
    });
    
    contributors.push(contributor);
  }
  
  console.log(`✅ Created ${contributors.length} contributors`);
  return contributors;
}

/**
 * Seed activities
 */
async function seedActivities(
  contributors: Array<{ username: string }>,
  activityDefinitions: Array<{ slug: string; name: string }>
) {
  console.log("\n🎯 Seeding activities...");
  
  let totalActivities = 0;
  
  for (const contributor of contributors) {
    const numActivities = faker.number.int({
      min: CONFIG.activitiesPerContributor.min,
      max: CONFIG.activitiesPerContributor.max,
    });
    
    for (let i = 0; i < numActivities; i++) {
      const activityDef = faker.helpers.arrayElement(activityDefinitions);
      const occuredAt = randomDateInPast(CONFIG.daysBack);
      
      // Generate activity-specific content
      let title = "";
      let text = "";
      let link = "";
      
      switch (activityDef.slug) {
        case "commit":
          title = faker.git.commitMessage();
          link = `https://github.com/example/repo/commit/${faker.git.commitSha()}`;
          break;
        case "pull-request":
          title = `feat: ${faker.hacker.phrase()}`;
          text = faker.lorem.paragraph();
          link = `https://github.com/example/repo/pull/${faker.number.int({ min: 1, max: 999 })}`;
          break;
        case "code-review":
          title = `Review: ${faker.hacker.phrase()}`;
          text = faker.lorem.sentence();
          link = `https://github.com/example/repo/pull/${faker.number.int({ min: 1, max: 999 })}`;
          break;
        case "issue-created":
        case "issue-resolved":
          title = faker.lorem.sentence();
          text = faker.lorem.paragraph();
          link = `https://github.com/example/repo/issues/${faker.number.int({ min: 1, max: 999 })}`;
          break;
        case "documentation":
          title = `docs: ${faker.lorem.words(3)}`;
          link = `https://github.com/example/repo/commit/${faker.git.commitSha()}`;
          break;
        case "bug-fix":
          title = `fix: ${faker.lorem.sentence()}`;
          text = faker.lorem.paragraph();
          link = `https://github.com/example/repo/pull/${faker.number.int({ min: 1, max: 999 })}`;
          break;
        case "feature":
          title = `feat: ${faker.hacker.phrase()}`;
          text = faker.lorem.paragraphs(2);
          link = `https://github.com/example/repo/pull/${faker.number.int({ min: 1, max: 999 })}`;
          break;
        default:
          title = faker.lorem.sentence();
      }
      
      const slug = `${activityDef.slug}-${contributor.username}-${occuredAt.getTime()}`;
      
      await prisma.activity.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          contributor: contributor.username,
          activityDefinition: activityDef.slug,
          title,
          occuredAt,
          link: link || null,
          text: text || null,
          points: null, // Will use definition points
          meta: {
            generated: true,
            seed: true,
          } as any,
        },
      });
      
      totalActivities++;
    }
  }
  
  console.log(`✅ Created ${totalActivities} activities`);
}

/**
 * Seed badge definitions
 */
async function seedBadgeDefinitions() {
  console.log("\n🏆 Seeding badge definitions...");
  
  const badges = BADGE_DEFINITIONS.slice(0, CONFIG.badgeDefinitions);
  
  for (const badge of badges) {
    await prisma.badgeDefinition.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        variants: badge.variants as any,
      },
      create: {
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        variants: badge.variants as any,
      },
    });
  }
  
  console.log(`✅ Created ${badges.length} badge definitions`);
  return badges;
}

/**
 * Seed contributor badges
 */
async function seedContributorBadges(
  contributors: Array<{ username: string }>,
  badgeDefinitions: Array<{ slug: string; variants: Record<string, any> }>
) {
  console.log("\n🎖️  Seeding contributor badges...");
  
  let totalBadges = 0;
  
  for (const contributor of contributors) {
    const numBadges = faker.number.int({
      min: CONFIG.badgesPerContributor.min,
      max: CONFIG.badgesPerContributor.max,
    });
    
    // Randomly select badges
    const selectedBadges = faker.helpers.arrayElements(
      badgeDefinitions,
      Math.min(numBadges, badgeDefinitions.length)
    );
    
    for (const badge of selectedBadges) {
      const variantKeys = Object.keys(badge.variants);
      const variant = faker.helpers.arrayElement(variantKeys);
      const achievedOn = randomDateInPast(CONFIG.daysBack);
      
      const slug = `${badge.slug}-${contributor.username}-${variant}`;
      
      try {
        await prisma.contributorBadge.upsert({
          where: { slug },
          update: {},
          create: {
            slug,
            badge: badge.slug,
            contributor: contributor.username,
            variant,
            achievedOn,
            meta: {
              generated: true,
              seed: true,
            } as any,
          },
        });
        totalBadges++;
      } catch (error) {
        // Skip if unique constraint fails (badge + contributor + variant already exists)
        continue;
      }
    }
  }
  
  console.log(`✅ Created ${totalBadges} contributor badges`);
}

/**
 * Main seed function
 */
async function main() {
  console.log("🌱 Starting database seeding with fixtures...\n");
  console.log("Configuration:");
  console.log(`  - Contributors: ${CONFIG.contributors}`);
  console.log(`  - Activity Definitions: ${CONFIG.activityDefinitions}`);
  console.log(`  - Activities per Contributor: ${CONFIG.activitiesPerContributor.min}-${CONFIG.activitiesPerContributor.max}`);
  console.log(`  - Date Range: Last ${CONFIG.daysBack} days`);
  console.log(`  - Badge Definitions: ${CONFIG.badgeDefinitions}`);
  console.log(`  - Badges per Contributor: ${CONFIG.badgesPerContributor.min}-${CONFIG.badgesPerContributor.max}`);
  
  try {
    // Seed in order (respecting foreign key constraints)
    const activityDefinitions = await seedActivityDefinitions();
    const contributors = await seedContributors();
    await seedActivities(contributors, activityDefinitions);
    const badgeDefinitions = await seedBadgeDefinitions();
    await seedContributorBadges(contributors, badgeDefinitions);
    
    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - ${activityDefinitions.length} activity definitions`);
    console.log(`  - ${contributors.length} contributors`);
    console.log(`  - ${CONFIG.badgeDefinitions} badge definitions`);
    console.log("\n💡 You can now run 'pnpm build' to generate the static site with this data.");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  prisma.$disconnect();
  process.exit(1);
});

