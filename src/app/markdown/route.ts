import { SITE_URL } from "@/utils/config";

const markdown = `# AniStream

AniStream helps Indonesian anime fans discover anime series, films, genres, schedules, and episode listings. The site indexes third-party video links and does not host video files.

## Key pages
- [Home](${SITE_URL}/): Latest anime and discovery links.
- [Latest anime](${SITE_URL}/latest)
- [Popular anime](${SITE_URL}/popular)
- [Genres](${SITE_URL}/genres)
- [Schedule](${SITE_URL}/schedule)
- [FAQ](${SITE_URL}/faq)
- [About AniStream](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact): [contact@anistreaming.com](mailto:contact@anistreaming.com)
- [Terms of Service](${SITE_URL}/terms)
- [Privacy Policy](${SITE_URL}/privacy)
- [DMCA / Copyright](${SITE_URL}/dmca)

## Content and attribution
Anime metadata and third-party links are presented for discovery. AniStream does not claim ownership of third-party works. See the [DMCA / Copyright page](${SITE_URL}/dmca) for reports and the [Terms of Service](${SITE_URL}/terms) for site terms.
`;

export function GET() {
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept",
    },
  });
}
