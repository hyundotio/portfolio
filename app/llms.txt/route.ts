import { buildLlmDocument } from "@/utils/llmDocument";

// Built once at deploy: the document only changes when the copy does.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmDocument(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
