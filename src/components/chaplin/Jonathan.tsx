import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import jonathanImg from "@/assets/jonathan-lopez.jpg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const credenciales = [
  { valor: "UAP", desc: "Universidad Alas Peruanas" },
  { valor: "Ica", desc: "Su tierra natal" },
  { valor: "Lima · Ica", desc: "Asesoría de negocios en regiones" },
];

const trayectoria: { lugar: string; rol: string; detalle?: string }[] = [
  { lugar: "Universidad Alas Peruanas", rol: "Administración y Negocios Internacionales" },
  { lugar: "Grupo Roky's", rol: "Administrador" },
  { lugar: "Karaoke Bar y Discoteca Sopranos", rol: "Administrador" },
  { lugar: "Chicharronería Mechita", rol: "Gerente General de su propia empresa" },
  { lugar: "Macacona Hotel Resort", rol: "Administrador" },
  {
    lugar: "Actualidad",
    rol: "Asesor administrativo de negocios",
    detalle: "Asesora a Inversiones Leoney E.I.R.L. y Cía. Minera Cruzcam E.I.R.L.",
  },
];

export function Jonathan() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".jon-fade", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
      gsap.from(".jon-line", {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
      gsap.from(".jon-cred", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".jon-creds", start: "top 80%" },
      });
      gsap.from(".jon-step", {
        opacity: 0,
        x: -24,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".jon-timeline", start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro-suave grain py-28 lg:py-40 relative overflow-hidden">
      {/* Iniciales decorativas */}
      <span
        aria-hidden
        className="absolute top-0 left-0 font-display text-[300px] lg:text-[400px] leading-none text-blanco/[0.018] select-none pointer-events-none"
      >
        JL
      </span>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-24 items-start">
          {/* Texto */}
          <div className="order-1">
            <p className="jon-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
              Gestión y administración
            </p>
            <h2 className="jon-fade font-display text-blanco text-5xl md:text-6xl lg:text-[68px] leading-[0.9] mb-6">
              EL ORDEN<br />DETRÁS DEL<br /><span className="text-rojo">ESCENARIO.</span>
            </h2>
            <div className="jon-line linea-roja mb-8" style={{ transformOrigin: "left center" }} />

            <p className="jon-fade font-body text-blanco/80 text-base md:text-lg leading-[1.8] mb-5 max-w-xl">
              Nacido en Ica, Jonathan estudió <strong className="text-blanco">Administración y Negocios Internacionales</strong> en la Universidad Alas Peruanas y construyó su carrera <em className="not-italic font-semibold text-blanco">desde la gestión de negocios reales</em>.
            </p>
            <p className="jon-fade font-body text-blanco/60 text-base leading-[1.8] mb-5 max-w-xl">
              Se desempeñó como administrador en el Grupo Roky's y en el Karaoke Bar y Discoteca Sopranos. Luego dio el salto a emprender con su propia empresa, Chicharronería Mechita, como Gerente General, y fue administrador de Macacona Hotel Resort.
            </p>
            <p className="jon-fade font-body text-blanco/60 text-base leading-[1.8] mb-10 max-w-xl">
              Hoy es asesor administrativo de negocios en Lima, Ica y otras regiones, y pone esa experiencia al servicio de Chaplin Grupo Cultural como Gerente General, cuidando que la parte administrativa esté tan bien armada como lo que ocurre sobre el escenario.
            </p>

            {/* Trayectoria */}
            <div className="jon-timeline mb-10 max-w-xl">
              <p className="font-body uppercase tracking-[0.3em] text-rojo text-[11px] mb-5">Trayectoria</p>
              <ol className="relative border-l border-gris-textura pl-6 space-y-5">
                {trayectoria.map((t) => (
                  <li key={t.lugar} className="jon-step relative">
                    <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-rojo rounded-full" />
                    <p className="font-display text-blanco text-xl leading-none">{t.lugar}</p>
                    <p className="font-body text-blanco/55 text-sm mt-1">{t.rol}</p>
                    {t.detalle && <p className="font-body text-blanco/40 text-xs mt-1">{t.detalle}</p>}
                  </li>
                ))}
              </ol>
            </div>

            {/* Credenciales */}
            <div className="jon-creds grid grid-cols-3 gap-px bg-gris-textura mb-10">
              {credenciales.map((c) => (
                <div key={c.valor} className="jon-cred bg-negro-suave p-5 sm:p-6 text-center">
                  <p className="font-display text-rojo text-2xl md:text-3xl leading-none mb-2">{c.valor}</p>
                  <p className="font-body text-blanco/50 text-[10px] uppercase tracking-[0.2em] leading-tight">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="jon-fade flex flex-wrap gap-4">
              <Link to="/producciones" className="btn-rojo">
                Ver producciones
              </Link>
              <Link to="/contacto" className="btn-outline">
                Contacto
              </Link>
            </div>
          </div>

          {/* Foto */}
          <div className="jon-fade order-2 relative pb-8 lg:sticky lg:top-28">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={jonathanImg}
                alt="Jonathan Christhofer López Segovia – Gerente General"
                loading="lazy"
                className="w-full h-full object-cover object-[50%_18%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-negro/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-body uppercase tracking-[0.35em] text-rojo text-[10px] mb-2">
                  Gerente General
                </p>
                <h3 className="font-display text-blanco text-3xl leading-none">
                  JONATHAN CHRISTHOFER<br />LÓPEZ SEGOVIA
                </h3>
              </div>
            </div>

            <div className="absolute top-5 -right-4 lg:-right-8 bg-rojo px-5 py-4 max-w-[180px] shadow-stage z-10">
              <p className="font-body text-negro text-[10px] uppercase tracking-[0.2em] mb-1">Administrador</p>
              <p className="font-display text-negro text-2xl leading-none">NEGOCIOS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
