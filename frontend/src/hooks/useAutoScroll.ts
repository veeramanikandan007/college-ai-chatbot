import { useEffect, useRef } from 'react';

/**
 * Automatically scrolls the referenced container to the bottom
 * whenever any value in the `dependencies` array changes.
 *
 * Usage:
 *   const scrollRef = useRef<HTMLDivElement>(null);
 *   useAutoScroll(scrollRef, [messages]);
 */
export function useAutoScroll(ref: React.RefObject<HTMLDivElement | null>, dependencies: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
