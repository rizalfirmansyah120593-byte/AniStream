import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'https', hostname: 'samehadaku.mba' },
      { protocol: 'https', hostname: 'imgsrv.crunchyroll.com' },
      { protocol: 'https', hostname: 'arank-party-ridatsu-official.com' },
      { protocol: 'https', hostname: 'a.storyblok.com' },
      { protocol: 'https', hostname: 'v1.samehadaku.how' },
      { protocol: 'https', hostname: 'v2.samehadaku.how' },
    ],
  },
};

export default nextConfig;
