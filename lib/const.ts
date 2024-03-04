export const SORT_BY_OPTIONS = {
  comment_created: "Comment Created",
  eod_update: "EOD Update",
  issue_assigned: "Issue Assigned",
  issue_opened: "Issue Opened",
  points: "Points",
  pr_merged: "PR Merged",
  pr_opened: "PR Opened",
  pr_reviewed: "PR Reviewed",
  pr_stale: "Stale PRs",
} as const;

export const FILTER_BY_ROLE_OPTIONS = {
  core: "Core",
  intern: "Intern",
  operations: "Operations",
  contributor: "Contributor",
} as const;

export const TOP_CONTRIBUTOR_CATEGORIES = {
  eod_update: "EOD Updates",
  pr_opened: "Pull Requests Opened",
  pr_merged: "Pull Requests Merged",
  pr_reviewed: "Pull Requests Reviewed",
  issue_opened: "Issues Opened",
  comment_created: "Comments Created",
} as const;
