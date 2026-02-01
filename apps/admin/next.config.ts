import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@playnow/api", "@playnow/ui"],
};

export default nextConfig;
