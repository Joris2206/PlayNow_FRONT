"use client";

import { useLayoutEffect, useRef } from "react";

const STICKY_GAP = 0;
export const STICKY_TOOLBAR_OFFSET_CHANGE_EVENT =
  "admin:sticky-toolbar-offset-change";

export function useStickyToolbarOffset<TElement extends HTMLElement>(
  gap = STICKY_GAP
) {
  const ref = useRef<TElement>(null);

  useLayoutEffect(() => {
    const toolbar = ref.current;
    if (!toolbar) return;

    const root = document.documentElement;
    const updateOffset = () => {
      const configuredTop = Number.parseFloat(
        getComputedStyle(toolbar).top
      );
      const stickyTop = Number.isFinite(configuredTop)
        ? configuredTop
        : 0;
      const offset =
        stickyTop +
        toolbar.getBoundingClientRect().height +
        gap;

      root.style.setProperty("--admin-sticky-table-top", `${offset}px`);
      window.dispatchEvent(
        new Event(STICKY_TOOLBAR_OFFSET_CHANGE_EVENT)
      );
    };

    updateOffset();
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateOffset);
    observer?.observe(toolbar);
    window.addEventListener("resize", updateOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateOffset);
      root.style.removeProperty("--admin-sticky-table-top");
    };
  }, [gap]);

  return ref;
}
