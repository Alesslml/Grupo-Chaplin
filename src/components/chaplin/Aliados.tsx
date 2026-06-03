import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const aliados = [
  "LA TÍA", "LA CARTELERA", "ARCSUR", "CINCO PIEDRAS",
  "LIMÓN Y SAL", "RESPIRA", "VILLA DEL SOL", "OLIMPO",
  "DRUCILA MAKEUP", "DREBON", "CULTURA ICA", "ARTE+",
];

export function Aliados() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".al-fade", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
      gsap.from(".al-line", {
        scaleX: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro grain py-24 lg:py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <header className="text-center mb-16">
          <h2 className="al-fade font-display text-blanco text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            ALIADOS QUE APUESTAN<br />POR LA CULTURA.
          </h2>
          <div className="al-line linea-roja mx-auto" style={{ transformOrigin: "center" }} />
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-gris-textura">
          {aliados.map((a) => (
            <div
              key={a}
              className="al-fade bg-negro aspect-[3/2] flex items-center justify-center p-4 group hover:bg-rojo transition-colors duration-500"
            >
              <span className="logo-grayscale group-hover:!opacity-100 group-hover:!filter-none font-display text-blanco text-base md:text-xl tracking-wider text-center group-hover:text-negro transition-colors duration-500">
                {a}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
