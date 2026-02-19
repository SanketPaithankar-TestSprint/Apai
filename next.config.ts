import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3uhxzbj1embbx.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
