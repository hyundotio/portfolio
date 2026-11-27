# hyun.io

Personal portfolio. Next.js, plain CSS, no client-side animation libraries.

- Copy lives in `content/work.ts` (case studies) and `content/site.ts` (intro, about, links).
- `/llms.txt` is the whole site as one Markdown document for pasting into an AI assistant. It is generated from the copy above; its opening note, key facts, and reading threads live in `content/llm.ts`.
- Styles live in `app/globals.css`: one 12-column grid, one typeface, two weights.
- Images are in `public/assets/work`. Videos are served from Vercel Blob through `/api/blob`.
- The contact form posts to `/api/send` (Resend). Needs `RESEND_API_KEY`.

```bash
npm install
npm run dev
```
