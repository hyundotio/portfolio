"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "copied" | "error";

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

async function copyDocument() {
  // Safari only allows a clipboard write in the same tick as the click, so it
  // gets a promise of the text instead of waiting on the fetch first.
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const blob = loadDocument().then(
        (text) => new Blob([text], { type: "text/plain" }),
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "text/plain": blob }),
      ]);
      return;
    } catch {
      // Older browsers reject a promise here: fall through to plain text.
    }
  }
  await navigator.clipboard.writeText(await loadDocument());
}

/** Copies the whole site as text, for pasting into the visitor's own assistant. */
export default function CopyForLLM({ prompt }: { prompt: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(reset.current), []);

  async function handleClick() {
    clearTimeout(reset.current);
    try {
      await copyDocument();
      setStatus("copied");
      reset.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="llm-copy">
      <button type="button" onClick={handleClick}>
        {status === "copied" ? "Copied" : "Copy for LLM"}
      </button>
      <p className="small muted">
        {status === "error" ? (
          <>
            Couldn’t reach the clipboard.{" "}
            <a href={DOCUMENT_HREF}>Open the text</a> and copy it from there.
          </>
        ) : (
          <>
            Paste it into ChatGPT, Claude, or any assistant and ask, “{prompt}”{" "}
            <a href={DOCUMENT_HREF}>See what gets copied</a>
          </>
        )}
      </p>
      <span role="status" className="sr-only">
        {status === "copied" && "Copied. Paste it into your assistant."}
      </span>
    </div>
  );
}
