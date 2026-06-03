import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import musical from "@/assets/show-musical.jpg";
import drama from "@/assets/show-drama.jpg";
import family from "@/assets/show-family.jpg";
import comedy from "@/assets/show-comedy.jpg";
import king from "@/assets/show-king.jpg";
import sing from "@/assets/show-sing.jpg";

const obras = [
  { title: "Heathers", year: "2023", tipo: "Musical", img: musical },
  { title: "El Rey León", year: "2022", tipo: "Musical", img: king },
  { title: "TOC TOC", year: "2023", tipo: "Comedia", img: comedy },
  { title: "Mamma Mia", year: "2022", tipo: "Musical", img: musical },
  { title: "Encanto", year: "2024", tipo: "Familiar", img: family },
  { title: "The Greatest Showman", year: "2023", tipo: "Musical", img: sing },
  { title: "Coco", year: "2024", tipo: "Familiar", img: family },
  { title: "Pinocho", year: "2021", tipo: "Drama", img: drama },
  { title: "Jesucristo Rockstar", year: "2025", tipo: "Próxima", img: drama },
];

export function Producciones() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".prod-card", {
        opacity: 0,
        y: 60,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".prod-grid", start: "top 80%" },
      });
      gsap.from(".prod-title", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="producciones"
      ref={ref}
      className="bg-negro-suave grain py-28 lg:py-40 relative"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <header className="text-center mb-20 max-w-3xl mx-auto">
          <p className="prod-title font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">
            Nuestras historias en escena
          </p>
          <h2 className="prod-title font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6">
            CADA OBRA, UN<br />UNIVERSO ABIERTO.
          </h2>
          <p className="prod-title font-body text-blanco/60 text-base md:text-lg leading-relaxed">
            Más de veinte producciones llevadas al escenario. Desde el musical
            que enciende butacas hasta el drama que detiene la respiración.
          </p>
        </header>

        <div className="prod-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((o) => (
            <article
              key={o.title}
              className="prod-card group relative aspect-[3/4] overflow-hidden bg-negro cursor-pointer"
            >
              <img
                src={o.img}
                alt={o.title}
                width={768}
                height={1024}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* default overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/30 to-transparent" />
              {/* hover overlay */}
              <div className="absolute inset-0 bg-negro/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-body text-rojo text-[10px] uppercase tracking-[0.3em]">
                    {o.year}
                  </span>
                  <span className="w-1 h-1 bg-rojo rounded-full" />
                  <span className="font-body text-blanco/80 text-[10px] uppercase tracking-[0.3em]">
                    {o.tipo}
                  </span>
                </div>
                <h3 className="font-display text-blanco text-3xl md:text-4xl leading-none mb-4">
                  {o.title}
                </h3>
                <div className="w-0 group-hover:w-12 h-[2px] bg-rojo transition-all duration-500" />
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-16">
          <a href="#" className="link-underline font-body text-blanco uppercase tracking-[0.3em] text-sm">
            Ver todas las producciones →
          </a>
        </div>
      </div>
    </section>
  );
}
