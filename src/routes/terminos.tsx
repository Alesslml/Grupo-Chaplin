import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [{ title: "Términos y condiciones · Chaplin Grupo Cultural" }],
  }),
  component: TerminosPage,
});

function TerminosPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>TÉRMINOS Y<br />CONDICIONES.</>}
        subtitle="Estamos redactando esta sección junto a nuestro equipo legal."
      />
      <section className="bg-negro-suave grain py-28 lg:py-40">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 text-center">
          <p className="font-body text-blanco/70 text-base leading-[1.8] mb-8">
            Los términos y condiciones de Chaplin Grupo Cultural están en preparación.
            Mientras tanto, si tienes alguna consulta sobre inscripciones, funciones o
            políticas de compra, escríbenos directamente.
          </p>
          <a
            href="https://wa.me/51956060826"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rojo"
          >
            Escribir por WhatsApp
          </a>
          <div className="mt-10">
            <Link to="/" className="font-body text-blanco/50 text-sm hover:text-rojo transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
