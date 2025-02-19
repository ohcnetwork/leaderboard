import { sitemapEntry } from "@/app/sitemap";
import { getContributors } from "@/lib/api";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contributors = await getContributors();
  return contributors.map((contributor) =>
    sitemapEntry(`/contributors/${contributor.github}`, {
      lastModified: contributor.activityData.last_updated
        ? new Date(contributor.activityData.last_updated)
        : undefined,
      priority: 0.8,
    }),
  );
}
