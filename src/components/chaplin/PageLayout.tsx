import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf: number;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-negro text-blanco overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
