import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import ensemble from "@/assets/ensemble.jpg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/equipo")({
  head: () => ({
    meta: [
      { title: "Equipo · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Conoce al equipo humano detrás de Chaplin Grupo Cultural: dirección, producción, talleres y diseño.",
      },
    ],
  }),
  component: EquipoPage,
});

const equipo = [
  { nombre: "Jonathan López", cargo: "Gerente general" },
  { nombre: "Harold López", cargo: "Director general" },
  { nombre: "Yenny Huamani", cargo: "Directora de producción" },
  { nombre: "Daniela Lengua", cargo: "Directora de talleres" },
  { nombre: "Francia Reategui", cargo: "Diseñadora gráfica" },
  { nombre: "Gerson Juaze", cargo: "Realizador audiovisual" },
];

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function EquipoSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".eq-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
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
        <header className="max-w-3xl mb-20">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">La familia detrás del telón</p>
          <h2 className="font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8">
            NUESTRO<br />EQUIPO.
          </h2>
          <p className="font-body text-blanco/70 text-base leading-[1.8]">
            Detrás de cada aplauso, cada puesta en escena y cada clase, existe un motor
            humano que hace que la magia del teatro sea posible. Somos un grupo de
            profesionales apasionados, artistas comprometidos y docentes con una visión
            transformadora, unidos por la convicción de que el teatro es la herramienta
            más poderosa para cambiar nuestra realidad regional.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipo.map((p) => (
            <div
              key={p.nombre}
              className="eq-card group bg-negro-suave border border-gris-textura hover:border-rojo/40 transition-colors duration-500 p-8 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 border-2 border-rojo flex items-center justify-center bg-negro group-hover:bg-rojo transition-colors duration-500">
                <span className="font-display text-rojo group-hover:text-negro text-3xl transition-colors duration-500">
                  {iniciales(p.nombre)}
                </span>
              </div>
              <h3 className="font-display text-blanco text-2xl mb-1">{p.nombre}</h3>
              <p className="font-body text-rojo text-[12px] uppercase tracking-[0.2em]">{p.cargo}</p>
            </div>
          ))}
        </div>

        <p className="font-body text-blanco/50 text-sm text-center mt-16 max-w-2xl mx-auto">
          Presentamos a quienes, día a día, hacen que la pasión por el teatro sea
          nuestra forma de vivir.
        </p>
      </div>
    </section>
  );
}

function EquipoPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>DETRÁS DEL<br /><span className="text-rojo">TELÓN.</span></>}
        subtitle="Un equipo de profesionales apasionados unidos por la convicción de que el teatro transforma."
        bg={ensemble}
      />
      <EquipoSection />
    </PageLayout>
  );
}
