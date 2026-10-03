import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Znacznik trybu dev zasłaniał pasek narzędzi planszy na telefonie.
  devIndicators: false,
};

export default nextConfig;
