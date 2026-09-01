import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://lambdaidx.dpdns.org");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/index/", "/index/*"],
        disallow: ["/admin/", "/admin/*", "/api/", "/api/*"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
