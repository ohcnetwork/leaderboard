import { env } from "@/env.mjs";
import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";
import fs from "fs";
import path, { join } from "path";
import stripJsonComments from "strip-json-comments";
import octokit from "./octokit";
import { featureIsEnabled } from "./utils";

const cwd = process.cwd();

const GH_DATA = join(
  cwd,
  process.env.DATA_REPO ?? "data-repo",
  "../data/github/discussions",
);
export const categoriesArray: { name: string; emoji: string }[] = [];

export async function fetchGithubDiscussion(
  noOfDiscussion?: number | null,
  user?: string,
) {
  if (!featureIsEnabled("Discussions")) {
    return null;
  }
  const filesInDir = fs
    .readdirSync(GH_DATA)
    .filter((file) => path.extname(file) === ".json");

  const discussions = filesInDir.map((file) => {
    const content = fs.readFileSync(path.join(GH_DATA, file)).toString();
    return JSON.parse(stripJsonComments(content));
  })[0] as ParsedDiscussion[];

  discussions.forEach((d) => {
    if (d.category) {
      const key = `${d.category.name}-${d.category.emoji}`;
      if (
        !categoriesArray.some(
          (category) =>
            category.name === d.category!.name &&
            category.emoji === d.category!.emoji,
        )
      ) {
        categoriesArray.push(d.category);
      }
    }
  });

  if (user) {
    return discussions.filter(
      (discussion) =>
        (discussion.participants ?? []).includes(user) ||
        discussion.author === user,
    );
  }

  // return noOfDiscussion ? discussions.slice(0, noOfDiscussion) : discussions;
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

  if (response === null) return [];
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
        title = isAnswered
          ? "Answered a Discussion"
          : "Commented on a Discussion";
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
      };
    }),
  );

  return discussions;
}
