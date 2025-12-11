/** @type {import("next").NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  productionBrowserSourceMaps: true,
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  devIndicators: {
    allowedDevOrigins: [
      `http://192.168.0.194:${process.env.NEXT_PUBLIC_APP_PORT}/`,
    ],
  },
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
      {
        source: "/:path*",
        has: [{ type: "header", key: "accept", value: "text/html.*" }],
        headers: [
          {
            key: "Cache-Control",
            value: "private, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/погода/:country/:city/:lat/:lon",
        destination: "/weather/:country/:city/:lat/:lon",
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
