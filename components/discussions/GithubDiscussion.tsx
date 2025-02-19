import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";
import Image from "next/image";
import Link from "next/link";
import RelativeTime from "@/components/RelativeTime";
import { FiGithub } from "react-icons/fi";
import { parseOrgRepoFromURL } from "@/lib/utils";
import Markdown from "@/components/Markdown";
import { FaAnglesRight } from "react-icons/fa6";
import { Suspense } from "react";

interface Props {
  discussion: ParsedDiscussion;
  minimal?: boolean;
  isProfilePage?: boolean;
}

const GithubDiscussion = ({
  discussion,
  minimal = false,
  isProfilePage = false,
}: Props) => {
  const lengthOfDescription = isProfilePage ? 300 : 500;
  const { org, repo } = parseOrgRepoFromURL(discussion.link);

  return (
    <div
      className={`group mt-3 flex w-full gap-3 ${minimal ? "lg:w-full" : "lg:w-3/4"}  ${!isProfilePage ? "mt-5" : "lg:w-full"}`}
    >
      {/* Left side */}
      {!isProfilePage && (
        <div className=" relative min-w-10">
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
          <span
            className="absolute left-5 top-12 -ml-px h-full w-0.5 justify-center bg-secondary-200 group-last:hidden dark:bg-secondary-700"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Right side */}
      <div className="ml-2">
        {/* Title and Time */}
        <div className={`flex items-center justify-start `}>
          <div className={`${isProfilePage && "flex"} w-3/4`}>
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
                {repo && (
                  <>
                    in{" "}
                    <Link href={`https://github.com/${repo}`} target="_blank">
                      <span className="hidden font-bold text-secondary-700 dark:text-secondary-300 sm:inline">
                        {org}/{repo}
                      </span>
                      <span className="font-bold text-secondary-700 dark:text-secondary-300 sm:hidden">
                        {repo.replace(`${org}/`, "")}
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
            <span className="hidden whitespace-nowrap sm:inline">
              Open in GitHub
            </span>
          </Link>
        </div>

        {/* Description */}
        <div
          className={`${
            !isProfilePage && "mt-2 bg-secondary-100 p-4 dark:bg-secondary-800"
          } break-all rounded-md text-xs lg:text-sm`}
        >
          <Suspense fallback="...">
            <div>
              <Markdown>
                {discussion.text.length > lengthOfDescription
                  ? discussion.text.slice(0, lengthOfDescription) + "..."
                  : discussion.text}
              </Markdown>
              {discussion.text.length > lengthOfDescription && (
                <Link
                  className="flex w-full justify-end gap-1 self-center text-primary-300 underline hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-400"
                  href={discussion.link}
                >
                  Read More <FaAnglesRight className="self-center" />
                </Link>
              )}
            </div>
          </Suspense>
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
