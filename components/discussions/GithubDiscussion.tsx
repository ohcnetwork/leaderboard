"use client";
import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";
import RelativeTime from "../RelativeTime";
import { env } from "@/env.mjs";
import { FiGithub } from "react-icons/fi";
import DiscussionMarkdown from "@/components/discussions/DiscussionMarkdown";

interface params {
  discussion: ParsedDiscussion;
  isProfilePage?: boolean;
}

const GithubDiscussion = ({ discussion, isProfilePage = false }: params) => {
  const [isFullDescription, setFullDescription] = useState(false);
  const lengthOfDescription = isProfilePage ? 300 : 500;
  const orgRepoName = discussion["link"].split("/").slice(3, 5).join("/");
  const repository =
    orgRepoName === `orgs/${env.NEXT_PUBLIC_GITHUB_ORG}` ? "" : orgRepoName;

  return (
    <div className={`mt-3 flex w-full gap-3 ${!isProfilePage && "mt-5"}`}>
      {/* Left side */}
      {!isProfilePage && (
        <div className="relative min-w-10">
          {/* Profile image */}
          <Image
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-400 ring-8 ring-secondary-200 transition-all duration-200 ease-in-out group-hover:scale-125 group-hover:ring-2 dark:ring-secondary-800 group-hover:dark:ring-white/50"
            src={`https://avatars.githubusercontent.com/${discussion.author}`}
            alt={`${discussion.author}'s profile picture`}
            height={48}
            width={48}
          />
          <span className="absolute left-6 top-6 text-xl lg:text-2xl">
            {discussion.category?.emoji}
          </span>
          {/* Vertical Line under Profile */}
          <span
            className="top-13 absolute left-5 -ml-px h-full w-0.5 justify-center bg-secondary-200 group-last:hidden dark:bg-secondary-700"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Right side */}
      <div className="ml-2">
        {/* Title and Time */}
        <div className={`flex items-center justify-between `}>
          <div className={`${isProfilePage && "flex"}`}>
            <Link href={discussion.link}>
              <p className="w-full text-lg font-semibold text-primary-900 dark:text-primary-100">
                {discussion.title}
              </p>
            </Link>
            {!isProfilePage && (
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                <Link
                  href={`https://github.com/${discussion.author}`}
                  target="_blank"
                  className="font-bold text-secondary-700 dark:text-secondary-300"
                >
                  {discussion.author}
                </Link>{" "}
                started a discussion{" "}
                {repository.length > 0 && (
                  <>
                    in{" "}
                    <Link
                      href={`https://github.com/${repository}`}
                      target="_blank"
                    >
                      <span className="hidden font-bold text-secondary-700 dark:text-secondary-300 sm:inline">
                        {repository}
                      </span>
                      <span className="font-bold text-secondary-700 dark:text-secondary-300 sm:hidden">
                        {repository.replace(
                          `${env.NEXT_PUBLIC_GITHUB_ORG}/`,
                          "",
                        )}
                      </span>
                    </Link>
                  </>
                )}{" "}
                <RelativeTime time={discussion.time} />
              </p>
            )}
          </div>

          <Link
            href={discussion.link}
            target="_blank"
            className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-xs text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100 sm:text-sm"
          >
            <FiGithub />
            <span className="hidden sm:inline">Open in GitHub</span>
          </Link>
        </div>

        {/* Description */}
        <div
          className={`${
            !isProfilePage && "mt-2 bg-secondary-100 p-4 dark:bg-secondary-800"
          } ${isProfilePage && "-mt-10"} break-all rounded-md text-xs lg:text-sm`}
        >
          {discussion.text.length > lengthOfDescription ? (
            <div>
              <DiscussionMarkdown>
                {isFullDescription
                  ? discussion.text
                  : discussion.text.slice(0, lengthOfDescription)}
              </DiscussionMarkdown>
              <button
                className="mx-auto flex w-fit gap-2 text-sm"
                onClick={() => setFullDescription(!isFullDescription)}
              >
                {isFullDescription ? (
                  <>
                    Read Less
                    <FaAngleDoubleUp className="self-center" />
                  </>
                ) : (
                  <>
                    Read More
                    <FaAngleDoubleDown className="self-center" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <DiscussionMarkdown>{discussion.text}</DiscussionMarkdown>
          )}
        </div>

        {/* Participants */}
        {!isProfilePage && (
          <div className="mt-2 gap-2">
            <p className="text-xl">
              {discussion.participants &&
                discussion.participants.length > 0 &&
                "Participants"}
            </p>
            <div className="ml-3 mt-2 flex gap-2">
              {discussion.participants &&
                discussion.participants.length > 0 &&
                discussion.participants.slice(0, 5).map((participant) => (
                  <Link
                    className="-ml-4"
                    key={participant}
                    href={`https://github.com/${participant}`}
                  >
                    <Image
                      className="flex h-10 w-10 items-center justify-center rounded-full border bg-secondary-400 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md hover:shadow-primary-400"
                      src={`https://avatars.githubusercontent.com/${participant}`}
                      alt={`${participant}'s profile picture`}
                      height={24}
                      width={24}
                    />
                  </Link>
                ))}
              {discussion.participants &&
                discussion.participants.length > 0 && (
                  <Link
                    href={discussion.link}
                    target="_blank"
                    className="self-center hover:text-primary-400"
                  >
                    {discussion.participants &&
                      discussion.participants.length > 5 &&
                      `${discussion.participants.length - 5} more...`}
                  </Link>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GithubDiscussion;
