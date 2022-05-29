/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

let renderText = (activity) => {
  const activity_time = (
    new String(activity.time).length === 10
      ? new Date(activity.time * 1000)
      : new Date(activity.time)
  ).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
  });
  switch (activity["type"]) {
    case "comment_created":
    case "eod_update":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm">
              <div className="font-medium text-primary-500 ">
                {activity["type"] == "eod_update"
                  ? "End of the day"
                  : "Commented"}
              </div>
            </div>
            <p className="mt-0.5 text-sm text-gray-200"> on {activity_time}</p>
          </div>
          <div className="mt-2 text-sm text-gray-100">
            <p className="break-words">{activity["text"]}</p>
          </div>
        </div>
      );
    case "pr_opened":
    case "pr_merged":
    case "pr_reviewed":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-100">
            <span className="font-medium text-primary-500 ">
              Pull Request {activity["type"].split("_")[1]}
            </span>

            <a href={activity["link"]}>
              <span className="font-medium text-gray-200 ml-2">
                {activity["text"]}
              </span>
            </a>
            <span className="whitespace-nowrap ml-2">{activity_time}</span>
          </div>
        </div>
      );
    case "issue_opened":
    case "issue_assigned":
    case "issue_closed":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-100">
            <div className="font-medium text-primary-500  ">
              Issue {activity["type"].split("_")[1]}
            </div>
            <a href={activity["link"]}>
              <span className="font-medium text-white ml-2 hover:text-primary-500">
                {activity["text"]}
              </span>
            </a>
            <span className="whitespace-nowrap ml-2">{activity_time}</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-100">
            <span className="font-medium text-primary-500 ">
              {activity["type"]}
            </span>

            <div className="font-medium text-gray-200 ml-2">
              {activity["text"]}
            </div>
            <span className="whitespace-nowrap ml-2">{activity_time}</span>
          </div>
        </div>
      );
  }
};

let icon = (type) => {
  switch (type) {
    case "comment_created":
    case "eod_update":
      return (
        <svg
          className="h-5 w-5 text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "pr_opened":
    case "pr_merged":
      return (
        <svg
          className="h-5 w-5 text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "issue_opened":
    case "issue_assigned":
      return (
        <svg
          className="h-5 w-5 text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-5 w-5 text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

let showContribution = (activity) => {
  let type = activity["type"];
  return (
    <div className="relative pb-8">
      <span
        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
        aria-hidden="true"
      ></span>
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="h-8 w-8 bg-gray-300 rounded-full ring-8 ring-gray-700 flex items-center justify-center">
              {icon(type)}
            </div>
          </div>
        </div>
        {renderText(activity)}
      </div>
    </div>
  );
};

export default function GithubActivity({ activityData }) {
  return (
    <div className="flow-root text-gray-100 mt-4">
      <ul role="list" className="-mb-8">
        {activityData["activity"].map((activity, i) => {
          return <li key={i}>{showContribution(activity)}</li>;
        })}
      </ul>
      <div className="mt-12 text-center mb-20">
        More to come in the coming days...!
      </div>
    </div>
  );
}
