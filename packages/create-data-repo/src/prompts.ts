/**
 * Interactive prompts for collecting data repository configuration
 */

import prompts from "prompts";
import type { DataRepoConfig, RoleConfig } from "./types";
import {
  validateUrl,
  validateOptionalUrl,
  validateOptionalDate,
  validateSlug,
  validateEmail,
  validateRequired,
} from "./validation";
import { suggestDataSource } from "./utils";

/**
 * Collect complete configuration through interactive prompts
 */
export async function collectConfig(): Promise<DataRepoConfig> {
  console.log("📋 Organization Information\n");

  // Organization information
  const orgInfo = await prompts([
    {
      type: "text",
      name: "orgName",
      message: "Organization name:",
      validate: validateRequired,
    },
    {
      type: "text",
      name: "orgDescription",
      message: "Organization description:",
      validate: validateRequired,
    },
    {
      type: "text",
      name: "orgUrl",
      message: "Organization website URL:",
      validate: validateUrl,
    },
    {
      type: "text",
      name: "orgLogoUrl",
      message: "Organization logo URL:",
      validate: validateUrl,
    },
    {
      type: "text",
      name: "orgStartDate",
      message: "Organization start date (YYYY-MM-DD, optional):",
      validate: validateOptionalDate,
    },
  ]);

  // Check if user cancelled
  if (!orgInfo.orgName) {
    console.error("\nSetup cancelled.");
    process.exit(1);
  }

  console.log("\n🔗 Social Media Links (optional)\n");

  // Social links
  const socialsPrompt = await prompts({
    type: "confirm",
    name: "addSocials",
    message: "Add social media links?",
    initial: true,
  });

  let socials: any = {};
  if (socialsPrompt.addSocials) {
    socials = await prompts([
      {
        type: "text",
        name: "githubUrl",
        message: "GitHub organization URL (optional):",
        validate: validateOptionalUrl,
      },
      {
        type: "text",
        name: "slackUrl",
        message: "Slack workspace URL (optional):",
        validate: validateOptionalUrl,
      },
      {
        type: "text",
        name: "linkedinUrl",
        message: "LinkedIn company URL (optional):",
        validate: validateOptionalUrl,
      },
      {
        type: "text",
        name: "youtubeUrl",
        message: "YouTube channel URL (optional):",
        validate: validateOptionalUrl,
      },
      {
        type: "text",
        name: "emailContact",
        message: "Contact email (optional):",
        validate: validateEmail,
      },
    ]);
  }

  console.log("\n🌐 Site Metadata & SEO\n");

  // Meta/SEO information
  const metaInfo = await prompts([
    {
      type: "text",
      name: "metaTitle",
      message: "Site title:",
      initial: `${orgInfo.orgName} Leaderboard`,
      validate: validateRequired,
    },
    {
      type: "text",
      name: "metaDescription",
      message: "Site description:",
      initial: `${orgInfo.orgName} contributor leaderboard`,
      validate: validateRequired,
    },
    {
      type: "text",
      name: "metaImageUrl",
      message: "OG image URL (for social sharing):",
      initial: orgInfo.orgLogoUrl,
      validate: validateUrl,
    },
    {
      type: "text",
      name: "metaSiteUrl",
      message: "Public site URL (where leaderboard will be hosted):",
      validate: validateUrl,
    },
    {
      type: "text",
      name: "metaFaviconUrl",
      message: "Favicon URL:",
      initial: orgInfo.orgLogoUrl,
      validate: validateUrl,
    },
  ]);

  console.log("\n⚙️  Leaderboard Configuration\n");

  // Leaderboard configuration
  const leaderboardInfo = await prompts([
    {
      type: "text",
      name: "dataSource",
      message: "Data source repository URL:",
      initial: suggestDataSource(socials.githubUrl),
      validate: validateUrl,
    },
    {
      type: "confirm",
      name: "addTheme",
      message: "Use custom theme CSS?",
      initial: false,
    },
  ]);

  let themeUrl: string | undefined;
  if (leaderboardInfo.addTheme) {
    const themePrompt = await prompts({
      type: "text",
      name: "themeUrl",
      message: "Theme CSS URL:",
      validate: validateUrl,
    });
    themeUrl = themePrompt.themeUrl;
  }

  console.log("\n👥 Roles Configuration\n");
  console.log("Configure at least one role for contributors.\n");

  // Collect roles
  const roles = await collectRoles();

  if (roles.length === 0) {
    console.error("\nError: At least one role is required.");
    process.exit(1);
  }

  // Return complete configuration
  return {
    orgName: orgInfo.orgName,
    orgDescription: orgInfo.orgDescription,
    orgUrl: orgInfo.orgUrl,
    orgLogoUrl: orgInfo.orgLogoUrl,
    orgStartDate: orgInfo.orgStartDate || undefined,
    githubUrl: socials.githubUrl || undefined,
    slackUrl: socials.slackUrl || undefined,
    linkedinUrl: socials.linkedinUrl || undefined,
    youtubeUrl: socials.youtubeUrl || undefined,
    emailContact: socials.emailContact || undefined,
    metaTitle: metaInfo.metaTitle,
    metaDescription: metaInfo.metaDescription,
    metaImageUrl: metaInfo.metaImageUrl,
    metaSiteUrl: metaInfo.metaSiteUrl,
    metaFaviconUrl: metaInfo.metaFaviconUrl,
    dataSource: leaderboardInfo.dataSource,
    themeUrl,
    roles,
  };
}

/**
 * Collect roles through interactive prompts
 */
async function collectRoles(): Promise<RoleConfig[]> {
  const roles: RoleConfig[] = [];
  let continueAdding = true;

  // Suggest default roles
  const useDefaults = await prompts({
    type: "confirm",
    name: "value",
    message: "Add default roles (core, contributor)?",
    initial: true,
  });

  if (useDefaults.value) {
    roles.push(
      {
        slug: "core",
        name: "Core",
        description: "Core team member",
        hidden: false,
      },
      {
        slug: "contributor",
        name: "Contributor",
        description: "Open source contributor",
        hidden: false,
      }
    );
    console.log("✓ Added default roles: core, contributor\n");

    const addMore = await prompts({
      type: "confirm",
      name: "value",
      message: "Add more roles?",
      initial: false,
    });

    continueAdding = addMore.value as boolean;
  }

  while (continueAdding) {
    console.log(`\nRole ${roles.length + 1}:\n`);

    const role = await prompts([
      {
        type: "text",
        name: "slug",
        message: "Role slug (e.g., 'intern', 'bot'):",
        validate: (value) => {
          const slugValidation = validateSlug(value);
          if (slugValidation !== true) return slugValidation;

          // Check for duplicate slugs
          if (roles.some((r) => r.slug === value)) {
            return "This slug is already used";
          }
          return true;
        },
      },
      {
        type: "text",
        name: "name",
        message: "Role display name:",
        validate: validateRequired,
      },
      {
        type: "text",
        name: "description",
        message: "Role description (optional):",
      },
      {
        type: "confirm",
        name: "hidden",
        message: "Hide this role from leaderboard?",
        initial: false,
      },
    ]);

    if (!role.slug) {
      console.log("\nRole creation cancelled.");
      break;
    }

    roles.push({
      slug: role.slug,
      name: role.name,
      description: role.description || undefined,
      hidden: role.hidden || undefined,
    });

    console.log(`✓ Added role: ${role.name}`);

    const addAnother = await prompts({
      type: "confirm",
      name: "value",
      message: "Add another role?",
      initial: false,
    });

    continueAdding = addAnother.value;
  }

  return roles;
}
