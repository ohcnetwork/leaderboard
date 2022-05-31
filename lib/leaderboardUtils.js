export const categories = [
  { slug: "eod_update", title: "EOD Updates" },
  { slug: "pr_opened", title: "Pull Requests Opened" },
  { slug: "pr_merged", title: "Pull Requests Merged" },
  { slug: "pr_reviewed", title: "Pull Requests Reviewed" },
  { slug: "issue_assigned", title: "Issues Assigned" },
  { slug: "issue_opened", title: "Issues Opened" },
  { slug: "comment_created", title: "Comments Created" },
];

export const getMonthRepresentation = (date) => {
  let d = new Date(date);
  // Use previous month if before 14th of current month.
  if (d.getDate() < 14) {
    d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  }
  return d
    .toLocaleDateString(undefined, { month: "long", year: "2-digit" })
    .replace(" ", " ’");
};
