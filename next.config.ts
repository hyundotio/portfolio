import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Keeping your existing settings
  reactCompiler: true,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },

  async rewrites() {
    return [
      {
        source: "/work",
        destination: "/", // Loads the index page (Scene) without a hard refresh
      },
    ];
  },
};

export default nextConfig;
