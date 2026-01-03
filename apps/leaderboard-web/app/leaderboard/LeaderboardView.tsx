"use client";

import { LeaderboardEntry } from "@/lib/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Medal, Trophy, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ActivityTrendChart from "./ActivityTrendChart";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  period: "week" | "month" | "year";
  startDate: Date;
  endDate: Date;
  topByActivity: Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  >;
  hiddenRoles: string[];
}

export default function LeaderboardView({
  entries,
  period,
  startDate,
  endDate,
  topByActivity,
  hiddenRoles,
}: LeaderboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected roles from query params
  // If no roles are selected, default to all visible roles (excluding hidden ones)
  const selectedRoles = useMemo(() => {
    const rolesParam = searchParams.get("roles");
    if (rolesParam) {
      return new Set(rolesParam.split(","));
    }
    // Default: exclude hidden roles
    const allRoles = new Set<string>();
    entries.forEach((entry) => {
      if (entry.role && !hiddenRoles.includes(entry.role)) {
        allRoles.add(entry.role);
      }
    });
    return allRoles;
  }, [searchParams, entries, hiddenRoles]);

  // Get unique roles from entries
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    entries.forEach((entry) => {
      if (entry.role) {
        roles.add(entry.role);
      }
    });
    return Array.from(roles).sort();
  }, [entries]);

  // Filter entries by selected roles and search query
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by roles
    if (selectedRoles.size > 0) {
      filtered = filtered.filter(
        (entry) => entry.role && selectedRoles.has(entry.role)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const name = (entry.name || entry.username).toLowerCase();
        const username = entry.username.toLowerCase();
        return name.includes(query) || username.includes(query);
      });
    }

    return filtered;
  }, [entries, selectedRoles, searchQuery]);

  const toggleRole = (role: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(role)) {
      newSelected.delete(role);
    } else {
      newSelected.add(role);
    }
    updateRolesParam(newSelected);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("roles");
    router.push(`?${params.toString()}`, { scroll: false });
    setSearchQuery("");
  };

  const updateRolesParam = (roles: Set<string>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (roles.size > 0) {
      params.set("roles", Array.from(roles).join(","));
    } else {
      params.delete("roles");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filter top contributors by selected roles
  const filteredTopByActivity = useMemo(() => {
    if (selectedRoles.size === 0) {
      return topByActivity;
    }

    const filtered: typeof topByActivity = {};

    for (const [activityName, contributors] of Object.entries(topByActivity)) {
      const filteredContributors = contributors.filter((contributor) => {
        // Find the contributor in entries to get their role
        const entry = entries.find((e) => e.username === contributor.username);
        return entry?.role && selectedRoles.has(entry.role);
      });

      if (filteredContributors.length > 0) {
        filtered[activityName] = filteredContributors;
      }
    }

    return filtered;
  }, [topByActivity, selectedRoles, entries]);

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return (
        <Trophy className="h-6 w-6 text-yellow-500" aria-label="1st place" />
      );
    if (rank === 2)
      return <Medal className="h-6 w-6 text-gray-400" aria-label="2nd place" />;
    if (rank === 3)
      return (
        <Medal className="h-6 w-6 text-amber-600" aria-label="3rd place" />
      );
    return null;
  };

  const periodLabels = {
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {periodLabels[period]} Leaderboard
                </h1>
                <p className="text-muted-foreground">
                  {filteredEntries.length} of {entries.length} contributors
                  {(selectedRoles.size > 0 || searchQuery) && " (filtered)"}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search contributors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-64"
                  />
                </div>

                {/* Role Filter */}
                {availableRoles.length > 0 && (
                  <>
                    {(selectedRoles.size > 0 || searchQuery) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          <Filter className="h-4 w-4 mr-2" />
                          Role
                          {selectedRoles.size > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                              {selectedRoles.size}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="end">
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">
                            Filter by Role
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {availableRoles.map((role) => (
                              <div
                                key={role}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={role}
                                  checked={selectedRoles.has(role)}
                                  onCheckedChange={() => toggleRole(role)}
                                />
                                <label
                                  htmlFor={role}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {role}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>
            </div>
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
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {entries.length === 0
                  ? "No contributors with points in this period"
                  : "No contributors match the selected filters"}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => {
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
                    <CardContent>
                      <div className="flex items-center gap-6">
                        {/* Rank */}
                        <div className="flex items-center justify-center size-12 shrink-0">
                          {getRankIcon(rank) || (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="size-14 shrink-0">
                          <AvatarImage
                            src={entry.avatar_url || undefined}
                            alt={entry.name || entry.username}
                          />
                          <AvatarFallback>
                            {(entry.name || entry.username)
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Contributor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link href={`/${entry.username}`}>
                              <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                                {entry.name || entry.username}
                              </h3>
                            </Link>
                            {entry.role && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {entry.role}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/${entry.username}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            @{entry.username}
                          </Link>
                          <div className="mb-3" />

                          {/* Activity Breakdown */}
                          <div className="flex flex-wrap gap-3">
                            {entry.activity_breakdown && Object.entries(entry.activity_breakdown)
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

                        {/* Total Points with Trend Chart */}
                        <div className="flex items-center gap-4 shrink-0">
                          {/* Activity Trend Chart */}
                          {entry.daily_activity &&
                            entry.daily_activity.length > 0 && (
                              <ActivityTrendChart
                                dailyActivity={entry.daily_activity}
                                startDate={startDate}
                                endDate={endDate}
                                mode="points"
                              />
                            )}
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                              {entry.total_points}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              points
                            </div>
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

        {/* Sidebar - Top Contributors by Activity */}
        {Object.keys(filteredTopByActivity).length > 0 && (
          <div className="hidden xl:block w-80 shrink-0">
            <div>
              <h2 className="text-xl font-bold mb-6">Top Contributors</h2>
              <div className="space-y-4">
                {Object.entries(filteredTopByActivity).map(
                  ([activityName, contributors]) => (
                    <Card key={activityName} className="overflow-hidden p-0">
                      <CardContent className="p-0">
                        <div className="bg-muted/50 px-4 py-2.5 border-b">
                          <h3 className="font-semibold text-sm text-foreground">
                            {activityName}
                          </h3>
                        </div>
                        <div className="p-3 space-y-2">
                          {contributors.map((contributor, index) => (
                            <Link
                              key={contributor.username}
                              href={`/${contributor.username}`}
                              className="flex items-center gap-2.5 p-2 rounded-md hover:bg-accent transition-colors group"
                            >
                              <div className="flex items-center justify-center w-5 h-5 shrink-0">
                                {index === 0 && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                                {index === 1 && (
                                  <Medal className="h-4 w-4 text-gray-400" />
                                )}
                                {index === 2 && (
                                  <Medal className="h-4 w-4 text-amber-600" />
                                )}
                              </div>
                              <Avatar className="h-9 w-9 shrink-0 border">
                                <AvatarImage
                                  src={contributor.avatar_url || undefined}
                                  alt={contributor.name || contributor.username}
                                />
                                <AvatarFallback className="text-xs">
                                  {(contributor.name || contributor.username)
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors leading-tight">
                                  {contributor.name || contributor.username}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {contributor.count}{" "}
                                  {contributor.count === 1
                                    ? "activity"
                                    : "activities"}{" "}
                                  · {contributor.points} pts
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
