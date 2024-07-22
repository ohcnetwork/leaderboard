import { env } from "@/env.mjs";
import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";
import fs from "fs";
import path, { join } from "path";
import stripJsonComments from "strip-json-comments";
import octokit from "./octokit";
import { featureIsEnabled } from "./utils";
import { Activity } from "./types";

interface Participant {
  repository: {
    discussion: {
      comments: {
        edges: {
          node: {
            author: {
              login: string;
            };
          };
        }[];
      };
    };
  };
}
interface Dicussion {
  repository: {
    discussion: {
      answer: {
        author: {
          login: string;
        };
      };
    };
  };
}

const root = join(process.cwd(), "data-repo/data/github/discussions");

export const categories: { name: string; emoji: string }[] = [];

export async function fetchParticipants(discussion: ParsedDiscussion) {
  const org = env.NEXT_PUBLIC_GITHUB_ORG;
  const number = discussion.link?.split("/").pop() ?? "";

  const query = `query($org: String!, $repoName: String!, $discussionNumber: Int!, $cursor: String) {
    repository(owner: $org, name: $repoName) {
      discussion(number: $discussionNumber) {
        comments(first: 100, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              author {
                login
              }
            }
          }
        }
      }
    }
  }
`;
  const participants: Participant = await octokit.graphql.paginate(query, {
    org,
    repoName: discussion.repoName,
    discussionNumber: Number(number),
    cursor: null,
  });
  return Array.from(
    new Set(
      participants.repository.discussion.comments.edges.map(
        (c) => c.node.author.login,
      ),
    ),
  );
}

async function appendParticipantsToDiscussions(
  discussions: ParsedDiscussion[],
) {
  await Promise.all(
    discussions.map(async (discussion) => {
      if (!discussion.isAnswered)
        discussion.participants = await fetchParticipants(discussion);
    }),
  );
  return discussions;
}

export async function fetchGithubDiscussion(
  noOfDiscussion?: number | null,
  user?: string,
) {
  if (!featureIsEnabled("Discussions")) {
    return null;
  }
  const filesInDir = fs
    .readdirSync(root)
    .filter((file) => path.extname(file) === ".json");

  const discussions = filesInDir.map((file) => {
    const content = fs.readFileSync(path.join(root, file)).toString();
    return JSON.parse(stripJsonComments(content));
  })[0] as ParsedDiscussion[];

  discussions.forEach((d) => {
    if (d.category) {
      const key = `${d.category.name}-${d.category.emoji}`;
      if (
        !categories.some(
          (category) =>
            category.name === d.category!.name &&
            category.emoji === d.category!.emoji,
        )
      ) {
        categories.push(d.category);
      }
    }
  });

  let discussionsToReturn: ParsedDiscussion[] = discussions;

  if (user) {
    discussionsToReturn = discussions.filter(
      (discussion) =>
        (discussion.participants ?? []).includes(user) ||
        discussion.author === user,
    );
  } else if (noOfDiscussion) {
    discussionsToReturn = discussions.slice(0, noOfDiscussion);
  }

  return await appendParticipantsToDiscussions(discussionsToReturn);
}

export async function checkAnsweredByUser(
  github: string,
  number: string,
  repoName: string,
) {
  const org = env.NEXT_PUBLIC_GITHUB_ORG;

  const dicussion: Dicussion = await octokit.graphql(`query {
    repository(owner: "${org}", name: "${repoName}") {
      discussion (number: ${number}) {
        answer {
          author {
            login
          }
        }
      }
    }
  }`);
  if (dicussion.repository.discussion.answer !== null) {
    return dicussion.repository.discussion.answer.author.login === github;
  } else return false;
}

export async function getGithubDiscussions(githubHandle: string) {
  const response = await fetchGithubDiscussion(null, githubHandle);

  if (response === null) return [] as Activity[];
  const discussions = await Promise.all(
    response.map(async (discussion: ParsedDiscussion) => {
      const isAuthor = discussion.author === githubHandle;
      let title, activityType;

      if (isAuthor) {
        title = "Started a Discussion";
        activityType = "discussion_created";
      } else {
        const isAnswered = await checkAnsweredByUser(
          githubHandle,
          discussion.link?.split("/").pop() ?? "",
          discussion.repoName,
        );
        title = isAnswered ? "Discussion Answered" : "Commented on discussion";
        activityType = isAnswered
          ? "discussion_answered"
          : "discussion_comment_created";
      }

      return {
        type: activityType,
        title: title,
        time: discussion.time,
        link: discussion.link,
        text: "",
        discussion: discussion,
      } as Activity;
    }),
  );

  return discussions;
}
