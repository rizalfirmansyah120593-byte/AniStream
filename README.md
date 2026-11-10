![AniStream Banner](public/banner.png)

# 🎬 AniStream

Platform streaming anime gratis dan tanpa iklan.

🔗 [![Live Demo](https://img.shields.io/badge/Demo-Live_Website-success?style=for-the-badge&logo=vercel)](https://snow-elk-131691.hostingersite.com)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Support AniStream
If you enjoy this project and want to support the development, you can scan the QR code below:

<img src="./public/qrcode.png" alt="Donasi via Saweria" width="200" />

Atau klik link ini: [**Donasi via Saweria**](https://saweria.co/RizalFirmansyah)
## Automatic trend articles

AniStream checks Indonesia's public Google Trends RSS feed every two hours and rotates article formats: seasonal release guides, latest-episode updates, genre-based recommendations, franchise watch orders, and story explanations. It only uses anime topics matched to the catalog, verifies current claims with web search, and requires citations from at least two independent sites. Release dates, episode information, franchise order, and plot claims must be sourced; unsupported topics are skipped rather than filled with guesses. Articles are stored in Hostinger MySQL and served from `/artikel`, with internal links to relevant anime and discovery pages.

To enable publishing, add `OPENAI_API_KEY` and set `ARTICLE_AUTOPUBLISH_ENABLED=true` in the Hostinger Node.js environment settings. Keep the API key there; do not commit it or send it in chat. The default model is `gpt-6-astra`. Disable publishing with `ARTICLE_AUTOPUBLISH_ENABLED=false`. OpenAI model and web-search use may incur charges; set an appropriate account spending limit. The scheduler uses UTC two-hour slots.

# SEO deployment notes

Set `NEXT_PUBLIC_SITE_URL`, `INDEXNOW_KEY`, and `INDEXNOW_SECRET` in the production environment. Replace `public/REPLACE_WITH_INDEXNOW_KEY.txt` with a file named exactly `<INDEXNOW_KEY>.txt` containing only the key. After an anime or episode is published, call:

```bash
curl -X POST https://anistreaming.com/api/indexnow \
  -H "Content-Type: application/json" \
  -H "x-indexnow-secret: $INDEXNOW_SECRET" \
  -d '{"urls":["https://anistreaming.com/anime/example","https://anistreaming.com/watch/example/1"]}'
```

Integrate this call into the successful publish transaction (not a page visit). Submit `https://anistreaming.com/sitemap.xml` once in Google Search Console and Bing Webmaster Tools, then inspect representative anime and episode URLs. Check: HTTP 200, one canonical URL, indexable robots meta, unique title/description, valid JSON-LD, and visible internal links.
