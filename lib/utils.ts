import {
  formatDuration as _formatDuration,
  intervalToDuration,
  format,
} from "date-fns";
import { env } from "@/env.mjs";
export const parametreize = (string: string) => {
  return string.replace(/\s/gu, "_").toLowerCase();
};

export const humanize = (str: string) => {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

export const scrollTo = (id: string | boolean) => {
  const element = document.querySelector(`#${id}`);
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
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
];

export const formatDate = (date: Date) => {
  return format(date, "MMM dd, yyyy");
};
type Features = "Projects" | "Releases";
export const featureIsEnabled = (feature: Features) => {
  return env.NEXT_PUBLIC_FEATURES?.split(",").includes(feature);
};
