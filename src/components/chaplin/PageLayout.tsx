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

    // Lenis virtualiza el scroll, así que el salto nativo a #hash no alcanza
    // la posición correcta una vez que el layout termina de animarse/cargar.
    let hashTimeout: ReturnType<typeof setTimeout> | undefined;
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      hashTimeout = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) lenis.scrollTo(el, { offset: -90 });
      }, 400);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (hashTimeout) clearTimeout(hashTimeout);
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
