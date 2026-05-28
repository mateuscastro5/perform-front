import { useEffect, useState } from "react";

/**
 * Reactive check for viewport widths below the Tailwind `lg` breakpoint
 * (1024px). Returns true on small screens / tablets so callers can swap
 * the persistent sidebar for a drawer, collapse multi-column layouts, etc.
 */
export function useIsMobile(breakpoint = 1024): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile("matches" in event ? event.matches : false);
    };

    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
