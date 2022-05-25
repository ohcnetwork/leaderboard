import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

const root = join(process.cwd(), "contributors");
const slackRoot = join(process.cwd(), "data/slack");
const githubRoot = join(process.cwd(), "data/github");

const points = {
  comment_created: 1,
  eod_update: 2,
  pr_opened: 3,
  pr_merged: 0,
  pr_reviewed: 7,
  issue_assigned: 2,
  issue_opened: 5,
};

export function formatSlug(slug) {
  return slug.replace(/\.md$/, "");
}

export function formatSlugJSON(slug) {
  return slug.replace(/\.json$/, "");
}

export function getSlackSlugs() {
  const slackSlugs = {};
  fs.readdirSync(`${slackRoot}`).forEach((file) => {
    slackSlugs[formatSlugJSON(file)] = file;
  });

  return slackSlugs;
}

let validSlackSlugs = getSlackSlugs();

export function getSlackMessages(slackId) {
  const filePath = join(slackRoot, `${slackId}.json`);
  let fileContents = [];
  if (validSlackSlugs[slackId]) {
    try {
      fileContents = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.log(e);
    }
    return Object.values(fileContents).reduce((acc, messages) => {
      return acc.concat(
        messages.map((message) => ({
          type: "eod_update",
          time: new Date(message.ts * 1000).toISOString(),
          link: "",
          text: message.text,
        }))
      );
    }, []);
  } else {
    return [];
  }
}

export function getContributorsSlugs() {
  const contributorSlugs = [];
  fs.readdirSync(`${root}`).forEach((file) => {
    contributorSlugs.push({ file: file });
  });

  return contributorSlugs;
}

export function getContributorBySlug(file, detail = false) {
  const fullPath = join(root, `${formatSlug(file)}.md`);
  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));

  const githubHandle = file.replace(/\.md$/, "");

  let activityData = { activity: [] };

  try{
    activityData = JSON.parse(fs.readFileSync(join(githubRoot, `${githubHandle}.json`), "utf8"));
  } catch (e) {
    console.log(e);
  }

  activityData = {
    ...activityData,
    activity: [...activityData.activity, ...getSlackMessages(data.slack)],
  };

  const weightedActivity = activityData.activity.reduce(
    (acc, activity) => {
      return {
        activity: [
          ...acc.activity,
          { ...activity, points: points[activity.type] || 0 },
        ],
        points: acc.points + (points[activity.type] || 0),
        comment_created:
          acc.comment_created + (activity.type === "comment_created" ? 1 : 0),
        eod_update: acc.eod_update + (activity.type === "eod_update" ? 1 : 0),
        pr_opened: acc.pr_opened + (activity.type === "pr_opened" ? 1 : 0),
        pr_merged: acc.pr_merged + (activity.type === "pr_merged" ? 1 : 0),
        pr_reviewed:
          acc.pr_reviewed + (activity.type === "pr_reviewed" ? 1 : 0),
        issue_assigned:
          acc.issue_assigned + (activity.type === "issue_assigned" ? 1 : 0),
        issue_opened:
          acc.issue_opened + (activity.type === "issue_opened" ? 1 : 0),
      };
    },
    {
      activity: [],
      points: 0,
      comment_created: 0,
      eod_update: 0,
      pr_opened: 0,
      pr_merged: 0,
      pr_reviewed: 0,
      issue_assigned: 0,
      issue_opened: 0,
    }
  );

  const calendarData = getCalendarData(weightedActivity.activity);
  return {
    file: file,
    slug: formatSlug(file),
    path: fullPath,
    content: content,
    activityData: {
      ...activityData,
      activity: weightedActivity.activity,
    },
    highlights: {
      points: weightedActivity.points,
      eod_update: weightedActivity.eod_update,
      comment_created: weightedActivity.comment_created,
      pr_opened: weightedActivity.pr_opened,
      pr_reviewed: weightedActivity.pr_reviewed,
      pr_merged: weightedActivity.pr_merged,
      issue_assigned: weightedActivity.issue_assigned,
      issue_opened: weightedActivity.issue_opened,
    },
    weekSummary: getLastWeekHighlights(calendarData),
    calendarData: detail ? calendarData : [],
    ...data,
  };
}

export function getContributors(detail = false) {
  const contributors = getContributorsSlugs()
    .map((path) => getContributorBySlug(path.file, detail))
    .sort((a, b) => b.weekSummary.points - a.highlights.points);
  // .sort((x, y) => (x.joining_date > y.joining_date ? 1 : -1));
  return contributors;
}

export function getCalendarData(activity) {
  const calendarData = activity.reduce((acc, activity) => {
    // Github activity.time ignores milliseconds (*1000)
    const date = (
      new String(activity.time).length === 10
        ? new Date(activity.time * 1000)
        : new Date(activity.time.slice(0, 10))
    )
      .toISOString()
      .split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        count: 0,
        types: [],
      };
    }
    acc[date].count += 1;
    if (acc[date][activity.type]) {
      acc[date][activity.type] += 1;
    } else {
      acc[date][activity.type] = 1;
    }
    if (!acc[date].types.includes(activity.type)) {
      acc[date].types.push(activity.type);
      // console.log(activity.type);
    }
    return acc;
  }, {});
  return [...Array(365)].map((_, i) => {
    // Current Date - i
    const iReverse = 365 - i;
    const date = new Date(
      new Date().getTime() - iReverse * 24 * 60 * 60 * 1000
    );
    // yyyy-mm-dd
    const dateString = `${date.getFullYear()}-${padZero(
      date.getMonth() + 1
    )}-${padZero(date.getDate())}`;
    const returnable = {
      // date in format YYYY-MM-DD
      ...calendarData[dateString],
      date: dateString,
      count: calendarData[dateString]?.count || 0,
      level: calendarData[dateString]?.types.length || 0,
    };
    // console.log("Returning", returnable);
    return returnable;
  });
}

const getLastWeekHighlights = (calendarData) => {
  const lastWeek = calendarData.slice(-7);
  const highlights = lastWeek.reduce(
    (acc, day) => {
      return {
        points: acc.points + (day.points ?? 0),
        eod_update: acc.eod_update + (day.eod_update ?? 0),
        comment_created: acc.comment_created + (day.comment_created ?? 0),
        pr_opened: acc.pr_opened + (day.pr_opened ?? 0),
        pr_reviewed: acc.pr_reviewed + (day.pr_reviewed ?? 0),
        pr_merged: acc.pr_merged + (day.pr_merged ?? 0),
        issue_assigned: acc.issue_assigned + (day.issue_assigned ?? 0),
        issue_opened: acc.issue_opened + (day.issue_opened ?? 0),
      };
    },
    {
      points: 0,
      eod_update: 0,
      comment_created: 0,
      pr_opened: 0,
      pr_reviewed: 0,
      pr_merged: 0,
      issue_assigned: 0,
      issue_opened: 0,
    }
  );
  if (lastWeek.find((day) => day.pr_opened > 0)) {
    console.log(lastWeek, "Summarized to ", highlights);
  }
  return highlights;
};

const padZero = (num) => (num < 10 ? `0${num}` : num);
