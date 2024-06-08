import { octokit } from "./config.js";
import { OpenPr } from "./types.js";
import { resolve_autonomy_responsibility } from "./utils.js";

export const fetch_merge_events = async (user: string, org: string) => {
  console.log("Merge events for : ", user);

  // Fetching closed issues authored by the user
  const { data: issues } = await octokit.request("GET /search/issues", {
    q: `is:issue is:closed org:${org} author:${user}`,
  });

  let merged_prs = [];

  for (const issue of issues.items) {
    const { data: timeline_events } = await octokit.request(
      "GET " + issue.timeline_url,
    );

    for (const event of timeline_events) {
      if (await resolve_autonomy_responsibility(event, user)) {
        const pull_request = event.source.issue.pull_request;
        if (pull_request && pull_request.merged_at) {
          merged_prs.push({
            issue_link: issue.html_url,
            pr_link: pull_request.html_url,
          });
        }
      }
    }
  }

  return merged_prs;
};

export const fetchOpenPulls = async (user: string, org: string) => {
  console.log(`Fetching open pull requests for ${user}`);
  const { data } = await octokit.request("GET /search/issues", {
    q: `is:pr is:open org:${org} author:${user}`,
  });

  type PullsData = (typeof data.items)[0];
  let pulls: PullsData[] = data.items;
  let open_prs: OpenPr[] = [];

  pulls.forEach((pr: PullsData) => {
    let today: Date = new Date();
    let prLastUpdated: Date = new Date(pr.updated_at);
    let staleFor: number = Math.floor(
      (today.getTime() - prLastUpdated.getTime()) / (1000 * 60 * 60 * 24),
    );

    open_prs.push({
      link: pr.html_url,
      title: pr.title,
      stale_for: staleFor,
      labels: pr.labels.map((label: { name: string }) => label.name),
    });
  });

  console.log(`Fetched ${pulls.length} open pull requests for ${user}`);
  return open_prs;
};
