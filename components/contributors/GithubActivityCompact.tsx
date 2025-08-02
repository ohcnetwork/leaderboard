"use client";

import { ACTIVITY_TYPES, Activity, ActivityData } from "@/lib/types";
import {
  formatDuration,
  parseDateRangeSearchParam,
  parseOrgRepoFromURL,
} from "@/lib/utils";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RelativeTime from "@/components/RelativeTime";
import DateRangePicker from "@/components/DateRangePicker";
import { format, isWithinInterval } from "date-fns";
import GithubDiscussion from "@/components/discussions/GithubDiscussion";
import { IoIosChatboxes } from "react-icons/io";
import Link from "next/link";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import {
  IoGitCommit,
  IoGitMerge,
  IoGitPullRequestSharp,
} from "react-icons/io5";
import { FaRegDotCircle } from "react-icons/fa";
import { MdOutlineInsertComment, MdReviews } from "react-icons/md";

const activityTypesAtom = atomWithStorage("leaderboard-activity-types", [
  ...ACTIVITY_TYPES,
]);

const getNumberFromLink = (link: string) => {
  const parts = link.split("/");
  return parts[parts.length - 1];
};

const formatSlackText = (text: string) => {
  text = text.replace(/<([^|]+)\|([^>]+)>/g, "$2");
  text = text.replace(/<@([A-Z0-9]+)>/g, "@$1");
  text = text.replace(/:([a-zA-Z0-9_+-]+):/g, "$1");
  return text;
};

const FormattedTime = ({ time }: { time: string }) => (
  <span className="text-foreground underline">
    {format(new Date(time), "dd MMM yy")}
  </span>
);

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
            <div>
              <div className="font-bold text-primary-500 dark:text-primary-300">
                <FormattedTime time={timestamp} />
                <span className=" text-sm font-medium text-secondary-700 dark:text-secondary-200">
                  {" "}
                  - End of the day update from slack
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-secondary-600 p-2 md:p-4">
            <span className="whitespace-pre-line break-words text-sm font-medium text-foreground">
              {formatSlackText(activity["text"])}
            </span>
          </div>
        </div>
      );
    case "comment_created":
      return (
        <div className="min-w-0 flex-1">
          <div>
            <div className="font-base text-sm text-primary-300">
              {"Commented on "}
              {commentTypes(activity["link"].split("/").slice(5, 6))}
              {" in  "}
              <span className="text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
              <span className="ml-2 whitespace-nowrap">
                on <FormattedTime time={timestamp} />
              </span>
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-secondary-600 p-2 md:p-4">
            <a href={activity["link"]} target="_blank">
              <span className="cursor-pointer whitespace-pre-line break-words text-sm font-medium text-foreground hover:text-primary-500">
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
          <div className="text-base text-foreground">
            <div className="font-base text-sm text-primary-300">
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
                  <FormattedTime time={timestamp} />
                </span>
              )}
            </div>
            {["pr_merged", "pr_opened"].includes(activity["type"]) && (
              <div className="max-w-xl pt-4">
                <a
                  href={activity["link"]}
                  target="_blank"
                  className="font-bold text-foreground hover:text-primary-500 dark:text-white dark:hover:text-primary-400"
                >
                  {activity["text"]}{" "}
                  <span className="text-sm text-gray-300">
                    #{getNumberFromLink(activity["link"])}
                  </span>
                </a>
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
          <div className="text-base text-foreground">
            <div className="font-base text-sm text-primary-300">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" an issue in "}</span>
              <span className="text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
              <span className="ml-2 whitespace-nowrap">
                on <FormattedTime time={timestamp} />
              </span>
            </div>
            <div className="max-w-xl pt-4">
              <a
                href={activity["link"]}
                target="_blank"
                className="font-bold text-foreground hover:text-primary-500 dark:text-white dark:hover:text-primary-400"
              >
                {activity["text"]}{" "}
                <span className="text-sm text-gray-300">
                  #{getNumberFromLink(activity["link"])}
                </span>
              </a>
            </div>
          </div>
        </div>
      );
    case "pr_collaborated":
      return (
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-base text-foreground">
            <div className="font-base text-sm">
              <span className="capitalize">
                {activity["type"].split("_")[1]}
              </span>
              <span>{" on a pull request on "}</span>
              <span className="text-primary-400 dark:text-primary-300">
                {activity["link"].split("/").slice(3, 5).join("/")}
              </span>
            </div>
            <div className="max-w-xl pt-4">
              <a
                href={activity["link"]}
                target="_blank"
                className="font-bold text-foreground hover:text-primary-500 dark:text-white dark:hover:text-primary-400"
              >
                {activity["text"]}{" "}
                <span className="text-sm text-gray-300">
                  #{getNumberFromLink(activity["link"])}
                </span>
              </a>
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
                <FormattedTime time={activity.time} />
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
      return <MdOutlineInsertComment className="size-5 text-secondary-700" />;

    case "pr_reviewed":
      return <MdReviews className="size-5 text-secondary-700" />;

    case "issue_opened":
      return (
        <FaRegDotCircle className="size-5 stroke-current text-green-600" />
      );

    case "issue_assigned":
      return <FaRegDotCircle className="size-5 stroke-current text-blue-600" />;

    case "issue_closed":
      return (
        <FaRegDotCircle className="size-5 stroke-current text-purple-600" />
      );

    case "pr_opened":
      return (
        <IoGitPullRequestSharp className="size-5 stroke-current text-green-600" />
      );

    case "pr_merged":
      return <IoGitMerge className="size-6 stroke-current text-purple-600" />;

    case "pr_collaborated":
      return <IoGitCommit className="size-5 stroke-current text-blue-600" />;

    case "discussion_answered":
    case "discussion_comment_created":
    case "discussion_created":
      return <IoIosChatboxes className="size-5 text-secondary-700" />;

    default:
      return <FaRegDotCircle className="size-5 text-secondary-700" />;
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
    return isWithinInterval(time, { start: from, end: to });
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
