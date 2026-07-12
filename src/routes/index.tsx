import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { Hero } from "@/components/chaplin/Hero";
import { ProximaFuncion } from "@/components/chaplin/ProximaFuncion";
import { Reconocimientos } from "@/components/chaplin/Reconocimientos";
import { Aliados } from "@/components/chaplin/Aliados";
import ensemble from "@/assets/ensemble.jpg";
import musicalImg from "@/assets/show-musical.jpg";
import dramaImg from "@/assets/show-drama.jpg";
import fesmicaImg from "@/assets/fesmica.jpg";
import { Camera, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chaplin Grupo Cultural · Teatro que transforma desde Ica" },
      {
        name: "description",
        content:
          "Compañía teatral profesional de Ica, Perú. Más de 20 producciones, talleres de actuación y el festival FESMICA.",
      },
      { property: "og:title", content: "Chaplin Grupo Cultural · Teatro que transforma" },
      { property: "og:description", content: "Una familia artística desde Ica para el Perú." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const secciones = [
  {
    to: "/nosotros" as const,
    eyebrow: "Quiénes somos",
    title: "UNA FAMILIA\nARTÍSTICA",
    desc: "6 años transformando el teatro desde Ica. Historia, misión y las personas detrás del telón.",
    img: ensemble,
  },
  {
    to: "/producciones" as const,
    eyebrow: "Nuestro repertorio",
    title: "20+\nPRODUCCIONES",
    desc: "Desde musicales que encienden butacas hasta dramas que detienen la respiración.",
    img: musicalImg,
  },
  {
    to: "/talleres" as const,
    eyebrow: "Escuela Chaplin",
    title: "FORMA\nTU VOZ",
    desc: "Actuación, teatro musical, expresión corporal y más. Cinco caminos al escenario.",
    img: dramaImg,
  },
  {
    to: "/fesmica" as const,
    eyebrow: "Nuestro festival",
    title: "FESMICA",
    desc: "El Festival de Microteatro de Ica que Chaplin creó para el Perú. Íntimo, fugaz, eléctrico.",
    img: fesmicaImg,
  },
];

function SeccionesTeasers() {
  return (
    <section className="bg-negro">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gris-textura">
        {secciones.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group relative aspect-[4/3] overflow-hidden block"
          >
            <img
              src={s.img}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-negro/65 group-hover:bg-negro/45 transition-colors duration-500" />

            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end">
              <p className="font-body uppercase tracking-[0.35em] text-rojo text-[10px] mb-3">
                {s.eyebrow}
              </p>
              <h2 className="font-display text-blanco text-4xl md:text-5xl lg:text-[52px] leading-[0.9] mb-4 whitespace-pre-line">
                {s.title}
              </h2>
              <p className="font-body text-blanco/65 text-sm leading-relaxed mb-6 max-w-sm">
                {s.desc}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-body text-[11px] uppercase tracking-[0.3em] text-blanco group-hover:text-rojo transition-colors duration-300">
                  Explorar
                </span>
                <span className="h-px w-8 bg-rojo group-hover:w-16 transition-all duration-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Misión, visión y frase de Chaplin ──────────────────────────────────── */
function SobreChaplinSection() {
  return (
    <section className="bg-negro grain py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <p className="font-body italic text-rojo text-lg md:text-2xl text-center max-w-2xl mx-auto mb-16">
          "Un día sin reír es un día perdido." — Charles Chaplin
        </p>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-16">
          <div>
            <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-4">Misión</p>
            <p className="font-body text-blanco/75 text-base leading-[1.8]">
              Impulsar y promover el desarrollo del teatro y las artes escénicas en la
              región Ica, brindando una formación artística integral e inclusiva. Busca
              formar actores, directores y productores priorizando la disciplina, el
              desarrollo de habilidades blandas y el talento por encima de barreras
              económicas.
            </p>
          </div>
          <div>
            <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-4">Visión</p>
            <p className="font-body text-blanco/75 text-base leading-[1.8]">
              Consolidarse como un referente cultural a nivel nacional, destacando por la
              calidad de sus puestas en escena. Su meta principal es fortalecer y
              democratizar la actividad teatral en una región con escasa infraestructura,
              inspirando a nuevas generaciones mediante el arte.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="font-body text-blanco/60 text-sm max-w-xl mx-auto mb-6">
            Chaplin Grupo Cultural nació en Ica en 2019 con la convicción de que el teatro
            transforma vidas, comunidades y ciudades. Hoy somos más de 20 producciones y
            6 años de historia después.
          </p>
          <Link to="/nosotros" className="btn-outline">
            Más información
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ + comunidad ─────────────────────────────────────────────────────── */
function ComunidadSection() {
  return (
    <section className="bg-gris-claro py-20 lg:py-28 text-negro">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-10">
        <div className="flex items-start gap-5 border-l-2 border-rojo pl-6">
          <HelpCircle className="text-rojo shrink-0 mt-1" size={28} strokeWidth={1.5} />
          <div>
            <h3 className="font-display text-negro text-2xl mb-2">¿Tienes dudas?</h3>
            <p className="font-body text-gris-humo text-sm mb-4 leading-relaxed">
              Respondemos las preguntas más frecuentes sobre nuestros talleres y funciones.
            </p>
            <Link to="/talleres" hash="faq" className="font-body text-[12px] uppercase tracking-[0.25em] text-rojo hover:text-negro transition-colors">
              Ver preguntas frecuentes →
            </Link>
          </div>
        </div>

        <div className="flex items-start gap-5 border-l-2 border-rojo pl-6">
          <Camera className="text-rojo shrink-0 mt-1" size={28} strokeWidth={1.5} />
          <div>
            <h3 className="font-display text-negro text-2xl mb-2">¿Viste alguna de nuestras obras?</h3>
            <p className="font-body text-gris-humo text-sm mb-4 leading-relaxed">
              Déjanos tu comentario y/o tu foto. Nos encanta saber cómo viviste la función.
            </p>
            <a
              href="https://wa.me/51956060826?text=Hola,%20quiero%20dejarles%20un%20comentario%20sobre%20una%20de%20sus%20obras"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[12px] uppercase tracking-[0.25em] text-rojo hover:text-negro transition-colors"
            >
              Escribir por WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <PageLayout>
      <Hero />
      <SeccionesTeasers />
      <ProximaFuncion />
      <SobreChaplinSection />
      <Reconocimientos />
      <Aliados />
      <ComunidadSection />
    </PageLayout>
  );
}
