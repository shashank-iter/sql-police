import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No turbopack aliases needed — sql.js is loaded at runtime via a
  // script tag from public/, completely outside the bundler graph.
  turbopack: {},
};

export default nextConfig;
