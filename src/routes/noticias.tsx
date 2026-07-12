import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import fesmicaImg from "@/assets/fesmica.jpg";
import { Newspaper, Mic2, MessageSquareQuote, Trophy, Award } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Noticias · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Críticas teatrales, entrevistas, comentarios de espectadores, premios y reconocimientos de Chaplin Grupo Cultural.",
      },
    ],
  }),
  component: NoticiasPage,
});

const categorias = [
  { icon: Newspaper, title: "Críticas teatrales", desc: "Reseñas de nuestras producciones publicadas por la prensa especializada." },
  { icon: Mic2, title: "Entrevistas", desc: "Conversaciones con nuestro elenco, dirección y equipo en radio, TV y medios digitales." },
  { icon: MessageSquareQuote, title: "Comentarios de espectadores", desc: "Lo que el público dice después de ver una obra de Chaplin." },
  { icon: Trophy, title: "Premios", desc: "Reconocimientos recibidos por nuestras producciones y nuestro equipo." },
  { icon: Award, title: "Oficio Crítico 2025", desc: "Reconocimiento del prestigioso portal nacional de crítica teatral." },
];

function CategoriasSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".nc-card",
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
        <header className="max-w-2xl mb-16">
          <p className="font-body uppercase tracking-[0.4em] text-rojo text-xs mb-5">Prensa y comunidad</p>
          <h2 className="font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            NOTICIAS Y<br />RECONOCIMIENTOS.
          </h2>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-textura">
          {categorias.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="nc-card bg-negro-suave p-8 lg:p-10">
                <Icon className="text-rojo mb-6" size={32} strokeWidth={1.2} />
                <h3 className="font-display text-blanco text-2xl mb-3">{c.title}</h3>
                <p className="font-body text-blanco/60 text-sm leading-relaxed mb-6">{c.desc}</p>
                <span className="font-body text-[11px] uppercase tracking-[0.25em] text-gris-humo">
                  Próximamente
                </span>
              </div>
            );
          })}
        </div>

        <p className="font-body text-blanco/50 text-sm text-center mt-16 max-w-xl mx-auto">
          Estamos reuniendo el material de prensa, entrevistas y reconocimientos de
          Chaplin Grupo Cultural. Vuelve pronto para ver las novedades.
        </p>
      </div>
    </section>
  );
}

function NoticiasPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>NOTICIAS.</>}
        subtitle="Críticas, entrevistas, comentarios del público y los reconocimientos que respaldan nuestro trabajo."
        bg={fesmicaImg}
      />
      <CategoriasSection />
    </PageLayout>
  );
}
