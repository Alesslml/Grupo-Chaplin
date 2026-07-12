import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import drama from "@/assets/show-drama.jpg";
import { Calendar, Clock, MapPin, Users, ChevronDown } from "lucide-react";

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
          "Baby Chaplin, Chaplin Kids, Chaplin Teens, Primer Acto y Taller de Montaje: la oferta real de talleres de teatro de Chaplin Grupo Cultural en Ica, Perú.",
      },
    ],
  }),
  component: TalleresPage,
});

interface Taller {
  nombre: string;
  instructor: string;
  edades: string;
  temporada: string;
  sesiones: string;
  clases: string;
  horario: string;
  sede: string;
  desc: string[];
  precioRegular?: string;
  precioPreventa?: string;
  preventaNota?: string;
  gratuito?: string;
}

const ninosYAdolescentes: Taller[] = [
  {
    nombre: "BABY CHAPLIN",
    instructor: "Francia Reategui",
    edades: "Para niños de 3 a 5 años",
    temporada: "Desde 2027",
    sesiones: "8 sesiones",
    clases: "Sábados y domingos",
    horario: "9:00 am – 10:00 am",
    sede: "Por confirmar",
    desc: [
      "¡El teatro comienza a despertar la imaginación! Baby Chaplin es un espacio creativo diseñado para niños de 3 a 5 años, donde el juego y la curiosidad son los protagonistas. Bajo la guía de Francia Reátegui, los más pequeños aprenderán a crear sus propias historias y personajes a través de una experiencia sensorial única: el uso de instrumentos y objetos cotidianos para construir mundos y atmósferas sonoras.",
      "Es una invitación a explorar, conectar y desarrollar la sensibilidad artística desde temprana edad, culminando con una muestra final en nuestra sede donde los pequeños artistas compartirán su talento. Todos los alumnos que completen el programa recibirán un certificado de participación.",
    ],
    precioRegular: "S/900",
    precioPreventa: "S/675",
    preventaNota: "Por confirmar",
  },
  {
    nombre: "CHAPLIN KIDS",
    instructor: "Francia Reategui",
    edades: "Para niños de 6 a 11 años",
    temporada: "Desde 2027",
    sesiones: "8 sesiones",
    clases: "Sábados y domingos",
    horario: "10:00 am – 11:30 am",
    sede: "Por confirmar",
    desc: [
      "¿Alguna vez te has detenido a observar cómo un niño convierte una caja de cartón en un castillo o un simple palo en una espada mágica? En Chaplin Kids no solo hacemos teatro; exploramos el poder transformador de ese lenguaje universal: el \"hagamos como si\".",
      "Nuestro taller, dirigido por Francia Reategui, parte de la premisa de que el juego es la forma más seria y profunda que tiene un niño para entender el mundo. A través de este concepto innato, los participantes de 6 a 11 años aprenden a relacionarse con otros, a gestionar sus emociones y a construir confianza en sí mismos, todo mientras se divierten.",
    ],
    precioRegular: "S/900",
    precioPreventa: "S/720",
    preventaNota: "Por confirmar",
  },
  {
    nombre: "TALLER CONVENIO SANLUISANO",
    instructor: "Harold López",
    edades: "Para estudiantes de 1ro a 5to de secundaria",
    temporada: "Desde 2025",
    sesiones: "Todo el año",
    clases: "Sábados y domingos",
    horario: "Sábados 2:30 pm – 4:30 pm · Domingos 9:00 am – 10:30 am",
    sede: "I.E. San Luis Gonzaga (frente al Soyuz)",
    desc: [
      "El Convenio SanLuisano, bajo la dirección de Harold López, te invita a formar parte de un espacio único de creación y expresión artística. Diseñado especialmente para estudiantes de 1ro a 5to de secundaria, este taller es el lugar donde podrás descubrir tu talento, vencer el miedo al público y desarrollar tu confianza, todo mientras haces nuevos amigos y exploras el mundo del teatro.",
      "Desde el 2025, venimos transformando la experiencia escolar a través del arte. Sin importar si es tu primera vez actuando o si ya tienes experiencia, aquí encontrarás un lugar para crecer, crear y ser tú mismo.",
    ],
    gratuito: "¡Totalmente gratis! (sujeto a los acuerdos del convenio institucional)",
  },
  {
    nombre: "CHAPLIN TEENS",
    instructor: "Harold López",
    edades: "Para adolescentes de 12 a 17 años",
    temporada: "Temporada invierno–primaveral: agosto – setiembre – octubre",
    sesiones: "24 sesiones",
    clases: "Sábados y domingos",
    horario: "Sábados 2:30 pm – 4:30 pm · Domingos 9:00 am – 10:30 am",
    sede: "I.E. San Luis Gonzaga",
    desc: [
      "La adolescencia es una etapa de búsqueda, de preguntas y, sobre todo, de ganas de descubrir quiénes somos. Chaplin Teens es un espacio diseñado para adolescentes que buscan más que una clase de actuación: buscan un lugar donde su opinión, su creatividad y su personalidad sean las protagonistas.",
      "Bajo la guía de Harold López, este taller utiliza el teatro como una herramienta de autodescubrimiento y liderazgo. Los participantes se sumergirán en un proceso dinámico de exploración teatral donde aprenderán a transformar su energía, vencer la timidez y construir personajes que, en el fondo, cuentan parte de su propia historia.",
    ],
    precioRegular: "S/900",
    precioPreventa: "S/720",
    preventaNota: "Por confirmar",
  },
];

const adultos: Taller[] = [
  {
    nombre: "PRIMER ACTO",
    instructor: "Harold López",
    edades: "Adultos de 18 a 85 años (principiantes o entusiastas con experiencia previa)",
    temporada: "Temporada primaveral: setiembre – octubre – noviembre",
    sesiones: "24 sesiones",
    clases: "Sábados y domingos",
    horario: "Sábados 6:30 pm – 8:00 pm · Domingos 11:40 am – 1:00 pm",
    sede: "Por confirmar",
    desc: [
      "¿Alguna vez sentiste que el escenario te esperaba, pero la vida tomó otro rumbo? Primer Acto es el refugio creativo para todos los adultos —de 18 a 85 años— que desean habitar el teatro desde cero, sin presiones y con total libertad.",
      "Bajo la dirección de Harold López, trabajaremos la desinhibición, el juego dramático y la expresión corporal, convirtiendo el espacio de ensayo en un lugar seguro para reconectar con tu creatividad y disfrutar del placer de crear junto a otros.",
    ],
    precioRegular: "S/1200",
    precioPreventa: "S/960",
    preventaNota: "Por confirmar",
  },
];

const montaje: Taller[] = [
  {
    nombre: "SHREK, El inicio de la aventura",
    instructor: "Harold López",
    edades: "Desde los 8 años (edades según el proyecto) · Nivel intermedio – avanzado",
    temporada: "Temporada invierno – primavera · Duración: 5 meses (agosto – diciembre)",
    sesiones: "30 sesiones",
    clases: "Sábados y domingos",
    horario: "Sábados 2:30 pm – 5:10 pm · Domingos 9:00 am – 10:20 am",
    sede: "Por confirmar",
    desc: [
      "¿Estás listo para dar vida al mundo fantástico de Duloc? Te invitamos a ser parte de una experiencia artística inmersiva diseñada para quienes desean experimentar el rigor, la disciplina y la magia de un montaje profesional. Bajo la guía de Harold López, este taller trasciende la formación convencional para convertirse en una verdadera compañía de teatro en proceso de producción.",
      "Durante 5 meses trabajaremos en un proceso intensivo de creación donde la disciplina y la técnica se encuentran para dar vida a personajes inolvidables, a través de 30 sesiones distribuidas los fines de semana.",
    ],
  },
];

const proximamente = [
  { nombre: "TALLER DE VOZ", instructor: "Andre Bonifaz" },
  { nombre: "TALLER DE BAILE", instructor: "Kevin Juaze" },
];

const faqs = [
  {
    q: "¿Necesito experiencia previa o ser actor para participar?",
    a: [
      "¡No, para nada! Nuestros talleres están diseñados para recibir a todos los entusiastas de las artes escénicas. En Chaplin Grupo Cultural creemos que el teatro es un lenguaje universal que todos podemos aprender y disfrutar.",
      "Si eres principiante: contamos con espacios pensados especialmente para quienes dan su primer paso, en un entorno seguro, paciente y libre de presiones.",
      "Si ya tienes experiencia: tenemos programas de nivel intermedio y avanzado para profundizar tu técnica y enfrentar los retos de un montaje profesional.",
    ],
  },
  {
    q: "¿Los talleres tienen una presentación final?",
    a: [
      "¡Claro que sí! Cada proceso creativo culmina con la alegría de compartirlo con el público.",
      "Talleres de Montaje: al ser proyectos de mayor envergadura, el gran estreno se realiza en un auditorio, con la experiencia completa de una temporada profesional.",
      "Talleres formativos: realizamos una muestra final en nuestra sede, donde los alumnos demuestran todo lo aprendido en un ambiente cercano y acogedor.",
    ],
  },
  {
    q: "¿Dónde se realizan las presentaciones?",
    a: [
      "Para la gran mayoría de nuestras presentaciones, el escenario elegido es el Auditorio del Colegio de Ingenieros de Ica, que nos permite contar con las condiciones técnicas y la capacidad necesarias para que cada montaje se luzca.",
    ],
  },
  {
    q: "¿Cuándo inician las inscripciones?",
    a: [
      "Contamos con talleres durante todo el año. Nuestras inscripciones se abren por temporadas, así que te recomendamos estar atento a nuestras redes y canales oficiales.",
      "Fechas aproximadas: Verano → desde mediados de noviembre · Otoño → desde marzo · Invierno → desde mediados de junio · Primavera → entre finales de agosto e inicios de setiembre.",
    ],
  },
  {
    q: "¿Ofrecen facilidades de pago?",
    a: [
      "Sí. Contamos con distintos medios de pago y facilidades según el tipo de taller. En los talleres regulares, el pago puede dividirse hasta en 2 cuotas tomando como referencia el precio regular. En talleres especializados o laboratorios, las cuotas pueden ampliarse según la duración del programa.",
    ],
  },
];

const infoGeneral = [
  { icon: Calendar, label: "Clases", value: "Sábados y domingos" },
  { icon: Clock, label: "Duración", value: "Según cada taller" },
  { icon: Users, label: "Grupos", value: "Reducidos y personalizados" },
  { icon: MapPin, label: "Sedes", value: "Ica · I.E. San Luis Gonzaga y más" },
];

/* ─── Card de un taller ───────────────────────────────────────────────────── */
function TallerCard({ t }: { t: Taller }) {
  const waMsg = encodeURIComponent(`Hola, quiero más información sobre el taller ${t.nombre}`);
  return (
    <div className="tl-row bg-negro-suave border border-gris-textura">
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-0">
        <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gris-textura">
          <h3 className="font-display text-blanco text-3xl md:text-4xl mb-1">{t.nombre}</h3>
          <p className="font-body italic text-rojo text-sm mb-6">con {t.instructor}</p>

          <ul className="space-y-3 mb-6">
            {[
              { icon: Users, text: t.edades },
              { icon: Calendar, text: t.temporada },
              { icon: Calendar, text: `${t.sesiones} · ${t.clases}` },
              { icon: Clock, text: t.horario },
              { icon: MapPin, text: t.sede },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <item.icon size={15} className="text-rojo mt-0.5 shrink-0" strokeWidth={1.5} />
                <span className="font-body text-blanco/70 text-[13px] leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>

          {t.gratuito ? (
            <p className="font-display text-rojo text-2xl">{t.gratuito}</p>
          ) : t.precioRegular ? (
            <div className="flex items-end gap-4">
              <div>
                <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-1">Preventa</p>
                <p className="font-display text-rojo text-3xl">{t.precioPreventa}</p>
              </div>
              <div>
                <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-1">Regular</p>
                <p className="font-display text-blanco/50 text-xl line-through">{t.precioRegular}</p>
              </div>
              {t.preventaNota && (
                <span className="font-body text-blanco/40 text-[11px] ml-auto">
                  *Preventa hasta: {t.preventaNota}
                </span>
              )}
            </div>
          ) : (
            <p className="font-body text-gris-humo text-[11px] uppercase tracking-[0.2em]">
              Precio: por confirmar
            </p>
          )}
        </div>

        <div className="p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-4 mb-8">
            {t.desc.map((p, i) => (
              <p key={i} className="font-body text-blanco/70 text-sm leading-[1.8]">{p}</p>
            ))}
          </div>
          <a
            href={`https://wa.me/51956060826?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rojo self-start"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Grupo de talleres ───────────────────────────────────────────────────── */
function GrupoTalleres({ eyebrow, title, items }: { eyebrow: string; title: React.ReactNode; items: Taller[] }) {
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
    <section ref={ref} className="bg-negro grain py-20 lg:py-28">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="max-w-2xl mb-14">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">{eyebrow}</p>
          <h2 className="font-display text-blanco text-4xl md:text-5xl lg:text-6xl leading-[0.95]">{title}</h2>
        </header>
        <div className="space-y-6">
          {items.map((t) => (
            <TallerCard key={t.nombre} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Próximamente ────────────────────────────────────────────────────────── */
function ProximamenteSection() {
  return (
    <section className="bg-negro-suave grain py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-8">Próximamente</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {proximamente.map((p) => (
            <div key={p.nombre} className="border border-dashed border-gris-textura p-8 opacity-70">
              <h3 className="font-display text-blanco text-2xl mb-1">{p.nombre}</h3>
              <p className="font-body italic text-blanco/50 text-sm">con {p.instructor}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────────────────────── */
function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-gris-claro py-24 lg:py-32 text-negro scroll-mt-24">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12">
        <header className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Resolvemos tus dudas</p>
          <h2 className="font-display text-negro text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
            PREGUNTAS<br />FRECUENTES.
          </h2>
        </header>

        <div className="space-y-px bg-negro/10">
          {faqs.map((f, i) => (
            <div key={f.q} className="bg-gris-claro">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <span className="font-display text-negro text-lg md:text-xl">{f.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-rojo shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  open === i ? "max-h-[600px]" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-6 space-y-3">
                  {f.a.map((p, j) => (
                    <p key={j} className="font-body text-gris-humo text-sm leading-[1.8]">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Info general / metodología ──────────────────────────────────────────── */
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
    <section ref={ref} className="bg-negro-suave grain py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gris-textura">
          {infoGeneral.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="info-card bg-negro-suave p-10 text-center">
                <Icon className="text-rojo mx-auto mb-5" size={36} strokeWidth={1.2} />
                <p className="font-body uppercase tracking-[0.3em] text-[10px] text-gris-humo mb-2">{item.label}</p>
                <p className="font-display text-blanco text-xl md:text-2xl leading-tight">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-20 items-center">
          <div>
            <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Nuestra metodología</p>
            <h2 className="font-display text-blanco text-4xl md:text-5xl lg:text-6xl leading-[0.95] mb-6">
              APRENDER<br />HACIENDO.
            </h2>
            <p className="font-body text-blanco/70 text-base leading-[1.8] mb-6">
              En Chaplin creemos que el aprendizaje escénico ocurre sobre las tablas, no en un aula. Nuestros
              talleres combinan teoría básica con práctica constante, y los alumnos más avanzados participan
              en producciones reales de la compañía.
            </p>
            <p className="font-body text-blanco/60 text-base leading-[1.8]">
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
          Las inscripciones abren por temporadas. Escríbenos para reservar tu lugar.
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
      <GrupoTalleres
        eyebrow="Para los más pequeños"
        title={<>NIÑOS Y<br />ADOLESCENTES.</>}
        items={ninosYAdolescentes}
      />
      <GrupoTalleres eyebrow="Nunca es tarde" title={<>TALLERES PARA<br />ADULTOS.</>} items={adultos} />
      <GrupoTalleres eyebrow="Nivel intermedio – avanzado" title={<>TALLER DE<br />MONTAJE.</>} items={montaje} />
      <ProximamenteSection />
      <InfoGeneral />
      <FaqSection />
      <InscripcionCta />
    </PageLayout>
  );
}
