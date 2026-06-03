import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Star, Building2 } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const partners = [
  "OFICIO CRÍTICO",
  "TEATRO EN EL PERÚ",
  "MUNICIPALIDAD DE ICA",
  "JUEGOS FLORALES",
  "LA CARTELERA",
  "ARCSUR",
  "CULTURA ICA",
  "LA TÍA",
];

const reconocimientos = [
  { icon: Award, text: "+6 ediciones como jurado en Juegos Florales Nacionales" },
  { icon: Star, text: "Reconocidos por Oficio Crítico — crítica teatral nacional" },
  { icon: Building2, text: "Aval de la Municipalidad Provincial de Ica" },
];

export function Reconocimientos() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".rc-fade", {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-blanco text-negro py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="text-center mb-16">
          <p className="rc-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">
            Nos respaldan
          </p>
          <h2 className="rc-fade font-display text-negro text-5xl md:text-6xl lg:text-7xl">
            CONFIANZA<br className="md:hidden" /> GANADA<br /> EN ESCENA.
          </h2>
        </header>

        {/* Banda de aliados */}
        <div className="rc-fade bg-[#f0f0f0] py-10 px-8 mb-16">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {partners.map((p) => (
              <span
                key={p}
                className="logo-grayscale font-display text-xl md:text-2xl text-negro tracking-wider"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Logros */}
        <div className="grid md:grid-cols-3 gap-6">
          {reconocimientos.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.text}
                className="rc-fade flex items-start gap-4 border-l-2 border-rojo pl-6 py-4"
              >
                <Icon className="text-rojo shrink-0 mt-1" size={28} strokeWidth={1.5} />
                <p className="font-display text-negro text-xl md:text-2xl leading-tight">
                  {r.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
