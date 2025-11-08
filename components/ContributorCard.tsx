import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Contributor } from "@/types";

interface ContributorCardProps {
  contributor: Contributor;
  totalPoints?: number;
  activityCount?: number;
  rank?: number;
}

export function ContributorCard({
  contributor,
  totalPoints,
  activityCount,
  rank,
}: ContributorCardProps) {
  const initials = contributor.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || contributor.username.slice(0, 2).toUpperCase();

  return (
    <Link href={`/contributors/${contributor.username}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {contributor.avatar_url && (
                  <AvatarImage
                    src={contributor.avatar_url}
                    alt={contributor.name || contributor.username}
                  />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {contributor.name || contributor.username}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{contributor.username}
                </p>
              </div>
            </div>
            {rank !== undefined && (
              <Badge variant="secondary" className="text-sm">
                #{rank}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contributor.role && (
            <Badge variant="outline" className="mb-2">
              {contributor.role}
            </Badge>
          )}
          {contributor.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {contributor.bio}
            </p>
          )}
          <div className="flex gap-4 text-sm">
            {totalPoints !== undefined && (
              <div>
                <span className="font-semibold text-lg">{totalPoints}</span>
                <span className="text-muted-foreground ml-1">points</span>
              </div>
            )}
            {activityCount !== undefined && (
              <div>
                <span className="font-semibold text-lg">{activityCount}</span>
                <span className="text-muted-foreground ml-1">activities</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

