"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityGraph, {
  ActivityGraphFilterButton,
  ActivityGraphFilterProps,
} from "./ActivityGraph";
import { useState } from "react";

interface ActivityOverviewProps {
  data: Array<{ date: string; count: number; level: number }>;
  activities: Array<{
    activity_definition_name: string;
    occured_at: Date | string;
  }>;
  activityDefinitions: Array<{
    name: string;
  }>;
  totalActivities: number;
}

export default function ActivityOverview({
  data,
  activities,
  activityDefinitions,
  totalActivities,
}: ActivityOverviewProps) {
  const [filterProps, setFilterProps] =
    useState<ActivityGraphFilterProps | null>(null);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Activity Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalActivities} contributions in the last year
            </p>
          </div>
          {filterProps && <ActivityGraphFilterButton {...filterProps} />}
        </div>
      </CardHeader>
      <CardContent>
        <ActivityGraph
          data={data}
          activities={activities}
          activityDefinitions={activityDefinitions}
          onFilterChange={setFilterProps}
        />
      </CardContent>
    </Card>
  );
}

