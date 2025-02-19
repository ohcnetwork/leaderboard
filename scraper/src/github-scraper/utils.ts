import path from "path";
import { octokit } from "./config.js";
import {
  Action,
  ActivityData,
  ParsedDiscussion,
  PullRequestEvent,
} from "./types.js";
import { mkdir, readFile, writeFile } from "fs/promises";

export const parseISODate = (isoDate: Date) => {
  return new Date(isoDate);
};

const userBlacklist = new Set(
  ["dependabot", "snyk-bot", "codecov-commenter"].concat(
    process.env.BLACKLISTED_USERS?.split(",") ?? [],
  ),
);

export const isBlacklisted = (login: string): boolean => {
  return (
    login.includes("[bot]") ||
    login.endsWith("-bot") ||
    userBlacklist.has(login)
  );
};

export async function calculateTurnaroundTime(event: PullRequestEvent) {
  const user: string = event.payload.pull_request.user.login;
  const mergedAt: Date = parseISODate(event.payload.pull_request.merged_at);
  const createdAt: Date = parseISODate(event.payload.pull_request.created_at);

  const linkedIssues: [string, string][] = [];
  const linkedIssuesResponse = await octokit.request(
    `GET ${event.payload?.pull_request?.issue_url}`,
  );
  // Fetch url all linked issues url from the response
  linkedIssues.push([event.repo.name, `#${linkedIssuesResponse.data.number}`]);

  // Fetch issue events to find cross-referenced issues
  const issueEventsUrl = await linkedIssuesResponse.data.events_url;
  const issueEventsResponse = await octokit.request(`GET ${issueEventsUrl}`);

  type issueEvent = typeof issueEventsResponse.data;
  // Filter for cross-referenced events and add them if they are from a different repo
  issueEventsResponse.data.forEach((event: issueEvent) => {
    if (event.event === "cross-referenced" && event.source?.issue) {
      const crossReferencedRepoFullName =
        event.source.issue.repository.full_name;
      const crossReferencedIssueNumber = `#${event.source.issue.number}`;

      // Check if the cross-referenced issue is from a different repository
      if (
        crossReferencedRepoFullName !==
        linkedIssuesResponse.data.repository.full_name
      ) {
        linkedIssues.push([
          crossReferencedRepoFullName,
          crossReferencedIssueNumber,
        ]);
      }
    }
  });

  const prTimelineResponse = await octokit.request(
    `GET ${event.payload?.pull_request?.issue_url}/timeline`,
  );

  prTimelineResponse.data.forEach((action: Action) => {
    if (
      action.event === "cross-referenced" &&
      action.source.type === "issue" &&
      !action.source.issue.pull_request
    ) {
      linkedIssues.push([
        action.source.issue.repository.full_name,
        `#${action.source.issue.number}`,
      ]);
    }

    if (action.event === "connected") {
      // TODO: currently there is no way to get the issue number from the timeline, handle this case while moving to graphql
    }
  });

  const uniqueLinkedIssues = Array.from(
    new Set(linkedIssues.map((issue) => JSON.stringify(issue))),
  ).map((item) => JSON.parse(item) as [string, string]);

  const assignedAts: { issue: string; time: Date }[] = [];

  for (const [org_repo, issue] of uniqueLinkedIssues) {
    const org = org_repo.split("/")[0] || event.repo.name.split("/")[0];
    const repo = org_repo.split("/")[-1] || event.repo.name.split("/")[1];
    const issueNumber = parseInt(issue.split("#")[1]);

    const issueTimelineResponse = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
      {
        owner: org,
        repo: repo,
        issue_number: issueNumber,
      },
    );
    type IssueTimelineType = (typeof issueTimelineResponse.data)[0];
    issueTimelineResponse.data.forEach((action: IssueTimelineType) => {
      if ("assignee" in action) {
        if (action.event === "assigned" && action.assignee?.login === user) {
          assignedAts.push({
            issue: `${org}/${repo}#${issueNumber}`,
            time: parseISODate(new Date(action.created_at)),
          });
        }

        if (action.event === "unassigned" && action.assignee?.login === user) {
          assignedAts.pop();
        }
      }
    });

    const assignedAt: Date | null =
      assignedAts.length === 0
        ? null
        : assignedAts.reduce((min, current) =>
            current.time < min.time ? current : min,
          ).time;
    const turnaroundTime =
      (mergedAt.getTime() - (assignedAt || createdAt.getTime()).valueOf()) /
      1000;
    return turnaroundTime;
  }
}

export async function resolveAutonomyResponsibility(
  event: Action,
  user: string,
) {
  return (
    event.event === "cross-referenced" &&
    event.source.type === "issue" &&
    event.source.issue.user.login === user
  );
}

export async function loadUserData(user: string, dataDir: string) {
  const file = path.join(dataDir, `${user}.json`);
  console.log(`Loading user data from ${file}`);

  try {
    const response = await readFile(file);
    const data: ActivityData = JSON.parse(response.toString());
    return data;
  } catch (error: any) {
    if (error.code === "ENOENT" || error.name === "SyntaxError") {
      console.log(`User data not found for ${user}`);
      return { activity: [] };
    } else {
      throw error; // rethrow unexpected errors
    }
  }
}

export async function saveUserData(
  user: string,
  data: ActivityData,
  dataDir: string,
  serializer: any,
) {
  const file = path.join(dataDir, `${user}.json`);
  console.log(`Saving user data to ${file}`);

  try {
    const jsonData = JSON.stringify(data, serializer, 2);
    await writeFile(file, jsonData);
  } catch (error: any) {
    console.error(`Failed to save user data for ${user}: ${error.message}`);
    throw error;
  }
}

export async function mergeDiscussions(
  oldData: ParsedDiscussion[],
  newDiscussions: ParsedDiscussion[],
) {
  const mergedDiscussions = [...oldData];
  if (!newDiscussions) {
    return mergedDiscussions;
  }
  newDiscussions.forEach((newDiscussion) => {
    const oldIndex = oldData.findIndex(
      (oldDiscussion) => oldDiscussion.link === newDiscussion.link,
    );

    if (oldIndex !== -1) {
      if (
        oldData[oldIndex].updateTime !== newDiscussion.updateTime ||
        oldData[oldIndex].participants !== newDiscussion.participants
      ) {
        mergedDiscussions[oldIndex] = newDiscussion;
      }
    } else {
      mergedDiscussions.push(newDiscussion);
    }
  });

  return mergedDiscussions;
}

export async function saveDiscussionData(
  discussions: ParsedDiscussion[],
  dataDir: string,
) {
  // check data dir present or not and file is present or not if not then create it
  await mkdir(dataDir + "/discussions", { recursive: true });
  if (discussions.length === 0) {
    return;
  }
  const discussionsDir = path.join(dataDir, "discussions");
  const file = path.join(discussionsDir, "discussions.json");
  try {
    // Try reading the file
    const response = await readFile(file);
    const oldData = JSON.parse(response.toString());
    const mergedData = await mergeDiscussions(oldData, discussions);
    const jsonData = JSON.stringify(mergedData, null, 2);
    await writeFile(file, jsonData);
  } catch (err) {
    // File doesn't exist, create it with initial data
    const jsonData = JSON.stringify(discussions, null, 2);
    await writeFile(file, jsonData);
  }
}
