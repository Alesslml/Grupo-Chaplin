import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import sing from "@/assets/show-sing.jpg";
import musical from "@/assets/show-musical.jpg";
import drama from "@/assets/show-drama.jpg";
import { Calendar } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const temporada = [
  {
    title: "SING",
    subtitle: "¡Ven y canta!",
    fecha: "Sábado 15 de agosto",
    img: sing,
  },
  {
    title: "JESUCRISTO",
    subtitle: "Rockstar",
    fecha: "Octubre",
    img: musical,
  },
  {
    title: "SHREK",
    subtitle: "El inicio de la aventura · Dir. Harold López",
    fecha: "Diciembre",
    img: drama,
  },
];

export function ProximaFuncion() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".px-fade",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        }
      );
      gsap.fromTo(
        ".px-card",
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="proxima" ref={ref} className="relative bg-negro grain overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rojo z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(254,0,0,0.08),transparent_65%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
        <span className="px-fade inline-flex items-center gap-2 bg-rojo text-negro font-body text-[11px] font-bold uppercase tracking-[0.4em] px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-negro rounded-full animate-pulse" />
          Temporada 2026
        </span>

        <h2 className="px-fade font-display text-blanco text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] mb-14 max-w-3xl">
          TRES ESTRENOS<br />
          <span className="text-rojo">TE ESPERAN.</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {temporada.map((t) => (
            <div key={t.title} className="px-card group relative aspect-[3/4] overflow-hidden">
              <img
                src={t.img}
                alt={t.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/50 to-transparent" />
              <div className="absolute -bottom-0 right-0 w-full h-full border-2 border-rojo/30 -z-10" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center gap-2 mb-2 text-rojo">
                  <Calendar size={14} />
                  <span className="font-body text-[11px] uppercase tracking-[0.25em]">{t.fecha}</span>
                </div>
                <h3 className="font-display text-blanco text-3xl leading-none mb-1">{t.title}</h3>
                <p className="font-body text-blanco/70 text-sm mb-4">{t.subtitle}</p>
                <Link
                  to="/producciones"
                  className="font-body text-[11px] uppercase tracking-[0.25em] text-blanco hover:text-rojo transition-colors duration-300"
                >
                  Más información →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="px-fade text-center mt-14">
          <a
            href={TICKETS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rojo"
          >
            Comprar entradas
          </a>
        </div>
      </div>
    </section>
  );
}

// TODO: reemplazar por el link real cuando exista el sistema de compra propio de Chaplin.
const TICKETS_URL = "https://teleticket.com.pe";
