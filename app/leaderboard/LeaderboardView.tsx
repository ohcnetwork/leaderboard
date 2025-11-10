import { LeaderboardEntry } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  period: "week" | "month" | "year";
}

export default function LeaderboardView({
  entries,
  period,
}: LeaderboardViewProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="h-6 w-6 text-yellow-500" aria-label="1st place" />;
    if (rank === 2)
      return <Medal className="h-6 w-6 text-gray-400" aria-label="2nd place" />;
    if (rank === 3)
      return <Medal className="h-6 w-6 text-amber-600" aria-label="3rd place" />;
    return null;
  };

  const periodLabels = {
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {periodLabels[period]} Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top contributors ranked by their activity points
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-8 border-b">
        <Link
          href="/leaderboard/week"
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2",
            period === "week"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Week
        </Link>
        <Link
          href="/leaderboard/month"
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2",
            period === "month"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Month
        </Link>
        <Link
          href="/leaderboard/year"
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2",
            period === "year"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Year
        </Link>
      </div>

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No contributors with points in this period
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            return (
              <Card
                key={entry.username}
                className={cn(
                  "transition-all hover:shadow-md",
                  isTopThree && "border-primary/50"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 shrink-0">
                      {getRankIcon(rank) || (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Image
                      src={
                        entry.avatar_url ||
                        `https://github.com/${entry.username}.png`
                      }
                      alt={entry.name || entry.username}
                      width={56}
                      height={56}
                      className="rounded-full shrink-0"
                    />

                    {/* Contributor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-semibold">
                          {entry.name || entry.username}
                        </h3>
                        {entry.role && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {entry.role}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        @{entry.username}
                      </p>

                      {/* Activity Breakdown */}
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(entry.activity_breakdown)
                          .sort((a, b) => b[1].points - a[1].points)
                          .map(([activityName, data]) => (
                            <div
                              key={activityName}
                              className="text-xs bg-muted px-3 py-1 rounded-full"
                            >
                              <span className="font-medium">
                                {activityName}:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {data.count}
                              </span>
                              {data.points > 0 && (
                                <span className="text-primary ml-1">
                                  (+{data.points})
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className="text-right shrink-0">
                      <div className="text-3xl font-bold text-primary">
                        {entry.total_points}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

