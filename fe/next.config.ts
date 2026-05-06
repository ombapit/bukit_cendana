import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Experimental features for faster builds
  experimental: {
    // Optimized package imports for better tree-shaking
    optimizePackageImports: [
      "lucide-react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "clsx",
      "tailwind-merge",
    ],
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
