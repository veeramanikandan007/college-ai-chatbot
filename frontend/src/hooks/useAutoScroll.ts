import { useEffect, RefObject } from 'react';

export function useAutoScroll(ref: RefObject<HTMLDivElement>, dependencies: any[]) {
  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, dependencies);
}
