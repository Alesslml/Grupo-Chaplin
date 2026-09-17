import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  CheckCircle2,
  Share2,
  Printer,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  fetchTicketByIdServer,
  getStoredReservations,
  TicketReservation,
  ZONAS_CONFIG,
  PROMOS_CONFIG,
  METODOS_PAGO_CONFIG,
  buildWhatsAppReservationMessage,
} from "@/lib/tickets-crm";

export const Route = createFileRoute("/ticket/$id")({
  loader: async ({ params }) => {
    try {
      const res = await fetchTicketByIdServer({ data: { id: params.id } });
      return { ticket: res.ok ? res.ticket : null, ticketId: params.id };
    } catch {
      return { ticket: null, ticketId: params.id };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.ticket
          ? `Boleto Oficial #${loaderData.ticket.ticketCode || loaderData.ticket.id} · ${loaderData.ticket.clienteNombre} · Jesucristo Rockstar`
          : "Boleto Digital · Jesucristo Rockstar · Chaplin Grupo Cultural",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { ticket: initialTicket, ticketId } = Route.useLoaderData();
  const [ticket, setTicket] = useState<TicketReservation | null>(initialTicket);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fallback a almacenamiento local si el servidor no devolvió el ticket
  useEffect(() => {
    if (!ticket && typeof window !== "undefined") {
      const localList = getStoredReservations();
      const found = localList.find((r) => r.id === ticketId || r.ticketCode === ticketId);
      if (found) setTicket(found);
    }
  }, [ticket, ticketId]);

  const isCortesia =
    ticket?.etapaPromo === "cortesia" ||
    ticket?.zonaKey === "cortesia" ||
    Number(ticket?.totalPagado) === 0;

  const meta = ticket ? ZONAS_CONFIG[ticket.zonaKey] || { label: "Zona General", color: "#fe0000", totalSeats: 60 } : null;
  const promoMeta = ticket ? PROMOS_CONFIG[ticket.etapaPromo] || { label: "Precio Regular" } : null;
  const promoLabel = isCortesia ? "Pase de Cortesía (Sin Costo)" : (promoMeta?.label || "Precio Regular");
  const totalLabel = isCortesia ? "S/ 0.00 SOLES (CORTESÍA)" : `S/ ${Number(ticket?.totalPagado).toFixed(2)} SOLES`;
  const metodoLabel = isCortesia ? "Pase de Cortesía" : (ticket ? METODOS_PAGO_CONFIG[ticket.metodoPago || "yape"]?.label || "Yape" : "Yape");

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (ticket?.ticketCode) {
      navigator.clipboard.writeText(ticket.ticketCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    if (!ticket) return;
    const msg = buildWhatsAppReservationMessage(ticket);
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // Si no se encuentra el boleto
  if (!ticket) {
    return (
      <div className="min-h-screen bg-negro text-blanco flex flex-col items-center justify-center p-6 text-center grain relative overflow-hidden">
        <div className="max-w-md w-full p-8 border border-gris-textura bg-zinc-950/80 rounded-2xl shadow-2xl relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-800/80 flex items-center justify-center mx-auto text-rojo">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-blanco">Boleto no encontrado</h1>
            <p className="font-body text-xs text-blanco/60 mt-2 leading-relaxed">
              No localizamos una reserva registrada con el identificador <strong className="text-blanco font-bold">#{ticketId}</strong>.
            </p>
          </div>
          <div className="pt-2 space-y-3 font-body">
            <a
              href="https://wa.me/51956060826?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20boleto%20de%20Jesucristo%20Rockstar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-rojo w-full justify-center flex items-center gap-2 text-xs py-3"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar a Boletería Chaplin</span>
            </a>
            <Link
              to="/entradas"
              className="block text-xs text-blanco/50 hover:text-blanco transition-colors py-2"
            >
              ← Ir a la boletería general
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#070709] text-blanco overflow-x-hidden font-body selection:bg-rojo selection:text-white pb-20">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. ESCENOGRAFÍA TEATRAL: TELÓN DE TEATRO (VELVET CURTAINS & SPOTLIGHTS)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#1a0002] via-[#0d0204] to-[#070709] pt-8 pb-12 print:hidden">
        {/* Luces cenitales / Reflectores teatrales */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(254,0,0,0.35),rgba(200,16,46,0.15)_40%,transparent_75%)] pointer-events-none blur-2xl" />
        <div className="absolute top-0 left-1/4 w-72 h-96 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.2),transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute top-0 right-1/4 w-72 h-96 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.2),transparent_70%)] pointer-events-none blur-3xl" />

        {/* Faldón Teatral Superior (Lambrequín festoneado con borde dorado) */}
        <div className="absolute top-0 left-0 right-0 h-10 md:h-14 bg-gradient-to-b from-[#400005] to-[#73020c] shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-10 border-b-2 border-[#d4af37]/60 flex items-center justify-around px-4 opacity-95">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-12 md:w-20 h-full bg-gradient-to-b from-[#5c0008] via-[#8c0310] to-[#400005] rounded-b-xl border-b border-[#ffd700]/40 shadow-inner"
            />
          ))}
        </div>

        {/* Telón Izquierdo Drapeado */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-28 md:w-44 bg-gradient-to-r from-[#2e0004] via-[#5e010a] to-transparent pointer-events-none z-10 opacity-80 flex">
          <div className="w-1/3 h-full bg-gradient-to-r from-black/40 via-transparent to-black/30" />
          <div className="w-1/3 h-full bg-gradient-to-r from-black/40 via-transparent to-black/30" />
          <div className="w-1/3 h-full bg-gradient-to-r from-black/40 via-transparent to-black/30" />
        </div>

        {/* Telón Derecho Drapeado */}
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-28 md:w-44 bg-gradient-to-l from-[#2e0004] via-[#5e010a] to-transparent pointer-events-none z-10 opacity-80 flex justify-end">
          <div className="w-1/3 h-full bg-gradient-to-l from-black/40 via-transparent to-black/30" />
          <div className="w-1/3 h-full bg-gradient-to-l from-black/40 via-transparent to-black/30" />
          <div className="w-1/3 h-full bg-gradient-to-l from-black/40 via-transparent to-black/30" />
        </div>

        {/* Cabecera Central con Logo Oficial Chaplin & Marquee */}
        <div className="max-w-3xl mx-auto px-6 pt-10 sm:pt-14 relative z-20 text-center">
          <Link to="/" className="inline-block group mb-3" aria-label="Chaplin Grupo Cultural">
            <div className="relative inline-block">
              <div className="absolute -inset-3 bg-[#d4af37]/20 rounded-full blur-xl pointer-events-none" />
              <img
                src="/logo-chaplin.png"
                alt="Chaplin Grupo Cultural"
                className="h-12 sm:h-16 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105 relative z-10"
                style={{ filter: "invert(1) hue-rotate(180deg)" }}
              />
            </div>
          </Link>

          <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#d4af37] font-semibold flex items-center justify-center gap-2">
            <span>★</span>
            <span>Chaplin Grupo Cultural Presenta</span>
            <span>★</span>
          </p>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-blanco tracking-wide mt-1 drop-shadow-[0_4px_20px_rgba(254,0,0,0.6)]">
            JESUCRISTO <span className="text-rojo">ROCKSTAR</span>
          </h1>

          <div className="inline-flex items-center gap-2 bg-[#d4af37]/15 border border-[#d4af37]/40 px-3.5 py-1 rounded-full text-[11px] text-[#ffd700] font-semibold mt-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boleto Digital Oficial · Entrada Confirmada</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. TARJETA PRINCIPAL DEL BOLETO (E-TICKET CARD)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-30 -mt-2 sm:-mt-4">
        <div className="bg-[#111114] border-2 border-[#d4af37]/50 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.15)] overflow-hidden relative print:border-black print:shadow-none print:bg-white print:text-black">
          {/* Cinta superior del ticket */}
          <div className="bg-gradient-to-r from-[#99000a] via-rojo to-[#99000a] p-4 text-white flex items-center justify-between border-b border-[#d4af37]/60">
            <div className="flex items-center gap-2.5">
              <TicketIcon className="w-5 h-5 text-yellow-300" />
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-200/90 block leading-none">
                  Comprobante Oficial de Reserva
                </span>
                <span className="font-display text-lg tracking-wider block mt-0.5">
                  AUDITORIO COLEGIO DE INGENIEROS DE ICA
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-yellow-200 block font-medium">
                Estado
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-extrabold bg-black/40 px-2 py-0.5 rounded-full border border-yellow-400/40 text-yellow-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMADO</span>
              </div>
            </div>
          </div>

          {/* Cuerpo del Ticket */}
          <div className="p-6 sm:p-8 space-y-6">
            {isCortesia && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-amber-400/60 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-300 block">
                      Pase Oficial de Cortesía · Costo S/ 0.00
                    </span>
                    <span className="text-[10px] text-amber-200/70 block">
                      Entrada de honor confirmada para el evento.
                    </span>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-[10px] bg-amber-400/25 text-amber-200 px-2.5 py-1 rounded-full border border-amber-400/50 uppercase tracking-widest shrink-0">
                  Cortesía
                </span>
              </div>
            )}

            {/* Código del ticket y zona */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gris-textura/60">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-blanco/50 font-bold block">
                  Código Único de Entrada
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#ffd700] tracking-wider">
                    #{ticket.ticketCode || ticket.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 text-blanco/60 hover:text-white hover:bg-blanco/10 rounded-md transition-colors print:hidden"
                    title="Copiar código de ticket"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Insignia de Zona */}
              <div className="sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-blanco/50 font-bold block">
                  Zona Reservada
                </span>
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-bold text-sm uppercase tracking-wider mt-1"
                  style={{
                    backgroundColor: `${meta?.color}20`,
                    borderColor: meta?.color,
                    color: meta?.color === "#f2d675" ? "#ffd700" : meta?.color,
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: meta?.color }} />
                  <span>{meta?.label}</span>
                </div>
              </div>
            </div>

            {/* Fecha, Horario y Asientos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-950/70 border border-gris-textura/60 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rojo/20 border border-rojo/40 flex items-center justify-center shrink-0 text-rojo">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blanco/40 block font-bold">Fecha</span>
                  <span className="text-xs sm:text-sm font-bold text-blanco">Dom. 18 de Octubre</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gris-textura/60 pt-2 sm:pt-0 sm:pl-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blanco/40 block font-bold">Función</span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-300">{ticket.funcion}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gris-textura/60 pt-2 sm:pt-0 sm:pl-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                  <TicketIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blanco/40 block font-bold">Entradas</span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                    {ticket.cantidad} {ticket.cantidad === 1 ? "asiento" : "asientos"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ficha Completa del Comprador */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#d4af37] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Datos del Titular de la Reserva</span>
              </h3>

              <div className="border border-gris-textura/60 rounded-xl divide-y divide-gris-textura/50 bg-black/40 text-xs">
                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">NOMBRE DEL TITULAR:</span>
                  <span className="font-bold text-blanco text-sm uppercase tracking-wide">
                    {ticket.clienteNombre}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">DOCUMENTO DE IDENTIDAD (DNI):</span>
                  <span className="font-mono font-bold text-blanco">
                    {ticket.clienteDni || "Registrado al canje"}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">PROMOCIÓN / TARIFA:</span>
                  <span className="font-bold text-amber-300 uppercase">
                    {promoLabel}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">TOTAL PAGADO:</span>
                  <span className={`font-mono font-bold text-sm ${isCortesia ? "text-amber-400" : "text-emerald-400"}`}>
                    {totalLabel}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">MEDIO DE PAGO:</span>
                  <span className="font-bold text-blanco uppercase">
                    {metodoLabel}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">ASESOR / VENDEDOR:</span>
                  <span className="text-blanco/80 font-medium">
                    {ticket.vendedor || "Boletería Oficial"}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex justify-between items-center">
                  <span className="text-blanco/50 font-medium">EMITIDO EL:</span>
                  <span className="text-blanco/60">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Separador perforated ticket cut */}
            <div className="relative py-2 print:hidden">
              <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#070709] border-r-2 border-[#d4af37]/50" />
              <div className="absolute -right-10 w-6 h-6 rounded-full bg-[#070709] border-l-2 border-[#d4af37]/50" />
              <div className="w-full border-b-2 border-dashed border-gris-textura/70" />
            </div>

            {/* Verificación y Validación en Boletería mediante DNI y CRM */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-[#d4af37]/40 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 text-[#ffd700] shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#ffd700] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Validación Directa en Boletería</span>
                </div>
                <h4 className="font-display text-xl text-blanco tracking-wide">
                  CANJE DE ENTRADAS CON TU DNI
                </h4>
                <p className="text-[11px] text-blanco/70 leading-relaxed">
                  El personal de Chaplin Grupo Cultural validará tu {isCortesia ? "pase de cortesía" : "compra"} en el sistema CRM con tu DNI (<strong className="text-blanco font-bold">{ticket.clienteDni || "Registrado"}</strong>) o tu Código de Ticket (<strong className="text-[#ffd700] font-mono font-bold">#{ticket.ticketCode || ticket.id}</strong>) en el Auditorio del Colegio de Ingenieros de Ica para hacer entrega de tus entradas físicas.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    {isCortesia ? "Pase de Cortesía Registrado en el CRM Oficial" : "Boleto Registrado y Verificado en el CRM Oficial"}
                  </span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────────
                3. SECCIÓN REGLAMENTARIA: TENER EN CUENTA (TEXTO EXACTO DE HAROLD)
                ───────────────────────────────────────────────────────────────────────────── */}
            <div className="border border-amber-500/40 bg-amber-500/[0.05] p-5 rounded-xl space-y-3.5 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>TENER EN CUENTA:</span>
              </div>

              <ul className="space-y-2 text-blanco/80 leading-relaxed font-body">
                <li className="flex items-start gap-2">
                  <span className="text-sm">⏰</span>
                  <span>Por favor llegar minutos antes de la función; el ingreso a la sala será por orden de llegada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm">🎟️</span>
                  <span>Por favor presentar su DNI en boletería el día de la función para hacer entrega de sus entradas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm">👥</span>
                  <span>Público recomendado: Apto para mayores de 14 años.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm">🚪</span>
                  <span>Una vez iniciada la función no se permitirá el ingreso.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm">📵</span>
                  <span>No se permite la grabación ni la toma de fotografías una vez iniciada la función.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm">🗓️</span>
                  <span>Los cambios de horario se pueden realizar hasta 48 horas antes de la función y según disponibilidad.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-amber-500/30 text-center space-y-1">
                <p className="text-blanco/90 font-medium">
                  Muchas gracias 👍🏽 por apoyar el arte y la cultura, en especial el teatro 🎭...
                </p>
                <p className="font-display text-xl text-rojo tracking-wider pt-1">
                  ¡LOS ESPERAMOS PARA ROCKEAR! 🤘🔥
                </p>
                <p className="text-[11px] text-[#ffd700] uppercase tracking-widest font-semibold">
                  Chaplin Grupo Cultural, pasión por el teatro 🎭
                </p>
              </div>
            </div>

            {/* Acciones del Boleto */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 font-body print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-negro font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-colors shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Descargar / Imprimir Boleto</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 border border-gris-textura hover:border-blanco text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "¡Enlace Copiado!" : "Copiar Enlace del Boleto"}</span>
              </button>

              <a
                href="https://maps.google.com/?q=Colegio+de+Ingenieros+del+Peru+CD+Ica"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 border border-gris-textura hover:border-rojo text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4 text-rojo" />
                <span>Cómo llegar en Google Maps</span>
              </a>
            </div>

            {/* Asistencia Directa */}
            <div className="text-center pt-2 print:hidden">
              <a
                href="https://wa.me/51956060826?text=Hola%20Chaplin,%20tengo%20una%20consulta%20sobre%20mi%20boleto%20de%20Jesucristo%20Rockstar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blanco/50 hover:text-rojo transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>¿Dudas con tu entrada? Escribe a soporte de Chaplin Grupo Cultural</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página sutil */}
      <footer className="max-w-xl mx-auto text-center mt-12 px-6 print:hidden">
        <p className="text-[11px] text-blanco/40 uppercase tracking-[0.2em]">
          Chaplin Grupo Cultural · Temporada 2026 · Ica, Perú
        </p>
      </footer>
    </div>
  );
}
