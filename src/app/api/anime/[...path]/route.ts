import { API_URL } from "@/utils/config";

export const revalidate = 300;

const ALLOWED_PATH = /^(?:new-anime|ongoing-anime|completed-anime|genre-anime\/[a-z0-9-]+|type-anime\/(?:tv|ova|ona|special|movie))$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const apiPath = path.join("/");

  if (!ALLOWED_PATH.test(apiPath)) {
    return Response.json({ error: "Unsupported anime endpoint" }, { status: 404 });
  }

  try {
    const upstream = await fetch(`${API_URL}/${apiPath}${new URL(request.url).search}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });

    if (!upstream.ok) {
      return Response.json({ error: "Anime service unavailable" }, { status: upstream.status });
    }

    return new Response(await upstream.text(), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json({ error: "Anime service unavailable" }, { status: 502 });
  }
}
