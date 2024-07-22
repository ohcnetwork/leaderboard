import { octokit } from "./config.js";
import { Discussion, ParsedDiscussion } from "./types.js";
import { saveDiscussionData } from "./utils.js";

const query = `query($org: String!, $cursor: String) {
  organization(login: $org) {
    repositories(first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          name
            discussions(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
            edges {
              node {
                title
                body
                author {
                  login
                }
                url
                isAnswered
                category {
                  name
                  emojiHTML
                }
                comments(first: 10) {
                  edges {
                    node {
                      author {
                        login
                      }
                    }
                  }
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    }
  }
}`;

async function fetchGitHubDiscussions(
  org: string,
  endDate: Date,
  startDate: Date,
  cursor = null,
) {
  const variables = {
    org,
    cursor,
  };
  for await (const response of octokit.graphql.paginate.iterator(
    query,
    variables,
  )) {
    const repositories = await response.organization.repositories.edges;
    type repo = (typeof repositories)[0];
    for (const repo of repositories) {
      const discussions = await repo.node.discussions.edges.map(
        (discussion: repo) => ({
          repoName: repo.node.name,
          discussion: discussion.node,
        }),
      );
      const discussionsWithinDateRange = await discussions.find((d: repo) => {
        const createdAt = new Date(d.discussion.createdAt);
        const updatedAt = new Date(d.discussion.updatedAt);

        return (
          createdAt >= new Date(startDate) || updatedAt >= new Date(startDate)
        );
      });
      if (discussionsWithinDateRange) {
        return discussions;
      }
    }
  }

  return null;
}

async function parseDiscussionData(
  allDiscussions: { repoName: string; discussion: Discussion }[],
  endDate: Date,
  startDate: Date,
) {
  const discussionsWithinDateRange = allDiscussions.filter((d) => {
    const createdAt = new Date(d.discussion.createdAt);
    const updatedAt = new Date(d.discussion.updatedAt);

    return (
      (createdAt >= new Date(startDate) && createdAt <= new Date(endDate)) ||
      (updatedAt >= new Date(startDate) && updatedAt <= new Date(endDate))
    );
  });
  const parsedDiscussions: ParsedDiscussion[] = discussionsWithinDateRange.map(
    (d) => {
      const participants = d.discussion.comments.edges.map(
        (comment) => comment.node.author.login,
      );
      return {
        source: "github",
        title: d.discussion.title,
        text: d.discussion.body,
        author: d.discussion.author.login,
        link: d.discussion.url,
        isAnswered: d.discussion.isAnswered,
        time: d.discussion.createdAt,
        updateTime: d.discussion.updatedAt,
        category: {
          name: d.discussion.category.name,
          emoji: d.discussion.category.emojiHTML.replace(/<\/?div>/g, ""),
        },
        participants: participants || [],
        repoName: d.repoName,
      };
    },
  );
  return parsedDiscussions;
}

export async function scrapeDiscussions(
  organizationName: string,
  dataDir: string,
  endDate: Date,
  startDate: Date,
) {
  try {
    const allDiscussions = await fetchGitHubDiscussions(
      organizationName,
      endDate,
      startDate,
    );
    const parsedDiscussions =
      allDiscussions &&
      (await parseDiscussionData(allDiscussions, endDate, startDate));
    await saveDiscussionData(parsedDiscussions, dataDir);
  } catch (error: any) {
    throw new Error(`Error fetching discussions: ${error.message}`);
  }
}
