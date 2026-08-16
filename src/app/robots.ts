import type { MetadataRoute } from "next";

const SITE = "https://www.getvinea.nl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The credits page is a courtesy to photographers, not a landing page,
        // and it would otherwise compete with the one page that matters.
        disallow: ["/credits"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
