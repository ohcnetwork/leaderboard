interface Actor {
  id: number;
  login: string;
  gravatar_id: string;
  url: string;
  avatar_url: string;
}

interface Reactions {
  total_count: number;
  "+1": number;
  "-1": number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

interface Comment {
  html_url: string;
  user: Actor;
  body: string;
  reactions: Reactions;
  created_at: string;
  updated_at: string;
}

export interface PullRequest {
  html_url: string;
  user: Actor;
  title: string;
  body: string;
  number: number;
  labels: string[] | { name: string }[];
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: Date;
  updated_at: string;
  merged_at: Date;
  issue_url: string;
  merged?: string;
  commits_url?: string;
}

interface Review {
  user: Actor;
  body: string;
  html_url: string;
  state: string;
}

interface Issue {
  html_url: string;
  user: Actor;
  title: string;
  body: string;
  labels: string[];
  reactions: Reactions;
  number: number;
  created_at: string;
  updated_at: string;
}

interface Commit {
  sha: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
  message: string;
}

interface GitHubEvent {
  id: string;
  actor: Actor;
  repo: {
    id: number;
    name: string;
    url: string;
  };
  public: boolean;
  created_at: string;
  org: Actor;
}

interface PullRequestReviewEvent extends GitHubEvent {
  type: "PullRequestReviewEvent";
  payload: {
    action: string;
    review: Review;
    pull_request: PullRequest;
  };
}

interface IssuesEvent extends GitHubEvent {
  type: "IssuesEvent";
  payload: {
    action: string;
    issue: Issue;
  };
}

interface IssueCommentEvent extends GitHubEvent {
  type: "IssueCommentEvent";
  payload: {
    action: string;
    issue: Issue;
    comment: Comment;
  };
}

export interface PullRequestEvent extends GitHubEvent {
  type: "PullRequestEvent";
  payload: {
    action: string;
    pull_request: PullRequest;
  };
}

export type IGitHubEvent =
  | PullRequestReviewEvent
  | IssuesEvent
  | IssueCommentEvent
  | PullRequestEvent;

export interface ActivityData {
  last_updated?: string;
  activity: Activity[];
  open_prs: OpenPr[];
  pr_stale?: number;
  authored_issue_and_pr: AuthoredIssueAndPr[];
}
export interface ProcessData {
  [key: string]: ActivityData;
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

export interface Action {
  event: string;
  source: {
    type: string;
    issue: {
      pull_request: boolean;
      repository: {
        full_name: string;
      };
      user: {
        login: string;
      };
      number: number;
    };
  };
  assignee: {
    login: string;
  };
  created_at: Date;
}
export interface Activity {
  type: (typeof ACTIVITY_TYPES)[number] | string;
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
