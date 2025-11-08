import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EnrichedActivity } from "@/types";
import { ExternalLink } from "lucide-react";

interface ActivityItemProps {
  activity: EnrichedActivity;
  showContributor?: boolean;
}

export function ActivityItem({
  activity,
  showContributor = true,
}: ActivityItemProps) {
  const contributor = activity.contributor_info;
  const activityDef = activity.activity_definition_info;

  const initials = contributor.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || contributor.username.slice(0, 2).toUpperCase();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {showContributor && (
            <Link href={`/contributors/${contributor.username}`}>
              <Avatar className="h-10 w-10">
                {contributor.avatar_url && (
                  <AvatarImage
                    src={contributor.avatar_url}
                    alt={contributor.name || contributor.username}
                  />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                {showContributor && (
                  <Link
                    href={`/contributors/${contributor.username}`}
                    className="font-semibold hover:underline"
                  >
                    {contributor.name || contributor.username}
                  </Link>
                )}
                <span className="text-muted-foreground mx-2">
                  {activityDef.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {activity.calculated_points > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{activity.calculated_points} pts
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(activity.occured_at, { addSuffix: true })}
                </span>
              </div>
            </div>
            {activity.title && (
              <p className="text-sm font-medium mb-1">{activity.title}</p>
            )}
            {activity.text && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {activity.text}
              </p>
            )}
            {activity.link && (
              <a
                href={activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View details
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

