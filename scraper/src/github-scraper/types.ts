interface Actor {
  id: number;
  login: string;
  gravatar_id: string;
  url: string;
  avatar_url: string;
}

interface Comment {
  html_url: string;
  user: Actor;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface PullRequest {
  base: {
    label: string;
    ref: string;
    sha: string;
    user: Actor;
  };
  head: {
    label: string;
    ref: string;
    sha: string;
    user: Actor;
  };
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
  number: number;
  created_at: string;
  updated_at: string;
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
  "issue_closed",
  "eod_update",
  "pr_opened",
  "pr_merged",
  "pr_collaborated",
] as const;

export interface Action {
  event: string;
  source: {
    [x: string]: any;
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
  labels: (string | undefined)[];
}

export interface AuthoredIssueAndPr {
  issue_link: string;
  pr_link: string;
}

export type Discussion = {
  isAnswered: Boolean;
  title: string;
  body: string;
  author: {
    login: string;
  };
  url: string;
  category: {
    name: string;
    emojiHTML: string;
  };
  comments: {
    edges: {
      node: {
        author: {
          login: string;
        };
      };
    }[];
  };
  createdAt: string;
  updatedAt: string;
};

export type Repository = {
  node: {
    name: string;
    discussions: {
      edges: {
        node: Discussion;
      }[];
    };
  };
};

export type ParsedDiscussion = {
  source?: string;
  title: string;
  text: string;
  author: string;
  link: string;
  isAnswered: Boolean;
  time: string;
  updateTime: string;
  category?: {
    name: string;
    emoji: string;
  };
  participants?: string[];
  repository: string;
};
