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
  core: boolean;
  intern: boolean;
  operations: boolean;
  courses_completed: string[];
}

export interface ActivityData {
  last_updated?: number;
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
  time: number | string; // TODO: github events are in seconds since epoch, slack events are in timestamp strings. Unify it to one.
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
  data: any;
  organization: Organization;
}
