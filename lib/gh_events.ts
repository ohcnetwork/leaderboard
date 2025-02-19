interface Actor {
  id: number;
  login: string;
  gravatar_id: string;
  url: string;
  avatar_url: string;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: Actor;
  url: string;
  fork: boolean;
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

interface PullRequest {
  html_url: string;
  user: Actor;
  title: string;
  body: string;
  number: number;
  labels: string[];
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
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

interface PullRequestReviewCommentEvent extends GitHubEvent {
  type: "PullRequestReviewCommentEvent";
  payload: {
    action: string;
    comment: Comment;
    pull_request: PullRequest;
  };
}
interface PullRequestReviewEvent extends GitHubEvent {
  type: "PullRequestReviewEvent";
  payload: {
    action: string;
    review: Review;
    pull_request: PullRequest;
  };
}
interface MemberEvent extends GitHubEvent {
  type: "MemberEvent";
  payload: {
    action: string;
    member: Actor;
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

interface PullRequestEvent extends GitHubEvent {
  type: "PullRequestEvent";
  payload: {
    action: string;
    pull_request: PullRequest;
  };
}

interface PushEvent extends GitHubEvent {
  type: "PushEvent";
  payload: {
    ref: string;
    commits: Commit[];
    size: number;
  };
}

interface ForkEvent extends GitHubEvent {
  type: "ForkEvent";
  payload: {
    forkee: Repo;
  };
}

export interface ReleaseEvent extends GitHubEvent {
  type: "ReleaseEvent";
  payload: {
    action: string;
    release: {
      html_url: string;
      tag_name: string;
      name: string;
      body: string;
      discussions_url: string;
      mentions: {
        avatar_url: string;
        login: string;
        profile_name: string;
        profile_url: string;
      }[];
      author: Actor;
    };
  };
}

export type IGitHubEvent =
  | PullRequestReviewCommentEvent
  | PullRequestReviewEvent
  | MemberEvent
  | IssuesEvent
  | IssueCommentEvent
  | PullRequestEvent
  | PushEvent
  | ForkEvent
  | ReleaseEvent;
