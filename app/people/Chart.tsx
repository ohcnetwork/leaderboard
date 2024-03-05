"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ActivityCounts {
  [type: string]: { [month: string]: number };
}

interface Props {
  activityCounts: ActivityCounts;
}

export function Chart({ activityCounts }: Props) {
  const months = Object.keys(activityCounts.issue_opened).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  const latestMonths = months.slice(0, 12);

  const filteredActivityCounts: ActivityCounts = {
    issue_opened: {},
    issue_closed: {},
    pr_merged: {},
    pr_collaborated: {},
    pr_reviewed: {},
    pr_opened: {},
    comment_created: {},
  };

  for (const month of latestMonths) {
    filteredActivityCounts.issue_opened[month] =
      activityCounts.issue_opened[month];
    filteredActivityCounts.issue_closed[month] =
      activityCounts.issue_closed[month];
    filteredActivityCounts.pr_merged[month] = activityCounts.pr_merged[month];
    filteredActivityCounts.pr_collaborated[month] =
      activityCounts.pr_collaborated[month];
    filteredActivityCounts.pr_reviewed[month] =
      activityCounts.pr_reviewed[month];
    filteredActivityCounts.pr_opened[month] = activityCounts.pr_opened[month];
    filteredActivityCounts.comment_created[month] =
      activityCounts.comment_created[month];
  }

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const labels = latestMonths;

  const data = {
    labels,
    datasets: [
      {
        label: "Issue Closed",
        data: Object.values(filteredActivityCounts.issue_closed),
        backgroundColor: "#d64e12",
      },
      {
        label: "Issue Opened",
        data: Object.values(filteredActivityCounts.issue_opened),
        backgroundColor: "#16a4d8",
      },
      {
        label: "PR Merged",
        data: Object.values(filteredActivityCounts.pr_merged),
        backgroundColor: "#9b5fe0",
      },
      {
        label: "PR Opened",
        data: Object.values(filteredActivityCounts.pr_opened),
        backgroundColor: "#8bd346",
      },
      {
        label: "PR Collaborated",
        data: Object.values(filteredActivityCounts.pr_collaborated),
        backgroundColor: "#efdf48",
      },
      {
        label: "Comment Created",
        data: Object.values(filteredActivityCounts.comment_created),
        backgroundColor: "#f9a52c",
      },
      {
        label: "PR Reviewed",
        data: Object.values(filteredActivityCounts.pr_reviewed),
        backgroundColor: "#60dbe8",
      },
    ],
  };

  return (
    <>
      <div className="mb-12 h-[500px] w-[800px]">
        <h1 className="p-6 text-center">Community Engagement</h1>
        <Bar options={options} data={data} />
      </div>
    </>
  );
}
