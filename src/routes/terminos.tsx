import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Términos y condiciones de compra de entradas de Chaplin Grupo Cultural: reservas, pagos, ingreso, cambios, devoluciones y reventa.",
      },
    ],
  }),
  component: TerminosPage,
});

const ACTUALIZADO = "12 de octubre de 2026";
const WHATSAPP = "956 060 826";

interface Seccion {
  id: string;
  titulo: string;
  intro?: string;
  items: string[];
}

const secciones: Seccion[] = [
  {
    id: "general",
    titulo: "Información general",
    items: [
      "Estos términos regulan la compra de entradas de Chaplin Grupo Cultural (en adelante, “Chaplin”), con sede en Ica, Perú.",
      "Se aplican a la venta de entradas de “Jesucristo Rockstar” (domingo 18 de octubre de 2026, funciones de 4:00 pm y 7:00 pm, Auditorio del Colegio de Ingenieros de Ica) y a las demás funciones que Chaplin ponga a la venta, salvo que se indique otra cosa.",
      "Al reservar o pagar una entrada, el comprador declara haber leído y aceptado estos términos y condiciones.",
    ],
  },
  {
    id: "compra",
    titulo: "Compra y reserva",
    items: [
      "La reserva se solicita desde la página de entradas y se confirma directamente con el equipo de Chaplin por WhatsApp. La reserva queda confirmada cuando se verifica el pago.",
      "Los cupos están sujetos a disponibilidad en tiempo real. Chaplin no garantiza un cupo hasta que la reserva haya sido confirmada.",
      "La compra debe ser realizada por una persona mayor de 18 años, con DNI. Los menores de edad no pueden comprar entradas por su cuenta; deberá hacerlo su padre, madre o apoderado.",
      "El comprador debe entregar sus nombres, apellidos y DNI reales. Chaplin puede anular las entradas emitidas con datos falsos o incompletos.",
      "Medios de pago: Yape, Plin y otros medios que se coordinan por WhatsApp al confirmar la reserva. Las entradas se emiten una vez recibido y validado el pago.",
    ],
  },
  {
    id: "precios",
    titulo: "Precios y promociones",
    items: [
      "El precio de cada entrada depende de la zona elegida y de la etapa de preventa vigente el día en que se realiza la compra: promoción 2x1, promoción 3x2, descuento del 20 % y precio regular.",
      "En las promociones 2x1 y 3x2, el precio publicado corresponde a una promoción que da derecho a 2 o 3 entradas, respectivamente, en la misma zona y función.",
      "El precio aplicable es el vigente en la fecha de compra, no en la fecha de la función. Una vez confirmada la compra no se puede cambiar a otra etapa de promoción.",
      "Las promociones y precios pueden modificarse o terminar sin previo aviso; no afectan a las compras ya confirmadas.",
    ],
  },
  {
    id: "ingreso",
    titulo: "Entrada digital e ingreso a la función",
    items: [
      "La entrada se entrega en formato digital mediante un enlace personal con código de ticket y código QR, que Chaplin envía por WhatsApp.",
      "El día de la función se debe presentar el DNI en boletería para la entrega o validación de las entradas.",
      "El ingreso a la sala es por orden de llegada. Se recomienda llegar con anticipación.",
      "Una vez iniciada la función no se permite el ingreso.",
      "Si el grupo no llega junto, las entradas pueden usarse por partes: cada ingreso queda registrado con fecha y hora, y el resto de entradas del mismo ticket sigue vigente hasta completar las personas compradas.",
      "No se permite la grabación ni la toma de fotografías una vez iniciada la función.",
      "Público recomendado: mayores de 14 años.",
    ],
  },
  {
    id: "uso-personal",
    titulo: "Uso personal y reventa",
    items: [
      "Las entradas son de uso personal. Está prohibida su reventa, así como cualquier uso comercial o promocional.",
      "El código QR y el número de ticket son de uso único. Si el enlace o la captura de la entrada se comparte o se copia, solo será válido el primer ingreso registrado; los siguientes intentos serán rechazados.",
      "Chaplin no se hace responsable por entradas clonadas, compartidas o publicadas por el comprador.",
      "Si Chaplin detecta irregularidades, reventa o manipulación de las entradas, puede anularlas sin derecho a devolución.",
    ],
  },
  {
    id: "cambios",
    titulo: "Cambios y devoluciones",
    items: [
      "Una vez confirmada la compra, no se realizan devoluciones por arrepentimiento, error del comprador ni por inasistencia.",
      "Los cambios de horario de función se pueden solicitar hasta 48 horas antes de la función y están sujetos a disponibilidad.",
      "Otros cambios, como la zona o los datos del titular, deben solicitarse por WhatsApp y están sujetos a disponibilidad y a la aprobación de Chaplin.",
      "Si hubo un error atribuible a Chaplin (por ejemplo, un cobro duplicado o una entrada mal emitida), se corregirá o se devolverá el monto correspondiente.",
    ],
  },
  {
    id: "cancelacion",
    titulo: "Cancelación o reprogramación de la función",
    items: [
      "Si Chaplin cancela la función o cambia su fecha, el comprador puede elegir entre conservar su entrada para la nueva fecha o solicitar el reembolso del monto pagado.",
      "El reembolso se coordina por WhatsApp y se realiza por el mismo medio de pago con el que se compró.",
    ],
  },
  {
    id: "cortesias",
    titulo: "Pases de cortesía",
    items: [
      "Los pases de cortesía son personales, no se pueden transferir ni vender, y no tienen valor comercial. Se rigen por las mismas reglas de ingreso de estos términos.",
    ],
  },
  {
    id: "datos",
    titulo: "Datos personales",
    items: [
      "Chaplin usa el nombre, el DNI y el teléfono del comprador solo para gestionar la reserva, emitir las entradas, controlar el ingreso a la función y comunicarse con él sobre su compra.",
      "Los datos no se venden ni se ceden a terceros. El comprador puede pedir la corrección o eliminación de sus datos escribiendo al WhatsApp de Chaplin.",
    ],
  },
  {
    id: "reclamos",
    titulo: "Reclamos y contacto",
    items: [
      "Para consultas, cambios o reclamos, escríbenos por WhatsApp.",
    ],
  },
  {
    id: "modificaciones",
    titulo: "Modificaciones de estos términos",
    items: [
      "Chaplin puede actualizar estos términos y condiciones. A cada compra le corresponde la versión vigente al momento de la compra.",
    ],
  },
];

function TerminosPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Chaplin Grupo Cultural"
        title={<>TÉRMINOS Y<br />CONDICIONES.</>}
        subtitle="Cómo reservar, pagar e ingresar a nuestras funciones. Léelos antes de comprar tus entradas."
      />
      <section className="bg-negro-suave grain py-20 lg:py-32">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 grid lg:grid-cols-[260px_1fr] gap-12 lg:gap-20">
          {/* Índice */}
          <nav aria-label="Contenido" className="lg:sticky lg:top-28 self-start">
            <p className="font-body uppercase tracking-[0.3em] text-rojo text-[11px] mb-4">Contenido</p>
            <ol className="space-y-2.5">
              {secciones.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="font-body text-blanco/60 hover:text-rojo text-sm transition-colors"
                  >
                    {i + 1}. {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
            <p className="font-body text-blanco/40 text-xs mt-8">Última actualización: {ACTUALIZADO}</p>
          </nav>

          {/* Contenido */}
          <div className="space-y-14">
            {secciones.map((s, i) => (
              <article key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="font-display text-blanco text-3xl md:text-4xl leading-none mb-5">
                  <span className="text-rojo">{String(i + 1).padStart(2, "0")}.</span> {s.titulo}
                </h2>
                <div className="linea-roja mb-6" />
                <ul className="space-y-3.5">
                  {s.items.map((t) => (
                    <li key={t} className="flex gap-3 font-body text-blanco/70 text-[15px] leading-[1.75]">
                      <span className="mt-[11px] w-1.5 h-1.5 bg-rojo shrink-0" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                {s.id === "reclamos" && (
                  <div className="flex flex-wrap gap-4 mt-7">
                    <a
                      href="https://wa.me/51956060826"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-rojo"
                    >
                      WhatsApp {WHATSAPP}
                    </a>
                  </div>
                )}
              </article>
            ))}

            <div className="pt-4 border-t border-gris-textura flex flex-wrap items-center justify-between gap-4">
              <Link to="/entradas" className="btn-rojo">
                Ir a comprar entradas
              </Link>
              <Link to="/" className="font-body text-blanco/50 text-sm hover:text-rojo transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
