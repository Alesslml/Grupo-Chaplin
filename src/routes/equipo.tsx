import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import ensemble from "@/assets/team-gala.jpg";
import { Harold } from "@/components/chaplin/Harold";
import { Jonathan } from "@/components/chaplin/Jonathan";

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
    <section ref={ref} className="bg-negro grain pt-28 lg:pt-40 pb-4">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <header className="max-w-3xl">
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
      <Harold />
      <Jonathan />
      <section className="bg-negro grain py-16">
        <p className="font-body text-blanco/50 text-sm text-center max-w-2xl mx-auto px-6">
          Presentamos a quienes, día a día, hacen que la pasión por el teatro sea
          nuestra forma de vivir.
        </p>
      </section>
    </PageLayout>
  );
}
