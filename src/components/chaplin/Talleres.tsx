import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import { Mic, User, Music, Heart, Sparkles } from "lucide-react";

const talleres = [
  { icon: User, title: "Actuación", desc: "Construye personajes desde adentro. Aprende método, presencia y verdad escénica." },
  { icon: Heart, title: "Expresión Corporal", desc: "Tu cuerpo cuenta historias antes que tu voz. Descúbrelo y entrénalo." },
  { icon: Music, title: "Teatro Musical", desc: "Canto, baile y actuación: la tríada que enciende el escenario." },
  { icon: Sparkles, title: "Socioemocional", desc: "Habilidades para la vida, escuchar, sostener y conectar con otros." },
  { icon: Mic, title: "Desinhibición Escénica", desc: "Pierde el miedo, gana presencia. Para quien quiere romper su muro." },
];

export function Talleres() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".tl-card", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".tl-grid", start: "top 80%" },
      });
      gsap.from(".tl-head", {
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
      id="talleres"
      ref={ref}
      className="bg-gris-claro py-28 lg:py-40 text-negro"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="max-w-3xl mb-20">
          <p className="tl-head font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">
            Escuela Chaplin
          </p>
          <h2 className="tl-head font-display text-negro text-5xl md:text-6xl lg:text-[72px] leading-[0.95] mb-6">
            FORMA TU VOZ,<br />TU CUERPO,<br />TU ESCENA.
          </h2>
          <p className="tl-head font-body text-negro/70 text-base md:text-lg leading-relaxed max-w-xl">
            Aquí no solo aprendes a actuar. Aprendes a expresarte, a escuchar,
            a ser. Cinco caminos para encontrar tu lugar sobre el escenario.
          </p>
        </header>

        <div className="tl-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-l border-negro/10">
          {talleres.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.title}
                className="tl-card group relative bg-gris-claro border-r border-b border-t border-negro/10 p-8 hover:bg-negro transition-all duration-500 cursor-pointer"
              >
                <Icon
                  className="text-negro group-hover:text-rojo transition-colors duration-500 mb-8"
                  size={36}
                  strokeWidth={1.2}
                />
                <h3 className="font-display text-negro group-hover:text-blanco text-3xl mb-4 leading-tight transition-colors duration-500">
                  {t.title}
                </h3>
                <p className="font-body text-[14px] text-gris-humo group-hover:text-blanco/70 leading-relaxed transition-colors duration-500 mb-6">
                  {t.desc}
                </p>
                <div className="h-[3px] w-10 bg-rojo group-hover:w-full transition-all duration-500" />
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link to="/talleres" className="btn-rojo">
            Inscríbete en un taller
          </Link>
        </div>
      </div>
    </section>
  );
}
