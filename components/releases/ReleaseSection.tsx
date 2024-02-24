"use client";

import React, { useEffect, useState } from "react";
import Release from "@/app/api/releases/route";

const ReleaseSection: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  useEffect(() => {
    fetch("/api/releases")
      .then((res) => res.json())
      .then((data: Release[]) => setReleases(data))
      .catch((error) => console.error("Error fetching releases:", error));
  }, []);

  if (releases.length === 0) {
    return (
      <>
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1">
      <ol className="relative border-s border-gray-200 dark:border-gray-700">
        {releases.map((release) => (
          <li className="mb-10 ms-4 group">
            <div className="absolute mt-1.5 left-[-18px]">
              <img
                src={release.author.avatarUrl}
                alt="user-avatar"
                className="flex h-10 w-10 group-hover:scale-125 items-center justify-center rounded-full bg-gray-400 ring-8 ring-gray-200 dark:ring-gray-800 group-hover:dark:ring-white/50 transition-all duration-200 ease-in-out group-hover:ring-2"
              />
            </div>
            <div className="ml-10">
              <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-400">
                <a
                  href={`https://github.com/${release.author.login}`}
                  target="_blank"
                  className="text-gray-300 font-semibold"
                >
                  {release.author.login}
                </a>{" "}
                released a new version on{" "}
                {new Date(release.createdAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </time>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                {release.repository} - {release.name}
              </h3>
              <div className="text-gray-400 mt-3">
                <p>Contributors - </p>
                <div className="flex gap-2 mt-3">
                  <div className="grid grid-cols-3 md:grid-cols-10 gap-3">
                    {release.mentions.nodes.map((contributor) => (
                      <a
                        href={`https://github.com/${contributor.login}`}
                        target="_blank"
                        className="flex"
                      >
                        <img
                          src={contributor.avatarUrl}
                          alt="img"
                          className="w-10 h-10 rounded-full"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <a
                href={release.url}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 mt-5"
                target="_blank"
              >
                Open in Github
                <svg
                  className="w-3 h-3 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </a>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ReleaseSection;
