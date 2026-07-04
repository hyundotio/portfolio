"use client";

import styles from "@/Components/Header.module.scss";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ThemeToggle from "@/Components/ThemeToggle";
import { rememberModalNavigation } from "@/Components/modalRouteHistory";
import { useRouteTransition } from "@/Components/RouteTransitionProvider";

interface LinkProp {
  title: string;
  href: string;
  target?: string;
}

interface HeaderProps {
  links: LinkProp[];
}

const DETAIL_PAGE_NAV_SCROLL_MAX_WAIT_MS = 500;
const DETAIL_PAGE_NAV_SCROLL_POLL_MS = 16;

function waitForScrollToTop() {
  const startTop = window.scrollY || document.documentElement.scrollTop || 0;

  if (startTop <= 4) {
    window.scrollTo({ top: 0, behavior: "auto" });
    return Promise.resolve();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  return new Promise<void>((resolve) => {
    const startedAt = Date.now();

    const checkScrollPosition = () => {
      const currentTop = window.scrollY || document.documentElement.scrollTop || 0;

      if (
        currentTop <= 4 ||
        Date.now() - startedAt >= DETAIL_PAGE_NAV_SCROLL_MAX_WAIT_MS
      ) {
        window.scrollTo({ top: 0, behavior: "auto" });
        resolve();
        return;
      }

      window.setTimeout(checkScrollPosition, DETAIL_PAGE_NAV_SCROLL_POLL_MS);
    };

    window.setTimeout(checkScrollPosition, DETAIL_PAGE_NAV_SCROLL_POLL_MS);
  });
}

const Header = ({ links }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { startTransition } = useRouteTransition();
  const [brandLink, ...navLinks] = links;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeWorkMatch = pathname.match(/^\/work\/([^/]+)/);
  const activeWorkId = activeWorkMatch?.[1];
  const isWorkDetailPage = /^\/work\/[^/]+\/details$/.test(pathname);
  const isHomePage = pathname === "/";

  const navigateWithTransition = useCallback(
    (href: string) => {
      const transitionPlan = startTransition(href);

      if (!transitionPlan) {
        rememberModalNavigation(pathname, href);
        router.push(href);
        return;
      }

      window.setTimeout(() => {
        rememberModalNavigation(pathname, href);
        router.push(href);
      }, transitionPlan.navigationDelayMs);
    },
    [pathname, router, startTransition],
  );

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const renderLink = (link: LinkProp, index: number, onNavigate?: () => void) => {
    const isWorkLink = link.title.toLowerCase() === "work";
    const resolvedLink =
      isWorkLink && activeWorkId
        ? {
            ...link,
            href: `/work/${activeWorkId}`,
          }
        : link;

    return (
      <Link
        key={`${resolvedLink.title}-${index}`}
        href={resolvedLink.href}
        target={resolvedLink.target}
        rel={resolvedLink.target === "_blank" ? "noreferrer" : undefined}
        onClick={(event) => {
          if (
            resolvedLink.target === "_blank" ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            onNavigate?.();
            return;
          }

          event.preventDefault();
          onNavigate?.();

          if (isWorkLink && isWorkDetailPage) {
            void waitForScrollToTop().then(() => {
              navigateWithTransition(resolvedLink.href);
            });
            return;
          }

          navigateWithTransition(resolvedLink.href);
        }}
      >
        {resolvedLink.title}
      </Link>
    );
  };

  return (
    <header
      className={`${styles["main-nav"]} ${
        isHomePage ? styles["main-nav-home"] : ""
      }`.trim()}
    >
      <nav>
        {brandLink ? (
          <div className={styles["brand-slot"]}>
            {renderLink(brandLink, 0)}
          </div>
        ) : null}
        <ul className={styles["nav-links"]}>
          {navLinks.map((link, index) => (
            <li key={`${link.title}-${index}`}>{renderLink(link, index + 1)}</li>
          ))}
        </ul>
        <div className={styles["theme-slot"]}>
          <ThemeToggle />
        </div>
        <button
          type="button"
          className={`${styles["menu-toggle"]} ${
            isMobileMenuOpen ? styles["menu-toggle-open"] : ""
          }`.trim()}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
        </button>
      </nav>
      <div
        aria-hidden={!isMobileMenuOpen}
        className={`${styles["mobile-menu-layer"]} ${
          isMobileMenuOpen ? styles["mobile-menu-layer-open"] : ""
        }`.trim()}
        inert={!isMobileMenuOpen}
      >
        <button
          type="button"
          className={styles["mobile-menu-backdrop"]}
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
        <aside id="mobile-navigation" className={styles["mobile-menu"]}>
          <ul>
            {navLinks.map((link, index) => (
              <li key={`${link.title}-${index}`}>
                {renderLink(link, index + 1, closeMobileMenu)}
              </li>
            ))}
            <li>
              <ThemeToggle onToggle={closeMobileMenu} variant="text" />
            </li>
          </ul>
        </aside>
      </div>
    </header>
  );
};

export default Header;
