import { describe, expect, it } from "vitest";
import {
  getContributorProfileEditUrl,
  parseGitHubRepoFromUrl,
} from "../github-edit-url";

describe("parseGitHubRepoFromUrl", () => {
  it("parses standard repo URL", () => {
    expect(
      parseGitHubRepoFromUrl("https://github.com/ohcnetwork/leaderboard-data"),
    ).toEqual({ owner: "ohcnetwork", repo: "leaderboard-data" });
  });

  it("accepts trailing slash", () => {
    expect(
      parseGitHubRepoFromUrl("https://github.com/ohcnetwork/leaderboard-data/"),
    ).toEqual({ owner: "ohcnetwork", repo: "leaderboard-data" });
  });

  it("strips .git suffix", () => {
    expect(
      parseGitHubRepoFromUrl(
        "https://github.com/ohcnetwork/leaderboard-data.git",
      ),
    ).toEqual({ owner: "ohcnetwork", repo: "leaderboard-data" });
  });

  it("uses first two path segments when URL includes tree path", () => {
    expect(
      parseGitHubRepoFromUrl(
        "https://github.com/ohcnetwork/leaderboard-data/tree/production/contributors",
      ),
    ).toEqual({ owner: "ohcnetwork", repo: "leaderboard-data" });
  });

  it("returns null for non-GitHub hosts", () => {
    expect(parseGitHubRepoFromUrl("https://gitlab.com/a/b")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(parseGitHubRepoFromUrl("not a url")).toBeNull();
  });
});

describe("getContributorProfileEditUrl", () => {
  it("builds edit URL with encoded branch and username", () => {
    expect(
      getContributorProfileEditUrl(
        "https://github.com/ohcnetwork/leaderboard-data",
        "production",
        "rithviknishad",
      ),
    ).toBe(
      "https://github.com/ohcnetwork/leaderboard-data/edit/production/contributors/rithviknishad.md",
    );
  });

  it("returns null when data source is not github.com", () => {
    expect(
      getContributorProfileEditUrl(
        "https://example.com/org/repo",
        "main",
        "alice",
      ),
    ).toBeNull();
  });
});
