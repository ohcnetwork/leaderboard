"use client";

import { useMemo } from "react";

interface ActivityTrendChartProps {
  dailyActivity: Array<{ date: string; count: number; points: number }>;
  startDate: Date;
  endDate: Date;
  mode: "points" | "count";
  maxDataPoints?: number;
}

export default function ActivityTrendChart({
  dailyActivity,
  startDate,
  endDate,
  mode,
  maxDataPoints = 32,
}: ActivityTrendChartProps) {
  // Generate all dates in the range
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      if (dateStr) {
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [startDate, endDate]);

  // Map daily activity to full date range
  const fullActivityData = useMemo(() => {
    const activityMap = new Map(
      dailyActivity.map((d) => [d.date, mode === "points" ? d.points : d.count])
    );

    return dateRange.map((date) => activityMap.get(date) || 0);
  }, [dailyActivity, dateRange, mode]);

  // Downsample data to max 72 points for smoother visualization
  const activityData = useMemo(() => {
    if (fullActivityData.length <= maxDataPoints) {
      return fullActivityData;
    }

    // Calculate batch size
    const batchSize = Math.ceil(fullActivityData.length / maxDataPoints);
    const downsampled: number[] = [];

    // Group data into batches and calculate average
    for (let i = 0; i < fullActivityData.length; i += batchSize) {
      const batch = fullActivityData.slice(i, i + batchSize);
      const average = batch.reduce((sum, val) => sum + val, 0) / batch.length;
      downsampled.push(average);
    }

    return downsampled;
  }, [fullActivityData, maxDataPoints]);

  // Calculate chart dimensions and scaling
  const maxValue = useMemo(() => Math.max(...activityData, 1), [activityData]);
  const width = 120;
  const height = 24;
  const padding = 2;

  // Generate smooth SVG path for the trend line using Catmull-Rom splines
  const pathData = useMemo(() => {
    if (activityData.length === 0) return "";

    const points = activityData.map((value, index) => {
      const x =
        padding +
        (index / (activityData.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return { x, y };
    });

    if (points.length === 1 && points[0]) {
      return `M ${points[0].x},${points[0].y}`;
    }

    // Create smooth curve using cubic bezier curves
    const firstPoint = points[0];
    if (!firstPoint) return "";

    let path = `M ${firstPoint.x},${firstPoint.y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      if (!current || !next) continue;

      // Calculate control points for smooth curve
      const tension = 0.3; // Adjust this value for more/less smoothness (0-1)
      const cp1x = current.x + (next.x - current.x) * tension;
      const cp1y = current.y;
      const cp2x = next.x - (next.x - current.x) * tension;
      const cp2y = next.y;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    return path;
  }, [activityData, maxValue, width, height, padding]);

  // Generate smooth area fill path
  const areaPathData = useMemo(() => {
    if (activityData.length === 0) return "";

    const points = activityData.map((value, index) => {
      const x =
        padding +
        (index / (activityData.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return { x, y };
    });

    const firstX = padding;
    const lastX = padding + (width - padding * 2);
    const bottomY = height - padding;

    const firstPoint = points[0];
    if (points.length === 1 && firstPoint) {
      return `M ${firstX},${bottomY} L ${firstPoint.x},${firstPoint.y} L ${lastX},${bottomY} Z`;
    }

    if (!firstPoint) return "";

    // Create smooth curve for area fill
    let path = `M ${firstX},${bottomY} L ${firstPoint.x},${firstPoint.y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      if (!current || !next) continue;

      const tension = 0.3;
      const cp1x = current.x + (next.x - current.x) * tension;
      const cp1y = current.y;
      const cp2x = next.x - (next.x - current.x) * tension;
      const cp2y = next.y;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    path += ` L ${lastX},${bottomY} Z`;
    return path;
  }, [activityData, maxValue, width, height, padding]);

  const totalValue = useMemo(
    () => activityData.reduce((sum, val) => sum + val, 0),
    [activityData]
  );

  if (totalValue === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <svg width={width} height={height} className="opacity-30">
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </svg>
        <span>No activity in this period</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <svg
        width={width}
        height={height}
        className="text-primary"
        style={{ overflow: "visible" }}
      >
        {/* Define gradient */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Area fill with gradient */}
        <path d={areaPathData} fill="url(#trendGradient)" stroke="none" />
        {/* Trend line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
