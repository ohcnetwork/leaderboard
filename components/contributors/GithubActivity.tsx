"use client";

import { ACTIVITY_TYPES, Activity, ActivityData } from "@/lib/types";
import {
  formatDuration,
  parseDateRangeSearchParam,
  parseOrgRepoFromURL,
} from "@/lib/utils";
import OpenGraphImage from "@/components/gh_events/OpenGraphImage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RelativeTime from "@/components/RelativeTime";
import DateRangePicker from "@/components/DateRangePicker";
import { format } from "date-fns";
import GithubDiscussion from "@/components/discussions/GithubDiscussion";
import { IoIosChatboxes } from "react-icons/io";
import Link from "next/link";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

const activityTypesAtom = atomWithStorage("leaderboard-activity-types", [
  ...ACTIVITY_TYPES,
]);

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

let renderText = (activity: Activity) => {
  const timestamp = new Date(activity.time).toString();
  switch (activity["type"]) {
    case "eod_update":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <div className="">
              <div className="font-bold text-primary-500 dark:text-primary-300">
                <RelativeTime time={timestamp} />
                <span className=" text-sm font-medium text-secondary-700 dark:text-secondary-200">
                  {" "}
                  - End of the day update from slack
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-secondary-600 p-2 md:p-4">
            <a href={activity["link"]} target="_blank">
              <span className="cursor-pointer break-words text-sm font-medium text-foreground hover:text-primary-500">
                {activity["text"]}
              </span>
            </a>
          </div>
        </div>
      );
    case "comment_created":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <p className="font-bold">
              {"Commented on "}
              {commentTypes(activity["link"].split("/").slice(5, 6))}
              {" in  "}
              <span className="text-primary-400 dark:text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>

              <span className="text-foreground">
                {" "}
                <RelativeTime time={timestamp} />
              </span>
            </p>
          </div>
          <div className="mt-2 rounded-lg border border-secondary-600 p-2 md:p-4">
            <a href={activity["link"]} target="_blank">
              <span className="cursor-pointer break-words text-sm font-medium text-foreground hover:text-primary-500">
                {activity["text"]}
              </span>
            </a>
          </div>
        </div>
      );
    case "pr_opened":
    case "pr_merged":
    case "pr_reviewed":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-foreground">
            <div className="font-bold">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" a pull request on "}</span>
              <span className="text-primary-400 dark:text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
              {!!activity["turnaround_time"] ? (
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {" with a turnaround time of "}
                  {formatDuration(activity["turnaround_time"] * 1000)}
                </span>
              ) : (
                <span className="text-foreground">
                  {" "}
                  <RelativeTime time={timestamp} />
                </span>
              )}
            </div>
            {["pr_merged", "pr_opened"].includes(activity["type"]) && (
              <div className="max-w-xl pt-4">
                <OpenGraphImage url={activity["link"]} className="rounded-xl" />
              </div>
            )}
            {activity["type"] == "pr_reviewed" && (
              <div className="mt-2 rounded-lg border border-secondary-600 p-2 md:p-4">
                <a href={activity["link"]} target="_blank">
                  <span className="cursor-pointer break-words text-sm font-medium text-foreground hover:text-primary-500">
                    {activity["text"]}
                  </span>
                </a>
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
            <div className="text-base font-bold">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" an issue on "}</span>
              <span className="text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
              <span className="ml-2 whitespace-nowrap">
                <RelativeTime time={timestamp} />
              </span>
            </div>
            <div className="max-w-xl pt-4">
              <OpenGraphImage url={activity["link"]} className="rounded-xl" />
            </div>
          </div>
        </div>
      );
    case "pr_collaborated":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-foreground">
            <div className="font-bold">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" on a pull request on "}</span>
              <span className="text-primary-400 dark:text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
            </div>
            <div className="max-w-xl pt-4">
              <OpenGraphImage url={activity["link"]} className="rounded-xl" />
            </div>
          </div>
        </div>
      );
    case "discussion_answered":
    case "discussion_comment_created":
    case "discussion_created":
      const { org, repo } = parseOrgRepoFromURL(activity.link);

      return (
        <div className="min-w-0 flex-1">
          <div>
            <p className="font-bold">
              {activity.title}{" "}
              {repo && (
                <>
                  in{" "}
                  <Link href={`https://github.com/${repo}`} target="_blank">
                    <span className="text-primary-400 dark:text-primary-300">
                      {org}/{repo}
                    </span>
                  </Link>
                </>
              )}
              <span className="text-foreground">
                {" "}
                <RelativeTime time={activity.time} />
              </span>
            </p>
          </div>
          <div className="mt-2 rounded-lg border border-secondary-600 p-2 md:p-4">
            {activity.discussion && (
              <GithubDiscussion
                discussion={activity.discussion}
                isProfilePage
              />
            )}
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

            <div className="ml-2 font-medium text-secondary-700 dark:text-secondary-200">
              {activity["text"]}
            </div>
            <span className="ml-2 whitespace-nowrap">
              <RelativeTime time={timestamp} />
            </span>
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
          className="h-5 w-5 text-secondary-700"
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
          className="h-5 w-5 text-secondary-700"
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
          className="h-5 w-5 text-secondary-700"
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
    case "discussion_answered":
    case "discussion_comment_created":
    case "discussion_created":
      return <IoIosChatboxes className="size-5 text-secondary-700" />;
    default:
      return (
        <svg
          className="h-5 w-5 text-secondary-700"
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
        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-secondary-700 dark:bg-secondary-200"
        aria-hidden="true"
      ></span>
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 ring-8 ring-secondary-200 dark:bg-secondary-300 dark:ring-secondary-700">
              {icon(type)}
            </div>
          </div>
        </div>
        {renderText(activity)}
      </div>
    </div>
  );
};

const activitiesBetween = (range: { from: Date; to: Date }) => {
  const from = range.from.getTime();
  const to = range.to.getTime();

  return (activity: Activity) => {
    const time = new Date(activity.time).getTime();
    return from < time && time < to;
  };
};

const compareByActivityTime = (a: Activity, b: Activity) => {
  return new Date(b.time).getTime() - new Date(a.time).getTime();
};

const activitiesOfType = (types: Activity["type"][]) => {
  return (activity: Activity) => {
    return types.includes(activity.type);
  };
};

interface Props {
  activityData: ActivityData;
}

export default function GithubActivity({ activityData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));

  const updateSearchParam = (key: string, value?: string) => {
    const current = new URLSearchParams(searchParams.toString());
    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  const [activityTypes, setActivityTypes] = useAtom(activityTypesAtom);

  const activitiesInRange = activityData.activity.filter(
    activitiesBetween({ from: start, to: end }),
  );

  const activities = activitiesInRange
    .filter(activitiesOfType(activityTypes))
    .sort(compareByActivityTime);

  return (
    <div className="flex flex-row-reverse flex-wrap items-start justify-between gap-6 md:flex-nowrap">
      <div className="top-24 my-4 flex w-full flex-col gap-2 rounded-lg border border-primary-500 p-4 md:sticky md:w-[42rem]">
        <h3>Filter Activity</h3>
        <DateRangePicker
          value={{ start, end }}
          onChange={(value) => {
            updateSearchParam(
              "between",
              `${format(value.start, "yyyy-MM-dd")}...${format(
                value.end,
                "yyyy-MM-dd",
              )}`,
            );
          }}
        />
        {ACTIVITY_TYPES.map((type) => (
          <ActivityCheckbox
            key={type}
            type={type}
            count={activitiesInRange.filter((a) => a.type === type).length}
            state={activityTypes}
            setState={setActivityTypes}
          />
        ))}
      </div>
      <div className="mt-4 w-full grow px-1 text-foreground sm:px-2">
        <ul role="list" className="my-4 w-full max-w-xl">
          {activities.map((activity, i) => {
            return <li key={i}>{showContribution(activity)}</li>;
          })}
        </ul>
      </div>
      {activities.length === 0 && (
        <div className="flex h-full w-full items-center justify-center py-48">
          <span className="text-secondary-500 dark:text-secondary-400">
            No activities in this period
          </span>
        </div>
      )}
    </div>
  );
}

export const ActivityCheckbox = (props: {
  type: Activity["type"];
  count: number;
  state: Activity["type"][];
  setState: (value: Activity["type"][]) => void;
}) => {
  return (
    <label className="flex items-center gap-2 whitespace-nowrap text-sm">
      <input
        name={props.type}
        className="accent-primary-500 dark:accent-primary-400"
        type="checkbox"
        checked={props.state.includes(props.type)}
        onChange={(event) => {
          const isChecked = event.target.checked;
          const final = new Set([...props.state]);
          final[isChecked ? "add" : "delete"](props.type);
          props.setState(Array.from(final));
        }}
      />{" "}
      {
        {
          comment_created: "Comment",
          eod_update: "Slack E.O.D. update",
          issue_assigned: "Issue assigned",
          issue_closed: "Issue closed",
          issue_opened: "Issue opened",
          pr_collaborated: "PR collaborated",
          pr_merged: "PR merged",
          pr_opened: "PR opened",
          pr_reviewed: "Code Review",
          discussion_comment_created: "Commented on a discussion",
          discussion_created: "Started a discussion",
          discussion_answered: "Answered on a discussion",
        }[props.type]
      }
      <span className="text-xs text-secondary-500 dark:text-secondary-400">
        [{props.count || "None"}]
      </span>
    </label>
  );
};
