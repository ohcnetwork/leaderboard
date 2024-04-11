import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";
import Image from "next/image";
import Link from "next/link";
import { GoIssueOpened } from "react-icons/go";
import Markdown from "@/components/Markdown";

const fetchIssues = async () => {
  const organization = "coronasafe"; // Replace with your organization name

  const query = `
    query($org: String!) {
      organization(login: $org) {
        repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            issues(first: 100, states: OPEN, labels: ["good first issue"], filterBy: { assignee: null }) {
              nodes {
                number
                title
                body
                createdAt
                author {
                  login
                  avatarUrl
                }
                url
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await octokit.graphql(query, {
      org: env.NEXT_PUBLIC_GITHUB_ORG,
    });
    console.log(response.organization.repositories.nodes[0].issues.nodes[0]);
    return response.organization.repositories.nodes;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
const page = async () => {
  const repositories = await fetchIssues();

  // if (repositories.length === 0) {
  //   return <div>No issues found with the good first issue label.</div>;
  // }

  return (
    <div className="mx-auto w-3/4">
      <h2 className="p-4 text-center">
        Welcome To the Open Health Care Network
      </h2>
      <div className="felx-col mx-auto">
        {repositories.map((repo) => (
          <div key={repo.name} className="mb-8">
            {repo.issues.nodes.length > 0 && (
              <>
                <h2 className="mb-4 text-4xl font-bold">{repo.name}</h2>
                <ul>
                  {repo.issues.nodes.map((issue) => (
                    <li key={issue.number} className="mb-4">
                      <div className="flex gap-3 rounded p-4">
                        <Image
                          src={issue.author.avatarUrl}
                          alt={issue.author.login}
                          width={40}
                          height={40}
                          className="h-14 w-14 rounded-full"
                        />
                        <div className="flex w-full gap-2 self-center rounded-md border p-4">
                          <GoIssueOpened className="inline-block text-2xl" />
                          <div className="flex-col items-center self-center">
                            <Link href={issue.url} className="hover:underline">
                              {issue.title} #{issue.number}
                            </Link>
                            <div className="flex">
                              <p className="text-gray-400">
                                Created by: {issue.author.login}
                              </p>
                              <p className="ml-4 text-gray-400">
                                Created at:{" "}
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="rounded-lg">
                              <Markdown>{issue.body}</Markdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
