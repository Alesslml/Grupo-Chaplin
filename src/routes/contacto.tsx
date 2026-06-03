import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Escríbenos por WhatsApp o Instagram. Chaplin Grupo Cultural · Ica, Perú · 956 060 826.",
      },
    ],
  }),
  component: ContactoPage,
});

const canales = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "956 060 826",
    sub: "Respuesta en menos de 24 horas",
    href: "https://wa.me/51956060826",
    cta: "Escribir ahora",
  },
  {
    icon: Instagram,
    title: "Instagram",
    value: "@chaplin.grupocultural",
    sub: "Síguenos para novedades",
    href: "https://instagram.com/chaplin.grupocultural",
    cta: "Ir al perfil",
  },
  {
    icon: Facebook,
    title: "Facebook",
    value: "Chaplin Grupo Cultural",
    sub: "Eventos y funciones",
    href: "https://facebook.com/chaplingrupocultural",
    cta: "Ver página",
  },
  {
    icon: MapPin,
    title: "Ubicación",
    value: "Ica, Perú",
    sub: "Teatro Municipal y sedes propias",
    href: "https://maps.google.com/?q=Ica,Peru",
    cta: "Ver en mapa",
  },
];

const motivaciones = [
  "Inscribirse en un taller",
  "Información sobre funciones",
  "Participar en FESMICA",
  "Contratar a Chaplin",
  "Trabajar con Harold",
  "Prensa y medios",
  "Otro",
];

/* ─── Canales ─────────────────────────────────────────────────────────────── */
function CanalesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".canal-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gris-textura">
          {canales.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="canal-card group bg-negro p-8 lg:p-10 hover:bg-rojo transition-all duration-500 block"
              >
                <Icon
                  className="text-rojo group-hover:text-negro mb-6 transition-colors duration-500"
                  size={36}
                  strokeWidth={1.2}
                />
                {/* Tipo de canal */}
                <p className="font-body uppercase tracking-[0.3em] text-blanco/60 group-hover:text-negro/70 text-[10px] mb-2 transition-colors duration-500">
                  {c.title}
                </p>
                {/* Valor principal */}
                <p className="font-display text-blanco group-hover:text-negro text-2xl mb-3 transition-colors duration-500">
                  {c.value}
                </p>
                {/* Subtítulo */}
                <p className="font-body text-blanco/70 group-hover:text-negro/70 text-sm mb-6 transition-colors duration-500">
                  {c.sub}
                </p>
                {/* CTA inline */}
                <div className="flex items-center gap-2">
                  <span className="font-body text-[11px] uppercase tracking-[0.25em] text-rojo group-hover:text-negro transition-colors duration-500">
                    {c.cta}
                  </span>
                  <span className="h-px w-6 bg-rojo group-hover:bg-negro group-hover:w-10 transition-all duration-500" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Formulario ──────────────────────────────────────────────────────────── */
function FormularioSection() {
  const ref = useRef<HTMLElement>(null);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    motivo: "",
    mensaje: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hola, soy ${form.nombre}.\nMotivo: ${form.motivo}\n${form.mensaje}\nContacto: ${form.email} · ${form.telefono}`
    );
    window.open(`https://wa.me/51956060826?text=${text}`, "_blank");
    setEnviado(true);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".frm-fade",
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

  /* Clase base para todos los inputs/textarea/select */
  const inputClass =
    "w-full bg-negro/60 border-2 border-blanco/25 focus:border-rojo outline-none px-4 py-3 font-body text-blanco text-base placeholder:text-blanco/50 transition-colors duration-300";

  const labelClass =
    "font-body text-[11px] uppercase tracking-[0.3em] text-blanco/80 block mb-2";

  return (
    <section ref={ref} className="bg-negro-suave py-28 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-start">

          {/* ── Columna izquierda: info ── */}
          <div>
            <p className="frm-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
              Escríbenos
            </p>
            <h2 className="frm-fade font-display text-blanco text-5xl md:text-6xl lg:text-[72px] leading-[0.95] mb-8">
              HABLEMOS<br />DE TEATRO.
            </h2>
            <p className="frm-fade font-body text-blanco/75 text-base leading-[1.8] mb-10 max-w-sm">
              Ya sea para talleres, funciones, FESMICA o simplemente para conectar,
              el telón siempre está abierto.
            </p>

            <div className="frm-fade space-y-6">
              {[
                { icon: Phone,   label: "Teléfono",  value: "956 060 826" },
                { icon: Mail,    label: "Instagram",  value: "@chaplin.grupocultural" },
                { icon: MapPin,  label: "Ciudad",     value: "Ica, Perú" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-rojo flex items-center justify-center shrink-0">
                      <Icon className="text-rojo" size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-[0.3em] text-blanco/60 mb-0.5">
                        {item.label}
                      </p>
                      <p className="font-body text-blanco text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div className="frm-fade">
            {enviado ? (
              <div className="text-center py-20">
                <p className="font-display text-rojo text-8xl mb-6">✓</p>
                <h3 className="font-display text-blanco text-4xl mb-4">¡Mensaje enviado!</h3>
                <p className="font-body text-blanco/75 mb-8">
                  Te responderemos a la brevedad. Si es urgente, escríbenos al{" "}
                  <a href="https://wa.me/51956060826" className="text-rojo hover:underline">
                    956 060 826
                  </a>.
                </p>
                <button onClick={() => setEnviado(false)} className="btn-outline">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+51 000 000 000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Motivo *</label>
                    <select
                      name="motivo"
                      required
                      value={form.motivo}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="" disabled className="bg-negro text-blanco/60">
                        Selecciona...
                      </option>
                      {motivaciones.map((m) => (
                        <option key={m} value={m} className="bg-negro text-blanco">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Mensaje *</label>
                  <textarea
                    name="mensaje"
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Cuéntanos qué necesitas..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button type="submit" className="btn-rojo w-full justify-center py-4">
                  Enviar mensaje
                </button>

                <p className="font-body text-blanco/60 text-xs text-center">
                  Al enviar se abrirá WhatsApp con tu mensaje listo para confirmar.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── WhatsApp CTA ────────────────────────────────────────────────────────── */
function WhatsAppCta() {
  return (
    <section className="bg-rojo py-20 lg:py-24 text-center">
      <p className="font-body uppercase tracking-[0.4em] text-negro text-xs mb-6">
        La forma más rápida
      </p>
      <h2 className="font-display text-negro text-5xl md:text-6xl lg:text-7xl leading-[0.9] mb-8">
        ESCRÍBENOS<br />AL WHATSAPP.
      </h2>
      <a
        href="https://wa.me/51956060826"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-negro"
      >
        956 060 826
      </a>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function ContactoPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>CONTACTO.</>}
        subtitle="Estamos en Ica y listos para recibirte. Escríbenos, síguenos y únete a la familia."
      />
      <CanalesSection />
      <FormularioSection />
      <WhatsAppCta />
    </PageLayout>
  );
}
