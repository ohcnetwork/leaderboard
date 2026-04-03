"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface ActivityTypeData {
  name: string;
  count: number;
  points: number;
}

interface HomeActivityDonutProps {
  activityTypes: ActivityTypeData[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
];

const CHART_BG_CLASSES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
  "bg-chart-9",
  "bg-chart-10",
];

const SIZE = 180;
const CENTER = SIZE / 2;
const OUTER_R = 80;
const INNER_R = 52;

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = {
    x: cx + r * Math.cos(startAngle),
    y: cy + r * Math.sin(startAngle),
  };
  const end = {
    x: cx + r * Math.cos(endAngle),
    y: cy + r * Math.sin(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const GAP = 0.02;
  const adjustedStart = startAngle + GAP;
  const adjustedEnd = endAngle - GAP;
  if (adjustedEnd <= adjustedStart) {
    return describeArc(cx, cy, outerR, startAngle, endAngle);
  }

  const outerStart = {
    x: cx + outerR * Math.cos(adjustedStart),
    y: cy + outerR * Math.sin(adjustedStart),
  };
  const outerEnd = {
    x: cx + outerR * Math.cos(adjustedEnd),
    y: cy + outerR * Math.sin(adjustedEnd),
  };
  const innerEnd = {
    x: cx + innerR * Math.cos(adjustedEnd),
    y: cy + innerR * Math.sin(adjustedEnd),
  };
  const innerStart = {
    x: cx + innerR * Math.cos(adjustedStart),
    y: cy + innerR * Math.sin(adjustedStart),
  };
  const largeArc = adjustedEnd - adjustedStart > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function HomeActivityDonut({
  activityTypes,
}: HomeActivityDonutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...activityTypes].sort((a, b) => b.count - a.count),
    [activityTypes],
  );

  const total = useMemo(
    () => sorted.reduce((s, t) => s + t.count, 0),
    [sorted],
  );

  const slices = useMemo(() => {
    if (total === 0) return [];
    const START_ANGLE = -Math.PI / 2;
    let currentAngle = START_ANGLE;

    return sorted.map((item, i) => {
      const fraction = item.count / total;
      const startAngle = currentAngle;
      const endAngle = currentAngle + fraction * 2 * Math.PI;
      currentAngle = endAngle;

      return {
        ...item,
        fraction,
        startAngle,
        endAngle,
        color: CHART_COLORS[i % CHART_COLORS.length]!,
        bgClass: CHART_BG_CLASSES[i % CHART_BG_CLASSES.length]!,
        path: describeDonutSlice(
          CENTER,
          CENTER,
          OUTER_R,
          INNER_R,
          startAngle,
          endAngle,
        ),
      };
    });
  }, [sorted, total]);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No activity type data available
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut */}
      <div className="shrink-0">
        <TooltipProvider delayDuration={0}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="drop-shadow-sm"
          >
            {slices.map((slice, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <path
                    d={slice.path}
                    fill={slice.color}
                    opacity={
                      hoveredIndex === null || hoveredIndex === i ? 1 : 0.4
                    }
                    className="transition-opacity duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <p className="font-medium">{slice.name}</p>
                  <p className="text-muted-foreground">
                    {slice.count} activities (
                    {(slice.fraction * 100).toFixed(1)}
                    %)
                  </p>
                  {slice.points > 0 && (
                    <p className="text-muted-foreground">
                      {slice.points} points
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Center text */}
            <text
              x={CENTER}
              y={CENTER - 6}
              textAnchor="middle"
              fill="var(--foreground)"
              fontSize="22"
              fontWeight="700"
            >
              {total.toLocaleString()}
            </text>
            <text
              x={CENTER}
              y={CENTER + 12}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="11"
            >
              activities
            </text>
          </svg>
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex-1 grid grid-cols-1 gap-1.5 min-w-0 w-full">
        {slices.map((slice, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors",
              hoveredIndex === i && "bg-secondary/60",
            )}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={cn("w-2.5 h-2.5 rounded-sm shrink-0", slice.bgClass)}
            />
            <span className="text-sm truncate flex-1">{slice.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {slice.count}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
              {(slice.fraction * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
