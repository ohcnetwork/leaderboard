import {
  SORT_BY_OPTIONS,
  FILTER_BY_ROLE_OPTIONS,
  TOP_CONTRIBUTOR_CATEGORIES,
} from "./const";
export interface Contributor {
  file: string;
  slug: string;
  path: string;
  content: string;
  activityData: ActivityData;
  highlights: Highlights;
  leadership?: string[];
  weekSummary: WeekSummary;
  calendarData: any[];
  name: string;
  title: string;
  github: string;
  twitter: string;
  linkedin: string;
  slack: string;
  joining_date: string;
  role: "core" | "intern" | "operations" | "contributor";
  courses_completed: string[];
}

export interface ActivityData {
  last_updated?: string;
  activity: Activity[];
  open_prs: OpenPr[];
  pr_stale: number;
  authored_issue_and_pr: AuthoredIssueAndPr[];
}

export interface Highlights {
  points: number;
  eod_update: number;
  comment_created: number;
  pr_opened: number;
  pr_reviewed: number;
  pr_merged: number;
  pr_collaborated: number;
  issue_assigned: number;
  issue_opened: number;
}

export interface WeekSummary {
  points: number;
  eod_update: number;
  comment_created: number;
  pr_opened: number;
  pr_reviewed: number;
  pr_merged: number;
  pr_collaborated: number;
  issue_assigned: number;
  issue_opened: number;
}

export const ACTIVITY_TYPES = [
  "comment_created",
  "issue_assigned",
  "issue_closed",
  "pr_reviewed",
  "issue_opened",
  "eod_update",
  "pr_opened",
  "pr_merged",
  "pr_collaborated",
] as const;

export interface Activity {
  type: (typeof ACTIVITY_TYPES)[number];
  title: string;
  time: string;
  link: string;
  text: string;
  collaborated_with?: string[];
  turnaround_time?: number;
}

export interface OpenPr {
  link: string;
  title: string;
  stale_for: number;
  labels: string[];
}

export interface AuthoredIssueAndPr {
  issue_link: string;
  pr_link: string;
}

//release section types

// Release interface
export interface Release {
  name: string;
  tag: {
    name: string;
  };
  createdAt: string;
  description: string;
  url: string;
  repository: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  mentions: {
    nodes: {
      login: string;
      avatarUrl: string;
    }[];
  };
}

// Repository interface
export interface Repository {
  name: string;
  releases: {
    nodes: Release[];
  };
}

// Organization interface
export interface Organization {
  repositories: {
    nodes: Repository[];
  };
}

// GitHubResponse interface
export interface ReleasesResponse {
  organization: Organization;
}

export type LeaderboardAPIResponse = {
  user: {
    slug: string;
    name: string;
    title: string;
    role: keyof typeof FILTER_BY_ROLE_OPTIONS;
    content: string;
    social: ContributorSocials;
    joining_date: string;
  };
  highlights: Highlights & { pr_stale: number };
}[];

export type ContributorSocials = {
  github: string;
  twitter: string;
  linkedin: string;
  slack: string;
};

export type PageProps = {
  searchParams: {
    search?: string;
    between?: string; // <start-date>...<end-date>
    sortBy?: LeaderboardSortKey;
    role?: (keyof typeof FILTER_BY_ROLE_OPTIONS)[];
    ordering?: "asc" | "desc";
  };
};

export type LeaderboardSortKey = keyof typeof SORT_BY_OPTIONS;

export type RoleFilterKey = keyof typeof FILTER_BY_ROLE_OPTIONS;

export type TopContributorCategoryKey = keyof typeof TOP_CONTRIBUTOR_CATEGORIES;
