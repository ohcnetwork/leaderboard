import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import githubData from "/data/github_test.json";

const root = join(process.cwd(), "contributors");
const slackRoot = join(process.cwd(), "data/slack");

const points = {
  comment_created: 1,
  eod_update: 2,
  pr_opened: 3,
  pr_merged: 10,
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

export function getContributorBySlug(file) {
  const fullPath = join(root, `${formatSlug(file)}.md`);
  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));

  let activityData = githubData[file] ?? { activity: [] };
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
        pr_opened: acc.pr_opened + (activity.type === "pr_opened" ? 1 : 0),
        eod_updates: acc.eod_updates + (activity.type === "eod_update" ? 1 : 0),
        pr_reviews: acc.pr_reviews + (activity.type === "pr_reviewed" ? 1 : 0),
      };
    },
    {
      activity: [],
      points: 0,
      pr_opened: 0,
      eod_updates: 0,
      pr_reviews: 0,
    }
  );

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
      pr_opened: weightedActivity.pr_opened,
      eod_updates: weightedActivity.eod_updates,
      pr_reviews: weightedActivity.pr_reviews,
    },
    calendarData: getCalendarData(activityData.activity),
    ...data,
  };
}

export function getContributors() {
  const contributors = getContributorsSlugs()
    .map((path) => getContributorBySlug(path.file))
    .sort((x, y) => (x.joining_date > y.joining_date ? 1 : -1));
  return contributors;
}

export function getCalendarData(activity) {
  const calendarData = activity.reduce((acc, activity) => {
    const date = new Date(activity.time).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        count: 0,
        types: [],
      };
    }
    acc[date].count += 1;
    if (!acc[date].types.includes(activity.type)) {
      acc[date].types.push(activity.type);
    }
    return acc;
  }, {});
  return [...Array(365)].map((_, i) => {
    // Current Date - i
    const iReverse = 365 - i;
    const date = new Date(
      new Date().getTime() - iReverse * 24 * 60 * 60 * 1000
    );
    const dateString = date.toISOString().split("T")[0];
    const returnable = {
      // date in format YYYY-MM-DD
      date: dateString,
      count: calendarData[dateString]?.count || 0,
      level: calendarData[dateString]?.types.length || 0,
    };
    console.log(returnable);
    return returnable;
  });
}
