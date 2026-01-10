import {
  getAllBadgeDefinitions,
  getRecentBadgeAchievements,
  getTopBadgeEarners,
} from "@/lib/data/loader";
import { getConfig } from "@/lib/config/get-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Award, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { RecentBadgeAchievement, BadgeProgress } from "@/components/BadgeDisplay";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();

  return {
    title: `Badges - ${config.org.name}`,
    description: `Explore all achievement badges and see who's earned them in the ${config.org.name} community. View badge requirements, recent achievements, and top badge earners.`,
    keywords: [
      "badges",
      "achievements",
      "awards",
      config.org.name,
      "leaderboard",
      "gamification",
    ],
  };
}

export default async function BadgesPage() {
  const config = getConfig();
  const [badgeDefinitions, recentAchievements, topEarners] = await Promise.all([
    getAllBadgeDefinitions(),
    getRecentBadgeAchievements(20),
    getTopBadgeEarners(10),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Achievement Badges</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Earn badges by contributing to {config.org.name}. Complete challenges,
          reach milestones, and showcase your achievements.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgeDefinitions.length}</div>
            <p className="text-xs text-muted-foreground">
              Different badge types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Variants
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {badgeDefinitions.reduce(
                (sum, badge) => sum + Object.keys(badge.variants).length,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Achievement levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Achievements
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAchievements.length}</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Definitions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Badges</h2>
        {badgeDefinitions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No badges defined yet. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {badgeDefinitions.map((badge) => (
              <Card key={badge.slug}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {badge.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(badge.variants)
                      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
                      .map(([variantKey, variant]) => (
                        <div
                          key={variantKey}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {variant.svg_url ? (
                              <img
                                src={variant.svg_url}
                                alt={`${badge.name} - ${variantKey}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium capitalize">
                              {variantKey}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {variant.description}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recent Achievements</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentAchievements.map((achievement) => (
                  <Link
                    key={achievement.slug}
                    href={`/${achievement.contributor}`}
                  >
                    <RecentBadgeAchievement achievement={achievement} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Badge Earners */}
      {topEarners.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Badge Earners</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {topEarners.map((earner, index) => (
                  <Link
                    key={earner.username}
                    href={`/${earner.username}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={earner.avatar_url || undefined}
                        alt={earner.name || earner.username}
                      />
                      <AvatarFallback>
                        {(earner.name || earner.username)
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {earner.name || earner.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{earner.username}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <span className="text-lg font-bold">
                        {earner.badge_count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

