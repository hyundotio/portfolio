"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "copied" | "error";

const DOCUMENT_HREF = "/llms.txt";

let pending: Promise<string> | undefined;

function loadDocument() {
  pending ??= fetch(DOCUMENT_HREF)
    .then((res) => {
      if (!res.ok) throw new Error(`${DOCUMENT_HREF}: ${res.status}`);
      return res.text();
    })
    .catch((error) => {
      pending = undefined; // Let the next click try again.
      throw error;
    });
  return pending;
}

async function copyDocument(): Promise<Status> {
  try {
    // Safari only allows a clipboard write in the same tick as the click, so
    // it gets a promise of the text instead of waiting on the fetch first.
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      try {
        const blob = loadDocument().then(
          (text) => new Blob([text], { type: "text/plain" }),
        );
        await navigator.clipboard.write([
          new ClipboardItem({ "text/plain": blob }),
        ]);
        return "copied";
      } catch {
        // Older browsers reject a promise here: fall through to plain text.
      }
    }
    await navigator.clipboard.writeText(await loadDocument());
    return "copied";
  } catch {
    return "error";
  }
}

function Instructions({ status, prompt }: { status: Status; prompt: string }) {
  return status === "copied" ? (
    <>
      Paste it into ChatGPT/Claude and ask, “{prompt}”{" "}
      <a href={DOCUMENT_HREF}>See what was copied</a>
    </>
  ) : (
    <>
      Couldn’t reach the clipboard.{" "}
      <a href={DOCUMENT_HREF}>Open the text</a> and copy it from there.
    </>
  );
}

/**
 * Copies the whole site as text, for pasting into the visitor's own assistant.
 * In the header: a nav item, and a label-and-text row under the bar once
 * clicked. In the mobile menu: one of the list's lines.
 */
export default function CopyForLLM({
  prompt,
  variant,
}: {
  prompt: string;
  variant: "nav" | "menu";
}) {
  const pathname = usePathname();
  // Remembering the page it happened on closes the row on navigation.
  const [result, setResult] = useState<{ status: Status; path: string } | null>(
    null,
  );
  const status = result?.path === pathname ? result.status : null;

  useEffect(() => {
    if (!status || variant !== "nav") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setResult(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, variant]);

  const copy = async () =>
    setResult({ status: await copyDocument(), path: pathname });

  if (variant === "menu") {
    return (
      <>
        <button type="button" onClick={copy}>
          {status === "copied" ? "Copied" : "Copy for LLM"}
        </button>
        <p role="status" className="small muted">
          {status && <Instructions status={status} prompt={prompt} />}
        </p>
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={copy}>
        Copy for LLM
      </button>
      <div role="status" className="llm-note">
        {status && (
          <div className="grid small">
            <p className="col-label">
              {status === "copied" ? "Copied" : "Not copied"}
            </p>
            <p className="col-text muted">
              <Instructions status={status} prompt={prompt} />
            </p>
            <button type="button" onClick={() => setResult(null)}>
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
