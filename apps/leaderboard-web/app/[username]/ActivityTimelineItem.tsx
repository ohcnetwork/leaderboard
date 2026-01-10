"use client";

import { ContributorActivity } from "@/lib/data/types";
import RelativeTime from "@/components/RelativeTime";
import { ExternalLinkIcon } from "lucide-react";
import Icon from "@/components/Icon";

interface ActivityTimelineItemProps {
  activity: ContributorActivity;
}

export default function ActivityTimelineItem({
  activity,
}: ActivityTimelineItemProps) {
  return (
    <div className="flex gap-4 pb-4 border-b last:border-0">
      <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {activity.activity_icon && (
            <Icon name={activity.activity_icon} className="size-4" />
          )}
          <span className="font-medium text-sm">{activity.activity_name}</span>
          <RelativeTime
            date={activity.occured_at}
            className="text-xs text-muted-foreground"
          />
          {activity.points !== null && activity.points > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              +{activity.points}
            </span>
          )}
        </div>
        {activity.title && (
          <p className="text-sm mb-1">
            {activity.link ? (
              <div className="flex items-center gap-1">
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {activity.title}
                </a>
                <ExternalLinkIcon className="size-3.5 text-muted-foreground/50" />
              </div>
            ) : (
              activity.title
            )}
          </p>
        )}
        {activity.text && (
          <div
            className="text-sm text-muted-foreground prose prose-sm max-w-none hover:text-primary transition-colors"
            dangerouslySetInnerHTML={{ __html: activity.text }}
          />
        )}
      </div>
    </div>
  );
}
