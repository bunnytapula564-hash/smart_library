import { useEffect, useRef, useState } from "react";

/**
 * Fades its children in when they scroll into view and fades them out again
 * when they leave (toward the top or the bottom), so the motion also plays when
 * scrolling back up. Honors prefers-reduced-motion via CSS.
 */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);
  const [state, setState] = useState("below"); // "in" | "above" | "below"

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) {
      setState("in");
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setState("in");
        else setState(entry.boundingClientRect.top < 0 ? "above" : "below");
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${state} ${className}`} style={{ "--d": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
