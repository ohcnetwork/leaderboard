import { IGitHubEvent } from "@/lib/gh_events";
import GitHubReleaseEventBody from "./ReleaseEventBody";
import OpenGraphImage from "./OpenGraphImage";
import timeSince from "@/lib/timeSince";

export default function GitHubEvent({ event }: { event?: IGitHubEvent }) {
  if (!event) {
    return (
      <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
    );
  }

  let title, body;

  switch (event.type) {
    case "MemberEvent":
      title = (
        <>
          {event.payload.action} member{" "}
          <a
            className="cursor-pointer text-gray-300 font-bold"
            href={"https://github.com/" + event.payload.member.login}
          >
            {event.payload.member.login}
          </a>
        </>
      );
      body = "";
      break;

    case "IssuesEvent":
      title = (
        <>
          {event.payload.action} an issue in{" "}
          <a
            className="cursor-pointer text-gray-300 font-bold"
            href={"https://github.com/" + event.repo.name}
          >
            {event.repo.name}
          </a>
        </>
      );
      body = <OpenGraphImage url={event.payload.issue.html_url} />;
      break;

    case "PullRequestEvent":
      title = (
        <>
          {event.payload.action} a pull request in{" "}
          <a
            className="cursor-pointer text-gray-300 font-bold"
            href={"https://github.com/" + event.repo.name}
          >
            {event.repo.name}
          </a>
        </>
      );
      body = event.payload.action === "opened" && (
        <OpenGraphImage url={event.payload.pull_request.html_url} />
      );
      break;

    case "PushEvent":
      title = (
        <>
          pushed {event.payload.size} commits to{" "}
          <span className="text-gray-300 font-bold">
            {event.payload.ref.replace("refs/heads/", "")}
          </span>{" "}
          in{" "}
          <a
            className="cursor-pointer text-gray-300 font-bold"
            href={event.repo.url}
          >
            {event.repo.name}
          </a>
        </>
      );
      body = (
        <ul className="text-xs">
          {event.payload.commits.map((commit) => (
            <a
              className="hover:underline group"
              href={`https://github.com/${event.repo.name}/commit/${commit.sha}`}
            >
              <li key={commit.sha}>
                <span className="text-gray-500 font-mono px-2 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {commit.sha.slice(-7)}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {commit.message.split("\n")[0]}
                </span>
              </li>
            </a>
          ))}
        </ul>
      );
      break;

    case "ForkEvent":
      title = (
        <>
          forked{" "}
          <a
            className="cursor-pointer text-gray-300 font-bold"
            href={event.repo.url}
          >
            {event.repo.name}
          </a>
        </>
      );
      body = <OpenGraphImage url={event.payload.forkee.html_url} />;
      break;

    case "ReleaseEvent":
      title = (
        <>
          released{" "}
          <a
            className="cursor-pointer text-gray-300 font-bold"
            href={event.payload.release.html_url}
          >
            {event.repo.name}#{event.payload.release.tag_name}
          </a>
        </>
      );
      body = <GitHubReleaseEventBody event={event} />;
      break;

    default:
      title = (event as IGitHubEvent).type;
      // body = JSON.stringify(event.payload);
      break;
  }

  return (
    <li>
      <div className="relative pb-4">
        <span
          className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
          aria-hidden
        />
        <div className="relative flex items-start space-x-5">
          <div className="relative">
            <img
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-gray-200 dark:ring-gray-700"
              src={event.actor.avatar_url + "&s=40"}
              alt=""
            />
            {event.type.includes("Comment") && (
              <span className="absolute -bottom-1.5 -right-1.5 rounded bg-gray-200 dark:bg-gray-700 px-0.5 py-px">
                <svg
                  className="h-5 w-5 text-gray-400"
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
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <a
                  href={`https://github.com/${event.actor.login}`}
                  className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {event.actor.login}
                </a>{" "}
                <span className="mt-0.5 text-sm text-gray-400">
                  {title} {timeSince(event.created_at)}
                </span>
              </span>

              {!!body && (
                <div className="mt-4 ml-2 max-w-lg rounded-xl overflow-hidden">
                  <p>{body}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
