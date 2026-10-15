import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import amareLogo from "@/assets/aliados/amare.png";
import saborMilagrosoLogo from "@/assets/aliados/sabor-milagroso.png";

interface Aliado {
  nombre: string;
  logo?: string; // logo con sus colores originales; si no hay, se muestra el nombre en texto
  href?: string; // al hacer clic se abre su Instagram / página
  fondoCompleto?: boolean; // el logo trae su propio fondo y ocupa todo el cuadro
}

const aliados: Aliado[] = [
  { nombre: "AMARÉ", logo: amareLogo, href: "https://instagram.com/amarestudio.pe", fondoCompleto: true },
  { nombre: "EL SABOR MILAGROSO", logo: saborMilagrosoLogo, href: "https://www.instagram.com/elsabormilagroso" },
  ...[
    "LA TÍA", "LA CARTELERA", "ARCSUR", "CINCO PIEDRAS",
    "LIMÓN Y SAL", "RESPIRA", "VILLA DEL SOL", "OLIMPO",
    "DRUCILA MAKEUP", "DREBON", "CULTURA ICA", "ARTE+",
  ].map((nombre) => ({ nombre })),
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
          {aliados.map((a) => {
            const tile = a.logo
              ? "al-fade bg-negro aspect-[3/2] overflow-hidden group flex items-center justify-center"
              : "al-fade bg-negro aspect-[3/2] flex items-center justify-center p-4 group hover:bg-rojo transition-colors duration-500";
            const contenido = a.logo ? (
              <img
                src={a.logo}
                alt={`Logo de ${a.nombre}`}
                loading="lazy"
                className={
                  a.fondoCompleto
                    ? "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    : "w-[88%] h-[88%] object-contain transition-transform duration-500 group-hover:scale-105"
                }
              />
            ) : (
              <span className="logo-grayscale group-hover:!opacity-100 group-hover:!filter-none font-display text-blanco text-base md:text-xl tracking-wider text-center group-hover:text-negro transition-colors duration-500">
                {a.nombre}
              </span>
            );
            return a.href ? (
              <a
                key={a.nombre}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${a.nombre} en Instagram`}
                title={`${a.nombre} en Instagram`}
                className={tile}
              >
                {contenido}
              </a>
            ) : (
              <div key={a.nombre} className={tile}>
                {contenido}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
