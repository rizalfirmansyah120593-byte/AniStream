const sitePages = [
  { title: "Home", url: "https://anistreaming.com/" },
  { title: "Latest anime", url: "https://anistreaming.com/latest" },
  { title: "Popular anime", url: "https://anistreaming.com/popular" },
  { title: "Genres", url: "https://anistreaming.com/genres" },
  { title: "Schedule", url: "https://anistreaming.com/schedule" },
  { title: "FAQ", url: "https://anistreaming.com/faq" },
  { title: "About AniStream", url: "https://anistreaming.com/about" },
  { title: "Contact", url: "https://anistreaming.com/contact" },
  { title: "Terms of Service", url: "https://anistreaming.com/terms" },
  { title: "Privacy Policy", url: "https://anistreaming.com/privacy" },
  { title: "DMCA / Copyright", url: "https://anistreaming.com/dmca" },
];

const tools = [
  {
    name: "get_anistream_site_info",
    description: "Get a short description of AniStream and its main public pages.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

function jsonRpc(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

export async function POST(request: Request) {
  let message: { id?: unknown; method?: string; params?: { name?: string } };
  try {
    message = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }

  if (message.method === "notifications/initialized" || message.method?.startsWith("notifications/")) {
    return new Response(null, { status: 202 });
  }

  if (message.method === "initialize") {
    return jsonRpc(message.id, {
      protocolVersion: "2025-11-25",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "AniStream", version: "1.0.0" },
      instructions: "Read-only tools provide public site information and navigation links.",
    });
  }

  if (message.method === "ping") {
    return jsonRpc(message.id, {});
  }

  if (message.method === "tools/list") {
    return jsonRpc(message.id, { tools });
  }

  if (message.method === "tools/call") {
    if (message.params?.name !== "get_anistream_site_info") {
      return Response.json({ jsonrpc: "2.0", id: message.id ?? null, error: { code: -32602, message: "Unknown tool" } });
    }

    return jsonRpc(message.id, {
      content: [{
        type: "text",
        text: JSON.stringify({
          name: "AniStream",
          description: "AniStream helps Indonesian anime fans discover anime, genres, schedules, and episode listings. It indexes third-party video links and does not host video files.",
          contact: "mailto:contact@anistreaming.com",
          pages: sitePages,
        }),
      }],
    });
  }

  return Response.json({ jsonrpc: "2.0", id: message.id ?? null, error: { code: -32601, message: "Method not found" } });
}
