export interface Contributor {
  file: string;
  slug: string;
  path: string;
  content: string;
  activityData: ActivityData;
  highlights: Highlights;
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
  last_updated: number;
  activity: Activity[];
  open_prs: OpenPr[];
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
  pr_stale?: number;
}

export interface Activity {
  type: string;
  title: string;
  time: number;
  link: string;
  text: string;
  collaborated_with?: string[];
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

export interface Category {
  slug: string;
  title: string;
  contributor: Contributor;
}
