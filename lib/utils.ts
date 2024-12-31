import {
  formatDuration as _formatDuration,
  intervalToDuration,
  format,
  getISOWeek,
  startOfISOWeek,
  addDays,
  getISOWeekYear,
} from "date-fns";
import { env } from "@/env.mjs";

export const formatDuration = (duration_in_ms: number) =>
  _formatDuration(
    intervalToDuration({
      start: new Date(0),
      end: new Date(duration_in_ms),
    }),
  )
    .split(" ")
    .splice(0, 4)
    .join(" ");

export const getWeekNumber = (date: Date) => {
  let weekNumber = getISOWeek(date);

  if (weekNumber === 1 && date.getMonth() === 11) {
    const startOfWeek = startOfISOWeek(date);
    if (startOfWeek.getFullYear() !== getISOWeekYear(date)) {
      const lastDayOfLastWeekThisYear = addDays(startOfWeek, -1);
      weekNumber = getISOWeek(lastDayOfLastWeekThisYear) + 1;
    }
  }
  return weekNumber;
};

const now = new Date();

export const LeaderboardFilterDurations = [
  "last-week",
  "last-fortnight",
  "last-month",
  "previous-month",
  `year-${now.getFullYear()}`,
  `year-${now.getFullYear() - 1}`,
] as const;

export const calcDateRange = (
  duration: (typeof LeaderboardFilterDurations)[number],
) => {
  if (duration === "last-week") return parseDateRangeSearchParam(null, 7);
  if (duration === "last-fortnight") return parseDateRangeSearchParam(null, 14);
  if (duration === "last-month") return parseDateRangeSearchParam(null, 28);

  if (duration === "previous-month") {
    const end = new Date();
    end.setDate(0);
    const start = new Date(end);
    start.setDate(1);
    return [start, end] as const;
  }

  if (duration.startsWith("year-")) {
    const year = parseInt(duration.replace("year-", ""));
    const end = new Date(`${year}-12-31`);
    const start = new Date(`${year}-01`);
    return [start, end] as const;
  }
};

export const parseDateRangeSearchParam = (
  range?: string | null,
  relativeDaysBefore = 7,
) => {
  if (range) {
    const [startStr, endStr] = range.split("...");
    const start = new Date(startStr);
    const end = new Date(endStr);
    end.setHours(23, 59, 59);
    return [start, end] as const;
  }

  // Last 7 days
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - relativeDaysBefore);
  end.setHours(23, 59, 59);
  return [start, end] as const;
};

export const padZero = (num: number) => (num < 10 ? `0${num}` : num);

export const parseIssueNumber = (url: string) => {
  return url.replace(/^.*github\.com\/[\w-]+\/[\w-]+\/issues\//, "");
};

export const navLinks = [
  { title: "Feed", path: "/feed" },
  { title: "Leaderboard", path: "/leaderboard" },
  { title: "People", path: "/people" },
  { title: "Projects", path: "/projects" },
  { title: "Releases", path: "/releases" },
  { title: "Discussion", path: "/discussion" },
];

export const formatDate = (date: Date) => {
  return format(date, "MMM dd, yyyy");
};
type Features = "Projects" | "Releases" | "Discussions";
export const featureIsEnabled = (feature: Features) => {
  return env.NEXT_PUBLIC_FEATURES?.split(",").includes(feature);
};

export const parseOrgRepoFromURL = (
  url: string,
): { org: string; repo: string | null } => {
  const parts = url.split("/");

  let org: string, repo: string | null;

  if (parts[3] === "orgs") {
    // Handle the URL format: /orgs/{org}/discussions/{id}
    org = parts[4];
    repo = null;
  } else {
    // Handle the URL format: /{org}/{repo}/discussions/{id}
    org = parts[3];
    repo = parts[4] === org ? "" : parts[4];
  }

  return { org, repo };
};
