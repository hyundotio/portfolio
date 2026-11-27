"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import CopyForLLM from "./CopyForLLM";
import ThemeSwitch from "./ThemeSwitch";

type Item = { title: string; href: string; external?: boolean };

/**
 * Small screens only: a "Menu" text button that opens a full-screen list of
 * links. Built on <dialog>, so Esc, focus and the back layer come for free.
 */
export default function MobileMenu({
  items,
  llmPrompt,
}: {
  items: Item[];
  llmPrompt: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Each opening starts the copy line fresh.
  const [opened, setOpened] = useState(0);

  const open = () => {
    setOpened((n) => n + 1);
    ref.current?.showModal();
    document.documentElement.classList.add("menu-open");
  };
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        className="menu-button"
        aria-haspopup="dialog"
        onClick={open}
      >
        Menu
      </button>

      <dialog
        ref={ref}
        className="menu"
        aria-label="Menu"
        onClose={() => document.documentElement.classList.remove("menu-open")}
      >
        <div className="menu-bar">
          <Link href="/" className="brand" onClick={close}>
            Hyun Seo
          </Link>
          <button type="button" className="menu-button" onClick={close} autoFocus>
            Close
          </button>
        </div>
        <nav aria-label="Main">
          <ul className="menu-list">
            {items.map((item, i) =>
              item.external ? (
                <li key={item.href} style={{ animationDelay: `${i * 40}ms` }}>
                  <a href={item.href} target="_blank" rel="noreferrer" onClick={close}>
                    {item.title}
                  </a>
                </li>
              ) : (
                <li key={item.href} style={{ animationDelay: `${i * 40}ms` }}>
                  <Link href={item.href} onClick={close}>
                    {item.title}
                  </Link>
                </li>
              ),
            )}
            <li style={{ animationDelay: `${items.length * 40}ms` }}>
              <CopyForLLM key={opened} variant="menu" prompt={llmPrompt} />
            </li>
          </ul>
        </nav>
        <div className="menu-theme">
          <span>Theme</span>
          <ThemeSwitch />
        </div>
      </dialog>
    </>
  );
}
