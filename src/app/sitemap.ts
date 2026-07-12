import type { MetadataRoute } from "next";

const base = "https://kc-kappa.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/app", "/faq", "/vs/f5bot", "/for/indie-hackers", "/success"];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "/app" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
