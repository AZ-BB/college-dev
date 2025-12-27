import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Allow larger body sizes for file uploads (up to 10MB)
    bodySizeLimit: '10mb',
  },
};

export default nextConfig;
