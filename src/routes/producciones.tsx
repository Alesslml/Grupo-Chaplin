import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import musical from "@/assets/show-musical.jpg";
import drama from "@/assets/show-drama.jpg";
import family from "@/assets/show-family.jpg";
import comedy from "@/assets/show-comedy.jpg";
import king from "@/assets/show-king.jpg";
import sing from "@/assets/show-sing.jpg";
import { X, ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/producciones")({
  head: () => ({
    meta: [
      { title: "Producciones · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Más de 20 producciones llevadas al escenario. Musicales, dramas, comedias y obras familiares que han definido el teatro en Ica.",
      },
    ],
  }),
  component: ProduccionesPage,
});

type Tipo = "Todos" | "Musical" | "Drama" | "Comedia" | "Familiar";

interface Obra {
  title: string;
  year: string;
  tipo: Tipo;
  img: string;
  tag?: string;
  autores: string;
  director: string;
  sinopsis: string;
  canciones?: string[];
  elenco?: { personaje: string; actor: string }[];
}

const obras: Obra[] = [
  /* ── Temporada 2026 ── */
  {
    title: "Heathers · El Musical",
    year: "2026",
    tipo: "Musical",
    img: musical,
    tag: "ESTRENO",
    autores: "Kevin Murphy y Laurence O'Keefe",
    director: "Harold López Segovia",
    sinopsis:
      "Bienvenidos a Westerburg High, donde la popularidad es una cuestión de supervivencia. Las Heathers —el trío de reinas más despiadadas del instituto— dominan cada pasillo. Cuando la joven Verónica Sawyer logra infiltrarse en su círculo de poder, la llegada del misterioso J.D. lo cambia todo. A ritmo de rock vibrante y humor negro, Heathers nos sumerge en una lucha feroz por la identidad y nos obliga a preguntarnos: ¿qué precio estamos dispuestos a pagar por encajar?",
    canciones: [
      "Hermoso", "Escuadrón", "Lucharás por mí", "Congélate",
      "Es una fiesta", "Chica muerta", "Quién soy en realidad",
      "De nada", "Nuestro amor es Dios", "Diecisiete", "Brillar",
      "Digo No", "Mi novio del Kinder", "Hey Chica", "Tuyo",
    ],
    elenco: [
      { personaje: "Heather Chandler", actor: "Asiul Ayala Arias" },
      { personaje: "Heather Duke", actor: "Esther Garavito Huaroto" },
      { personaje: "Heather McNamara", actor: "Angelina Rosas Llerena" },
      { personaje: "Verónica Sawyer", actor: "Daniela Lengua Mendez" },
      { personaje: "Jason Dean (J.D.)", actor: "Gabriel Zárate Domínguez" },
      { personaje: "Martha López", actor: "Francia Reategui Vera" },
      { personaje: "Kurt Kelly", actor: "Cesar Alvarado Guevara" },
      { personaje: "Ram Sweney", actor: "Heber Martínez Maestre" },
    ],
  },
  {
    title: "SING, Ven y Canta",
    year: "2026",
    tipo: "Musical",
    img: sing,
    tag: "PRÓXIMA",
    autores: "Chaplin Grupo Cultural",
    director: "Gerson Juaze y Harold López",
    sinopsis:
      "Un musical que celebra la voz como herramienta de encuentro: canto, comunidad y la invitación a subir al escenario a cantar junto al elenco. Sábado 15 de agosto de 2026.",
  },
  {
    title: "Jesucristo Rockstar",
    year: "2026",
    tipo: "Musical",
    img: king,
    tag: "PRÓXIMA",
    autores: "Andrew Lloyd Webber y Tim Rice",
    director: "Harold López Segovia",
    sinopsis:
      "El clásico rock-ópera que narra los últimos días de Jesucristo desde la mirada humana de sus discípulos, especialmente Judas. Rock, fe y escena en una sola noche. Octubre de 2026.",
  },
  {
    title: "SHREK, El inicio de la aventura",
    year: "2026",
    tipo: "Familiar",
    img: family,
    tag: "PRÓXIMA",
    autores: "Basado en DreamWorks",
    director: "Harold López Segovia",
    sinopsis:
      "El ogro más querido del cine llega al escenario iqueño en una aventura familiar sobre la amistad, la aceptación y encontrar la belleza donde menos se espera. Diciembre de 2026.",
  },

  /* ── 2025 ── */
  {
    title: "GREASE, El musical",
    year: "2025",
    tipo: "Musical",
    img: musical,
    autores: "Jim Jacobs y Warren Casey",
    director: "Yerson Luján",
    sinopsis:
      "Los años 50, el amor adolescente y el rock and roll se encuentran en Rydell High. Danny y Sandy protagonizan el musical juvenil más icónico de todos los tiempos.",
  },
  {
    title: "El Rey León",
    year: "2025",
    tipo: "Musical",
    img: king,
    autores: "Elton John y Tim Rice",
    director: "Harold López Segovia",
    sinopsis:
      "El clásico eterno de Elton John y Tim Rice cobró vida sobre el escenario iqueño. Simba, Mufasa, Scar y todo el orgullo de las tierras salvajes en una producción que emocionó a público de todas las edades.",
    canciones: [
      "El círculo de la vida", "Yo voy a ser el rey", "¿Puedo sentirme el amor esta noche?",
      "Hakuna Matata", "Somos uno", "El tiempo de esperar",
    ],
  },
  {
    title: "Tus Amigos Nunca Te Harían Daño",
    year: "2025",
    tipo: "Drama",
    img: drama,
    autores: "Chaplin Grupo Cultural",
    director: "Harold López Segovia",
    sinopsis: "Sinopsis próximamente.",
  },

  /* ── 2024 ── */
  {
    title: "Hércules",
    year: "2024",
    tipo: "Musical",
    img: musical,
    autores: "Alan Menken · Disney",
    director: "Carlos Espino",
    sinopsis:
      "El semidiós griego criado entre mortales busca demostrar que es un verdadero héroe para recuperar su lugar en el Olimpo. Acción, mitología y humor en un musical familiar.",
  },
  {
    title: "El Gran Showman",
    year: "2024",
    tipo: "Musical",
    img: sing,
    autores: "Benj Pasek y Justin Paul",
    director: "Harold López Segovia",
    sinopsis:
      "Inspirado en la historia de P.T. Barnum, este espectáculo celebra a quienes no encajan, a los que sueñan en grande y a los que construyen un circo con su valentía.",
    canciones: [
      "The Greatest Show", "A Million Dreams", "Come Alive",
      "This Is Me", "The Other Side", "Rewrite the Stars",
    ],
  },
  {
    title: "Camino a OZ",
    year: "2024",
    tipo: "Familiar",
    img: family,
    autores: "Basado en El Mago de Oz",
    director: "Daniela Lengua",
    sinopsis: "Sinopsis próximamente.",
  },
  {
    title: "Él me mintió (3ra temporada)",
    year: "2024",
    tipo: "Comedia",
    img: comedy,
    autores: "Basado en el musical MENTIRAS",
    director: "Harold López Segovia",
    sinopsis:
      "Tercera temporada de la comedia de enredos que consolidó a Chaplin en Ica, con nuevas complicaciones y el mismo ingenio de siempre.",
  },
  {
    title: "El Grinch",
    year: "2024",
    tipo: "Familiar",
    img: family,
    autores: "Basado en Dr. Seuss",
    director: "Harold López Segovia",
    sinopsis:
      "El personaje que odia la Navidad se propone arruinarla en Villa Quién, hasta que descubre que la Navidad puede significar algo más.",
  },

  /* ── 2023 ── */
  {
    title: "Encanto",
    year: "2023",
    tipo: "Familiar",
    img: family,
    autores: "Lin-Manuel Miranda · Disney",
    director: "Harold López Segovia",
    sinopsis:
      "La familia Madrigal vive en una casa mágica en las montañas de Colombia. Cada miembro tiene un don extraordinario... excepto Mirabel, quien tendrá que salvar la magia de la casa.",
    canciones: [
      "Surface Pressure", "What Else Can I Do?", "We Don't Talk About Bruno",
      "Waiting on a Miracle", "Colombia, mi encanto",
    ],
  },
  {
    title: "Mamma Mia",
    year: "2023",
    tipo: "Musical",
    img: musical,
    autores: "Catherine Johnson · Música: ABBA",
    director: "Harold López Segovia",
    sinopsis:
      "El musical definitivo de ABBA. Sophie está a punto de casarse y quiere que su padre la lleve al altar, pero no sabe quién es, entre tres posibles candidatos.",
    canciones: [
      "Dancing Queen", "Mamma Mia", "The Winner Takes It All",
      "Super Trouper", "Voulez-Vous", "Fernando", "Gimme! Gimme! Gimme!",
    ],
  },
  {
    title: "Él me mintió (2da temporada)",
    year: "2023",
    tipo: "Comedia",
    img: comedy,
    autores: "Basado en el musical MENTIRAS",
    director: "Harold López Segovia",
    sinopsis: "Segunda temporada de la comedia de enredos amorosos que ya era un éxito consolidado en Ica.",
  },

  /* ── 2022 ── */
  {
    title: "Él me mintió (1ra temporada)",
    year: "2022",
    tipo: "Comedia",
    img: comedy,
    autores: "Basado en el musical MENTIRAS",
    director: "Harold López Segovia",
    sinopsis:
      "La producción que consolidó a Chaplin en Ica. Esta comedia de enredos amorosos fue la primera en demostrar que el teatro local podía llenar funciones de manera sostenida.",
  },
  {
    title: "TOC TOC (2da temporada)",
    year: "2022",
    tipo: "Comedia",
    img: comedy,
    autores: "Laurent Baffie",
    director: "Harold López Segovia",
    sinopsis:
      "Seis pacientes con Trastorno Obsesivo Compulsivo coinciden en la sala de espera de un psiquiatra que nunca llega. Una comedia sobre nuestras rarezas, con ternura y carcajadas.",
  },
  {
    title: "COCO, El musical",
    year: "2022",
    tipo: "Familiar",
    img: family,
    autores: "Adrian Molina · Disney / Pixar",
    director: "Harold López Segovia",
    sinopsis:
      "Miguel sueña con ser músico, pero su familia lo tiene prohibido. En el Día de los Muertos cruza a la Tierra de los Muertos en busca de su tatarabuelo.",
    canciones: [
      "Recuérdame", "La Llorona", "Un poco loco",
      "Proud Corazón", "Mucho más que tú",
    ],
  },

  /* ── 2021 ── */
  {
    title: "Me-estresas",
    year: "2021",
    tipo: "Comedia",
    img: comedy,
    autores: "Chaplin Grupo Cultural",
    director: "Harold López y Thalia Castillon",
    sinopsis: "Sinopsis próximamente.",
  },

  /* ── 2020 (microteatro virtual) ── */
  {
    title: "El Bucle",
    year: "2020",
    tipo: "Drama",
    img: drama,
    tag: "MICROTEATRO VIRTUAL",
    autores: "Chaplin Grupo Cultural",
    director: "Harold López Segovia",
    sinopsis: "Sinopsis próximamente.",
  },
  {
    title: "El Purgatorio",
    year: "2020",
    tipo: "Drama",
    img: drama,
    tag: "MICROTEATRO VIRTUAL",
    autores: "Chaplin Grupo Cultural",
    director: "Harold López Segovia",
    sinopsis: "Sinopsis próximamente.",
  },
  {
    title: "Dos para el camino",
    year: "2020",
    tipo: "Drama",
    img: drama,
    tag: "MICROTEATRO VIRTUAL",
    autores: "Chaplin Grupo Cultural",
    director: "Harold López Segovia",
    sinopsis: "Sinopsis próximamente.",
  },

  /* ── 2019 (fundación) ── */
  {
    title: "TOC TOC (1ra temporada)",
    year: "2019",
    tipo: "Comedia",
    img: comedy,
    tag: "OASIS",
    autores: "Laurent Baffie",
    director: "Harold López Segovia",
    sinopsis:
      "Seis pacientes con Trastorno Obsesivo Compulsivo coinciden en la sala de espera de un psiquiatra que nunca llega. La primera temporada de la comedia más aplaudida de Chaplin.",
  },
  {
    title: "LARCO, El musical",
    year: "2019",
    tipo: "Musical",
    img: musical,
    autores: "Chaplin Grupo Cultural",
    director: "Harold López Segovia",
    sinopsis: "Sinopsis próximamente.",
  },
];

// Año más reciente primero. parseInt toma el primer año en rangos tipo "2020–2022".
const obrasOrdenadas = [...obras].sort((a, b) => parseInt(b.year) - parseInt(a.year));

const filtros: Tipo[] = ["Todos", "Musical", "Drama", "Comedia", "Familiar"];

const stats = [
  { value: "20+", label: "Producciones" },
  { value: "6+", label: "Años en escena" },
  { value: "100%", label: "Iqueños" },
  { value: "∞", label: "Historias por contar" },
];

/* ─── Card de obra expandible ─────────────────────────────────────────────── */
function ObraCard({ obra, isOpen, onToggle }: {
  obra: Obra;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="obra-card group relative overflow-hidden bg-negro border border-gris-textura hover:border-rojo/40 transition-colors duration-500">
      {/* Imagen principal */}
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={onToggle}>
        <img
          src={obra.img}
          alt={obra.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/40 to-transparent" />
        <div className="absolute inset-0 bg-negro/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {obra.tag && (
          <div className="absolute top-4 right-4 bg-rojo px-3 py-1">
            <span className="font-body text-negro text-[10px] font-bold uppercase tracking-[0.2em]">{obra.tag}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-body text-rojo text-[10px] uppercase tracking-[0.3em]">{obra.year}</span>
            <span className="w-1 h-1 bg-rojo rounded-full" />
            <span className="font-body text-blanco/80 text-[10px] uppercase tracking-[0.3em]">{obra.tipo}</span>
          </div>
          <h3 className="font-display text-blanco text-2xl md:text-3xl leading-none mb-3">{obra.title}</h3>

          <div className="flex items-center gap-2 text-blanco/60 hover:text-rojo transition-colors duration-300">
            <span className="font-body text-[11px] uppercase tracking-[0.25em]">
              {isOpen ? "Cerrar" : "Ver detalles"}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Panel expandible con info */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 border-t border-gris-textura bg-negro-suave space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-1">Autores</p>
              <p className="font-body text-blanco text-sm">{obra.autores}</p>
            </div>
            <div>
              <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-1">Dirección</p>
              <p className="font-body text-blanco text-sm">{obra.director}</p>
            </div>
          </div>

          {/* Sinopsis */}
          <div>
            <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-2">Sinopsis</p>
            <p className="font-body text-blanco/70 text-sm leading-[1.8]">{obra.sinopsis}</p>
          </div>

          {/* Elenco (si hay) */}
          {obra.elenco && obra.elenco.length > 0 && (
            <div>
              <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-3">Elenco principal</p>
              <div className="grid grid-cols-2 gap-1">
                {obra.elenco.map((e) => (
                  <div key={e.personaje} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-rojo rounded-full mt-2 shrink-0" />
                    <div>
                      <p className="font-body text-blanco text-[12px]">{e.actor}</p>
                      <p className="font-body text-gris-humo text-[11px]">{e.personaje}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canciones (si hay) */}
          {obra.canciones && obra.canciones.length > 0 && (
            <div>
              <p className="font-body uppercase tracking-[0.25em] text-gris-humo text-[10px] mb-3">Canciones destacadas</p>
              <div className="flex flex-wrap gap-2">
                {obra.canciones.map((c) => (
                  <span
                    key={c}
                    className="font-body text-[11px] text-blanco/70 border border-gris-textura px-3 py-1"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── Stats bar ───────────────────────────────────────────────────────────── */
function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gris-textura mt-20">
      {stats.map((s) => (
        <div key={s.label} className="stat-item bg-negro-suave py-12 px-8 text-center">
          <p className="font-display text-rojo text-5xl md:text-6xl mb-3">{s.value}</p>
          <p className="font-body text-blanco/60 text-[11px] uppercase tracking-[0.3em]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function ProduccionesPage() {
  const [filtro, setFiltro] = useState<Tipo>("Todos");
  const [obraAbierta, setObraAbierta] = useState<string | null>(null);

  const filtered = filtro === "Todos" ? obrasOrdenadas : obrasOrdenadas.filter((o) => o.tipo === filtro);

  const toggleObra = (title: string) => {
    setObraAbierta((prev) => (prev === title ? null : title));
  };

  return (
    <PageLayout>
      <PageHero
        eyebrow="Nuestro repertorio"
        title={<>CADA OBRA,<br />UN UNIVERSO.</>}
        subtitle="Más de veinte producciones llevadas al escenario desde 2019. Cada una, una promesa al público de Ica."
        bg={musical}
      />

      <section className="bg-negro-suave grain py-28 lg:py-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-16">
            {filtros.map((f) => (
              <button
                key={f}
                onClick={() => { setFiltro(f); setObraAbierta(null); }}
                className={`font-body text-[12px] uppercase tracking-[0.25em] px-6 py-3 border transition-all duration-300 ${
                  filtro === f
                    ? "bg-rojo border-rojo text-negro font-bold"
                    : "bg-transparent border-gris-textura text-blanco/70 hover:border-rojo hover:text-rojo"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((o) => (
              <ObraCard
                key={o.title}
                obra={o}
                isOpen={obraAbierta === o.title}
                onToggle={() => toggleObra(o.title)}
              />
            ))}
          </div>

          <StatsBar />

          {/* CTA */}
          <div className="text-center mt-20">
            <p className="font-body text-blanco/50 text-sm mb-6">
              ¿Quieres ver a Chaplin en escena?
            </p>
            <Link to="/contacto" className="btn-rojo">
              Consultá por funciones
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
