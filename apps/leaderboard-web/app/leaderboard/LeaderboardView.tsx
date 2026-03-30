"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy, Medal, Search, Filter, X } from "lucide-react";

import type {
  ContributorEntry,
  LeaderboardData,
} from "@/lib/types/leaderboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardViewProps {
  data: LeaderboardData;
  period: "week" | "month" | "year";
}

export function LeaderboardView({
  data,
  period,
}: LeaderboardViewProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const entries = data.entries;
  const topByActivity = data.topByActivity || {};

  const selectedRoles = useMemo(() => {
    const roles = searchParams.get("roles");
    return new Set(roles?.split(",").filter(Boolean) || []);
  }, [searchParams]);

  const availableRoles = useMemo(() => {
    const roles = new Set(entries.map((entry) => entry.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [entries]);

  const hasActiveFilters = selectedRoles.size > 0 || searchQuery.trim().length > 0;

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (selectedRoles.size > 0) {
      filtered = filtered.filter((entry) => selectedRoles.has(entry.role));
    }

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

  const filteredTopByActivity = useMemo(() => {
    if (selectedRoles.size === 0) {
      return topByActivity;
    }

    const filtered: typeof topByActivity = {};

    for (const [activityName, contributors] of Object.entries(topByActivity)) {
      const filteredContributors = contributors.filter((contributor) => {
        const entry = entries.find((e) => e.username === contributor.username);
        return entry && selectedRoles.has(entry.role);
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
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {periodLabels[period]} Leaderboard
                </h1>
                <p className="text-muted-foreground">
                  {filteredEntries.length} of {entries.length} contributors
                  {hasActiveFilters && " (filtered)"}
                </p>
              </div>

              <div className="flex items-center gap-2">
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

                {availableRoles.length > 0 && (
                  <>
                    {hasActiveFilters && filteredEntries.length !== entries.length && (
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

          <Card>
            <CardHeader>
              <CardTitle>Contributors</CardTitle>
              <CardDescription>
                Ranked by contribution points for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Contributor</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Activities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, index) => (
                    <TableRow key={entry.username}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/${entry.username}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.avatarUrl} alt={entry.name || entry.username} />
                            <AvatarFallback>
                              {(entry.name || entry.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{entry.name || entry.username}</p>
                            <p className="text-sm text-muted-foreground">@{entry.username}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {entry.role ? (
                          <Badge variant="secondary">{entry.role}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.points.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.activities.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {Object.keys(filteredTopByActivity).length > 0 && (
          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top by Activity</CardTitle>
                  <CardDescription>
                    Highest contributors for each activity type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(filteredTopByActivity).map(
                    ([activityName, contributors]) => (
                      <div key={activityName}>
                        <h4 className="font-medium text-sm mb-2">{activityName}</h4>
                        <div className="space-y-2">
                          {contributors.slice(0, 3).map((contributor, index) => (
                            <div
                              key={contributor.username}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-muted-foreground w-4">#{index + 1}</span>
                                <Link
                                  href={`/${contributor.username}`}
                                  className="truncate hover:underline"
                                >
                                  {contributor.name || contributor.username}
                                </Link>
                              </div>
                              <span className="font-medium shrink-0">
                                {contributor.points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
