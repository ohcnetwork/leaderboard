import { env } from "@/env.mjs";
import { MetadataRoute } from "next";

export const sitemapEntry = (
  path: string,
  attrs: Omit<MetadataRoute.Sitemap[number], "url"> = {},
): MetadataRoute.Sitemap[number] => {
  return {
    changeFrequency: "daily",
    lastModified: new Date(),
    priority: 1,
    ...attrs,
    url: `${env.NEXT_PUBLIC_META_URL}${path}`,
  };
};

const entry = sitemapEntry;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/"),
    entry("/people"),
    entry("/projects"),
    entry("/releases"),
    entry("/leaderboard"),
    entry("/issues"),
    entry("/feed", { changeFrequency: "always", priority: 0.7 }),
  ];
}
