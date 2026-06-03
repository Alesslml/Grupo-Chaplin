import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import drama from "@/assets/show-drama.jpg";
import { Mic, User, Music, Heart, Sparkles, Clock, Users, Calendar, CheckCircle } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/talleres")({
  head: () => ({
    meta: [
      { title: "Talleres · Escuela Chaplin" },
      {
        name: "description",
        content:
          "Escuela Chaplin: talleres de actuación, teatro musical, expresión corporal, desarrollo socioemocional y desinhibición escénica en Ica, Perú.",
      },
    ],
  }),
  component: TalleresPage,
});

const talleres = [
  {
    num: "01",
    icon: User,
    title: "Actuación",
    subtitle: "Construye personajes desde adentro",
    desc: "Aprende método, presencia y verdad escénica. Trabajamos el cuerpo, la voz y la psicología del personaje. Basado en técnicas de Stanislavski, Meisner y el teatro físico. Para quien quiere actuar de verdad.",
    beneficios: ["Construcción de personajes", "Técnica Meisner", "Escenas prácticas", "Monólogos y diálogos"],
    para: "Mayores de 15 años · Todos los niveles",
  },
  {
    num: "02",
    icon: Heart,
    title: "Expresión Corporal",
    subtitle: "Tu cuerpo cuenta historias antes que tu voz",
    desc: "Descúbrelo y entrénalo. Exploramos el movimiento, la danza, el gesto y el silencio como herramientas escénicas. Ideal para quienes quieren conectar con su cuerpo y comunicar sin palabras.",
    beneficios: ["Conciencia corporal", "Movimiento escénico", "Danza y ritmo", "Comunicación no verbal"],
    para: "Mayores de 12 años · Todos los niveles",
  },
  {
    num: "03",
    icon: Music,
    title: "Teatro Musical",
    subtitle: "Canto, baile y actuación: la tríada que enciende el escenario",
    desc: "El taller más completo de la Escuela Chaplin. Trabajamos las tres disciplinas del musical: voz, cuerpo y interpretación. Participarás en producciones reales de la compañía.",
    beneficios: ["Técnica vocal aplicada", "Baile y coreografía", "Actuación musical", "Producción en vivo"],
    para: "Mayores de 12 años · Nivel básico a avanzado",
  },
  {
    num: "04",
    icon: Sparkles,
    title: "Socioemocional",
    subtitle: "Habilidades para la vida",
    desc: "Escuchar, sostener y conectar con otros. Este taller usa el teatro como herramienta para desarrollar inteligencia emocional, empatía y liderazgo. Muy útil para estudiantes, docentes y profesionales.",
    beneficios: ["Inteligencia emocional", "Trabajo en equipo", "Comunicación asertiva", "Manejo del estrés"],
    para: "Mayores de 14 años · Todos los niveles",
  },
  {
    num: "05",
    icon: Mic,
    title: "Desinhibición Escénica",
    subtitle: "Pierde el miedo, gana presencia",
    desc: "Para quien quiere romper su muro. Este taller está diseñado para personas que sienten bloqueos al hablar en público o al expresarse. Sin juicios, sin vergüenza. Solo libertad y aprendizaje.",
    beneficios: ["Confianza escénica", "Oratoria y presencia", "Juego teatral", "Trabajo en grupo seguro"],
    para: "Mayores de 14 años · Sin experiencia previa",
  },
];

const infoGeneral = [
  { icon: Calendar, label: "Frecuencia", value: "1 sesión por semana" },
  { icon: Clock, label: "Duración", value: "3 meses por módulo" },
  { icon: Users, label: "Grupos", value: "Reducidos (máx. 15 personas)" },
  { icon: CheckCircle, label: "Nivel", value: "Todos los niveles" },
];

/* ─── Lista de talleres ───────────────────────────────────────────────────── */
function ListaTalleres() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tl-row",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-negro grain py-28 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="max-w-2xl mb-20">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Escuela Chaplin</p>
          <h2 className="font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            CINCO CAMINOS<br />AL ESCENARIO.
          </h2>
        </header>

        <div className="space-y-px">
          {talleres.map((t, i) => {
            const Icon = t.icon;
            return (
              <div
                key={t.title}
                className="tl-row group bg-negro-suave hover:bg-rojo transition-all duration-500 cursor-pointer"
              >
                <div className="grid lg:grid-cols-[auto_1fr_1fr] gap-0 items-start">
                  {/* Número + icono */}
                  <div className="p-8 lg:p-10 border-r border-gris-textura group-hover:border-negro/20 transition-colors duration-500 flex flex-col items-center justify-start gap-4 w-28">
                    <span className="font-display text-rojo group-hover:text-negro text-5xl leading-none transition-colors duration-500">
                      {t.num}
                    </span>
                    <Icon
                      className="text-gris-humo group-hover:text-negro/60 transition-colors duration-500"
                      size={28}
                      strokeWidth={1.2}
                    />
                  </div>

                  {/* Título + descripción */}
                  <div className="p-8 lg:p-10 border-r border-gris-textura group-hover:border-negro/20 transition-colors duration-500">
                    <h3 className="font-display text-blanco group-hover:text-negro text-4xl md:text-5xl mb-2 transition-colors duration-500">
                      {t.title}
                    </h3>
                    <p className="font-body italic text-rojo group-hover:text-negro/70 text-sm mb-5 transition-colors duration-500">
                      {t.subtitle}
                    </p>
                    <p className="font-body text-blanco/60 group-hover:text-negro/70 text-sm leading-[1.8] transition-colors duration-500 max-w-lg">
                      {t.desc}
                    </p>
                  </div>

                  {/* Beneficios + para quién */}
                  <div className="p-8 lg:p-10">
                    <p className="font-body uppercase tracking-[0.25em] text-gris-humo group-hover:text-negro/60 text-[10px] mb-4 transition-colors duration-500">
                      Aprenderás
                    </p>
                    <ul className="space-y-2 mb-8">
                      {t.beneficios.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-rojo group-hover:bg-negro rounded-full shrink-0 transition-colors duration-500" />
                          <span className="font-body text-blanco/70 group-hover:text-negro/70 text-[13px] transition-colors duration-500">
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-body text-gris-humo group-hover:text-negro/50 text-[11px] uppercase tracking-[0.2em] transition-colors duration-500">
                      {t.para}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Info general ────────────────────────────────────────────────────────── */
function InfoGeneral() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".info-card", {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-negro/10">
          {infoGeneral.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="info-card bg-gris-claro p-10 text-center">
                <Icon className="text-rojo mx-auto mb-5" size={36} strokeWidth={1.2} />
                <p className="font-body uppercase tracking-[0.3em] text-[10px] text-gris-humo mb-2">{item.label}</p>
                <p className="font-display text-negro text-2xl md:text-3xl leading-tight">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-20 items-center">
          <div>
            <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Nuestra metodología</p>
            <h2 className="font-display text-negro text-4xl md:text-5xl lg:text-6xl leading-[0.95] mb-6">
              APRENDER<br />HACIENDO.
            </h2>
            <p className="font-body text-negro/70 text-base leading-[1.8] mb-6">
              En Chaplin creemos que el aprendizaje escénico ocurre sobre las tablas, no en un aula. Nuestros
              talleres combinan teoría básica con práctica constante, y los alumnos más avanzados participan
              en producciones reales de la compañía.
            </p>
            <p className="font-body text-negro/60 text-base leading-[1.8]">
              Los grupos son pequeños para garantizar una atención personalizada. Cada alumno tiene un
              proceso propio y lo respetamos.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={drama}
              alt="Ensayo en Escuela Chaplin"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-negro/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA inscripción ─────────────────────────────────────────────────────── */
function InscripcionCta() {
  return (
    <section className="bg-rojo py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
        <p className="font-body uppercase tracking-[0.4em] text-negro text-xs mb-6">Próxima apertura</p>
        <h2 className="font-display text-negro text-5xl md:text-7xl lg:text-[88px] leading-[0.9] mb-8">
          EL ESCENARIO<br />TE ESPERA.
        </h2>
        <p className="font-body text-negro/80 text-lg mb-10 max-w-lg mx-auto">
          Las inscripciones abren al inicio de cada módulo trimestral. Escríbenos para reservar tu lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/51956060826?text=Hola,%20quiero%20inscribirme%20en%20un%20taller"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-negro"
          >
            Inscribirme ahora
          </a>
          <Link to="/contacto" className="btn-outline" style={{ borderColor: "#000", color: "#000" }}>
            Más información
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function TalleresPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Escuela Chaplin"
        title={<>FORMA TU VOZ,<br />TU CUERPO,<br /><span className="text-rojo">TU ESCENA.</span></>}
        subtitle="Aquí no solo aprendes a actuar. Aprendes a expresarte, a escuchar, a ser. Talleres profesionales en Ica para todos los niveles."
        bg={drama}
      />
      <ListaTalleres />
      <InfoGeneral />
      <InscripcionCta />
    </PageLayout>
  );
}
