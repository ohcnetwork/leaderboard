"use client";

import { ACTIVITY_TYPES, Activity, ActivityData } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import OpenGraphImage from "../gh_events/OpenGraphImage";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RelativeTime from "../RelativeTime";
import Link from "next/link";

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
  const timestamp = getActivityTime(activity.time).toString();
  switch (activity["type"]) {
    case "eod_update":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <div className="">
              <div className="font-bold dark:text-primary-300 text-primary-500">
                <RelativeTime time={timestamp} />
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
            <p className="font-bold">
              {"Commented on "}
              {commentTypes(activity["link"].split("/").slice(5, 6))}
              {" in  "}
              <span className="dark:text-primary-300 text-primary-400">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>

              <span className="font-normal text-foreground">
                {" "}
                <RelativeTime time={timestamp} />
              </span>
            </p>
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
            <div className="font-bold">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" a pull request on "}</span>
              <span className="dark:text-primary-300 text-primary-400">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
              {!!activity["turnaround_time"] && (
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {" with a turnaround time of "}
                  {formatDuration(activity["turnaround_time"] * 1000)}
                </span>
              )}
            </div>
            {["pr_merged", "pr_opened"].includes(activity["type"]) && (
              <div className="pt-4 max-w-xl">
                <OpenGraphImage url={activity["link"]} className="rounded-xl" />
              </div>
            )}
            {activity["type"] == "pr_reviewed" && (
              <div>
                <Link href={activity["link"]}>
                  <span className="font-medium dark:text-gray-200 text-gray-500">
                    {activity["text"]}
                  </span>
                </Link>
                <span className="whitespace-nowrap ml-2">
                  <RelativeTime time={timestamp} />
                </span>
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
            <div className="font-bold text-base">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" an issue on "}</span>
              <span className="text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
            </div>

            <Link href={activity["link"]} className="pt-1">
              <span className="font-medium text-foreground hover:text-primary-500">
                {activity["text"]}
              </span>
            </Link>
            <span className="whitespace-nowrap ml-2">
              <RelativeTime time={timestamp} />
            </span>
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
              <span className="dark:text-primary-300 text-primary-400">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
            </div>
            <div className="pt-4 max-w-xl">
              <OpenGraphImage url={activity["link"]} className="rounded-xl" />
            </div>
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
            <span className="whitespace-nowrap ml-2">
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

const getActivityTime = (time: Activity["time"]) => {
  return typeof time === "number" ? new Date(time * 1e3) : new Date(time);
};

const activitiesBetween = (range: { from: Date; to: Date }) => {
  const from = range.from.getTime();
  const to = range.to.getTime();

  return (activity: Activity) => {
    const time = getActivityTime(activity.time).getTime();
    return from < time && time < to;
  };
};

const compareByActivityTime = (a: Activity, b: Activity) => {
  return getActivityTime(b.time).getTime() - getActivityTime(a.time).getTime();
};

const activitiesOfType = (types: Activity["type"][]) => {
  return (activity: Activity) => {
    return types.includes(activity.type);
  };
};

const getRangeFilterPresets = (activities: Activity[]) => {
  if (!activities.length) return [];

  const latest = getActivityTime(activities[0].time);
  let oldest = new Date(latest);

  activities.forEach((activity) => {
    const time = getActivityTime(activity.time);
    if (time < oldest) {
      oldest = time;
    }
  });

  let current = new Date(oldest.getFullYear(), oldest.getMonth());
  const end = new Date(latest.getFullYear(), latest.getMonth());

  const results: string[] = [];
  while (current <= end) {
    results.push(
      current.toLocaleString("default", { month: "long", year: "numeric" }),
    );
    current.setMonth(current.getMonth() + 1);
  }
  return results.reverse();
};

interface Props {
  activityData: ActivityData;
}

export default function GithubActivity({ activityData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rangeQuery = searchParams.get("range") ?? "last-month";

  const [activityTypes, setActivityTypes] = useState([...ACTIVITY_TYPES]);

  const range = useMemo(() => {
    const to = new Date();
    to.setDate(to.getDate() + 1);

    if (rangeQuery === "last-month") {
      const from = new Date(to);
      from.setDate(from.getDate() - 30);
      return { from, to: to };
    } else if (rangeQuery === "last-week") {
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      return { from, to };
    } else {
      const from = new Date(rangeQuery);
      const to = new Date(rangeQuery);
      to.setMonth(to.getMonth() + 1);
      return { from, to };
    }
  }, [rangeQuery]);

  const rangePresets = useMemo(
    () => getRangeFilterPresets(activityData["activity"]),
    [activityData],
  );

  const activitiesInRange = activityData.activity.filter(
    activitiesBetween(range),
  );

  const activities = activitiesInRange
    .filter(activitiesOfType(activityTypes))
    .sort(compareByActivityTime);

  return (
    <div className="flex flex-row-reverse items-start justify-between gap-6">
      <div className="sticky top-6 flex flex-col gap-2 p-4 my-4 border border-primary-500 rounded-lg w-64">
        <h3>Filter Activity</h3>
        <select
          className="block px-2 py-1 rounded border border-gray-600 dark:border-gray-300 text-sm font-medium focus:z-10 focus:outline-none text-foreground my-4"
          disabled={!rangePresets}
          value={rangeQuery}
          onChange={(event) => {
            const current = new URLSearchParams(
              Array.from(searchParams.entries()),
            );
            const value = event.target.value;
            if (!value) {
              current.delete("range");
            } else {
              current.set("range", event.target.value);
            }
            const search = current.toString();
            const query = search ? `?${search}` : "";
            router.replace(`${pathname}${query}`, { scroll: false });
          }}
        >
          <option value="last-week">Last week</option>
          <option value="last-month">Last 30 days</option>
          {rangePresets?.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
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
      <div className="mx-2 flow-root text-foreground mt-4">
        <ul role="list" className="my-4 w-full max-w-xl">
          {activities.map((activity, i) => {
            return <li key={i}>{showContribution(activity)}</li>;
          })}
        </ul>
      </div>
      {activities.length === 0 && (
        <div className="flex w-full h-full items-center justify-center py-48">
          <span className="text-gray-500 dark:text-gray-400">
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
    <label className="flex whitespace-nowrap items-center gap-2 text-sm">
      <input
        name={props.type}
        className="accent-primary-500 dark:accent-primary-400"
        type="checkbox"
        checked={props.state.includes(props.type)}
        onChange={(event) => {
          const final = event.target.checked
            ? Array.from(new Set([...props.state, props.type]))
            : props.state.filter((type) => type !== props.type);

          props.setState(final);
        }}
      />{" "}
      {
        {
          comment_created: "Comment",
          eod_update: "Slack E.O.D. update",
          issue_assigned: "Issue assigned",
          issue_closed: "Issue closed",
          issue_opened: "Iusse opened",
          pr_collaborated: "PR collaborated",
          pr_merged: "PR merged",
          pr_opened: "PR opened",
          pr_reviewed: "Code Review",
        }[props.type]
      }
      <span className="text-xs text-gray-500 dark:text-gray-400">
        [{props.count || "None"}]
      </span>
    </label>
  );
};
