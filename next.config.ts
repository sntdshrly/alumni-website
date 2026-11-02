import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 hanya mengizinkan kualitas 75 secara default; 100 dipakai untuk background login.
    qualities: [75, 100],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Aplikasi internal: jangan diindeks mesin pencari dan jangan ditampilkan di dalam iframe situs lain.
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
