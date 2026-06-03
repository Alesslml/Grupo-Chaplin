import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import f1 from "@/assets/family-1.jpg";
import f2 from "@/assets/family-2.jpg";
import f3 from "@/assets/family-3.jpg";
import ensemble from "@/assets/ensemble.jpg";

const testimonios = [
  { cita: "Llegué buscando un taller. Encontré una segunda familia y un escenario para toda la vida.", nombre: "Lucía Mendoza" },
  { cita: "Chaplin me enseñó que el teatro no es lo que haces. Es lo que eres cuando se apagan las luces.", nombre: "Diego Quispe" },
  { cita: "Aquí descubrí mi voz. Y descubrí que mi voz importaba.", nombre: "Andrea Rivas" },
];

export function Familia() {
  const ref = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonios.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fm-fade", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
      gsap.from(".fm-photo", {
        clipPath: "inset(100% 0 0 0)",
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".fm-mosaic", start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="familia"
      ref={ref}
      className="bg-negro-profundo grain py-28 lg:py-40 relative"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <header className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="fm-fade font-display text-blanco text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95]">
            LA FAMILIA<br />CHAPLIN.
          </h2>
          <p className="fm-fade font-body italic text-rojo text-lg md:text-xl">
            "No solo subimos a un escenario. Encontramos una familia."
          </p>
        </header>

        {/* Mosaico */}
        <div className="fm-mosaic grid grid-cols-2 md:grid-cols-4 grid-rows-[200px_200px_200px] md:grid-rows-[260px_260px] gap-3 mb-24">
          <div className="fm-photo relative overflow-hidden col-span-2 row-span-2 group">
            <img src={ensemble} alt="Elenco" width={1024} height={1280} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-negro via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="font-display text-blanco text-2xl">EL ELENCO</p>
              <p className="font-body text-rojo text-xs uppercase tracking-[0.3em]">Temporada 2024</p>
            </div>
          </div>
          <div className="fm-photo relative overflow-hidden group">
            <img src={f1} alt="Camarín" width={1024} height={1024} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 group-hover:scale-105" />
          </div>
          <div className="fm-photo relative overflow-hidden group">
            <img src={f3} alt="Dirección" width={768} height={1024} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 group-hover:scale-105" />
            <div className="absolute inset-0 bg-negro/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
              <p className="font-body italic text-blanco text-sm text-center">"Cada nota dirigida es una vida tocada."</p>
            </div>
          </div>
          <div className="fm-photo relative overflow-hidden col-span-2 group">
            <img src={f2} alt="Ensayo" width={1024} height={768} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-negro/80 via-transparent to-transparent" />
            <div className="absolute top-1/2 -translate-y-1/2 left-6 max-w-[60%]">
              <p className="font-display text-blanco text-2xl md:text-3xl leading-tight">DESPUÉS DEL TELÓN, LA RISA.</p>
            </div>
          </div>
        </div>

        {/* Testimonios carrusel */}
        <div className="max-w-3xl mx-auto text-center relative min-h-[200px]">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-display text-rojo text-[120px] leading-none opacity-40">
            "
          </span>
          {testimonios.map((t, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="font-body italic text-blanco text-lg md:text-2xl leading-relaxed mb-8 px-6">
                {t.cita}
              </p>
              <p className="font-display text-rojo text-xl tracking-wider">
                — {t.nombre}
              </p>
            </div>
          ))}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {testimonios.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Testimonio ${i + 1}`}
                className={`w-8 h-[2px] transition-all duration-300 ${
                  i === idx ? "bg-rojo" : "bg-gris-humo/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
