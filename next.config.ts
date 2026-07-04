import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "snkrsmayoreo.mx" },
      { protocol: "https", hostname: "cdn11.bigcommerce.com" },
      { protocol: "https", hostname: "www.fashionphile.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;