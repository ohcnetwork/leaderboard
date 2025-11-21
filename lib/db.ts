import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

// Prisma Client singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Upsert activity definitions to the database
 * @param activityDefinitions - The activity definitions to upsert
 */
export async function upsertActivityDefinitions(
  ...activityDefinitions: Array<{
    slug: string;
    name: string;
    description: string | null;
    points: number | null;
    icon: string | null;
  }>
) {
  await Promise.all(
    activityDefinitions.map((ad) =>
      prisma.activityDefinition.upsert({
        where: { slug: ad.slug },
        update: {
          name: ad.name,
          description: ad.description,
          points: ad.points,
          icon: ad.icon,
        },
        create: {
          slug: ad.slug,
          name: ad.name,
          description: ad.description,
          points: ad.points,
          icon: ad.icon,
        },
      })
    )
  );
}

/**
 * List all activity definitions from the database
 * @returns The list of all activity definitions
 */
export async function listActivityDefinitions() {
  return await prisma.activityDefinition.findMany();
}

/**
 * Upsert contributors to the database
 * @param contributors - The contributors to upsert
 */
export async function upsertContributor(
  ...contributors: Array<{
    username: string;
    name: string | null;
    role: string | null;
    title: string | null;
    avatarUrl: string | null;
    bio: string | null;
    socialProfiles: Record<string, string> | null;
    joiningDate: Date | null;
    meta: Record<string, string> | null;
  }>
) {
  await Promise.all(
    contributors.map((c) =>
      prisma.contributor.upsert({
        where: { username: c.username },
        update: {
          name: c.name,
          role: c.role,
          title: c.title,
          avatarUrl: c.avatarUrl,
          bio: c.bio,
          socialProfiles: c.socialProfiles as any,
          joiningDate: c.joiningDate,
          meta: c.meta as any,
        },
        create: {
          username: c.username,
          name: c.name,
          role: c.role,
          title: c.title,
          avatarUrl: c.avatarUrl,
          bio: c.bio,
          socialProfiles: c.socialProfiles as any,
          joiningDate: c.joiningDate,
          meta: c.meta as any,
        },
      })
    )
  );
}

/**
 * List all contributors from the database
 * @returns The list of all contributors
 * @deprecated TODO: remove this as we'd never want all information about all contributors when listing.
 */
export async function listContributors() {
  return await prisma.contributor.findMany();
}

/**
 * Get a contributor from the database
 * @param username - The username of the contributor
 * @returns The contributor
 */
export async function getContributor(username: string) {
  return await prisma.contributor.findUnique({
    where: { username },
  });
}

/**
 * Activity with contributor details
 */
export interface ActivityWithContributor {
  slug: string;
  contributor: string;
  activityDefinition: string;
  title: string | null;
  occuredAt: Date;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, unknown> | null;
  contributorName: string | null;
  contributorAvatarUrl: string | null;
  contributorRole: string | null;
}

/**
 * Activity group by activity definition
 */
export interface ActivityGroup {
  activityDefinition: string;
  activityName: string;
  activityDescription: string | null;
  activityPoints: number | null;
  activities: ActivityWithContributor[];
}

/**
 * Get recent activities grouped by activity type
 * @param days - Number of days to look back
 * @returns Activities grouped by activity definition
 */
export async function getRecentActivitiesGroupedByType(
  days: number
): Promise<ActivityGroup[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const activities = await prisma.activity.findMany({
    where: {
      occuredAt: {
        gte: cutoffDate,
      },
    },
    include: {
      contributorRel: {
        select: {
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      activityDefinitionRel: {
        select: {
          name: true,
          description: true,
          points: true,
        },
      },
    },
    orderBy: {
      occuredAt: "desc",
    },
  });

  // Group activities by activity_definition
  const grouped: Record<string, ActivityGroup> = {};

  for (const activity of activities) {
    const key = activity.activityDefinition;
    if (!grouped[key]) {
      grouped[key] = {
        activityDefinition: activity.activityDefinition,
        activityName: activity.activityDefinitionRel.name,
        activityDescription: activity.activityDefinitionRel.description,
        activityPoints: activity.activityDefinitionRel.points,
        activities: [],
      };
    }

    grouped[key].activities.push({
      slug: activity.slug,
      contributor: activity.contributor,
      activityDefinition: activity.activityDefinition,
      title: activity.title,
      occuredAt: activity.occuredAt,
      link: activity.link,
      text: activity.text,
      points: activity.points ?? activity.activityDefinitionRel.points,
      meta: activity.meta as Record<string, unknown> | null,
      contributorName: activity.contributorRel.name,
      contributorAvatarUrl: activity.contributorRel.avatarUrl,
      contributorRole: activity.contributorRel.role,
    });
  }

  return Object.values(grouped);
}

/**
 * Leaderboard entry with contributor details and activity breakdown
 */
export interface LeaderboardEntry {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: string | null;
  totalPoints: number;
  activityBreakdown: Record<string, { count: number; points: number }>;
  dailyActivity: Array<{ date: string; count: number; points: number }>;
}

/**
 * Get leaderboard for a specific date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Leaderboard entries sorted by total points
 */
export async function getLeaderboard(
  startDate: Date,
  endDate: Date
): Promise<LeaderboardEntry[]> {
  const activities = await prisma.activity.findMany({
    where: {
      occuredAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      contributorRel: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      activityDefinitionRel: {
        select: {
          name: true,
          points: true,
        },
      },
    },
    orderBy: [{ contributor: "asc" }, { occuredAt: "asc" }],
  });

  // Group by contributor and calculate totals
  const leaderboardMap: Record<string, LeaderboardEntry> = {};

  for (const activity of activities) {
    const username = activity.contributor;
    if (!leaderboardMap[username]) {
      leaderboardMap[username] = {
        username: activity.contributorRel.username,
        name: activity.contributorRel.name,
        avatarUrl: activity.contributorRel.avatarUrl,
        role: activity.contributorRel.role,
        totalPoints: 0,
        activityBreakdown: {},
        dailyActivity: [],
      };
    }

    const points =
      activity.points ?? activity.activityDefinitionRel.points ?? 0;
    leaderboardMap[username].totalPoints += points;

    const activityKey = activity.activityDefinitionRel.name;
    if (!leaderboardMap[username].activityBreakdown[activityKey]) {
      leaderboardMap[username].activityBreakdown[activityKey] = {
        count: 0,
        points: 0,
      };
    }
    leaderboardMap[username].activityBreakdown[activityKey].count += 1;
    leaderboardMap[username].activityBreakdown[activityKey].points += points;

    // Group by date for daily activity
    const dateKey = format(activity.occuredAt, "yyyy-MM-dd");
    const existingDay = leaderboardMap[username].dailyActivity.find(
      (d) => d.date === dateKey
    );
    if (existingDay) {
      existingDay.count += 1;
      existingDay.points += points;
    } else {
      leaderboardMap[username].dailyActivity.push({
        date: dateKey,
        count: 1,
        points: points,
      });
    }
  }

  // Filter contributors with points > 0 and sort by total points
  return Object.values(leaderboardMap)
    .filter((entry) => entry.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Get top contributors by activity type for a specific date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param activitySlugs - Optional array of activity definition slugs to filter by
 * @returns Top contributors grouped by activity type
 */
export async function getTopContributorsByActivity(
  startDate: Date,
  endDate: Date,
  activitySlugs?: string[]
): Promise<
  Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatarUrl: string | null;
      points: number;
      count: number;
    }>
  >
> {
  const whereClause: {
    occuredAt: {
      gte: Date;
      lte: Date;
    };
    activityDefinition?: {
      in: string[];
    };
  } = {
    occuredAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (activitySlugs && activitySlugs.length > 0) {
    whereClause.activityDefinition = {
      in: activitySlugs,
    };
  }

  const activities = await prisma.activity.findMany({
    where: whereClause,
    include: {
      contributorRel: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      activityDefinitionRel: {
        select: {
          name: true,
          slug: true,
          points: true,
        },
      },
    },
  });

  // Group by activity type and contributor
  const grouped: Record<
    string,
    Record<
      string,
      {
        username: string;
        name: string | null;
        avatarUrl: string | null;
        points: number;
        count: number;
      }
    >
  > = {};

  for (const activity of activities) {
    const activityName = activity.activityDefinitionRel.name;
    const username = activity.contributor;
    const points =
      activity.points ?? activity.activityDefinitionRel.points ?? 0;

    if (!grouped[activityName]) {
      grouped[activityName] = {};
    }

    if (!grouped[activityName][username]) {
      grouped[activityName][username] = {
        username: activity.contributorRel.username,
        name: activity.contributorRel.name,
        avatarUrl: activity.contributorRel.avatarUrl,
        points: 0,
        count: 0,
      };
    }

    grouped[activityName][username].points += points;
    grouped[activityName][username].count += 1;
  }

  // Convert to result format and take top 3 for each activity
  const result: Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatarUrl: string | null;
      points: number;
      count: number;
    }>
  > = {};

  for (const [activityName, contributors] of Object.entries(grouped)) {
    const sorted = Object.values(contributors)
      .filter((c) => c.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    if (sorted.length > 0) {
      result[activityName] = sorted;
    }
  }

  // If slugs are provided, return in the order specified in config
  if (activitySlugs && activitySlugs.length > 0) {
    const orderedResult: typeof result = {};

    // Create a map of slug to activity name from the activities
    const slugToName = new Map<string, string>();
    for (const activity of activities) {
      slugToName.set(
        activity.activityDefinitionRel.slug,
        activity.activityDefinitionRel.name
      );
    }

    // Add activities in the order specified by activitySlugs
    for (const slug of activitySlugs) {
      const activityName = slugToName.get(slug);
      if (activityName && result[activityName]) {
        orderedResult[activityName] = result[activityName];
      }
    }

    return orderedResult;
  }

  return result;
}

/**
 * Get all contributor usernames for static generation
 * @returns List of all contributor usernames
 */
export async function getAllContributorUsernames(): Promise<string[]> {
  const contributors = await prisma.contributor.findMany({
    select: { username: true },
    orderBy: { username: "asc" },
  });

  return contributors.map((c) => c.username);
}

/**
 * Get all contributors with avatars sorted by total points
 * @param excludeRoles - Optional array of role names to exclude
 * @returns List of contributors with avatar URLs and usernames
 */
export async function getAllContributorsWithAvatars(
  excludeRoles?: string[]
): Promise<
  Array<{
    username: string;
    name: string | null;
    avatarUrl: string;
    role: string | null;
    totalPoints: number;
  }>
> {
  const whereClause: {
    avatarUrl: {
      not: null;
    };
    OR?: Array<{ role: null } | { role: { notIn: string[] } }>;
  } = {
    avatarUrl: {
      not: null,
    },
  };

  if (excludeRoles && excludeRoles.length > 0) {
    whereClause.OR = [{ role: null }, { role: { notIn: excludeRoles } }];
  }

  const contributors = await prisma.contributor.findMany({
    where: whereClause,
    include: {
      activities: {
        include: {
          activityDefinitionRel: {
            select: {
              points: true,
            },
          },
        },
      },
    },
  });

  // Calculate total points for each contributor
  const result = contributors.map((c) => {
    const totalPoints = c.activities.reduce((sum, activity) => {
      const points =
        activity.points ?? activity.activityDefinitionRel.points ?? 0;
      return sum + points;
    }, 0);

    return {
      username: c.username,
      name: c.name,
      avatarUrl: c.avatarUrl!,
      role: c.role,
      totalPoints,
    };
  });

  // Sort by total points descending, then by username ascending
  return result.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.username.localeCompare(b.username);
  });
}

/**
 * Activity with full details for timeline
 */
export interface ContributorActivity {
  slug: string;
  contributor: string;
  activityDefinition: string;
  title: string | null;
  occuredAt: Date;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, unknown> | null;
  activityName: string;
  activityDescription: string | null;
  activityPoints: number | null;
  activityIcon: string | null;
}

/**
 * Get contributor profile with all activities
 * @param username - The username of the contributor
 * @returns Contributor profile with activities
 */
export async function getContributorProfile(username: string): Promise<{
  contributor: Awaited<ReturnType<typeof getContributor>>;
  activities: ContributorActivity[];
  totalPoints: number;
  activityByDate: Record<string, number>; // For activity graph
}> {
  // Get contributor info
  const contributor = await getContributor(username);

  if (!contributor) {
    return {
      contributor: null,
      activities: [],
      totalPoints: 0,
      activityByDate: {},
    };
  }

  // Get all activities for this contributor
  const activitiesData = await prisma.activity.findMany({
    where: { contributor: username },
    include: {
      activityDefinitionRel: {
        select: {
          name: true,
          description: true,
          points: true,
          icon: true,
        },
      },
    },
    orderBy: {
      occuredAt: "desc",
    },
  });

  const activities: ContributorActivity[] = activitiesData.map((a) => ({
    slug: a.slug,
    contributor: a.contributor,
    activityDefinition: a.activityDefinition,
    title: a.title,
    occuredAt: a.occuredAt,
    link: a.link,
    text: a.text,
    points: a.points ?? a.activityDefinitionRel.points,
    meta: a.meta as Record<string, unknown> | null,
    activityName: a.activityDefinitionRel.name,
    activityDescription: a.activityDefinitionRel.description,
    activityPoints: a.activityDefinitionRel.points,
    activityIcon: a.activityDefinitionRel.icon,
  }));

  // Calculate total points
  const totalPoints = activities.reduce(
    (sum, activity) => sum + (activity.points || 0),
    0
  );

  // Group activities by date for the activity graph
  const activityByDate: Record<string, number> = {};
  for (const activity of activities) {
    const dateKey = format(activity.occuredAt, "yyyy-MM-dd");
    activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
  }

  return {
    contributor,
    activities,
    totalPoints,
    activityByDate,
  };
}

/**
 * Get global aggregates by slugs
 * @param slugs - Array of aggregate slugs to fetch
 * @returns Array of global aggregates
 */
export async function getGlobalAggregates(slugs: string[]) {
  if (slugs.length === 0) {
    return [];
  }

  return await prisma.globalAggregate.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
  });
}

/**
 * Get contributor aggregates by username and slugs
 * @param username - The username of the contributor
 * @param slugs - Array of aggregate slugs to fetch
 * @returns Array of contributor aggregates
 */
export async function getContributorAggregates(
  username: string,
  slugs: string[]
) {
  if (slugs.length === 0) {
    return [];
  }

  return await prisma.contributorAggregate.findMany({
    where: {
      contributor: username,
      aggregate: {
        in: slugs,
      },
    },
  });
}

/**
 * List all global aggregates from the database
 * @returns The list of all global aggregates
 */
export async function listGlobalAggregates() {
  return await prisma.globalAggregate.findMany();
}

/**
 * Get a global aggregate from the database
 * @param slug - The slug of the global aggregate
 * @returns The global aggregate or null if not found
 */
export async function getGlobalAggregate(slug: string) {
  return await prisma.globalAggregate.findUnique({
    where: { slug },
  });
}

/**
 * List all contributor aggregate definitions from the database
 * @returns The list of all contributor aggregate definitions
 */
export async function listContributorAggregateDefinitions() {
  return await prisma.contributorAggregateDefinition.findMany();
}

/**
 * Get a specific contributor aggregate
 * @param username - The username of the contributor
 * @param aggregateSlug - The slug of the aggregate definition
 * @returns The contributor aggregate or null if not found
 */
export async function getContributorAggregate(
  username: string,
  aggregateSlug: string
) {
  return await prisma.contributorAggregate.findUnique({
    where: {
      aggregate_contributor: {
        aggregate: aggregateSlug,
        contributor: username,
      },
    },
  });
}

/**
 * Get all badges for a contributor
 * @param username - The username of the contributor
 * @returns Array of contributor badges with badge definition details
 */
export async function getContributorBadges(username: string) {
  const badges = await prisma.contributorBadge.findMany({
    where: { contributor: username },
    include: {
      badgeRel: {
        select: {
          name: true,
          description: true,
          variants: true,
        },
      },
    },
    orderBy: {
      achievedOn: "desc",
    },
  });

  return badges.map((b) => ({
    slug: b.slug,
    badge: b.badge,
    contributor: b.contributor,
    variant: b.variant,
    achievedOn: b.achievedOn,
    meta: b.meta,
    badgeName: b.badgeRel.name,
    badgeDescription: b.badgeRel.description,
    variants: b.badgeRel.variants,
  }));
}

/**
 * Get all contributors who have earned a specific badge
 * @param badgeSlug - The slug of the badge
 * @param variant - Optional variant to filter by
 * @returns Array of contributor badges with contributor details
 */
export async function getBadgeHolders(badgeSlug: string, variant?: string) {
  const whereClause: { badge: string; variant?: string } = { badge: badgeSlug };
  if (variant) {
    whereClause.variant = variant;
  }

  const badges = await prisma.contributorBadge.findMany({
    where: whereClause,
    include: {
      contributorRel: {
        select: {
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: {
      achievedOn: "asc",
    },
  });

  return badges.map((b) => ({
    slug: b.slug,
    badge: b.badge,
    contributor: b.contributor,
    variant: b.variant,
    achievedOn: b.achievedOn,
    meta: b.meta,
    contributorName: b.contributorRel.name,
    contributorAvatarUrl: b.contributorRel.avatarUrl,
    contributorRole: b.contributorRel.role,
  }));
}

/**
 * Get badge statistics - count of badges earned
 * @returns Badge statistics
 */
export async function getBadgeStatistics() {
  const result = await prisma.badgeDefinition.findMany({
    include: {
      _count: {
        select: {
          contributorBadges: true,
        },
      },
      contributorBadges: {
        select: {
          contributor: true,
        },
        distinct: ["contributor"],
      },
    },
  });

  return result.map((badge) => ({
    badge_count: 1,
    total_earned: badge._count.contributorBadges,
    unique_contributors: badge.contributorBadges.length,
  }));
}

/**
 * Get recent badge achievements
 * @param days - Number of days to look back
 * @param limit - Maximum number of results to return
 * @returns Recent badge achievements with contributor and badge details
 */
export async function getRecentBadgeAchievements(
  days: number,
  limit: number = 50
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const badges = await prisma.contributorBadge.findMany({
    where: {
      achievedOn: {
        gte: cutoffDate,
      },
    },
    include: {
      contributorRel: {
        select: {
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      badgeRel: {
        select: {
          name: true,
          description: true,
          variants: true,
        },
      },
    },
    orderBy: {
      achievedOn: "desc",
    },
    take: limit,
  });

  return badges.map((b) => ({
    slug: b.slug,
    badge: b.badge,
    contributor: b.contributor,
    variant: b.variant,
    achievedOn: b.achievedOn,
    meta: b.meta,
    contributorName: b.contributorRel.name,
    contributorAvatarUrl: b.contributorRel.avatarUrl,
    contributorRole: b.contributorRel.role,
    badgeName: b.badgeRel.name,
    badgeDescription: b.badgeRel.description,
  }));
}
