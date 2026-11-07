"use client";

import { useEffect } from "react";

type ModelContext = {
  registerTool: (tool: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: () => { name: string; description: string; pages: { title: string; url: string }[] };
  }) => void;
};

const pages = [
  { title: "Home", url: "https://anistreaming.com/" },
  { title: "Latest anime", url: "https://anistreaming.com/latest" },
  { title: "Popular anime", url: "https://anistreaming.com/popular" },
  { title: "Genres", url: "https://anistreaming.com/genres" },
  { title: "Schedule", url: "https://anistreaming.com/schedule" },
  { title: "FAQ", url: "https://anistreaming.com/faq" },
  { title: "About AniStream", url: "https://anistreaming.com/about" },
  { title: "Contact", url: "https://anistreaming.com/contact" },
];

export function WebMcpTools() {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    modelContext?.registerTool({
      name: "get_anistream_site_info",
      description: "Get a short description of AniStream and its main public pages.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => ({
        name: "AniStream",
        description: "AniStream helps Indonesian anime fans discover anime, genres, schedules, and episode listings. It indexes third-party video links and does not host video files.",
        pages,
      }),
    });
  }, []);

  return null;
}
