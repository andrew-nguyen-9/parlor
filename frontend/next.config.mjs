import { fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the trace root to this app. A stray parent-dir lockfile otherwise makes
  // Next infer the monorepo root and the build-trace step fails (ENOENT .nft.json).
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  images: {
    // image-opt meter sits near its ceiling (4K/5K). `unoptimized` routes every
    // image straight from the CDN/committed asset with ZERO billable transform —
    // the codebase already ships plain <img>, this locks the meter so a future
    // next/image can never silently re-arm the optimizer (spec §C4 image policy).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.dzcdn.net" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  // Static response headers are applied at the CDN edge WITHOUT an edge-function
  // invocation (unlike middleware), so they add nothing to the edge-request meter
  // while cutting fast-origin bandwidth on repeat/CDN loads (spec §C4 caching).
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      // Committed media in public/ changes only on deploy — long-lived immutable
      // caching makes repeat visits and edge hits free (no origin re-fetch).
      {
        source: "/audio/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.(png|jpg|jpeg|svg|webp|avif|woff2|json)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
