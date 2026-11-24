# hyun.io

Personal portfolio. Next.js, plain CSS, no client-side animation libraries.

- Copy lives in `content/work.ts` (case studies) and `content/site.ts` (intro, about, links).
- Styles live in `app/globals.css`: one 12-column grid, one typeface, two weights.
- Images are in `public/assets/work`. Videos are served from Vercel Blob through `/api/blob`.
- The contact form posts to `/api/send` (Resend). Needs `RESEND_API_KEY`.

```bash
npm install
npm run dev
```
