import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Allow Safari to load RSC payloads and source maps from localhost in dev
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Next-Router-State-Tree, Next-Router-Prefetch, RSC, Next-Url" },
        ],
      },
    ];
  },
};

export default nextConfig;
