import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/types";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Contributor</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Activities</TableHead>
          <TableHead className="text-right">Points</TableHead>
          <TableHead>Top Activities</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const contributor = entry.contributor;
          const initials = contributor.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || contributor.username.slice(0, 2).toUpperCase();

          const topActivities = entry.activity_breakdown
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, 3);

          return (
            <TableRow key={contributor.username}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <span>#{entry.rank}</span>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/contributors/${contributor.username}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Avatar className="h-8 w-8">
                    {contributor.avatar_url && (
                      <AvatarImage
                        src={contributor.avatar_url}
                        alt={contributor.name || contributor.username}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {contributor.name || contributor.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{contributor.username}
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                {contributor.role && (
                  <Badge variant="outline">{contributor.role}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {entry.activity_count}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {entry.total_points}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {topActivities.map((activity) => (
                    <Badge
                      key={activity.activity_definition}
                      variant="secondary"
                      className="text-xs"
                    >
                      {activity.activity_name}: {activity.count} (
                      {activity.total_points}pts)
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

