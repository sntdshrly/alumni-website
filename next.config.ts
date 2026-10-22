import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 hanya mengizinkan kualitas 75 secara default; 100 dipakai untuk background login.
    qualities: [75, 100],
  },
};

export default nextConfig;
