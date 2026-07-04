"use client";

import { WORK_DATA } from "@/content/work";

const modalRoutePaths = new Set(["/about", "/contact", "/resume"]);
const modalBasePathKey = "portfolio.modalBasePath";
const modalDepthKey = "portfolio.modalDepth";
const defaultWorkPath = `/work/${WORK_DATA[0]?.id ?? "ibm"}`;

function getPathname(href: string) {
  if (typeof window === "undefined") {
    return href;
  }

  return new URL(href, window.location.origin).pathname;
}

function getCurrentHref() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function isModalRoute(href: string) {
  return modalRoutePaths.has(getPathname(href));
}

export function rememberNonModalRoute() {
  if (typeof window === "undefined" || isModalRoute(window.location.pathname)) {
    return;
  }

  window.sessionStorage.setItem(modalBasePathKey, getCurrentHref());
  window.sessionStorage.setItem(modalDepthKey, "0");
}

export function rememberModalNavigation(fromHref: string, toHref: string) {
  if (typeof window === "undefined" || !isModalRoute(toHref)) {
    return;
  }

  const currentDepth = Number(window.sessionStorage.getItem(modalDepthKey) ?? "0");

  if (isModalRoute(fromHref)) {
    window.sessionStorage.setItem(modalDepthKey, String(Math.max(1, currentDepth + 1)));
    return;
  }

  window.sessionStorage.setItem(modalBasePathKey, getCurrentHref());
  window.sessionStorage.setItem(modalDepthKey, "1");
}

export function getModalDismissTarget() {
  if (typeof window === "undefined") {
    return { basePath: defaultWorkPath, depth: 0 };
  }

  const depth = Number(window.sessionStorage.getItem(modalDepthKey) ?? "0");
  const normalizedDepth = Number.isFinite(depth) ? Math.max(0, depth) : 0;
  const storedBasePath = window.sessionStorage.getItem(modalBasePathKey);
  const basePath =
    normalizedDepth === 0 && (!storedBasePath || storedBasePath === "/")
      ? defaultWorkPath
      : storedBasePath || defaultWorkPath;

  return {
    basePath,
    depth: normalizedDepth,
  };
}
