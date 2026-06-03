import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ensemble from "@/assets/ensemble.jpg";

const stats = [
  { value: 20, suffix: "+", label: "Producciones" },
  { value: 6, suffix: "+", label: "Años en escena" },
  { value: 1, suffix: "", label: "Festival propio" },
];

export function Identidad() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".id-reveal", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
      gsap.from(".id-line", {
        scaleX: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });

      // Stat counters
      ref.current?.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.counter);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => {
            el.textContent = String(Math.floor(obj.v));
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="nosotros"
      ref={ref}
      className="relative bg-negro grain py-28 lg:py-40 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Texto */}
          <div className="relative">
            <span
              aria-hidden
              className="absolute -top-16 -left-4 font-display text-[160px] lg:text-[220px] leading-none text-blanco/[0.04] select-none pointer-events-none"
            >
              2019
            </span>

            <p className="id-reveal font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6 relative">
              Desde el 21·10·2019
            </p>

            <h2 className="id-reveal font-display text-blanco text-5xl md:text-6xl lg:text-[64px] leading-[0.95] mb-6 relative">
              UNA FAMILIA<br />ARTÍSTICA<br />
              <span className="text-rojo">DESDE ICA.</span>
            </h2>

            <div className="id-line linea-roja mb-8" />

            <p className="id-reveal font-body text-blanco/80 text-base md:text-lg leading-[1.8] mb-6 relative max-w-xl">
              Somos Chaplin Grupo Cultural. Una compañía teatral profesional que
              nació en Ica con una convicción: el teatro transforma vidas,
              comunidades y ciudades. Cada función es una promesa cumplida.
            </p>
            <p className="id-reveal font-body text-blanco/60 text-base leading-[1.8] mb-12 relative max-w-xl">
              Más de seis años subiendo el telón, formando elenco, abriendo
              caminos y demostrando que el arte iqueño tiene voz propia en el
              Perú.
            </p>

            <div className="id-reveal grid grid-cols-3 gap-6 max-w-md">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-rojo text-5xl md:text-6xl leading-none">
                    <span data-counter={s.value}>0</span>
                    {s.suffix}
                  </p>
                  <p className="font-body text-blanco/70 text-[11px] uppercase tracking-[0.2em] mt-3">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen */}
          <div className="id-reveal relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={ensemble}
                alt="Elenco Chaplin en escena"
                width={1024}
                height={1280}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-negro via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-negro/80 via-transparent to-transparent" />
            </div>

            {/* Badge flotante */}
            <div className="absolute -bottom-6 -left-6 lg:-left-12 bg-rojo px-6 py-4 max-w-[260px] shadow-stage">
              <p className="font-body text-negro text-[10px] uppercase tracking-[0.3em] mb-1">
                Reconocidos por
              </p>
              <p className="font-display text-negro text-2xl leading-none">
                Oficio Crítico
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
