import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import { Harold } from "@/components/chaplin/Harold";
import ensemble from "@/assets/ensemble.jpg";
import f1 from "@/assets/family-1.jpg";
import f2 from "@/assets/family-2.jpg";
import f3 from "@/assets/family-3.jpg";
import { Heart, Star, Users, BadgeCheck, Theater, GraduationCap, Sparkles, LifeBuoy } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Conoce la historia de Chaplin Grupo Cultural: una compañía teatral profesional nacida en Ica en 2019 con la convicción de que el teatro transforma vidas.",
      },
    ],
  }),
  component: NosotrosPage,
});

const stats = [
  { value: 20, suffix: "+", label: "Producciones" },
  { value: 6, suffix: "+", label: "Años en escena" },
  { value: 1, suffix: "", label: "Festival propio" },
  { value: 3, suffix: "", label: "Talleres activos" },
];

const valores = [
  {
    icon: Heart,
    title: "PASIÓN",
    desc: "El teatro no es un oficio para nosotros: es una forma de vida. Cada ensayo, cada función, cada línea de diálogo nace de un amor genuino por el arte escénico.",
  },
  {
    icon: Users,
    title: "COMUNIDAD",
    desc: "Chaplin existe porque existe Ica. Construimos teatro para y con nuestra ciudad, creyendo que el arte es el lenguaje más honesto que une a las personas.",
  },
  {
    icon: Star,
    title: "PROFESIONALISMO",
    desc: "La pasión sin rigor es ruido. Aquí formamos artistas integrales: actores, directores y técnicos que respetan el escenario y honran al público.",
  },
];

const hitos = [
  { year: "2019", label: "Fundación", desc: "Chaplin Grupo Cultural nace en Ica el 21 de octubre. Estrena TOC TOC (1ra temporada) y LARCO, el musical." },
  { year: "2020", label: "Microteatro virtual", desc: "En plena pandemia, el grupo sostiene el vínculo artístico con El Bucle, El Purgatorio y Dos para el camino, y el concurso virtual \"SI YO FUERA\"." },
  { year: "2021", label: "Me-estresas", desc: "Nueva producción bajo la codirección de Harold López y Thalia Castillon, en plena reactivación post-pandemia." },
  { year: "2022", label: "Regreso a las tablas", desc: "El me mintió (1ra temporada), TOC TOC (2da temporada) y COCO marcan la vuelta con fuerza a la producción presencial." },
  { year: "2023", label: "Expansión musical", desc: "El me mintió (2da temporada), Encanto y Mamma Mia consolidan a Chaplin como referente musical iqueño." },
  { year: "2024", label: "Nace FESMICA", desc: "Hércules, El Gran Showman, Camino a OZ, El me mintió (3ra temporada) y El Grinch, junto al nacimiento del Festival de Microteatro de Ica." },
  { year: "2025", label: "Segunda edición de FESMICA", desc: "Grease, El Rey León y Tus Amigos Nunca Te Harían Daño, en el año de la II edición del festival." },
  { year: "2026", label: "Heathers, El Musical", desc: "Estreno de Heathers y temporada con SING, Jesucristo Rockstar y SHREK, en el año de la III edición de FESMICA." },
];

const testimonios = [
  { cita: "Llegué buscando un taller. Encontré una segunda familia y un escenario para toda la vida.", nombre: "Lucía Mendoza" },
  { cita: "Chaplin me enseñó que el teatro no es lo que haces. Es lo que eres cuando se apagan las luces.", nombre: "Diego Quispe" },
  { cita: "Aquí descubrí mi voz. Y descubrí que mi voz importaba.", nombre: "Andrea Rivas" },
];

/* ─── Sección Identidad ───────────────────────────────────────────────────── */
function IdentidadSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".id-reveal",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } }
      );
      gsap.fromTo(
        ".id-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true } }
      );
      ref.current?.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.counter);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => { el.textContent = String(Math.floor(obj.v)); },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative bg-negro grain py-28 lg:py-40 overflow-hidden">
      <span
        aria-hidden
        className="absolute -top-8 right-0 font-display text-[200px] lg:text-[280px] leading-none text-blanco/[0.025] select-none pointer-events-none"
      >
        2019
      </span>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <p className="id-reveal font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
              Desde el 21·10·2019
            </p>
            <h2 className="id-reveal font-display text-blanco text-5xl md:text-6xl lg:text-[64px] leading-[0.95] mb-6">
              UNA COMPAÑÍA<br />NACIDA DE LA<br />
              <span className="text-rojo">CONVICCIÓN.</span>
            </h2>
            <div className="id-line linea-roja mb-8" />
            <p className="id-reveal font-body text-blanco/80 text-base md:text-lg leading-[1.8] mb-5 max-w-xl">
              Fundado el 21 de octubre de 2019, Chaplin Grupo Cultural nace bajo la
              premisa de que el arte es una herramienta fundamental de transformación
              social y bienestar comunitario. Liderado por su director general, el
              Lic. Josue Harold López Segovia, el colectivo ha logrado descentralizar
              la cultura en Ica, elevando los estándares de la producción artística
              regional a niveles de competitividad nacional.
            </p>
            <p className="id-reveal font-body text-blanco/60 text-base leading-[1.8] mb-12 max-w-xl">
              Más de seis años subiendo el telón, formando elenco, abriendo
              caminos y demostrando que el arte iqueño tiene voz propia en el Perú.
            </p>
            <div className="id-reveal grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-rojo text-5xl md:text-6xl leading-none">
                    <span data-counter={s.value}>0</span>
                    {s.suffix}
                  </p>
                  <p className="font-body text-blanco/70 text-[11px] uppercase tracking-[0.2em] mt-2">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="id-reveal relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img src={ensemble} alt="Elenco Chaplin en escena" loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-negro via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-negro/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 lg:-left-12 bg-rojo px-6 py-4 max-w-[260px] shadow-stage">
              <p className="font-body text-negro text-[10px] uppercase tracking-[0.3em] mb-1">Reconocidos por</p>
              <p className="font-display text-negro text-2xl leading-none">Oficio Crítico</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Misión, Visión y avales ─────────────────────────────────────────────── */
function MisionVisionSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mv-fade", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro-profundo grain py-28 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-24">
          <div className="mv-fade">
            <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-4">Misión</p>
            <p className="font-body text-blanco/75 text-base leading-[1.8]">
              Brindar una formación artística completa y pedagógica que permita el
              desarrollo de la expresión oral, corporal y dramática de nuestros
              integrantes. Realizamos puestas en escena de alta calidad con el objetivo
              de formar no solo artistas, sino mejores personas y espectadores críticos.
            </p>
          </div>
          <div className="mv-fade">
            <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-4">Visión</p>
            <p className="font-body text-blanco/75 text-base leading-[1.8]">
              Consolidarnos como un grupo cultural reconocido a nivel nacional por
              nuestra calidad de servicio. Buscamos promover valores a través de la
              educación artística en beneficio de nuestros alumnos y la sociedad,
              ofreciendo siempre espectáculos innovadores en el mundo del teatro.
            </p>
          </div>
        </div>

        <header className="mv-fade max-w-2xl mb-14">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Avalados por</p>
          <h2 className="font-display text-blanco text-4xl md:text-5xl leading-[0.95]">
            LA CRÍTICA Y LA PEDAGOGÍA<br />NOS RESPALDAN.
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-px bg-gris-textura mb-20">
          <div className="mv-fade bg-negro-suave p-8 lg:p-10">
            <GraduationCap className="text-rojo mb-5" size={32} strokeWidth={1.2} />
            <h3 className="font-display text-blanco text-2xl mb-3">Autoridad Pedagógica</h3>
            <p className="font-body text-blanco/60 text-sm leading-[1.8]">
              El grupo ha sido convocado como Jurado de los Juegos Florales Escolares
              Nacionales (etapa regional) en más de 6 ediciones, consolidándose como
              referente técnico y educativo en la región.
            </p>
          </div>
          <div className="mv-fade bg-negro-suave p-8 lg:p-10">
            <BadgeCheck className="text-rojo mb-5" size={32} strokeWidth={1.2} />
            <h3 className="font-display text-blanco text-2xl mb-3">Validación de la Crítica</h3>
            <p className="font-body text-blanco/60 text-sm leading-[1.8]">
              El grupo ha sido reconocido por el prestigioso portal nacional "Oficio
              Crítico", galardón que sitúa las producciones iqueñas al mismo nivel
              competitivo que las grandes salas de la capital.
            </p>
          </div>
        </div>

        <div className="mv-fade max-w-3xl">
          <p className="font-body text-blanco/70 text-base leading-[1.8] mb-5">
            Chaplin destaca por ser una plataforma de desarrollo integral. Bajo la
            supervisión del equipo directivo, el talento interno ha evolucionado hacia
            roles de liderazgo, destacando las direcciones de{" "}
            <span className="text-blanco">Daniela Lengua</span> (Camino a Oz),{" "}
            <span className="text-blanco">Carlos Espino</span> (Hércules),{" "}
            <span className="text-blanco">Yerson Luján</span> (Grease) y{" "}
            <span className="text-blanco">Gerson Juaze</span> (SING, Ven y Canta —
            producción 2026).
          </p>
          <p className="font-body text-blanco/60 text-base leading-[1.8]">
            El grupo cuenta con un historial de éxitos y producciones de alta
            complejidad técnica: Mamma Mia, The Greatest Showman, Encanto, Coco, El Rey
            León, Él me mintió (3 temporadas consecutivas), TOC TOC, Tus Amigos Nunca Te
            Harían Daño y Pinocho, entre otras. En 2026 lidera con el estreno de{" "}
            <span className="text-rojo">Heathers, El Musical</span>.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Ecosistema Chaplin ──────────────────────────────────────────────────── */
const ecosistema = [
  { icon: Theater, title: "FESMICA", desc: "Organizadores del Festival de Microteatro de Ica, una plataforma clave para dinamizar el talento local." },
  { icon: GraduationCap, title: "Talleres Formativos", desc: "Programas especializados en habilidades socioemocionales y técnicas de desinhibición." },
  { icon: Sparkles, title: "Innovación en Crisis", desc: "Durante la pandemia, el grupo mantuvo el vínculo artístico mediante el concurso virtual \"SI YO FUERA\"." },
  { icon: LifeBuoy, title: "Asesoría Técnica", desc: "Soporte y consultoría para organizaciones del sector cultural." },
];

function EcosistemaSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".eco-card", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-gris-claro py-24 lg:py-32 text-negro">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="max-w-2xl mb-16">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Más allá del escenario</p>
          <h2 className="font-display text-negro text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
            UN ECOSISTEMA<br />ARTÍSTICO RESILIENTE.
          </h2>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-negro/10">
          {ecosistema.map((e) => {
            const Icon = e.icon;
            return (
              <div key={e.title} className="eco-card bg-gris-claro p-8">
                <Icon className="text-rojo mb-5" size={30} strokeWidth={1.2} />
                <h3 className="font-display text-negro text-xl mb-3">{e.title}</h3>
                <p className="font-body text-gris-humo text-[13px] leading-[1.7]">{e.desc}</p>
              </div>
            );
          })}
        </div>

        <p className="font-body text-gris-humo text-sm leading-[1.8] max-w-2xl mt-16">
          Chaplin Grupo Cultural representa la excelencia ante los desafíos. Al crear
          sus propios espacios y formar un público fiel, el grupo reafirma su
          compromiso de usar el escenario como un puente hacia la identidad, el
          bienestar y la cultura.
        </p>
      </div>
    </section>
  );
}

/* ─── Sección Valores ─────────────────────────────────────────────────────── */
function ValoresSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".val-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-gris-claro py-28 lg:py-36 text-negro">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="max-w-2xl mb-20">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Nuestros pilares</p>
          <h2 className="font-display text-negro text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            LO QUE NOS<br />MUEVE.
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-px bg-negro/10">
          {valores.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="val-card group bg-gris-claro p-10 lg:p-14 hover:bg-negro transition-all duration-500"
              >
                <Icon
                  className="text-rojo mb-8 transition-colors duration-500"
                  size={40}
                  strokeWidth={1.2}
                />
                <h3 className="font-display text-negro group-hover:text-blanco text-4xl mb-5 transition-colors duration-500">
                  {v.title}
                </h3>
                <p className="font-body text-[14px] text-gris-humo group-hover:text-blanco/70 leading-relaxed transition-colors duration-500 mb-6">
                  {v.desc}
                </p>
                <div className="h-[3px] w-10 bg-rojo group-hover:w-full transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Sección Historia ────────────────────────────────────────────────────── */
function HistoriaSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hit-item", {
        opacity: 0,
        x: -30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro-suave grain py-28 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="text-center max-w-2xl mx-auto mb-20">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Línea de tiempo</p>
          <h2 className="font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            EL CAMINO<br />RECORRIDO.
          </h2>
        </header>

        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-[11px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-rojo/20" />

          <div className="space-y-0">
            {hitos.map((h, i) => (
              <div
                key={h.year}
                className={`hit-item relative grid md:grid-cols-2 gap-8 md:gap-16 items-center py-10 ${
                  i % 2 === 0 ? "" : "md:direction-rtl"
                }`}
              >
                {/* Punto en la línea */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-6 h-6 bg-negro border-2 border-rojo flex items-center justify-center">
                  <div className="w-2 h-2 bg-rojo" />
                </div>

                {i % 2 === 0 ? (
                  <>
                    <div className="pl-10 md:pl-0 md:text-right md:pr-16">
                      <p className="font-display text-rojo text-5xl md:text-6xl leading-none mb-2">{h.year}</p>
                      <h3 className="font-display text-blanco text-2xl md:text-3xl">{h.label}</h3>
                    </div>
                    <div className="pl-10 md:pl-16">
                      <p className="font-body text-blanco/60 text-base leading-[1.8]">{h.desc}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pl-10 md:order-2 md:pl-16">
                      <p className="font-display text-rojo text-5xl md:text-6xl leading-none mb-2">{h.year}</p>
                      <h3 className="font-display text-blanco text-2xl md:text-3xl">{h.label}</h3>
                    </div>
                    <div className="pl-10 md:order-1 md:text-right md:pr-16">
                      <p className="font-body text-blanco/60 text-base leading-[1.8]">{h.desc}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Sección Familia ─────────────────────────────────────────────────────── */
function FamiliaSection() {
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
    <section id="familia" ref={ref} className="bg-negro-profundo grain py-28 lg:py-40 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <header className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="fm-fade font-display text-blanco text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95]">
            LA FAMILIA<br />CHAPLIN.
          </h2>
          <p className="fm-fade font-body italic text-rojo text-lg md:text-xl">
            "No solo subimos a un escenario. Encontramos una familia."
          </p>
        </header>

        <div className="fm-mosaic grid grid-cols-2 md:grid-cols-4 grid-rows-[200px_200px_200px] md:grid-rows-[260px_260px] gap-3 mb-24">
          <div className="fm-photo relative overflow-hidden col-span-2 row-span-2 group">
            <img src={ensemble} alt="Elenco" loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-negro via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="font-display text-blanco text-2xl">EL ELENCO</p>
              <p className="font-body text-rojo text-xs uppercase tracking-[0.3em]">Temporada 2024</p>
            </div>
          </div>
          <div className="fm-photo relative overflow-hidden group">
            <img src={f1} alt="Camarín" loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
          </div>
          <div className="fm-photo relative overflow-hidden group">
            <img src={f3} alt="Dirección" loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-negro/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
              <p className="font-body italic text-blanco text-sm text-center">"Cada nota dirigida es una vida tocada."</p>
            </div>
          </div>
          <div className="fm-photo relative overflow-hidden col-span-2 group">
            <img src={f2} alt="Ensayo" loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-negro/80 via-transparent to-transparent" />
            <div className="absolute top-1/2 -translate-y-1/2 left-6 max-w-[60%]">
              <p className="font-display text-blanco text-2xl md:text-3xl leading-tight">DESPUÉS DEL TELÓN, LA RISA.</p>
            </div>
          </div>
        </div>

        {/* Testimonios */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <span className="block font-display text-rojo text-[100px] leading-none opacity-30 mb-4">"</span>
            <div className="relative min-h-[160px]">
              {testimonios.map((t, i) => (
                <div
                  key={i}
                  className={`transition-opacity duration-700 ${
                    i === idx ? "opacity-100 relative" : "opacity-0 absolute inset-0"
                  }`}
                >
                  <p className="font-body italic text-blanco text-lg md:text-2xl leading-relaxed mb-6 px-4">
                    {t.cita}
                  </p>
                  <p className="font-display text-rojo text-xl tracking-wider">— {t.nombre}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {testimonios.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Testimonio ${i + 1}`}
                  className={`w-8 h-[2px] transition-all duration-300 ${i === idx ? "bg-rojo" : "bg-gris-humo/50"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────────────────────── */
function NosotrosCta() {
  return (
    <section className="bg-negro py-24 lg:py-32 border-t border-gris-textura">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div>
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-4">Únete</p>
          <h2 className="font-display text-blanco text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
            ¿QUIERES SER<br />PARTE?
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/talleres" className="btn-rojo">
            Ver talleres
          </Link>
          <Link to="/contacto" className="btn-outline">
            Escribirnos
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function NosotrosPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>UNA FAMILIA<br />ARTÍSTICA<br /><span className="text-rojo">DESDE ICA.</span></>}
        subtitle="Somos una compañía teatral profesional que nació con la convicción de que el teatro transforma vidas, comunidades y ciudades."
        bg={ensemble}
      />
      <IdentidadSection />
      <Harold />
      <MisionVisionSection />
      <ValoresSection />
      <EcosistemaSection />
      <HistoriaSection />
      <FamiliaSection />
      <NosotrosCta />
    </PageLayout>
  );
}
