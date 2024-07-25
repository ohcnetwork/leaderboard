import {
  formatDuration as _formatDuration,
  intervalToDuration,
  format,
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
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((Number(d) - Number(yearStart)) / 86400000 + 1) / 7);
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
