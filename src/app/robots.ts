import type { MetadataRoute } from "next";
import { identity } from "@/data/portfolio";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(identity.canonicalUrl
      ? { sitemap: `${identity.canonicalUrl}/sitemap.xml` }
      : {}),
  };
}
