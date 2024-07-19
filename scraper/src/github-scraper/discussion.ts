import { parseISO, startOfDay, subDays } from "date-fns";
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
                  emojiHTML 
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
    (edge: Edge) => ({
      repoName: edge.node.name,
      discussions: edge.node.discussions.edges,
    }),
  );

  return discussions;
}

async function parseDiscussionData(
  allDiscussions: { repoName: string; discussions: Discussion[] }[],
  date: string,
  numDays: number,
) {
  const endDate: Date = startOfDay(parseISO(date));
  const startDate: Date = startOfDay(subDays(endDate, numDays));

  const parsedDiscussions: ParsedDiscussion[] = allDiscussions.flatMap(
    (repo) => {
      const filteredDiscussions = repo.discussions.filter((d) => {
        const discussionTime: Date = new Date(d.node.createdAt);
        return discussionTime > startDate && discussionTime <= endDate;
      });

      return filteredDiscussions.map((d) => {
        return {
          source: "github",
          title: d.node.title,
          text: d.node.body,
          author: d.node.author.login,
          link: d.node.url,
          time: d.node.createdAt,
          category: {
            name: d.node.category.name,
            emoji: d.node.category.emojiHTML.replace(/<\/?div>/g, ""),
          },
          repoName: repo.repoName,
        };
      });
    },
  );

  return parsedDiscussions;
}

export async function fetchAllDiscussionEventsByOrg(
  organizationName: string,
  dataDir: string,
  date: string,
  numDays: number = 1,
) {
  try {
    const allDiscussions = await fetchDiscussionsForOrg(organizationName);
    const parsedDiscussions = await parseDiscussionData(
      allDiscussions,
      date,
      numDays,
    );
    await saveDiscussionData(parsedDiscussions, dataDir);
  } catch (error: any) {
    throw new Error(`Error fetching discussions: ${error.message}`);
  }
}
