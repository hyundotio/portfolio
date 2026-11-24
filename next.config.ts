import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Old URLs from the previous design.
      { source: "/work", destination: "/#work", permanent: false },
      { source: "/about", destination: "/#about", permanent: false },
      {
        source: "/work/:id/details",
        destination: "/work/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
