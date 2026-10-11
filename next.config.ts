import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sharp"],
  experimental: {
    serverActions: { bodySizeLimit: "60mb" },
    optimizePackageImports: ["@phosphor-icons/react", "recharts", "framer-motion"],
  },
  images: { unoptimized: true },
};

export default nextConfig;
