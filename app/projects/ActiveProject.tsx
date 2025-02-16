"use client";

import { ActiveProjectLabelConfig } from "@/app/projects/constants";
import Markdown from "@/components/Markdown";
import Link from "next/link";
import { env } from "process";
import { useState } from "react";
import { FiExternalLink, FiGithub, FiChevronDown } from "react-icons/fi";

type Issue = {
  labels: string[];
  repo: string;
  number: string;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
  };
};

export default function ActiveProject({
  issue,
  small,
  labels,
}: {
  issue: Issue;
  small?: boolean;
  labels: ActiveProjectLabelConfig;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-secondary-200 dark:border-secondary-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex justify-between p-6 pb-0 pt-4 max-sm:flex-col max-sm:gap-3 sm:items-center">
          <div className={`flex items-center ${small ? "gap-2" : "gap-3"}`}>
            <div className="flex flex-wrap gap-2">
              {issue.labels
                .filter((label) => label in labels)
                .map((label) => (
                  <Link
                    key={label}
                    href={labels[label].ref}
                    target="_blank"
                    className={`rounded-full border font-semibold capitalize ${
                      labels[label].className
                    }
                      ${
                        small
                          ? "border-secondary-200 px-2.5 py-1 text-xs dark:border-secondary-800"
                          : "border-current px-3 py-1 text-sm"
                      }`}
                  >
                    <span className="max-sm:hidden">{labels[label].name}</span>
                    <span className="sm:hidden">{labels[label].shortName}</span>
                  </Link>
                ))}
            </div>
            <Link
              href={issue.url}
              target="_blank"
              className={`font-mono font-bold tracking-wide text-secondary-700 dark:text-secondary-300 ${
                small ? "text-xs" : "text-sm"
              }`}
            >
              <span className="pr-0.5 tracking-normal text-secondary-400">
                {env.NEXT_PUBLIC_GITHUB_ORG}/{issue.repo}
              </span>
              #{issue.number}
            </Link>
          </div>
          {small ? (
            <Link
              href={issue.url}
              className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100"
            >
              <FiExternalLink />
              View
            </Link>
          ) : (
            <Link
              href={issue.url}
              target="_blank"
              className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100"
            >
              <FiGithub />
              Open in GitHub
            </Link>
          )}
        </div>

        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-semibold ${small ? "" : "pb-2"}`}>
              {issue.title}
            </h3>
            {!small && (
              <FiChevronDown
                className={`h-6 w-6 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        </div>
      </button>

      {!small && isExpanded && (
        <div className="break-all bg-secondary-100 p-6 text-sm dark:bg-secondary-800">
          <Markdown>{issue.body}</Markdown>
        </div>
      )}
    </div>
  );
}
