import {
  formatDuration as _formatDuration,
  intervalToDuration,
  format,
  getISOWeek,
  startOfISOWeek,
  addDays,
  getISOWeekYear,
  subDays,
  startOfMonth,
  subMonths,
  endOfMonth,
  endOfYear,
  startOfYear,
  startOfDay,
  endOfDay,
  min,
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
    const start = startOfMonth(subMonths(now, 1));
    const end = endOfMonth(subMonths(now, 1));
    return [start, end] as const;
  }

  if (duration.startsWith("year-")) {
    const year = new Date(`${duration.replace("year-", "")}-01-01`);
    return [startOfYear(year), min([endOfYear(year), now])] as const;
  }
};

export const parseDateRangeSearchParam = (
  range?: string | null,
  relativeDaysBefore = 7,
) => {
  if (range) {
    const [startStr, endStr] = range.split("...");
    const start = startOfDay(new Date(startStr));
    const end = endOfDay(new Date(endStr));
    return [start, end] as const;
  }

  // Last 7 days
  const end = new Date();
  const start = subDays(end, relativeDaysBefore);
  return [startOfDay(start), endOfDay(end)] as const;
};

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
