import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import QRCode from "qrcode";
import { Check, Copy, MapPin, MessageCircle, Printer, Link2 } from "lucide-react";
import {
  EVENTOS,
  ZONAS_CONFIG,
  METODOS_PAGO_CONFIG,
  getEffectiveTicketsCount,
  getIngresadosCount,
  getIngresosLog,
  getSeatStatus,
  type TicketReservation,
} from "@/lib/tickets-crm";
import { Fireflies } from "@/components/shrek/Fireflies";
import shrekPersonaje from "@/assets/shrek/shrek-personaje.png";
import pantano from "@/assets/shrek/flyer-preventa.jpg";

interface Props {
  ticket: TicketReservation;
  copiedLink: boolean;
  copiedCode: boolean;
  onCopyLink: () => void;
  onCopyCode: () => void;
  onShare: () => void;
  onPrint: () => void;
}

const EV = EVENTOS.shrek;
const INK = "#2a1a0a";
const SWAMP = "#2f6b1c";

const PAPER =
  "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(150,100,30,0.18), transparent 60%), linear-gradient(180deg,#fbefc6 0%,#f3dd9c 100%)";

// Recorta dos semicírculos en los bordes laterales (la "mordida" del ticket)
const NOTCH_BOTTOM =
  "radial-gradient(circle 15px at 0 100%, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 15px at 100% 100%, #0000 97%, #000) right / 51% 100% no-repeat";
const NOTCH_TOP =
  "radial-gradient(circle 15px at 0 0, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 15px at 100% 0, #0000 97%, #000) right / 51% 100% no-repeat";

const BULLETS = [
  "Llega unos minutos antes: el ingreso a la sala es por orden de llegada.",
  "Presenta tu DNI en boletería el día de la función para la entrega de tus entradas.",
  "Público recomendado: apto para todos.",
  "Una vez iniciada la función no se permite el ingreso.",
  "No se permite grabar ni tomar fotografías durante la función.",
  "Los cambios de horario se pueden hacer hasta 48 horas antes y según disponibilidad.",
];

export function ShrekTicket({ ticket, copiedLink, copiedCode, onCopyLink, onCopyCode, onShare, onPrint }: Props) {
  const [qr, setQr] = useState<string>("");

  const code = ticket.ticketCode || ticket.id;
  const url = typeof window !== "undefined" ? `${window.location.origin}/ticket/${code}` : `https://chaplingrupocultural.com/ticket/${code}`;

  const totalEntradas = getEffectiveTicketsCount(ticket);

  // Un solo QR por boleto (se dibuja aquí, en el celular: sin costo). En puerta se registra
  // cuántas personas de este boleto entran en cada momento.
  useEffect(() => {
    let vivo = true;
    QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#1d2a12", light: "#0000" } })
      .then((svg) => vivo && setQr(svg))
      .catch(() => vivo && setQr(""));
    return () => {
      vivo = false;
    };
  }, [url]);

  const zona = ZONAS_CONFIG[ticket.zonaKey] ?? { label: "Zona", color: SWAMP, totalSeats: 0, key: ticket.zonaKey };
  const zonaCorta = zona.label.replace("Zona ", "").replace(" (2do piso)", "");
  const piso = ticket.zonaKey === "pantano" ? "2.º piso" : "1.er piso";

  const esCortesia = ticket.etapaPromo === "cortesia" || ticket.zonaKey === "cortesia" || Number(ticket.totalPagado) === 0;
  const total = getEffectiveTicketsCount(ticket);
  const base = Number(ticket.cantidad || 0) + Number(ticket.cantidadNino || 0);
  const por = base > 0 ? total / base : 1;
  const adultos = Math.round(Number(ticket.cantidad || 0) * por);
  const ninos = Math.round(Number(ticket.cantidadNino || 0) * por);
  const ingresaron = getIngresadosCount(ticket);
  const log = getIngresosLog(ticket);
  const seatUsed = getSeatStatus(ticket);
  const completo = ingresaron >= total && total > 0;
  const parcial = ingresaron > 0 && !completo;

  const promo = EV.defaults.promos.find((p) => p.key === ticket.etapaPromo);
  const metodo = esCortesia ? "Pase de cortesía" : METODOS_PAGO_CONFIG[ticket.metodoPago || "yape"]?.label || "Yape";
  const horaCorta = ticket.funcion.replace(/\s?(am|pm)/i, (m) => m.toUpperCase()).replace(/\s/g, " ");
  const emitido = new Date(ticket.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

  const sello = completo
    ? { txt: "CANJEADO", color: "#a52a1f" }
    : parcial
    ? { txt: "PARCIAL", color: "#b4650a" }
    : { txt: "CONFIRMADO", color: SWAMP };

  return (
    <div className="shk-root relative min-h-screen overflow-x-hidden pb-16 font-body text-white print:bg-white print:text-black">
      {/* Fondo de pantano */}
      <div className="pointer-events-none absolute inset-0 print:hidden">
        <img src={pantano} alt="" className="h-[620px] w-full object-cover object-top opacity-[0.22]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(130,210,50,0.28),transparent_60%),linear-gradient(180deg,rgba(6,18,11,0.35)_0%,#06120b_620px)]" />
      </div>
      <div className="print:hidden">
        <Fireflies count={18} />
      </div>

      <div className="relative z-10 mx-auto max-w-[430px] px-4 pt-6">
        {/* Logo */}
        <Link to="/" className="mb-2 block text-center print:hidden" aria-label="Chaplin Grupo Cultural">
          <img
            src="/logo-chaplin.png"
            alt="Chaplin Grupo Cultural"
            className="mx-auto h-11 w-auto object-contain opacity-90"
            style={{ filter: "invert(1) hue-rotate(180deg)" }}
          />
        </Link>

        {/* Shrek asomándose detrás del boleto */}
        <div className="shk-peek pointer-events-none relative z-0 mx-auto -mb-[68px] h-[190px] w-[260px] overflow-hidden print:hidden">
          <img
            src={shrekPersonaje}
            alt=""
            className="absolute left-1/2 top-2 w-[250px] max-w-none -translate-x-1/2 drop-shadow-[0_18px_28px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* ───────── EL BOLETO ───────── */}
        <div className="shk-ticket-in relative z-10 [filter:drop-shadow(0_30px_30px_rgba(0,0,0,0.55))]">
          {/* Parte superior */}
          <div className="overflow-hidden rounded-t-[22px]" style={{ WebkitMask: NOTCH_BOTTOM, mask: NOTCH_BOTTOM }}>
            {/* Cartel de madera */}
            <div className="shk-wood !rounded-none !border-0 px-5 pb-5 pt-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#fdf0c4]/80" style={{ fontFamily: "var(--shk-serif)" }}>
                Boleto oficial
              </p>
              <p
                className="mt-1 text-[68px] leading-[0.9]"
                style={{
                  fontFamily: "var(--shk-title)",
                  background: "linear-gradient(180deg,#e4ff8e 0%,#a6e22e 48%,#5da514 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 3px 0 rgba(20,50,5,0.9))",
                }}
              >
                SHREK
              </p>
              <p
                className="text-[15px] tracking-[0.08em]"
                style={{
                  fontFamily: "var(--shk-serif)",
                  fontWeight: 900,
                  background: "linear-gradient(180deg,#ffe38a,#f6c744 55%,#c98a0c)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 2px 0 rgba(50,25,0,0.85))",
                }}
              >
                EL INICIO DE LA AVENTURA
              </p>
            </div>

            {/* Datos principales sobre papel */}
            <div className="relative px-6 pb-7 pt-6" style={{ background: PAPER, color: INK }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "#7a5a22" }}>
                    Sábado 28 de noviembre
                  </p>
                  <p className="mt-1 text-[58px] leading-[0.9]" style={{ fontFamily: "var(--shk-title)", color: SWAMP }}>
                    {horaCorta.toUpperCase()}
                  </p>
                </div>
                {/* Admite */}
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "#7a5a22" }}>
                    Admite
                  </p>
                  <p className="text-[58px] leading-[0.9]" style={{ fontFamily: "var(--shk-title)" }}>
                    {total}
                  </p>
                </div>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#6b4a1a" }}>
                <MapPin size={13} /> Auditorio del Colegio de Ingenieros · Ica
              </p>

              <div className="my-5 border-t-2 border-dotted" style={{ borderColor: "rgba(80,50,10,0.35)" }} />

              {/* Zona como bandera */}
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "#7a5a22" }}>
                    Tu zona
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span
                      className="inline-block h-[46px] w-[14px] rounded-sm"
                      style={{ background: zona.color, boxShadow: "inset -3px 0 0 rgba(0,0,0,0.2)" }}
                    />
                    <div>
                      <p className="text-[40px] leading-[0.9]" style={{ fontFamily: "var(--shk-title)" }}>
                        {zonaCorta.toUpperCase()}
                      </p>
                      <p className="text-[12px] font-semibold" style={{ color: "#6b4a1a" }}>
                        {piso}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[13px] font-bold leading-snug">
                  {adultos > 0 && <p>{adultos} Adulto{adultos === 1 ? "" : "s"}</p>}
                  {ninos > 0 && <p>{ninos} Niño{ninos === 1 ? "" : "s"}</p>}
                  {promo && por > 1 && (
                    <p className="mt-0.5 text-[11px] font-black uppercase tracking-wider" style={{ color: SWAMP }}>
                      Promo {promo.tag}
                    </p>
                  )}
                </div>
              </div>

              <div className="my-5 border-t-2 border-dotted" style={{ borderColor: "rgba(80,50,10,0.35)" }} />

              {/* Titular: renglones con puntos, como un boleto de verdad */}
              <dl className="space-y-2.5 text-[14px]">
                {[
                  ["Titular", ticket.clienteNombre],
                  ["DNI", ticket.clienteDni || "Se registra en boletería"],
                  ["Pago", esCortesia ? "Pase de cortesía · S/ 0" : `${metodo} · S/ ${Number(ticket.totalPagado).toFixed(2)}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <dt className="shrink-0 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "#7a5a22" }}>
                      {k}
                    </dt>
                    <span className="mb-[3px] min-w-[12px] flex-1 border-b-2 border-dotted" style={{ borderColor: "rgba(80,50,10,0.3)" }} />
                    <dd className="max-w-[62%] text-right font-bold leading-tight">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Perforación */}
          <div className="relative h-0">
            <div className="absolute inset-x-[18px] -top-px border-t-[3px] border-dashed" style={{ borderColor: "rgba(80,50,10,0.35)" }} />
          </div>

          {/* Talón con QR */}
          <div
            className="relative overflow-hidden rounded-b-[22px] px-6 pb-6 pt-7"
            style={{ background: PAPER, color: INK, WebkitMask: NOTCH_TOP, mask: NOTCH_TOP }}
          >
            {/* Código del boleto + sello */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "#7a5a22" }}>
                Código único
              </p>
              <button onClick={onCopyCode} className="group mt-1 flex items-center gap-1.5 text-left" aria-label="Copiar código">
                <span className="break-all font-mono text-[20px] font-black leading-tight">{code}</span>
                {copiedCode ? <Check size={16} className="shrink-0 text-[#2f6b1c]" /> : <Copy size={15} className="shrink-0 opacity-50 group-hover:opacity-100" />}
              </button>
              <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "#6b4a1a" }}>
                {total > 1
                  ? "Un solo QR para todo el grupo. En puerta registran cuántas personas entran en cada momento; pueden llegar por partes."
                  : "Muestra este QR en boletería junto con tu DNI."}
              </p>
              </div>
              <div
                className="shk-stamp mt-1 shrink-0 rotate-[-8deg] mr-1 rounded-md border-[3px] px-2.5 py-0.5 text-[16px] uppercase tracking-[0.04em] mix-blend-multiply"
                style={{ borderColor: sello.color, color: sello.color, fontFamily: "var(--shk-title)", boxShadow: `inset 0 0 0 2px ${sello.color}33` }}
              >
                {sello.txt}
              </div>
            </div>

            {/* QR único del boleto */}
            <div className="mt-6 flex flex-col items-center">
              <div className="relative h-[196px] w-[196px] rounded-[12px] bg-white/70 p-3 shadow-[inset_0_0_0_2px_rgba(80,50,10,0.18)]">
                {qr ? (
                  <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
                ) : (
                  <div className="h-full w-full animate-pulse rounded bg-black/10" />
                )}
              </div>

              {/* Cuántas personas de este boleto ya entraron */}
              <div className="mt-5 w-full text-center">
                <p className="text-[15px] font-black">
                  {completo
                    ? "Ya ingresaron todas las personas"
                    : ingresaron > 0
                    ? `Han ingresado ${ingresaron} de ${total} personas`
                    : `${total} ${total === 1 ? "persona puede ingresar" : "personas pueden ingresar"}`}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5" aria-hidden>
                  {Array.from({ length: Math.max(1, total) }, (_, i) => (
                    <span
                      key={i}
                      className="h-[14px] w-[14px] rounded-full border-2"
                      style={{
                        borderColor: SWAMP,
                        background: seatUsed[i] ? SWAMP : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Estado de ingreso */}
            {(completo || parcial) && (
              <div className="mt-5 rounded-lg px-3.5 py-3 text-[13px]" style={{ background: "rgba(80,50,10,0.08)" }}>
                <p className="font-black">
                  {completo ? "Ya ingresaron todas las personas" : `Ingresaron ${ingresaron} de ${total} personas`}
                </p>
                <ul className="mt-1.5 space-y-0.5 text-[12px]" style={{ color: "#5a3f12" }}>
                  {log.map((l, i) => (
                    <li key={i}>
                      {new Date(l.at).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {l.cantidad}{" "}
                      {l.cantidad === 1 ? "persona" : "personas"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#8a6a30" }}>
              <span>Emitido el {emitido}</span>
              <span>Chaplin Grupo Cultural</span>
            </div>

          </div>
        </div>

        {/* ───────── Acciones ───────── */}
        <div className="mt-8 flex flex-col items-center gap-4 print:hidden">
          <button onClick={onShare} className="shk-btn w-full max-w-[340px] !text-[19px]">
            <MessageCircle size={22} /> Enviar mi boleto por WhatsApp
          </button>
          <div className="flex items-center justify-center gap-7 text-[12px] font-bold text-white/70">
            <button onClick={onPrint} className="flex flex-col items-center gap-1.5 hover:text-[#caff55]">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25">
                <Printer size={18} />
              </span>
              Descargar
            </button>
            <button onClick={onCopyLink} className="flex flex-col items-center gap-1.5 hover:text-[#caff55]">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25">
                {copiedLink ? <Check size={18} className="text-[#caff55]" /> : <Link2 size={18} />}
              </span>
              {copiedLink ? "¡Copiado!" : "Copiar enlace"}
            </button>
            <a
              href="https://maps.google.com/?q=Colegio+de+Ingenieros+del+Peru+CD+Ica"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 hover:text-[#caff55]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25">
                <MapPin size={18} />
              </span>
              Cómo llegar
            </a>
          </div>
        </div>

        {/* ───────── Antes de venir ───────── */}
        <section className="mt-14 print:mt-6">
          <h2 className="text-[34px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>
            Antes de venir
          </h2>
          <ul className="mt-5">
            {BULLETS.map((t) => (
              <li key={t} className="flex gap-3 border-t border-white/10 py-3.5 text-[14.5px] leading-snug text-white/80 first:border-t-0">
                <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#a6e22e] shadow-[0_0_10px_rgba(166,226,46,0.8)] print:bg-black" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-white/55">
            Con esta entrada aceptas nuestros{" "}
            <a href="/terminos" target="_blank" rel="noopener noreferrer" className="font-bold text-[#caff55] underline underline-offset-2">
              Términos y condiciones
            </a>
            .
          </p>
        </section>

        <div className="mt-14 text-center">
          <p className="shk-title text-[40px]">¡NOS VEMOS EN EL PANTANO!</p>
          <p className="mt-3 text-[13px] text-white/55">Gracias por apoyar el arte y la cultura, en especial el teatro.</p>
          <a
            href={`https://wa.me/${EV.whatsapp}?text=${encodeURIComponent("Hola Chaplin, tengo una consulta sobre mi boleto de Shrek")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-[#f6c744] underline-offset-4 hover:underline print:hidden"
          >
            <MessageCircle size={16} /> ¿Dudas con tu entrada? Escríbenos
          </a>
          <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-white/35">Chaplin Grupo Cultural · Ica, Perú</p>
        </div>
      </div>
    </div>
  );
}
