import { ReleasesResponse } from "@/lib/types";
import { Repository } from "@/lib/types";
import { Release } from "@/lib/types";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import LoadingText from "@/components/LoadingText";

export default async function Releases(props: { className?: string }) {
  const accessToken = process.env.GITHUB_PAT;

  if (!accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.error("'GITHUB_PAT' is not configured in the environment.");
      return (
        <>
          <span className="flex w-full justify-center text-gray-600 dark:text-gray-400 text-lg font-semibold py-10">
            No recent releases
          </span>
        </>
      );
    }

    throw "'GITHUB_PAT' is not configured in the environment.";
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
          organization(login: "${process.env.NEXT_PUBLIC_GITHUB_ORG}") {
            repositories(first: 100) {
              nodes {
                name
                releases(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
                  nodes {
                    name
                    createdAt
                    description
                    url
                    author {
                      login
                      avatarUrl
                    }
                    mentions (first: 10) {
                      nodes {
                        login 
                        avatarUrl
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = (await response.json()) as ReleasesResponse;
  const data = json.data;

  const repositories: Repository[] = data.organization.repositories.nodes;
  const allReleases: Release[] = [];
  for (const repository of repositories) {
    for (const release of repository.releases.nodes) {
      release.repository = repository.name;
      allReleases.push(release);
    }
  }

  const sortedReleases = allReleases.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (allReleases.length === 0) {
    return (
      <>
        <LoadingText text="Fetching latest events" />;
      </>
    );
  }

  return (
    <>
      <div>
        <ul className="space-y-10">
          {sortedReleases.map((release) => (
            <li
              key={release.createdAt}
              className="flex flex-col rounded-lg border shadow-sm dark:border-gray-700"
            >
              <div className="flex justify-between items-center p-6 pt-4 pb-0">
                <div className="flex items-center">
                  <a
                    href={`https://github.com/coronasafe/${release.repository}`}
                    target="_blank"
                    className={`font-mono text-gray-700 dark:text-gray-300 font-bold tracking-wide`}
                  >
                    <span className="text-gray-400 tracking-normal pr-0.5">
                      {process.env.NEXT_PUBLIC_GITHUB_ORG}/{release.repository}
                    </span>
                  </a>
                </div>
                <a
                  href={release.url}
                  target="_blank"
                  className="rounded-lg border text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center text-sm gap-2 transition-colors hover:bg-gray-100 hover:text-gray-900 hover:dark:bg-gray-800 hover:dark:text-gray-100"
                >
                  <FiGithub />
                  Open in GitHub
                </a>
              </div>

              <div className="flex flex-col p-6">
                <h3 className={`font-semibold`}>{release.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Released by{" "}
                  <a
                    href={`https://github.com/${release.author.login}`}
                    target="_blank"
                    className="font-semibold"
                  >
                    {release.author.login}
                  </a>{" "}
                </p>
              </div>

              <div className="p-6 pt-0">
                <p>Contributors - </p>
                <div className="flex gap-2 mt-3">
                  <div className="grid grid-cols-3 md:grid-cols-10 gap-3">
                    {release.mentions.nodes.map((contributor) => (
                      <Link
                        href={`https://github.com/${contributor.login}`}
                        target="_blank"
                        className="flex"
                        key={contributor.avatarUrl}
                      >
                        <img
                          src={contributor.avatarUrl}
                          alt="img"
                          className="w-10 h-10 rounded-full"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 text-sm break-all bg-gray-100 dark:bg-gray-800 ">
                <Markdown>{release.description}</Markdown>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
