"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo, useState } from "react";

const shortDateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const tooltipDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface DailyData {
  date: string;
  count: number;
  points: number;
}

interface HomeActivityChartProps {
  dailyActivity: DailyData[];
  startDate: Date;
  endDate: Date;
}

const WIDTH = 800;
const HEIGHT = 200;
const PADDING = { top: 20, right: 16, bottom: 32, left: 48 };
const CHART_W = WIDTH - PADDING.left - PADDING.right;
const CHART_H = HEIGHT - PADDING.top - PADDING.bottom;

function buildSmoothPath(
  points: { x: number; y: number }[],
  tension = 0.3,
): string {
  if (points.length === 0) return "";
  const first = points[0]!;
  if (points.length === 1) return `M ${first.x},${first.y}`;

  let path = `M ${first.x},${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]!;
    const next = points[i + 1]!;
    const cp1x = curr.x + (next.x - curr.x) * tension;
    const cp2x = next.x - (next.x - curr.x) * tension;
    path += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`;
  }
  return path;
}

function niceYTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceStep =
    residual <= 1.5
      ? magnitude
      : residual <= 3
        ? 2 * magnitude
        : residual <= 7
          ? 5 * magnitude
          : 10 * magnitude;

  const ticks: number[] = [];
  for (let v = 0; v <= max + niceStep * 0.5; v += niceStep) {
    ticks.push(Math.round(v));
  }
  return ticks;
}

export default function HomeActivityChart({
  dailyActivity,
  startDate,
  endDate,
}: HomeActivityChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(formatDateKey(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  const fullData = useMemo(() => {
    const map = new Map(dailyActivity.map((d) => [d.date, d]));
    return dateRange.map((date) => ({
      date,
      count: map.get(date)?.count ?? 0,
      points: map.get(date)?.points ?? 0,
    }));
  }, [dailyActivity, dateRange]);

  const maxCount = useMemo(
    () => Math.max(...fullData.map((d) => d.count), 1),
    [fullData],
  );

  const yTicks = useMemo(() => niceYTicks(maxCount, 4), [maxCount]);
  const yMax = yTicks[yTicks.length - 1] || maxCount;

  const countPoints = useMemo(
    () =>
      fullData.map((d, i) => ({
        x: PADDING.left + (i / Math.max(fullData.length - 1, 1)) * CHART_W,
        y: PADDING.top + CHART_H - (d.count / yMax) * CHART_H,
      })),
    [fullData, yMax],
  );

  const linePath = useMemo(
    () => buildSmoothPath(countPoints, 0.25),
    [countPoints],
  );

  const areaPath = useMemo(() => {
    if (countPoints.length === 0) return "";
    const baseline = PADDING.top + CHART_H;
    const first = countPoints[0]!;
    const last = countPoints[countPoints.length - 1]!;
    return `${buildSmoothPath(countPoints, 0.25)} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
  }, [countPoints]);

  const xLabels = useMemo(() => {
    const step = Math.max(1, Math.floor(fullData.length / 6));
    const labels: { x: number; label: string }[] = [];
    for (let i = 0; i < fullData.length; i += step) {
      const d = fullData[i]!;
      labels.push({
        x: PADDING.left + (i / Math.max(fullData.length - 1, 1)) * CHART_W,
        label: shortDateFormat.format(new Date(d.date)),
      });
    }
    return labels;
  }, [fullData]);

  const totalCount = fullData.reduce((s, d) => s + d.count, 0);
  const totalPoints = fullData.reduce((s, d) => s + d.points, 0);

  if (totalCount === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No activity data available for this period
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-3 gap-1">
        <div className="flex items-baseline gap-2 sm:gap-4">
          <span className="text-xl sm:text-2xl font-bold">
            {totalCount.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            activities in the last {fullData.length} days
          </span>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {totalPoints.toLocaleString()} total points
        </div>
      </div>
      <TooltipProvider delayDuration={0}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="homeChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = PADDING.top + CHART_H - (tick / yMax) * CHART_H;
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? "0" : "4,4"}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  fontSize="11"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xLabels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={HEIGHT - 6}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="11"
              suppressHydrationWarning
            >
              {l.label}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#homeChartGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover targets */}
          {countPoints.map((pt, i) => {
            const d = fullData[i]!;
            const barW = CHART_W / fullData.length;
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <rect
                    x={pt.x - barW / 2}
                    y={PADDING.top}
                    width={barW}
                    height={CHART_H}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-crosshair"
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">
                    {tooltipDateFormat.format(new Date(d.date))}
                  </p>
                  <p className="text-muted-foreground">
                    {d.count} {d.count === 1 ? "activity" : "activities"}{" "}
                    &middot; {d.points} pts
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Hover dot */}
          {hoveredIndex !== null && countPoints[hoveredIndex] && (
            <>
              <line
                x1={countPoints[hoveredIndex]!.x}
                y1={PADDING.top}
                x2={countPoints[hoveredIndex]!.x}
                y2={PADDING.top + CHART_H}
                stroke="var(--muted-foreground)"
                strokeWidth="1"
                strokeDasharray="3,3"
                pointerEvents="none"
              />
              <circle
                cx={countPoints[hoveredIndex]!.x}
                cy={countPoints[hoveredIndex]!.y}
                r="4"
                fill="var(--primary)"
                stroke="var(--background)"
                strokeWidth="2"
                pointerEvents="none"
              />
            </>
          )}
        </svg>
      </TooltipProvider>
    </div>
  );
}
