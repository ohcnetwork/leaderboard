import { octokit } from "./config.js";
import { Discussion, ParsedDiscussion } from "./types.js";
import { saveDiscussionData } from "./utils.js";

// Query to fetch discussions from GitHub
const query = `
query($org: String!, $cursor: String) {
  organization(login: $org) {
    repositories(first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          name
          discussions(first: 100) {
            edges {
              node {
                title
                body
                author {
                  login
                }
                url
                isAnswered
                category{
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
              }
            }
          }
        }
      }
    }
  }
}
`;

async function fetchGitHubDiscussions(org: string, cursor = null) {
  const variables = { org, cursor };
  const response = await octokit.graphql.paginate(query, variables);

  type Edge = typeof response.organization.repositories.edges;

  const discussions = response.organization.repositories.edges.map(
    (edge: Edge) => ({
      repoName: edge.node.name,
      discussions: edge.node.discussions.edges,
    }),
  );

  return discussions;
}

async function parseDiscussionData(
  allDiscussions: { repoName: string; discussions: Discussion[] }[],
  endDate: Date,
  startDate: Date,
) {
  const parsedDiscussions: ParsedDiscussion[] = allDiscussions.flatMap(
    (repo) => {
      const filteredDiscussions = repo.discussions.filter((d) => {
        const discussionTime: Date = new Date(d.node.createdAt);
        return discussionTime > startDate && discussionTime <= endDate;
      });

      return filteredDiscussions.map((d) => {
        const participants = Array.from(
          new Set(d.node.comments.edges.map((c) => c.node.author.login)),
        );
        return {
          source: "github",
          title: d.node.title,
          text: d.node.body,
          author: d.node.author.login,
          link: d.node.url,
          isAnswered: d.node.isAnswered,
          time: d.node.createdAt,
          category: {
            name: d.node.category.name,
            emoji: d.node.category.emojiHTML.replace(/<\/?div>/g, ""),
          },
          participants: participants,
          repoName: repo.repoName,
        };
      });
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
    const allDiscussions = await fetchGitHubDiscussions(organizationName);
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
