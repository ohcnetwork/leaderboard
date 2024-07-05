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
                category{
                  name
                  emoji
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

async function fetchDiscussionsForOrg(org: string, cursor = null) {
  const variables = { org, cursor };
  const response = await octokit.graphql.paginate(query, variables);

  type Edge = typeof response.organization.repositories.edges;
  const discussions = response.organization.repositories.edges.map(
    (edge: Edge) => edge.node.discussions.edges,
  );

  return discussions.flat();
}

async function parseDiscussionData(allDiscussions: Discussion[]) {
  const parsedDiscussions: ParsedDiscussion[] = allDiscussions.map((d) => {
    const participants = Array.from(
      new Set(d.node.comments.edges.map((c) => c.node.author.login)),
    );
    return {
      source: "github",
      title: d.node.title,
      description: d.node.body,
      author: d.node.author.login,
      url: d.node.url,
      time: d.node.createdAt,
      category: d.node.category,
      participants,
    };
  });
  return parsedDiscussions;
}

export async function fetchAllDiscussionEventsByOrg(
  organizationName: string,
  dataDir: string,
) {
  try {
    const allDiscussions = await fetchDiscussionsForOrg(organizationName);
    const parsedDiscussions = await parseDiscussionData(allDiscussions);
    await saveDiscussionData(parsedDiscussions, dataDir);
  } catch (error: any) {
    throw new Error(`Error fetching discussions: ${error.message}`);
  }
}
