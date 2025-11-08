"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContributorCard } from "@/components/ContributorCard";
import { Search } from "lucide-react";
import type { Contributor } from "@/types";

interface PeoplePageProps {
  contributors: Array<{
    contributor: Contributor;
    total_points: number;
    activity_count: number;
  }>;
  roles: Record<string, { name: string; description?: string }>;
}

export default function PeoplePageClient({ contributors, roles }: PeoplePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const filteredContributors = useMemo(() => {
    return contributors.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.contributor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contributor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contributor.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === "all" || item.contributor.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [contributors, searchQuery, selectedRole]);

  const rolesList = [
    { key: "all", name: "All Contributors" },
    ...Object.entries(roles).map(([key, value]) => ({
      key,
      name: value.name,
    })),
  ];

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Contributors</h1>
          <p className="text-muted-foreground">
            Meet the people building our community
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={selectedRole} onValueChange={setSelectedRole}>
          <TabsList>
            {rolesList.map((role) => (
              <TabsTrigger key={role.key} value={role.key}>
                {role.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {filteredContributors.length} contributor
          {filteredContributors.length !== 1 ? "s" : ""} found
        </p>

        {filteredContributors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContributors.map((item) => (
              <ContributorCard
                key={item.contributor.username}
                contributor={item.contributor}
                totalPoints={item.total_points}
                activityCount={item.activity_count}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No contributors found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

