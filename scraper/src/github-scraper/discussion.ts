import { octokit } from "./config.js";
import { Discussion, ParsedDiscussion, Repository } from "./types.js";
import { saveDiscussionData } from "./utils.js";

const query = `query($org: String!, $cursor: String) {
  organization(login: $org) {
    repositories(first: 100, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
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
) {
  const iterator = octokit.graphql.paginate.iterator(query, { org });

  let discussionsList: { repository: string; discussion: Discussion }[] = [];

  for await (const response of iterator) {
    const repositories: Repository[] = response.organization.repositories.edges;

    for (const repo of repositories) {
      const discussions = repo.node.discussions.edges.map((discussion) => ({
        repository: repo.node.name,
        discussion: discussion.node,
      }));

      const isDiscussionOutOfDateRange = discussions.find((d) => {
        const createdAt = new Date(d.discussion.createdAt);
        const updatedAt = new Date(d.discussion.updatedAt);

        return (
          // When created or updated date will be lower than the start date and greater than end date then return true
          (createdAt <= new Date(startDate) &&
            createdAt >= new Date(endDate)) ||
          (updatedAt <= new Date(startDate) && updatedAt >= new Date(endDate))
        );
      });
      if (isDiscussionOutOfDateRange) {
        return discussionsList;
      }
      discussionsList = discussionsList.concat(discussions);
    }
  }

  return discussionsList;
}

async function parseDiscussionData(
  allDiscussions: { repository: string; discussion: Discussion }[],
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
        repository: d.repository,
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
    const parsedDiscussions = await parseDiscussionData(
      allDiscussions,
      endDate,
      startDate,
    );
    await saveDiscussionData(parsedDiscussions, dataDir);
  } catch (error: any) {
    throw new Error(`Error fetching discussions: ${error.message}`);
  }
}
