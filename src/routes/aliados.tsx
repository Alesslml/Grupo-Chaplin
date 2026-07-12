import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import { Aliados as AliadosGrid } from "@/components/chaplin/Aliados";
import ensemble from "@/assets/ensemble.jpg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/aliados")({
  head: () => ({
    meta: [
      { title: "Aliados · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Empresas y organizaciones que apuestan por la cultura junto a Chaplin Grupo Cultural. Súmate como aliado.",
      },
    ],
  }),
  component: AliadosPage,
});

/* ─── Formulario de contacto para aliados ─────────────────────────────────── */
function ApoyoSection() {
  const ref = useRef<HTMLElement>(null);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    empresa: "",
    consultas: "",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".ap-fade",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hola, soy ${form.nombre} ${form.apellido}, de la empresa ${form.empresa}.\nQuiero conversar sobre una posible alianza con Chaplin Grupo Cultural.\n${form.consultas}\nContacto: ${form.correo}`
    );
    window.open(`https://wa.me/51956060826?text=${text}`, "_blank");
    setEnviado(true);
  };

  const inputClass =
    "w-full bg-negro/60 border-2 border-blanco/25 focus:border-rojo outline-none px-4 py-3 font-body text-blanco text-base placeholder:text-blanco/50 transition-colors duration-300";
  const labelClass = "font-body text-[11px] uppercase tracking-[0.3em] text-blanco/80 block mb-2";

  return (
    <section ref={ref} className="bg-negro-suave grain py-28 lg:py-40">
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 text-center">
        <p className="ap-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">Súmate</p>
        <h2 className="ap-fade font-display text-blanco text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8">
          ¿QUIERES APOYAR<br />AL TEATRO?
        </h2>
        <p className="ap-fade font-body text-blanco/70 text-base leading-[1.8] mb-14 max-w-lg mx-auto">
          Contáctanos para coordinar una reunión y conversar sobre posibles alianzas con
          nuestra organización.
        </p>

        {enviado ? (
          <div className="ap-fade py-10">
            <p className="font-display text-rojo text-7xl mb-6">✓</p>
            <h3 className="font-display text-blanco text-3xl mb-4">¡Gracias por escribirnos!</h3>
            <p className="font-body text-blanco/70">Te responderemos a la brevedad.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ap-fade space-y-6 text-left">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" name="nombre" required value={form.nombre} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Apellido *</label>
                <input type="text" name="apellido" required value={form.apellido} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Correo electrónico *</label>
                <input type="email" name="correo" required value={form.correo} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Empresa *</label>
                <input type="text" name="empresa" required value={form.empresa} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Consultas</label>
              <textarea name="consultas" rows={4} value={form.consultas} onChange={handleChange} className={`${inputClass} resize-none`} />
            </div>
            <button type="submit" className="btn-rojo w-full justify-center py-4">
              Enviar
            </button>
            <p className="font-body text-blanco/60 text-xs text-center">
              Al enviar se abrirá WhatsApp con tu mensaje listo para confirmar.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

function AliadosPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>ALIADOS QUE<br />APUESTAN POR<br /><span className="text-rojo">LA CULTURA.</span></>}
        subtitle="Empresas y organizaciones que creen en el teatro como motor de transformación social en Ica."
        bg={ensemble}
      />
      <AliadosGrid />
      <ApoyoSection />
    </PageLayout>
  );
}
