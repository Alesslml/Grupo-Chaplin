import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import fesmicaImg from "@/assets/fesmica.jpg";
import drama from "@/assets/show-drama.jpg";
import musical from "@/assets/show-musical.jpg";
import comedy from "@/assets/show-comedy.jpg";
import { Clock, Users, MapPin, Zap } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/fesmica")({
  head: () => ({
    meta: [
      { title: "FESMICA · Festival de Microteatro de Ica" },
      {
        name: "description",
        content:
          "FESMICA: el Festival de Microteatro de Ica creado por Chaplin Grupo Cultural. Tres días, más de quince obras de quince minutos. Íntimo, fugaz, eléctrico.",
      },
    ],
  }),
  component: FesmicaPage,
});

const pilares = [
  {
    icon: Clock,
    title: "15 MINUTOS",
    desc: "Cada obra dura exactamente 15 minutos. El tiempo justo para contar una historia completa, sin relleno, sin pretextos.",
  },
  {
    icon: Users,
    title: "ÍNTIMO",
    desc: "Espacios reducidos para el público. La cuarta pared desaparece. El actor y el espectador comparten el mismo aire.",
  },
  {
    icon: MapPin,
    title: "ICA",
    desc: "Creado en Ica, para Ica. Con el tiempo, el Perú lo adoptó. Las compañías de Lima y otras regiones llegan a participar.",
  },
  {
    icon: Zap,
    title: "ELÉCTRICO",
    desc: "Cada función es una experiencia distinta. Drama, comedia, monólogo, danza-teatro. En FESMICA, todo vale si hay verdad escénica.",
  },
];

const ediciones = [
  {
    num: "I",
    year: "2024",
    titulo: "Primera Edición",
    desc: "El inicio de todo. 12 obras, 6 compañías participantes y un público iqueño que descubrió el microteatro como nunca antes.",
    obras: "12 obras",
    companias: "6 compañías",
    img: drama,
  },
  {
    num: "II",
    year: "2024",
    titulo: "Segunda Edición",
    desc: "Duplicamos la ambición. Compañías de Lima y Arequipa se sumaron al festival. El microteatro empezó a ser noticia nacional.",
    obras: "18 obras",
    companias: "9 compañías",
    img: musical,
  },
  {
    num: "III",
    year: "2025",
    titulo: "Tercera Edición",
    desc: "FESMICA se consolida como el festival de microteatro más importante del sur del Perú. Nuevos espacios, nuevo público, mismo espíritu.",
    obras: "20+ obras",
    companias: "12 compañías",
    img: comedy,
    proxima: true,
  },
];

const pasos = [
  { num: "01", title: "Postula tu obra", desc: "Envía la sinopsis, el elenco y la ficha técnica de tu obra de microteatro. La única condición: 15 minutos exactos." },
  { num: "02", title: "Selección", desc: "El comité artístico de Chaplin revisa las postulaciones y selecciona las obras que participarán en el festival." },
  { num: "03", title: "Ensayos y coordinación", desc: "Coordinaremos los horarios, espacios y necesidades técnicas de tu producción. Estamos para apoyarte." },
  { num: "04", title: "Sube al escenario", desc: "Presenta tu obra en FESMICA. 15 minutos para brillar ante un público que está listo para sorprenderse." },
];

/* ─── Qué es FESMICA ──────────────────────────────────────────────────────── */
function QueEsSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".qe-fade", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro grain py-28 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <p className="qe-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
              Chaplin presenta
            </p>
            <h2 className="qe-fade font-display text-blanco text-5xl md:text-7xl lg:text-[100px] leading-[0.85] mb-6">
              FESMICA
            </h2>
            <p className="qe-fade font-body text-rojo text-base md:text-lg uppercase tracking-[0.2em] mb-8">
              Festival de Microteatro de Ica
            </p>
            <p className="qe-fade font-body text-blanco/80 text-base md:text-lg leading-[1.8] mb-5 max-w-lg">
              Tres días. Más de quince obras de quince minutos. Un festival donde el
              teatro se vuelve íntimo, fugaz, eléctrico.
            </p>
            <p className="qe-fade font-body text-blanco/60 text-base leading-[1.8] max-w-lg">
              Chaplin lo creó, Ica lo adoptó, el Perú lo aplaude. FESMICA nació de
              la convicción de que el teatro puede ser una experiencia radical:
              personal, intensa y sin concesiones.
            </p>
          </div>

          <div className="qe-fade relative">
            <div className="relative aspect-[3/4] border-[12px] border-rojo shadow-black">
              <img
                src={fesmicaImg}
                alt="Festival FESMICA"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-rojo/30 -z-10" />
          </div>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gris-textura mt-24">
          {pilares.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="qe-fade bg-negro p-8 lg:p-10 group hover:bg-rojo transition-colors duration-500">
                <Icon className="text-rojo group-hover:text-negro mb-6 transition-colors duration-500" size={36} strokeWidth={1.2} />
                <h3 className="font-display text-blanco group-hover:text-negro text-3xl mb-4 transition-colors duration-500">
                  {p.title}
                </h3>
                <p className="font-body text-blanco/60 group-hover:text-negro/70 text-sm leading-relaxed transition-colors duration-500">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Ediciones ───────────────────────────────────────────────────────────── */
function EdicionesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ed-card", {
        opacity: 0,
        y: 60,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-gris-claro py-28 lg:py-40 text-negro">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="text-center max-w-2xl mx-auto mb-20">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Historia del festival</p>
          <h2 className="font-display text-negro text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            EDICIONES<br />DEL FESMICA.
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-px bg-negro/10">
          {ediciones.map((e) => (
            <div key={e.num} className="ed-card group relative bg-gris-claro overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={e.img}
                  alt={e.titulo}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-negro/50" />
                {e.proxima && (
                  <div className="absolute top-4 right-4 bg-rojo px-3 py-1">
                    <span className="font-body text-negro text-[10px] font-bold uppercase tracking-[0.2em]">Próxima</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <p className="font-display text-rojo text-6xl leading-none opacity-80">
                    {e.num}
                  </p>
                </div>
              </div>
              <div className="p-8">
                <p className="font-body uppercase tracking-[0.3em] text-rojo text-[10px] mb-3">{e.year}</p>
                <h3 className="font-display text-negro text-3xl mb-4">{e.titulo}</h3>
                <p className="font-body text-gris-humo text-sm leading-[1.8] mb-6">{e.desc}</p>
                <div className="flex items-center gap-6 pt-4 border-t border-negro/10">
                  <div>
                    <p className="font-display text-rojo text-2xl">{e.obras}</p>
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-gris-humo">presentadas</p>
                  </div>
                  <div>
                    <p className="font-display text-negro text-2xl">{e.companias}</p>
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-gris-humo">participantes</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Participar ──────────────────────────────────────────────────────────── */
function ParticiparSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".part-step", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro-suave grain py-28 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="text-center max-w-2xl mx-auto mb-20">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">¿Tienes una obra?</p>
          <h2 className="font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            PARTICIPA<br />EN FESMICA.
          </h2>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gris-textura mb-16">
          {pasos.map((p) => (
            <div key={p.num} className="part-step bg-negro p-8 lg:p-10">
              <p className="font-display text-rojo text-6xl leading-none mb-6">{p.num}</p>
              <h3 className="font-display text-blanco text-2xl md:text-3xl mb-4">{p.title}</h3>
              <p className="font-body text-blanco/60 text-sm leading-[1.8]">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="font-body text-blanco/50 text-sm mb-6">Las convocatorias abren cada año. Síguenos para estar al tanto.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contacto" className="btn-rojo">
              Consultar próxima convocatoria
            </Link>
            <a
              href="https://instagram.com/chaplin.grupocultural"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Seguirnos en Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function FesmicaPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin presenta"
        title={<>FESMICA</>}
        subtitle="El Festival de Microteatro de Ica. Tres días, quince minutos por obra, cero concesiones. Teatro que te entra por la piel."
        bg={fesmicaImg}
      />
      <QueEsSection />
      <EdicionesSection />
      <ParticiparSection />
    </PageLayout>
  );
}
