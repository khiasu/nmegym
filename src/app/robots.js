// src/app/robots.js
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/auth"],
    },
    sitemap: "https://nmegym.in/sitemap.xml",
  };
}
