import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GITHUB_PAT: z.string(),
  },
  client: {
    // organization details
    NEXT_PUBLIC_ORG_NAME: z.string(),
    NEXT_PUBLIC_ORG_INFO: z.string().optional(),
    NEXT_PUBLIC_ORG_LOGO: z.string(),
    NEXT_PUBLIC_ORG_URL: z.string(),
    NEXT_PUBLIC_GITHUB_ORG: z.string(),
    NEXT_PUBLIC_SLACK_URL: z.string().url(),
    NEXT_PUBLIC_ORG_START_DATE: z.string(),
    NEXT_PUBLIC_GITHUB_URL: z.string(),
    NEXT_PUBLIC_LINKEDIN_URL: z.string(),
    NEXT_PUBLIC_YOUTUBE_URL: z.string(),
    NEXT_PUBLIC_X_URL: z.string().optional(),
    NEXT_PUBLIC_CONTACT_EMAIL: z.string(),

    // SEO details
    NEXT_PUBLIC_META_TITLE: z.string(),
    NEXT_PUBLIC_META_IMG: z.string(),
    NEXT_PUBLIC_META_DESCRIPTION: z.string(),
    NEXT_PUBLIC_META_URL: z.string(),

    // page details
    NEXT_PUBLIC_PAGE_TITLE: z.string(),
    NEXT_PUBLIC_CONTRIBUTORS_INFO: z.string().optional(),
    NEXT_PUBLIC_LEADERBOARD_DEFAULT_ROLES: z.string().optional(),

    NEXT_PUBLIC_FEATURES: z.string(),
    NEXT_PUBLIC_DATA_SOURCE: z.string(),
    NEXT_PUBLIC_FLAT_REPO_EXPLORER_URL: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ORG_NAME: process.env.NEXT_PUBLIC_ORG_NAME,
    NEXT_PUBLIC_ORG_INFO: process.env.NEXT_PUBLIC_ORG_INFO,
    NEXT_PUBLIC_ORG_LOGO: process.env.NEXT_PUBLIC_ORG_LOGO,
    NEXT_PUBLIC_ORG_URL: process.env.NEXT_PUBLIC_ORG_URL,
    NEXT_PUBLIC_GITHUB_ORG: process.env.NEXT_PUBLIC_GITHUB_ORG,
    NEXT_PUBLIC_SLACK_URL: process.env.NEXT_PUBLIC_SLACK_URL,
    NEXT_PUBLIC_META_TITLE: process.env.NEXT_PUBLIC_META_TITLE,
    NEXT_PUBLIC_META_IMG: process.env.NEXT_PUBLIC_META_IMG,
    NEXT_PUBLIC_META_DESCRIPTION: process.env.NEXT_PUBLIC_META_DESCRIPTION,
    NEXT_PUBLIC_META_URL: process.env.NEXT_PUBLIC_META_URL,
    NEXT_PUBLIC_PAGE_TITLE: process.env.NEXT_PUBLIC_PAGE_TITLE,
    NEXT_PUBLIC_CONTRIBUTORS_INFO: process.env.NEXT_PUBLIC_CONTRIBUTORS_INFO,
    NEXT_PUBLIC_ORG_START_DATE: process.env.NEXT_PUBLIC_ORG_START_DATE,
    NEXT_PUBLIC_LEADERBOARD_DEFAULT_ROLES:
      process.env.NEXT_PUBLIC_LEADERBOARD_DEFAULT_ROLES,
    GITHUB_PAT:
      process.env.NODE_ENV === "development" && !process.env.GITHUB_PAT
        ? ""
        : process.env.GITHUB_PAT,
    NEXT_PUBLIC_FEATURES: process.env.NEXT_PUBLIC_FEATURES,
    NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
    NEXT_PUBLIC_FLAT_REPO_EXPLORER_URL:
      process.env.NEXT_PUBLIC_FLAT_REPO_EXPLORER_URL,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    NEXT_PUBLIC_YOUTUBE_URL: process.env.NEXT_PUBLIC_YOUTUBE_URL,
    NEXT_PUBLIC_X_URL: process.env.NEXT_PUBLIC_X_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  },
});
