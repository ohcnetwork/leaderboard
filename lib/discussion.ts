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

const root = join(process.cwd(), "data-repo/data/github/discussions");

export const categories: { name: string; emoji: string }[] = [];

export async function fetchParticipants(discussion: ParsedDiscussion) {
  const org = env.NEXT_PUBLIC_GITHUB_ORG;
  const number = discussion.link?.split("/").pop() ?? "";

  const participants: Participant = await octokit.graphql(`query {
    repository(owner: "${org}", name: "${discussion.repoName}") {
      discussion (number: ${number}) {
        comments(first: 100) {
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
  }`);
  return Array.from(
    new Set(
      participants.repository.discussion.comments.edges.map(
        (c) => c.node.author.login,
      ),
    ),
  );
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

  // get all particpants for github discussions
  discussions.forEach(async (discussion) => {
    // append participants to discussion
    discussion.participants = await fetchParticipants(discussion);
  });

  if (user) {
    return discussions.filter(
      (discussion) =>
        (discussion.participants ?? []).includes(user) ||
        discussion.author === user,
    );
  }

  return noOfDiscussion ? discussions.slice(0, noOfDiscussion) : discussions;
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
