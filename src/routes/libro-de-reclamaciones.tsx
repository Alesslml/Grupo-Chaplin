import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";

export const Route = createFileRoute("/libro-de-reclamaciones")({
  head: () => ({
    meta: [{ title: "Libro de Reclamaciones · Chaplin Grupo Cultural" }],
  }),
  component: LibroReclamacionesPage,
});

function LibroReclamacionesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>LIBRO DE<br />RECLAMACIONES.</>}
        subtitle="Nuestro libro de reclamaciones virtual está en implementación."
      />
      <section className="bg-negro-suave grain py-28 lg:py-40">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 text-center">
          <p className="font-body text-blanco/70 text-base leading-[1.8] mb-8">
            Estamos habilitando nuestro Libro de Reclamaciones virtual conforme a la
            normativa vigente. Mientras se publica, puedes hacernos llegar tu queja o
            reclamo directamente por WhatsApp y lo atenderemos a la brevedad.
          </p>
          <a
            href="https://wa.me/51956060826?text=Hola,%20quiero%20presentar%20un%20reclamo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rojo"
          >
            Presentar un reclamo por WhatsApp
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
