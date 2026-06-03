import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import haroldImg from "@/assets/harold-lopez.png";
import ensembleImg from "@/assets/ensemble.jpg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const credenciales = [
  { valor: "ENSAD", desc: "Escuela Nacional Superior de Arte Dramático" },
  { valor: "20+", desc: "Producciones dirigidas" },
  { valor: "6+", desc: "Años de labor ininterrumpida" },
  { valor: "Ica", desc: "Descentralización cultural" },
];

export function Harold() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".harold-fade", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
      gsap.from(".harold-line", {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
      gsap.from(".harold-cred", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".harold-creds", start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro grain py-28 lg:py-40 relative overflow-hidden">
      {/* Número decorativo */}
      <span
        aria-hidden
        className="absolute top-0 right-0 font-display text-[300px] lg:text-[400px] leading-none text-blanco/[0.018] select-none pointer-events-none"
      >
        HL
      </span>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-start">

          {/* Visual – foto real de Harold + badge */}
          <div className="harold-fade order-2 lg:order-1 relative pb-8">
            {/* Foto principal */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={haroldImg}
                alt="Lic. Josue Harold López Segovia – Director General"
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              {/* Gradiente suave abajo para que el badge se lea */}
              <div className="absolute inset-0 bg-gradient-to-t from-negro/70 via-transparent to-transparent" />

              {/* Nombre flotante sobre la foto */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-body uppercase tracking-[0.35em] text-rojo text-[10px] mb-2">
                  Director General
                </p>
                <h3 className="font-display text-blanco text-3xl leading-none">
                  LIC. JOSUE<br />HAROLD LÓPEZ
                </h3>
              </div>
            </div>

            {/* Imagen secundaria flotante – elenco */}
            <div className="absolute -bottom-4 -right-4 lg:-right-8 w-[48%] aspect-[4/3] overflow-hidden border-4 border-negro shadow-stage z-10">
              <img
                src={ensembleImg}
                alt="Elenco Chaplin Grupo Cultural"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-negro/30" />
            </div>

            {/* Badge ENSAD */}
            <div className="absolute top-5 -left-4 lg:-left-8 bg-rojo px-5 py-4 max-w-[180px] shadow-stage z-10">
              <p className="font-body text-negro text-[10px] uppercase tracking-[0.2em] mb-1">Formado en</p>
              <p className="font-display text-negro text-2xl leading-none">ENSAD</p>
            </div>
          </div>

          {/* Texto */}
          <div className="order-1 lg:order-2">
            <p className="harold-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
              Detrás del telón
            </p>
            <h2 className="harold-fade font-display text-blanco text-5xl md:text-6xl lg:text-[68px] leading-[0.9] mb-6">
              EL HOMBRE<br />QUE MUEVE<br /><span className="text-rojo">EL ESCENARIO.</span>
            </h2>
            <div className="harold-line linea-roja mb-8" style={{ transformOrigin: "left center" }} />

            <p className="harold-fade font-body text-blanco/80 text-base md:text-lg leading-[1.8] mb-5 max-w-xl">
              El teatro ha sido, desde sus años de formación en la <strong className="text-blanco">ENSAD</strong>, el eje que articula su propósito de vida: <em className="not-italic font-semibold text-blanco">transformar realidades a través del arte</em>.
            </p>
            <p className="harold-fade font-body text-blanco/60 text-base leading-[1.8] mb-5 max-w-xl">
              Tras más de 6 años de labor ininterrumpida y más de 20 puestas en escena, su compromiso con la descentralización cultural en Ica se mantiene más firme que nunca.
            </p>
            <p className="harold-fade font-body text-blanco/60 text-base leading-[1.8] mb-10 max-w-xl">
              Fundó Chaplin Grupo Cultural el 21 de octubre de 2019, liderando producciones de alta complejidad técnica que han elevado los estándares de la producción artística regional.
            </p>

            {/* Cita */}
            <div className="harold-fade relative pl-6 border-l-2 border-rojo mb-10">
              <p className="font-body italic text-blanco/80 text-base md:text-lg leading-[1.8]">
                "No solo buscamos entretener; buscamos que cada espectador se encuentre a sí mismo en el escenario."
              </p>
              <p className="font-display text-rojo text-sm tracking-wider mt-3">
                — Lic. Josue Harold López Segovia
              </p>
            </div>

            {/* Credenciales */}
            <div className="harold-creds grid grid-cols-2 sm:grid-cols-4 gap-px bg-gris-textura mb-10">
              {credenciales.map((c) => (
                <div key={c.valor} className="harold-cred bg-negro p-6 text-center">
                  <p className="font-display text-rojo text-3xl md:text-4xl leading-none mb-2">{c.valor}</p>
                  <p className="font-body text-blanco/50 text-[10px] uppercase tracking-[0.2em] leading-tight">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="harold-fade flex flex-wrap gap-4">
              <Link to="/producciones" className="btn-rojo">
                Ver producciones
              </Link>
              <Link to="/contacto" className="btn-outline">
                Trabajar con Harold
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
