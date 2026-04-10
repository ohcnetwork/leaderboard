/**
 * Build GitHub web "edit file" URLs for contributor markdown in the data repo.
 */

export interface GitHubRepoRef {
  owner: string;
  repo: string;
}

/**
 * Parse `owner` and `repo` from a GitHub repository URL.
 * Supports `https://github.com/owner/repo`, optional trailing slash, `/tree/...` paths, and `.git` suffix.
 */
export function parseGitHubRepoFromUrl(url: string): GitHubRepoRef | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== "github.com") {
      return null;
    }
    const segments = u.pathname.split("/").filter((s) => s.length > 0);
    if (segments.length < 2) {
      return null;
    }
    let owner = segments[0];
    let repo = segments[1];
    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -".git".length);
    }
    return { owner, repo };
  } catch {
    return null;
  }
}

/**
 * GitHub in-browser editor URL for `contributors/{username}.md` on the given branch.
 */
export function getContributorProfileEditUrl(
  dataSourceUrl: string,
  branch: string,
  username: string,
): string | null {
  const ref = parseGitHubRepoFromUrl(dataSourceUrl);
  if (!ref) {
    return null;
  }
  const path = `contributors/${encodeURIComponent(username)}.md`;
  const b = encodeURIComponent(branch);
  return `https://github.com/${ref.owner}/${ref.repo}/edit/${b}/${path}`;
}
