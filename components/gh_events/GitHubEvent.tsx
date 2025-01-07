/* eslint-disable prettier/prettier */
import { IGitHubEvent } from "@/lib/gh_events";
import GitHubReleaseEventBody from "@/components/gh_events/ReleaseEventBody";
import OpenGraphImage from "@/components/gh_events/OpenGraphImage";
import RelativeTime from "@/components/RelativeTime";

import { GoGitPullRequest } from "react-icons/go";
import { GoRepoForked } from "react-icons/go";
import { VscIssues } from "react-icons/vsc";
import { GoPersonAdd } from "react-icons/go";
import { GoCheck } from "react-icons/go";
import { GoRepoPush } from "react-icons/go";
import { GoComment } from "react-icons/go";
import { GoTag } from "react-icons/go";
import { GoFileDiff } from "react-icons/go";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/env.mjs";

export default function GitHubEvent({ event }: { event?: IGitHubEvent }) {
  if (!event) {
    return (
      <div className="h-10 w-full animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
    );
  }

  let title, body;

  switch (event.type) {
    case "MemberEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>{" "}
          <GoPersonAdd className=" inline text-lg font-bold " />{" "}
          <span className=" inline">{event.payload.action} member </span>{" "}
          <Link
            className="inline cursor-pointer font-bold text-secondary-300"
            href={"https://github.com/" + event.payload.member.login}
          >
            {event.payload.member.login}
          </Link>
        </div>
      );
      body = "";
      break;

    case "IssuesEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>{" "}
          <span className=" inline">
            <VscIssues className=" inline text-lg font-bold" />{" "}
            {event.payload.action} an issue in{" "}
          </span>
          <Link
            className="cursor-pointer gap-2 font-bold text-secondary-300"
            href={"https://github.com/" + event.repo.name}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>{" "}
          </Link>
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );
      body = <OpenGraphImage url={event.payload.issue.html_url} />;
      break;

    case "PullRequestEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300"
          >
            {event.actor.login}
          </Link>{" "}
          <GoGitPullRequest className="inline" />{" "}
          <span className="inline">
            {event.payload.action} a pull request in{" "}
          </span>
          <Link
            className="inline cursor-pointer gap-2 font-bold text-secondary-300"
            href={"https://github.com/" + event.repo.name}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden ">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>{" "}
          </Link>
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );
      body = ["opened", "closed", "reopened"].includes(
        event.payload.action,
      ) && <OpenGraphImage url={event.payload.pull_request.html_url} />;
      break;

    case "PullRequestReviewEvent":
      let action = "";
      if (event.payload.review.state === "approved") action = "approved";
      if (event.payload.review.state === "commented")
        action = "commented on PR";
      if (event.payload.review.state === "changes_requested")
        action = "requested changes on";
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>{" "}
          {action === "approved" && (
            <GoCheck className="inline text-lg font-bold" />
          )}{" "}
          {action === "commented on PR" && (
            <GoComment className="inline text-lg font-bold" />
          )}{" "}
          {action === "requested changes on" && (
            <GoFileDiff className="inline text-lg font-bold" />
          )}{" "}
          <span className="inline">{action} </span>
          <span className="inline">#{event.payload.pull_request.number} </span>
          {" in "}
          <Link
            className="inline cursor-pointer font-bold text-secondary-300"
            href={event.payload.review.html_url}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>
          </Link>{" "}
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );

      body = <OpenGraphImage url={event.payload.pull_request.html_url} />;
      break;

    case "PushEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>{" "}
          <GoRepoPush className=" inline text-lg font-bold " />{" "}
          <span className="inline">
            pushed {event.payload.size} commits to{" "}
            {event.payload.ref.replace("refs/heads/", "")}
          </span>{" "}
          in{" "}
          <Link
            className="inline cursor-pointer font-bold text-secondary-300"
            href={`https://github.com/${event.repo.name}`}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>{" "}
          </Link>
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );
      body = (
        <ul className="text-xs">
          {event.payload.commits.map((commit) => (
            <li key={commit.sha}>
              <Link
                href={`https://github.com/${event.repo.name}/commit/${commit.sha}`}
                className="flex flex-row"
              >
                <span className="px-2 text-secondary-500">
                  {commit.sha.slice(-7)}
                </span>
                <span className="text-secondary-700 hover:underline dark:text-secondary-300">
                  {commit.message.split("\n")[0]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      );
      break;

    case "ForkEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>{" "}
          <span className="inline">
            <GoRepoForked className=" inline text-lg font-bold" /> forked{" "}
          </span>
          <Link
            className="inline cursor-pointer gap-2 font-bold text-secondary-300"
            href={event.repo.url}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>{" "}
          </Link>
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );
      body = (
        <OpenGraphImage
          url={`https://github.com/${event.payload.forkee.full_name}`}
        />
      );
      break;

    case "ReleaseEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>{" "}
          <GoTag className=" inline text-lg font-bold" />{" "}
          <span className=" inline">released </span>
          <Link
            className="inline cursor-pointer gap-2 font-bold text-secondary-300"
            href={event.payload.release.html_url}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>
          </Link>
          <span className="inline">#{event.payload.release.tag_name}</span>
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );
      body = <GitHubReleaseEventBody event={event} />;
      break;

    case "IssueCommentEvent":
      title = (
        <div className="">
          <Link
            href={`https://github.com/${event.actor.login}`}
            className="inline cursor-pointer font-bold text-secondary-700 dark:text-secondary-300 "
          >
            {event.actor.login}
          </Link>
          <GoComment className=" inline text-lg font-bold" />{" "}
          <span className="inline">commented on </span>
          <Link
            className="inline cursor-pointer font-bold text-secondary-300"
            href={event.payload.comment.html_url}
          >
            <span className="hidden sm:inline">{event.repo.name}</span>
            <span className="sm:hidden">
              {event.repo.name.replace(`${env.NEXT_PUBLIC_GITHUB_ORG}/`, "")}
            </span>
          </Link>
          <span className="inline">#{event.payload.issue.number}</span>
          <RelativeTime
            className="inline text-sm text-secondary-400 underline"
            time={event.created_at}
          />
        </div>
      );
      body = <span className="p-2 text-xs">{event.payload.comment.body}</span>;
      break;

    default:
      title = (event as IGitHubEvent).type;
      // body = JSON.stringify(event.payload);
      break;
  }

  return (
    <li className="group" id={`gh-event-${event.id}`}>
      <div className="relative pb-4">
        <span
          className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-secondary-200 group-last:hidden dark:bg-secondary-700"
          aria-hidden
        />
        <div
          className={`relative flex space-x-5
          ${body ? "items-start" : "items-center"}`}
        >
          <div className="relative">
            <Image
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-400 ring-8 ring-secondary-200 transition-all duration-200 ease-in-out group-hover:scale-125 group-hover:ring-2 dark:ring-secondary-800 group-hover:dark:ring-white/50"
              src={event.actor.avatar_url + "&s=64"}
              alt=""
              height={40}
              width={40}
            />
            {event.type.includes("Comment") && (
              <span className="absolute -bottom-1.5 -right-1.5 rounded bg-secondary-200 px-0.5 py-px dark:bg-secondary-700">
                <svg
                  className="h-5 w-5 text-secondary-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="gap-1 text-sm text-secondary-700   dark:text-secondary-300 lg:flex-row">
              <div className="mt-0.5 flex gap-2 text-sm text-secondary-400">
                {title}
              </div>
            </div>

            {!!body && (
              <div className="ml-2 mt-4 max-w-lg overflow-hidden rounded-xl">
                {body}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
