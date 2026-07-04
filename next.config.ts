import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Keeping your existing settings
  reactCompiler: true,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },

  async redirects() {
    return [
      {
        source: "/dl/resume.pdf",
        destination: "/assets/downloads/resume/resume.pdf",
        permanent: true,
      },
    ];
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
