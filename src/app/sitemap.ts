import type { MetadataRoute } from "next";
import { identity } from "@/data/portfolio";
export default function sitemap(): MetadataRoute.Sitemap {
  return identity.canonicalUrl
    ? [{ url: identity.canonicalUrl, changeFrequency: "monthly", priority: 1 }]
    : [];
}
