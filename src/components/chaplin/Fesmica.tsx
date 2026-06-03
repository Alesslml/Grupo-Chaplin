import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import poster from "@/assets/fesmica.jpg";

export function Fesmica() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fs-fade", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
      gsap.from(".fs-img", {
        clipPath: "inset(100% 0 0 0)",
        duration: 1.4,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative grid lg:grid-cols-2 min-h-[80vh]">
      <div className="bg-negro grain py-24 lg:py-32 px-6 lg:px-16 flex flex-col justify-center relative z-10">
        <p className="fs-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
          Chaplin presenta
        </p>
        <h2 className="fs-fade font-display text-blanco text-7xl md:text-8xl lg:text-[140px] leading-[0.85] mb-6">
          FESMICA
        </h2>
        <p className="fs-fade font-body text-rojo text-base md:text-lg uppercase tracking-[0.2em] mb-8">
          Festival de Microteatro de Ica
        </p>
        <p className="fs-fade font-body text-blanco/70 text-base md:text-lg leading-[1.8] max-w-md mb-10">
          Tres días. Más de quince obras de quince minutos. Un festival donde el
          teatro se vuelve íntimo, fugaz, eléctrico. Chaplin lo creó, Ica lo
          adoptó, el Perú lo aplaude.
        </p>
        <Link to="/fesmica" className="fs-fade btn-rojo self-start">
          Conocer el festival
        </Link>
      </div>

      <div className="bg-rojo flex items-center justify-center p-12 lg:p-20 relative">
        <div className="fs-img relative w-full max-w-md aspect-[3/4] border-[12px] border-negro shadow-black">
          <img
            src={poster}
            alt="Festival FESMICA"
            width={1024}
            height={1024}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
