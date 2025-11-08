import { Config } from "@/types/config";

/**
 * Valid complete configuration
 */
export const validConfig: Config = {
  org: {
    name: "Test Organization",
    description: "A test organization for unit testing",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
    start_date: "2020-01-01",
    socials: {
      github: "https://github.com/testorg",
      slack: "https://slack.test.org",
      linkedin: "https://linkedin.com/company/testorg",
      youtube: "https://youtube.com/testorg",
      email: "test@test.org",
    },
  },
  meta: {
    title: "Test Leaderboard",
    description: "Test leaderboard description",
    image_url: "https://test.org/image.png",
    site_url: "https://leaderboard.test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/testorg/leaderboard-data",
    roles: {
      admin: {
        name: "Admin",
        description: "Administrator role",
      },
      contributor: {
        name: "Contributor",
        description: "Contributor role",
      },
    },
  },
  scrapers: {
    github: {
      source: "https://github.com/testorg/github-scraper",
      cron: "0 0 * * *",
      org: "testorg",
      token: "${{ GITHUB_TOKEN }}",
    },
    slack: {
      source: "./scrapers/slack",
      api_key: "${{ SLACK_API_KEY }}",
    },
  },
};

/**
 * Minimal valid configuration (only required fields)
 */
export const minimalValidConfig: Config = {
  org: {
    name: "Minimal Org",
    description: "Minimal organization",
    url: "https://minimal.org",
    logo_url: "https://minimal.org/logo.png",
  },
  meta: {
    title: "Minimal Leaderboard",
    description: "Minimal description",
    image_url: "https://minimal.org/image.png",
    site_url: "https://minimal.org",
    favicon_url: "https://minimal.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/minimal/data",
    roles: {
      user: {
        name: "User",
      },
    },
  },
};

/**
 * Configuration with missing required org fields
 */
export const missingOrgFieldsConfig = {
  org: {
    name: "Test",
    // Missing: description, url, logo_url
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
};

/**
 * Configuration with missing required meta fields
 */
export const missingMetaFieldsConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
  },
  meta: {
    title: "Test",
    // Missing: description, image_url, site_url, favicon_url
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
};

/**
 * Configuration with empty roles
 */
export const emptyRolesConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {}, // Empty roles object
  },
};

/**
 * Configuration with invalid URL formats
 */
export const invalidUrlsConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "not-a-valid-url",
    logo_url: "also-not-valid",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "invalid",
    site_url: "invalid",
    favicon_url: "invalid",
  },
  leaderboard: {
    data_source: "not-a-url",
    roles: {
      user: { name: "User" },
    },
  },
};

/**
 * Configuration with invalid email format
 */
export const invalidEmailConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
    socials: {
      email: "not-an-email",
    },
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
};

/**
 * Configuration with invalid date format
 */
export const invalidDateConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
    start_date: "not-a-date",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
};

/**
 * Configuration with scraper missing required source field
 */
export const scraperMissingSourceConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
  scrapers: {
    github: {
      // Missing: source
      cron: "0 0 * * *",
      org: "testorg",
    },
  },
};

/**
 * Configuration with invalid cron expression
 */
export const invalidCronConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
  scrapers: {
    github: {
      source: "https://github.com/test/scraper",
      cron: "invalid-cron",
    },
  },
};

/**
 * Configuration with role missing required name field
 */
export const roleMissingNameConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      admin: {
        // Missing: name
        description: "Admin role",
      },
    },
  },
};

/**
 * Configuration with additional properties (should fail with additionalProperties: false)
 */
export const additionalPropertiesConfig = {
  org: {
    name: "Test",
    description: "Test org",
    url: "https://test.org",
    logo_url: "https://test.org/logo.png",
    unexpected_field: "should not be here",
  },
  meta: {
    title: "Test",
    description: "Test",
    image_url: "https://test.org/image.png",
    site_url: "https://test.org",
    favicon_url: "https://test.org/favicon.ico",
  },
  leaderboard: {
    data_source: "https://github.com/test/data",
    roles: {
      user: { name: "User" },
    },
  },
};
