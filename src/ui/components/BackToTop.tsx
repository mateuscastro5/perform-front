import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { cn } from "@/ui/lib/utils";

interface BackToTopProps {
  /** Scroll distance (px) that triggers the button to appear. */
  threshold?: number;
  className?: string;
}

/**
 * Floating "back to top" affordance for long-scroll pages. Sits in the
 * bottom-right corner, fades in once the user has scrolled past `threshold`
 * pixels, and on click smoothly returns to the top. Compatible with Lenis
 * because it dispatches a regular scrollTo on window.
 */
export function BackToTop({ threshold = 400, className }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={handleClick}
          aria-label="Back to top"
          title="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full",
            "border border-border/55 bg-card/60 text-foreground/80 backdrop-blur-xl",
            "shadow-[0_8px_30px_-12px_hsl(258_92%_60%/0.55)] transition-colors",
            "hover:border-primary/55 hover:text-foreground hover:bg-card/80",
            "sm:bottom-8 sm:right-8 sm:h-12 sm:w-12",
            className,
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default BackToTop;
