import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: '<https://anistreaming.com/llms.txt>; rel="describedby"; type="text/plain", <https://anistreaming.com/markdown>; rel="alternate"; type="text/markdown"',
          },
          { key: "Vary", value: "Accept" },
        ],
      },
      {
        source: "/.well-known/mcp/server-card.json",
        headers: [
          { key: "Content-Type", value: "application/mcp-server-card+json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
  images: {
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
