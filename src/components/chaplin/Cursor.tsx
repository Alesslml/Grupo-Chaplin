import { useEffect, useRef } from "react";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 1024px)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      dot.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [role='button']")) {
        dot.classList.add("hover");
      } else {
        dot.classList.remove("hover");
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    let raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" aria-hidden />;
}
