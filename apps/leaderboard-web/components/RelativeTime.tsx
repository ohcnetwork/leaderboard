"use client";

import { formatTimeAgo } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface RelativeTimeProps {
  date: Date;
  className?: string;
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  // Format absolute time like: "Monday, November 11, 2025 at 2:30 PM"
  const absoluteTime = format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <time dateTime={date.toISOString()} className={className}>
            {formatTimeAgo(date)}
          </time>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">{absoluteTime}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
