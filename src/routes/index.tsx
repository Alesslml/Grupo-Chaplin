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

function Index() {
  return (
    <PageLayout>
      <Hero />
      <SeccionesTeasers />
      <ProximaFuncion />
      <Reconocimientos />
      <Aliados />
    </PageLayout>
  );
}
