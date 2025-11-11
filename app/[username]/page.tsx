import {
  getAllContributorUsernames,
  getContributorProfile,
} from "@/lib/db";
import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeAgo, generateActivityGraphData } from "@/lib/utils";
import { getConfig } from "@/lib/config";
import ActivityGraph from "./ActivityGraph";
import Link from "next/link";
import {
  ExternalLink,
  Mail,
  Calendar,
  Award,
  Activity as ActivityIcon,
} from "lucide-react";

interface ContributorPageProps {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username) => ({ username }));
}

export async function generateMetadata({ params }: ContributorPageProps) {
  const { username } = await params;
  const { contributor } = await getContributorProfile(username);
  const config = getConfig();

  if (!contributor) {
    return {
      title: "Contributor Not Found",
    };
  }

  return {
    title: `${contributor.name || contributor.username} - ${config.meta.title}`,
    description: contributor.bio || `Profile of ${contributor.name || contributor.username}`,
  };
}

export default async function ContributorPage({
  params,
}: ContributorPageProps) {
  const { username } = await params;
  const { contributor, activities, totalPoints, activityByDate } =
    await getContributorProfile(username);

  if (!contributor) {
    notFound();
  }

  const config = getConfig();
  const activityGraphData = generateActivityGraphData(activityByDate, 365);

  // Calculate stats
  const activityBreakdown = activities.reduce(
    (acc, activity) => {
      const key = activity.activity_name;
      if (!acc[key]) {
        acc[key] = { count: 0, points: 0 };
      }
      acc[key].count += 1;
      acc[key].points += activity.points || 0;
      return acc;
    },
    {} as Record<string, { count: number; points: number }>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={contributor.avatar_url || undefined}
              alt={contributor.name || contributor.username}
            />
            <AvatarFallback className="text-4xl">
              {(contributor.name || contributor.username)
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {contributor.name || contributor.username}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              @{contributor.username}
            </p>

            {contributor.bio && (
              <p className="text-muted-foreground mb-4">{contributor.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {contributor.role && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {contributor.role}
                  </span>
                </div>
              )}
              {contributor.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${contributor.email}`}
                    className="hover:text-primary"
                  >
                    {contributor.email}
                  </a>
                </div>
              )}
              {contributor.profile_url && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <a
                    href={contributor.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activity Types
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(activityBreakdown).length}
            </div>
            <p className="text-xs text-muted-foreground">Different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Graph */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            {activities.length} contributions in the last year
          </p>
        </CardHeader>
        <CardContent>
          <ActivityGraph data={activityGraphData} />
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(activityBreakdown)
              .sort((a, b) => b[1].points - a[1].points)
              .map(([activityName, data]) => (
                <div
                  key={activityName}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="font-medium mb-1">{activityName}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.count} {data.count === 1 ? "activity" : "activities"}
                  </div>
                  {data.points > 0 && (
                    <div className="text-sm text-primary font-medium mt-1">
                      {data.points} points
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            All activities from {contributor.name || contributor.username}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activities yet
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.slug}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">
                        {activity.activity_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.occured_at)}
                      </span>
                      {activity.points !== null && activity.points > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          +{activity.points}
                        </span>
                      )}
                    </div>
                    {activity.title && (
                      <p className="text-sm mb-1">
                        {activity.link ? (
                          <a
                            href={activity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            {activity.title}
                          </a>
                        ) : (
                          activity.title
                        )}
                      </p>
                    )}
                    {activity.text && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {activity.text}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Back to Leaderboard */}
      <div className="mt-8 text-center">
        <Link
          href="/leaderboard"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Leaderboard
        </Link>
      </div>
    </div>
  );
}

