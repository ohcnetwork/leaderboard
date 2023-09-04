import { Activity, ActivityData } from "@/lib/types";

let commentTypes = (activityEvent: string[]) => {
  switch (activityEvent[0]) {
    case "pull":
      return "a pull request";
    case "issues":
      return "an issue";
    case "discussions":
      return "a discussion";
    default:
      return "the community";
  }
};

function generateId() {
  return Math.random().toString(36).slice(2, 7);
}

let renderText = (activity: Activity) => {
  const activity_time = (
    new String(activity.time).length === 10
      ? new Date(activity.time * 1000)
      : new Date(activity.time)
  ).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
  });
  switch (activity["type"]) {
    case "eod_update":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <div className="">
              <div className="font-medium dark:text-primary-300 text-primary-500">
                {activity_time.split("at")[0]}
                <span className=" text-sm font-medium dark:text-gray-200 text-gray-700">
                  {" "}
                  - End of the day update from slack
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-foreground">
            <p className="break-words">{activity["text"]}</p>
          </div>
        </div>
      );
    case "comment_created":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm">
              <p className="font-medium  ">
                {"Shared a comment on "}
                {commentTypes(activity["link"].split("/").slice(5, 6))}
                {" in  "}
                <span className="dark:text-primary-300 text-primary-400 font-medium">
                  {activity["link"].split("/").slice(3, 5).join("/")}
                </span>

                <span className="font-normal text-foreground">
                  {" "}
                  on {activity_time}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-2 text-foreground">
            <p className="break-words">{activity["text"]}</p>
            <p className="break-words">{activity["link"]}</p>
          </div>
        </div>
      );
    case "pr_opened":
    case "pr_merged":
    case "pr_reviewed":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-foreground">
            <div className="font-medium">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" a pull request on "}</span>
              <span className="dark:text-primary-300 text-primary-400 font-medium">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
            </div>
            {activity["type"] == "pr_merged" && (
              <div className="pt-4">
                <a href={activity["link"]}>
                  <img
                    alt={activity["link"]}
                    className="rounded-xl"
                    src={`https://opengraph.githubassets.com/${generateId()}/${activity[
                      "link"
                    ]
                      .split("/")
                      .slice(3, 7)
                      .join("/")}/`}
                  />
                </a>
              </div>
            )}
            {activity["type"] != "pr_merged" && (
              <div>
                <a href={activity["link"]}>
                  <span className="font-medium dark:text-gray-200 text-gray-500">
                    {activity["text"]}
                  </span>
                </a>
                <span className="whitespace-nowrap ml-2">{activity_time}</span>
              </div>
            )}
          </div>
        </div>
      );
    case "issue_opened":
    case "issue_assigned":
    case "issue_closed":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-foreground">
            <div className="font-medium">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" an issue on "}</span>
              <span className="text-primary-300 font-medium">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
            </div>

            <a href={activity["link"]} className="pt-1">
              <span className="font-medium text-foreground hover:text-primary-500">
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
          <div className="text-sm text-foreground">
            <span className="font-medium text-primary-300 ">
              {activity["type"]}
            </span>

            <div className="font-medium dark:text-gray-200 text-gray-700 ml-2">
              {activity["text"]}
            </div>
            <span className="whitespace-nowrap ml-2">{activity_time}</span>
          </div>
        </div>
      );
  }
};

let icon = (type: string) => {
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
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="h-5 w-5 text-gray-700"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M208 239.1H294.7C307 211.7 335.2 191.1 368 191.1C412.2 191.1 448 227.8 448 271.1C448 316.2 412.2 352 368 352C335.2 352 307 332.3 294.7 303.1H208C171.1 303.1 138.7 292.1 112 272V358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 0 80 0C124.2 0 160 35.82 160 80C160 112.6 140.5 140.7 112.4 153.2C117 201.9 158.1 240 208 240V239.1zM80 103.1C93.25 103.1 104 93.25 104 79.1C104 66.74 93.25 55.1 80 55.1C66.75 55.1 56 66.74 56 79.1C56 93.25 66.75 103.1 80 103.1zM80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456zM368 247.1C354.7 247.1 344 258.7 344 271.1C344 285.3 354.7 295.1 368 295.1C381.3 295.1 392 285.3 392 271.1C392 258.7 381.3 247.1 368 247.1z" />
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

let showContribution = (activity: Activity) => {
  let type = activity["type"];
  return (
    <div className="relative pb-8">
      <span
        className="absolute top-5 left-5 -ml-px h-full w-0.5 dark:bg-gray-200 bg-gray-700"
        aria-hidden="true"
      ></span>
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="h-8 w-8 dark:bg-gray-300 bg-gray-100 rounded-full ring-8 dark:ring-gray-700 ring-gray-200 flex items-center justify-center">
              {icon(type)}
            </div>
          </div>
        </div>
        {renderText(activity)}
      </div>
    </div>
  );
};

interface Props {
  activityData: ActivityData;
}

export default function GithubActivity({ activityData }: Props) {
  return (
    <div className="mx-2 flow-root text-foreground mt-4">
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
