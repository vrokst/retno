import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("scroll-revealed");
          observer.unobserve(el);
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

export function useScrollRevealList(count: number, staggerMs = 100) {
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("scroll-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    refs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transitionDelay = `${i * staggerMs}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [count, staggerMs]);

  const setRef = (i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  };

  return setRef;
}
