import { getConfig } from "@/lib/config/get-config";
import { getAllContributorUsernames } from "@/lib/data/loader";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getConfig();
  const baseUrl = config.meta.site_url.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${baseUrl}/leaderboard/`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard/week/`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard/month/`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard/year/`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    { url: `${baseUrl}/people/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/badges/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/data/`, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/docs/`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const usernames = await getAllContributorUsernames();
  const contributorRoutes: MetadataRoute.Sitemap = usernames.map(
    (username) => ({
      url: `${baseUrl}/${username}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...contributorRoutes];
}
