import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import sing from "@/assets/show-sing.jpg";
import { Calendar, MapPin, Ticket } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
        ".px-img",
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="proxima"
      ref={ref}
      className="relative bg-negro grain overflow-hidden"
    >
      {/* Línea roja vertical izquierda */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rojo z-10" />

      {/* Resplandor rojo suave de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(254,0,0,0.08),transparent_65%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">

          {/* ── Columna texto ── */}
          <div>
            {/* Badge */}
            <span className="px-fade inline-flex items-center gap-2 bg-rojo text-negro font-body text-[11px] font-bold uppercase tracking-[0.4em] px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-negro rounded-full animate-pulse" />
              Próxima función
            </span>

            {/* Título */}
            <h2 className="px-fade font-display text-blanco text-[56px] sm:text-[78px] lg:text-[110px] leading-[0.88] mb-8">
              SING<br />
              <span className="text-rojo">¡VEN Y CANTA!</span>
            </h2>

            {/* Detalles */}
            <div className="px-fade space-y-4 mb-10">
              {[
                { icon: Calendar, text: "Sábado 15 de marzo · 8:00 PM" },
                { icon: MapPin,   text: "Teatro Municipal de Ica" },
                { icon: Ticket,   text: "Entrada general · S/ 35" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-rojo/50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-rojo" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-blanco/85 text-base md:text-lg">{text}</p>
                </div>
              ))}
            </div>

            <Link to="/contacto" className="px-fade btn-rojo">
              Comprar entradas
            </Link>
          </div>

          {/* ── Columna imagen ── */}
          <div className="px-img relative aspect-[3/4]">
            <img
              src={sing}
              alt="Sing ¡Ven y Canta!"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradiente para integrar con el fondo negro */}
            <div className="absolute inset-0 bg-gradient-to-r from-negro/60 via-transparent to-transparent" />
            {/* Marco rojo decorativo */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-rojo/40 -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
