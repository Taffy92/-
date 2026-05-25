import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = Object.values(siteConfig.links);
  return paths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: new Date("2026-05-17"),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7
  }));
}
