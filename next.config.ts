import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  /* config options here */
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
