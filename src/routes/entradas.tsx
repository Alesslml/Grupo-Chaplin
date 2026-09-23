import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { MessageCircle, Minus, Plus, Calendar, Clock, MapPin, Users, ShieldCheck, Flame, AlertCircle } from "lucide-react";
import {
  getStoredReservations,
  getZoneAvailability,
  onCRMUpdate,
  startVisiblePolling,
  getActivePromoKey,
  fetchPublicAvailabilityServer,
  fetchPublicEventSettingsServer,
  getStoredEventSettings,
  saveStoredEventSettingsLocally,
  type TicketReservation,
  type ZoneAvailability,
  type EventSettings,
} from "@/lib/tickets-crm";
import flyerOficial from "@/assets/jesucristo-rockstar-flyer.jpg";
import mapaZonas from "@/assets/jesucristo-rockstar-mapa.jpeg";

export const Route = createFileRoute("/entradas")({
  head: () => ({
    meta: [
      { title: "Entradas · Jesucristo Rockstar · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Reserva tus entradas para Jesucristo Rockstar, domingo 18 de octubre, Auditorio del Colegio de Ingenieros de Ica. Funciones 4:00 pm y 7:00 pm.",
      },
    ],
  }),
  component: EntradasPage,
});

const WHATSAPP_NUMBER = "51956060826";

const funciones = ["4:00 pm", "7:00 pm"];

const sinopsis =
  "Jesucristo Rockstar es una vibrante adaptación teatral que sumerge al público en los últimos siete días de la vida de Jesús de Nazaret, explorando su liderazgo y el profundo impacto en sus seguidores mediante una perspectiva profundamente humana y contemporánea. La obra resalta los dilemas internos y el conflicto de figuras clave como Judas ante la creciente marea de tensión política y religiosa, todo narrado con la fuerza, la rebeldía y la energía explosiva de una poderosa banda de rock en vivo, fusionando la solemnidad de la historia con la potencia sonora y la estética de un concierto inolvidable.";

const fichaTecnica = [
  { rol: "Dirección general", nombre: "Harold López" },
  { rol: "Productor ejecutivo", nombre: "Jonathan López" },
  { rol: "Coreografía", nombre: "Thian Ramos" },
  { rol: "Productor musical", nombre: "Andre Bonifaz" },
  { rol: "Dirección vocal", nombre: "Dayana Navarrete" },
  { rol: "Banda en vivo", nombre: "Black & White" },
];

const elenco = [
  "Yerson Luján", "Jacqui Arce", "Karina Félix", "Daniela Lengua", "Carlos Espino",
  "Cesar Alvarado", "Alex Meza", "Katia Carrascal", "Kleber Martínez", "Francia Reategui",
  "Keselhy Martínez", "Victoria Di Antonis", "Antoinette Hernández", "Marth Fernández",
  "Mahylyn Cáceres", "Angelina Rosas", "Sofía Gonzales", "Ingrid Vicuña",
];

const detallesEvento = [
  { icon: MapPin, label: "Auditorio del Colegio de Ingenieros de Ica" },
  { icon: Calendar, label: "Domingo 18 de octubre" },
  { icon: Clock, label: "120 minutos, incluye intermedio" },
  { icon: Users, label: "Público recomendado: mayores de 14 años" },
];

interface Zone {
  key: string;
  label: string;
  color: string;
  seats: number;
  prices: { twoXone: number; threeXtwo: number; twentyPct: number; regular: number };
  sellable: true;
}

const zonasVenta: Zone[] = [
  {
    key: "superstar",
    label: "Zona Superstar",
    color: "#fe0000",
    seats: 60,
    prices: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 80 },
    sellable: true,
  },
  {
    key: "getsemani",
    label: "Zona Getsemaní",
    color: "#f2d675",
    seats: 47,
    prices: { twoXone: 60, threeXtwo: 120, twentyPct: 48, regular: 60 },
    sellable: true,
  },
  {
    key: "hosanna",
    label: "Zona Hosanna",
    color: "#7dd3e8",
    seats: 67,
    prices: { twoXone: 40, threeXtwo: 80, twentyPct: 32, regular: 40 },
    sellable: true,
  },
  {
    key: "pueblo",
    label: "Zona Pueblo (2do piso)",
    color: "#2b3a8f",
    seats: 80,
    prices: { twoXone: 20, threeXtwo: 40, twentyPct: 16, regular: 20 },
    sellable: true,
  },
];

type TierKey = "twoXone" | "threeXtwo" | "twentyPct" | "regular";

interface Tier {
  key: TierKey;
  label: string;
  detalle: string;
  from: string;
  to: string;
  /** Cuántas entradas incluye cada precio listado (2 en 2x1, 3 en 3x2, 1 fuera de esas promos). */
  entradasPorPrecio: number;
}

const tiers: Tier[] = [
  {
    key: "twoXone",
    label: "Preventa 2x1",
    detalle: "Del 16 al 22 de setiembre · Llevas 2 entradas por este precio",
    from: "2026-09-16",
    to: "2026-09-22",
    entradasPorPrecio: 2,
  },
  {
    key: "threeXtwo",
    label: "Preventa 3x2",
    detalle: "Del 23 de setiembre al 2 de octubre · Llevas 3 entradas por este precio",
    from: "2026-09-23",
    to: "2026-10-02",
    entradasPorPrecio: 3,
  },
  {
    key: "twentyPct",
    label: "Preventa 20% dto.",
    detalle: "Del 3 al 11 de octubre · Precio por entrada",
    from: "2026-10-03",
    to: "2026-10-11",
    entradasPorPrecio: 1,
  },
  {
    key: "regular",
    label: "Precio regular",
    detalle: "Del 12 al 18 de octubre · Precio por entrada",
    from: "2026-10-12",
    to: "2026-10-18",
    entradasPorPrecio: 1,
  },
];

// La fecha se calcula en horario de Perú (America/Lima, UTC-5), no en UTC:
// con el servidor en UTC, cualquier hora desde las 7pm hora Peru en adelante
// ya cuenta como "el día siguiente" en UTC, lo que adelantaba la promo antes
// de tiempo.
function getPeruISODate(today: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
}

function getActiveTier(today: Date): Tier {
  const iso = getPeruISODate(today);
  const found = tiers.find((t) => iso >= t.from && iso <= t.to);
  if (found) return found;
  return iso < tiers[0].from ? tiers[0] : tiers[tiers.length - 1];
}

function EntradasPage() {
  const [eventSettings, setEventSettings] = useState<EventSettings>(getStoredEventSettings);
  // Misma regla que el CRM: la promo vigente sale de las fechas configuradas
  const activeTier = useMemo(
    () => tiers.find((t) => t.key === getActivePromoKey(eventSettings.promos)) ?? getActiveTier(new Date()),
    [eventSettings.promos]
  );
  const [funcion, setFuncion] = useState<string | null>(null);
  const [zonaKey, setZonaKey] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [vendedor, setVendedor] = useState("");

  // CRM Live State (Conectado a Neon PostgreSQL en Tiempo Real)
  const [crmReservations, setCrmReservations] = useState<TicketReservation[]>([]);
  const [neonSoldMap, setNeonSoldMap] = useState<Record<string, Record<string, number>> | null>(null);

  const activeFunciones = eventSettings.funciones;
  const activeZonasVenta: Zone[] = useMemo(() => {
    return eventSettings.zonas
      .filter((z) => z.key !== "cortesia")
      .map((z) => ({
        key: z.key,
        label: z.label,
        color: z.color,
        seats: z.seats,
        prices: z.prices,
        sellable: true,
      }));
  }, [eventSettings.zonas]);

  const syncNeonStock = async () => {
    try {
      const res = await fetchPublicAvailabilityServer();
      if (res && res.ok && res.soldMap) {
        setNeonSoldMap(res.soldMap);
      }
    } catch {
      // Fallback a almacenamiento local si no hay conexión
    }
  };

  const syncNeonSettings = async () => {
    try {
      const res = await fetchPublicEventSettingsServer();
      if (res && res.ok && res.settings) {
        setEventSettings(res.settings);
        saveStoredEventSettingsLocally(res.settings);
      }
    } catch {
      // Fallback a almacenamiento local si no hay conexión
    }
  };

  useEffect(() => {
    setCrmReservations(getStoredReservations());
    setEventSettings(getStoredEventSettings());
    syncNeonStock();
    syncNeonSettings();

    // Polling cada 30s, solo con la pestaña visible, sin solapamiento
    const stopPolling = startVisiblePolling(
      () => Promise.all([syncNeonStock(), syncNeonSettings()]),
      30000
    );

    // El listener SOLO relee almacenamiento local: nunca vuelve a llamar al
    // servidor (antes hacía sync -> guardar -> evento -> sync en bucle).
    const unsubscribe = onCRMUpdate(() => {
      setCrmReservations(getStoredReservations());
      setEventSettings(getStoredEventSettings());
    });

    return () => {
      stopPolling();
      unsubscribe();
    };
  }, []);

  const liveReservations = useMemo(() => {
    if (!neonSoldMap) return crmReservations;
    const synthetic: TicketReservation[] = [];
    for (const [func, zones] of Object.entries(neonSoldMap)) {
      for (const [zKey, count] of Object.entries(zones)) {
        if (count > 0) {
          synthetic.push({
            id: `neon-${func}-${zKey}`,
            createdAt: new Date().toISOString(),
            clienteNombre: "Venta Confirmada",
            clienteTelefono: "-",
            funcion: func as any,
            zonaKey: zKey as any,
            cantidad: count,
            etapaPromo: "regular",
            totalPagado: 0,
            vendedor: "Harold López",
            estado: "confirmado",
          });
        }
      }
    }
    // Si Neon está conectado, usar la información directa de Neon PostgreSQL
    return neonSoldMap !== null ? synthetic : crmReservations;
  }, [neonSoldMap, crmReservations]);

  const currentZoneAvail = useMemo(() => {
    if (!zonaKey || !funcion) return null;
    const targetZ = activeZonasVenta.find((item) => item.key === zonaKey);
    return getZoneAvailability(liveReservations, funcion, zonaKey, targetZ?.seats);
  }, [liveReservations, funcion, zonaKey, activeZonasVenta]);

  const zona = activeZonasVenta.find((z) => z.key === zonaKey) ?? null;
  const precioPorUnidad = zona ? zona.prices[activeTier.key] : null;
  const total = precioPorUnidad != null ? precioPorUnidad * cantidad : null;
  const entradasTotales = cantidad * activeTier.entradasPorPrecio;
  const esPaquete = activeTier.entradasPorPrecio > 1;

  const noHayCupo = Boolean(
    currentZoneAvail && (currentZoneAvail.isSoldOut || entradasTotales > currentZoneAvail.availableSeats)
  );

  const puedeReservar = Boolean(
    funcion && zona && nombre.trim() && dni.trim() && !noHayCupo
  );

  const cantidadLinea = esPaquete
    ? `CANTIDAD: ${cantidad} promoción(es) ${activeTier.label} = ${entradasTotales} entradas`
    : `CANTIDAD: ${cantidad} entrada(s)`;

  const mensaje =
    zona && total != null
      ? encodeURIComponent(
          `Hola, quiero reservar entradas para JESUCRISTO ROCKSTAR (Dom 18 de octubre):\n\n` +
            `NOMBRE: ${nombre.trim()}\n` +
            `DNI: ${dni.trim()}\n` +
            `${cantidadLinea}\n` +
            `ZONA: ${zona.label.toUpperCase()}\n` +
            `HORARIO DE FUNCIÓN: ${funcion}\n` +
            `MONTO: S/${total} SOLES (${activeTier.label.toUpperCase()})\n` +
            `VENDEDOR: ${vendedor.trim() || "Venta directa (web)"}\n\n` +
            `Quedo atento/a para enviar mi comprobante de pago. ¡Gracias!`
        )
      : "";

  return (
    <div className="bg-negro text-blanco overflow-x-hidden">
      <header className="border-b border-gris-textura sticky top-0 z-20 bg-negro/90 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 flex items-center">
          <Link to="/entradas" className="flex items-center group" aria-label="Chaplin Grupo Cultural">
            <img
              src="/logo-chaplin.png"
              alt="Chaplin Grupo Cultural"
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ filter: "invert(1) hue-rotate(180deg)" }}
            />
          </Link>
        </div>
      </header>

      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 overflow-hidden bg-negro grain">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <p className="font-body uppercase tracking-[0.3em] sm:tracking-[0.4em] text-rojo text-[11px] sm:text-xs mb-4 sm:mb-6">Temporada 2026 · Preventa</p>
          <h1 className="font-display text-blanco text-[40px] sm:text-[64px] md:text-[80px] lg:text-[108px] leading-[0.92] mb-4 sm:mb-6">
            JESUCRISTO
            <br />
            <span className="text-rojo">ROCKSTAR</span>
          </h1>
          <p className="font-body text-blanco/60 text-sm sm:text-base md:text-lg max-w-2xl leading-[1.7] sm:leading-[1.8]">
            Domingo 18 de octubre · Funciones {activeFunciones.join(" y ")} · Auditorio del Colegio de Ingenieros de Ica · Dirección general: Harold López
          </p>
          <div className="linea-roja mt-6 sm:mt-8" style={{ transformOrigin: "left center" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-rojo/20" />
      </section>

      <section className="bg-negro grain relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(254,0,0,0.16),transparent_60%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-20 pb-16 relative z-10">
          <div className="relative max-w-xl mx-auto mb-16 group">
            <div className="absolute -inset-4 bg-rojo/25 blur-3xl rounded-full pointer-events-none" />
            <img
              src={flyerOficial}
              alt={`Jesucristo Rockstar — Chaplin Grupo Cultural — Dom 18 de octubre, funciones ${activeFunciones.join(" y ")}, Auditorio del Colegio de Ingenieros de Ica`}
              className="relative w-full border-2 border-rojo shadow-[0_30px_80px_-20px_rgba(254,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>

          {/* Detalles del evento */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {detallesEvento.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-3 border border-gris-textura px-5 py-4">
                <Icon size={18} className="text-rojo shrink-0 mt-0.5" />
                <span className="font-body text-blanco/80 text-sm leading-snug">{label}</span>
              </div>
            ))}
          </div>

          {/* Sinopsis */}
          <div className="max-w-3xl mb-16">
            <h2 className="font-display text-blanco text-3xl mb-6">De qué trata</h2>
            <p className="font-body text-blanco/70 text-base leading-relaxed mb-10">{sinopsis}</p>

            <h2 className="font-display text-blanco text-3xl mb-6">Ficha técnica</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-10">
              {fichaTecnica.map((f) => (
                <div key={f.rol} className="border-b border-gris-textura pb-3">
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/50">{f.rol}</p>
                  <p className="font-body text-blanco text-base">{f.nombre}</p>
                </div>
              ))}
            </div>

            <h2 className="font-display text-blanco text-3xl mb-6">Elenco</h2>
            <p className="font-body text-blanco/70 text-sm leading-relaxed">{elenco.join(" · ")}</p>
          </div>

          {/* Banda de promo activa */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-rojo text-negro px-6 py-4 mb-16">
            <span className="font-body font-bold text-sm uppercase tracking-[0.2em]">
              {activeTier.label} vigente
            </span>
            <span className="font-body text-xs uppercase tracking-[0.15em]">{activeTier.detalle}</span>
          </div>

          {/* Precios por zona (ancho completo y 100% responsive) */}
          <div className="mb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="font-display text-blanco text-3xl md:text-4xl">Precios por zona</h2>
                <p className="font-body text-blanco/60 text-sm mt-1">
                  Consulta todas las etapas de preventa y tarifas oficiales. Toca una zona para seleccionarla.
                </p>
              </div>
              <div className="text-xs font-body text-blanco/40 uppercase tracking-[0.15em] shrink-0">
                * Precios en Soles (PEN)
              </div>
            </div>

            {/* Tabla para Desktop (md y superior con columnas amplias y badges completos) */}
            <div className="hidden md:block border border-gris-textura bg-negro relative overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-gris-textura bg-blanco/[0.02]">
                      <th className="font-body text-[11px] uppercase tracking-[0.18em] text-blanco/60 px-5 md:px-6 py-4 sticky left-0 bg-negro z-20 border-r border-gris-textura/50 w-[24%] min-w-[170px]">
                        Zona
                      </th>
                      {tiers.map((t) => {
                        const isActive = t.key === activeTier.key;
                        return (
                          <th
                            key={t.key}
                            className={`font-body px-5 py-4 transition-colors w-[19%] min-w-[145px] relative ${
                              isActive ? "bg-rojo/10 text-rojo" : "text-blanco/70"
                            }`}
                          >
                            {isActive && (
                              <div className="inline-flex items-center gap-1.5 bg-rojo text-negro text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 mb-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-negro animate-pulse" />
                                Vigente hoy
                              </div>
                            )}
                            <div className={`text-xs uppercase tracking-[0.15em] font-bold ${isActive ? "text-rojo" : "text-blanco"}`}>
                              {t.label}
                            </div>
                            <span className="block font-normal normal-case tracking-normal text-[11px] text-blanco/50 mt-1 leading-snug">
                              {t.detalle}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {activeZonasVenta.map((z) => {
                      const isSelected = zonaKey === z.key;
                      return (
                        <tr
                          key={z.key}
                          onClick={() => setZonaKey(z.key)}
                          className={`group border-b border-gris-textura last:border-0 cursor-pointer transition-colors ${
                            isSelected ? "bg-rojo/15" : "hover:bg-blanco/[0.04]"
                          }`}
                        >
                          <td
                            className={`px-5 md:px-6 py-4 sticky left-0 z-10 border-r border-gris-textura/50 transition-colors ${
                              isSelected ? "bg-zinc-950" : "bg-negro group-hover:bg-zinc-950"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-3.5 h-3.5 shrink-0" style={{ backgroundColor: z.color }} />
                              <div>
                                <span className={`font-body font-semibold text-sm ${isSelected ? "text-rojo" : "text-blanco"}`}>
                                  {z.label}
                                </span>
                                <span className="block font-body text-[11px] text-blanco/40">
                                  {z.seats} asientos
                                </span>
                              </div>
                            </div>
                          </td>
                          {tiers.map((t) => {
                            const isActive = t.key === activeTier.key;
                            return (
                              <td
                                key={t.key}
                                className={`font-body px-5 py-4 ${
                                  isActive
                                    ? "bg-rojo/10 text-rojo font-bold"
                                    : "text-blanco/80"
                                }`}
                              >
                                <span className="text-sm font-normal text-blanco/40 mr-0.5">S/</span>
                                <span className="text-base md:text-lg font-bold">{z.prices[t.key]}</span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vista adaptada para Celular / Móvil: 100% en una sola carga, sin deslizar horizontalmente */}
            <div className="md:hidden border border-gris-textura bg-negro overflow-hidden">
              <table className="w-full text-center border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-gris-textura bg-blanco/[0.02]">
                    <th className="font-body text-[10px] uppercase tracking-wider text-blanco/50 py-3 pl-2.5 pr-1 text-left w-[28%]">
                      Zona
                    </th>
                    {tiers.map((t) => {
                      const isActive = t.key === activeTier.key;
                      const title1 =
                        t.key === "twoXone" ? "PREVENTA" :
                        t.key === "threeXtwo" ? "PREVENTA" :
                        t.key === "twentyPct" ? "PREVENTA" : "PRECIO";
                      const title2 =
                        t.key === "twoXone" ? "2X1" :
                        t.key === "threeXtwo" ? "3X2" :
                        t.key === "twentyPct" ? "20% DTO." : "REGULAR";
                      const dateText =
                        t.key === "twoXone" ? "16-22 set." :
                        t.key === "threeXtwo" ? "23 set.-2 oct." :
                        t.key === "twentyPct" ? "3-11 oct." : "12-18 oct.";

                      return (
                        <th
                          key={t.key}
                          className={`font-body py-2.5 px-0.5 transition-colors w-[18%] relative ${
                            isActive ? "bg-rojo/15 text-rojo border-x border-rojo/30" : "text-blanco/70"
                          }`}
                        >
                          {isActive && (
                            <div className="inline-block bg-rojo text-negro text-[7px] font-bold uppercase tracking-wider px-1 py-0.2 rounded-xs mb-1">
                              HOY
                            </div>
                          )}
                          <div className={`text-[9px] font-bold uppercase leading-none ${isActive ? "text-rojo" : "text-blanco"}`}>
                            {title1}
                          </div>
                          <div className={`text-[10px] font-extrabold uppercase leading-tight mt-0.5 ${isActive ? "text-rojo" : "text-blanco"}`}>
                            {title2}
                          </div>
                          <span className={`block font-body text-[7px] tracking-tight mt-1 leading-none ${isActive ? "text-rojo font-semibold" : "text-blanco/40"}`}>
                            {dateText}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeZonasVenta.map((z) => {
                    const isSelected = zonaKey === z.key;
                    return (
                      <tr
                        key={z.key}
                        onClick={() => setZonaKey(z.key)}
                        className={`border-b border-gris-textura last:border-0 cursor-pointer transition-colors ${
                          isSelected ? "bg-rojo/15" : "hover:bg-blanco/[0.04]"
                        }`}
                      >
                        <td className="py-3 pl-2.5 pr-1 text-left">
                          <div className="flex items-start gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                              style={{ backgroundColor: z.color }}
                            />
                            <div className="min-w-0">
                              <span className={`font-body font-semibold text-[11px] block leading-tight ${isSelected ? "text-rojo" : "text-blanco"}`}>
                                {z.label}
                              </span>
                              <span className="block font-body text-[9px] text-blanco/40 leading-none mt-0.5">
                                {z.seats} asientos
                              </span>
                            </div>
                          </div>
                        </td>
                        {tiers.map((t) => {
                          const isActive = t.key === activeTier.key;
                          return (
                            <td
                              key={t.key}
                              className={`font-body py-3 px-0.5 ${
                                isActive
                                  ? "bg-rojo/10 text-rojo font-bold border-x border-rojo/20"
                                  : "text-blanco/80"
                              }`}
                            >
                              <div className="flex items-baseline justify-center">
                                <span className="text-[9px] font-normal text-blanco/40 mr-0.5">S/</span>
                                <span className={`font-bold ${isActive ? "text-sm text-rojo" : "text-xs text-blanco"}`}>
                                  {z.prices[t.key]}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Detalle completo de cada etapa y preventa para móvil */}
              <div className="border-t border-gris-textura bg-blanco/[0.02] p-3 space-y-2 text-left font-body">
                <div className="text-[10px] uppercase tracking-wider text-blanco/40 font-semibold mb-1 flex items-center justify-between">
                  <span>Detalle de etapas y promociones:</span>
                  <span className="text-blanco/40 normal-case text-[10px]">Toca una zona para seleccionar</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {tiers.map((t) => {
                    const isActive = t.key === activeTier.key;
                    return (
                      <div
                        key={t.key}
                        className={`p-2.5 transition-colors border ${
                          isActive
                            ? "bg-rojo/10 border-rojo/40 text-blanco"
                            : "bg-negro/50 border-gris-textura/50 text-blanco/70"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-rojo animate-pulse" />}
                            <span className={`font-bold uppercase tracking-wider text-[11px] ${isActive ? "text-rojo" : "text-blanco"}`}>
                              {t.label}
                            </span>
                          </div>
                          {isActive && (
                            <span className="bg-rojo text-negro text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                              Vigente hoy
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-blanco/60 mt-1 leading-snug">
                          {t.detalle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Mapa de zonas */}
            <div className="min-w-0">
              <h2 className="font-display text-blanco text-3xl mb-8">Mapa de zonas</h2>
              <img
                src={mapaZonas}
                alt="Mapa de asistencia Jesucristo Rockstar: Zona Superstar, Zona Cortesía, Zona Getsemaní, Zona Hosanna y 2do piso Zona Pueblo"
                className="w-full border border-gris-textura mb-6"
              />
              <div className="border border-gris-textura">
                {activeZonasVenta.slice(0, 1).map((z) => {
                  const avail = funcion ? getZoneAvailability(liveReservations, funcion, z.key, z.seats) : undefined;
                  return (
                    <ZoneRow
                      key={z.key}
                      zone={z}
                      selected={zonaKey === z.key}
                      availability={avail}
                      onSelect={() => setZonaKey(z.key)}
                    />
                  );
                })}
                {/* Zona Cortesía - Fila referencial del mapa (14 asientos) */}
                <div className="w-full flex items-center justify-between px-6 py-4 border-t border-gris-textura text-left bg-blanco/[0.02]">
                  <div className="flex items-center gap-4">
                    <span className="w-5 h-5 shrink-0" style={{ backgroundColor: "#c59a58" }} />
                    <div>
                      <span className="font-body font-semibold uppercase tracking-[0.1em] text-sm text-blanco/80">
                        Zona Cortesía
                      </span>
                      <span className="block text-[10px] text-amber-300/80 font-medium mt-0.5">
                        Fila reservada para invitados especiales y producción
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-body text-blanco/80 text-xs font-semibold block">
                      14 asientos
                    </span>
                    <span className="font-body text-blanco/40 text-[10px]">por función</span>
                  </div>
                </div>
                {activeZonasVenta.slice(1).map((z) => {
                  const avail = funcion ? getZoneAvailability(liveReservations, funcion, z.key, z.seats) : undefined;
                  return (
                    <ZoneRow
                      key={z.key}
                      zone={z}
                      selected={zonaKey === z.key}
                      availability={avail}
                      onSelect={() => setZonaKey(z.key)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Formulario */}
            <div className="min-w-0">
              <h2 className="font-display text-blanco text-3xl mb-6">Arma tu reserva</h2>
              <div className="space-y-8">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">Función</p>
                  <div className="flex flex-wrap gap-3">
                    {activeFunciones.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFuncion(f)}
                        className={`font-body text-sm uppercase tracking-[0.1em] px-5 py-2.5 border transition-colors ${
                          funcion === f
                            ? "bg-rojo text-negro border-rojo font-bold"
                            : "border-gris-textura text-blanco hover:border-rojo"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60">Zona</p>
                    {funcion && (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                        ● Stock en vivo ({funcion})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {activeZonasVenta.map((z) => {
                      const avail = funcion ? getZoneAvailability(liveReservations, funcion, z.key, z.seats) : undefined;
                      const isSoldOut = Boolean(avail?.isSoldOut);
                      return (
                        <button
                          key={z.key}
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => setZonaKey(z.key)}
                          className={`font-body text-sm uppercase tracking-[0.1em] px-4 py-2.5 border transition-all flex items-center gap-2 ${
                            isSoldOut
                              ? "border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed line-through"
                              : zonaKey === z.key
                              ? "bg-rojo text-negro border-rojo font-bold"
                              : "border-gris-textura text-blanco hover:border-rojo"
                          }`}
                        >
                          <span>{z.label}</span>
                          {avail && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 ${
                                isSoldOut
                                  ? "bg-rose-950 text-rose-400 no-underline"
                                  : avail.isLowStock
                                  ? "bg-amber-400 text-negro animate-pulse"
                                  : zonaKey === z.key
                                  ? "bg-negro/30 text-negro"
                                  : "bg-blanco/10 text-blanco/70"
                              }`}
                            >
                              {isSoldOut ? "AGOTADO" : `${avail.availableSeats} disp.`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={esPaquete ? "bg-yellow-400/10 border border-yellow-400 px-4 py-4" : ""}>
                  <p
                    className={`font-body text-[11px] uppercase tracking-[0.2em] mb-3 ${
                      esPaquete ? "text-yellow-400 font-bold" : "text-blanco/60"
                    }`}
                  >
                    {esPaquete ? `Promociones ${activeTier.label}` : "Cantidad de entradas"}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gris-textura text-blanco hover:border-rojo transition-colors"
                      aria-label="Restar"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-display text-blanco text-2xl w-8 text-center">{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gris-textura text-blanco hover:border-rojo transition-colors"
                      aria-label="Sumar"
                    >
                      <Plus size={16} />
                    </button>
                    {esPaquete && (
                      <span className="font-body font-bold text-negro text-sm bg-yellow-400 px-3 py-1.5">
                        = {entradasTotales} entrada{entradasTotales === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">Nombres y apellidos</p>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full bg-transparent border border-gris-textura text-blanco font-body text-sm px-4 py-3 focus:outline-none focus:border-rojo transition-colors"
                    />
                  </div>
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">DNI</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="Tu DNI"
                      className="w-full bg-transparent border border-gris-textura text-blanco font-body text-sm px-4 py-3 focus:outline-none focus:border-rojo transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">
                      Vendedor <span className="normal-case text-blanco/40">(si un integrante del equipo te está ayudando con la compra)</span>
                    </p>
                    <input
                      type="text"
                      value={vendedor}
                      onChange={(e) => setVendedor(e.target.value)}
                      placeholder="Opcional"
                      className="w-full bg-transparent border border-gris-textura text-blanco font-body text-sm px-4 py-3 focus:outline-none focus:border-rojo transition-colors"
                    />
                  </div>
                </div>

                <div className="border-t border-gris-textura pt-6 flex items-baseline justify-between">
                  <div>
                    <span className="font-body text-blanco/60 text-sm uppercase tracking-[0.15em] block">Total estimado</span>
                    {zona && (
                      <span className="font-body text-blanco/50 text-xs">
                        {entradasTotales} entrada{entradasTotales === 1 ? "" : "s"} en total · {activeTier.label}
                      </span>
                    )}
                  </div>
                  <span className="font-display text-rojo text-4xl">{total != null ? `S/${total}` : "—"}</span>
                </div>

                {puedeReservar ? (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-rojo w-full flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={18} />
                    Reservar por WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-3 font-body font-bold text-sm uppercase tracking-[0.2em] px-9 py-3.5 bg-gris-textura text-blanco/40 cursor-not-allowed"
                  >
                    <MessageCircle size={18} />
                    Reservar por WhatsApp
                  </button>
                )}

                {noHayCupo && currentZoneAvail && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>
                      {currentZoneAvail.isSoldOut
                        ? `Esta zona (${zona?.label}) está agotada para la función de las ${funcion}. Por favor selecciona otro horario u otra zona.`
                        : `Solo quedan ${currentZoneAvail.availableSeats} asientos en ${zona?.label} para las ${funcion}. Reduce la cantidad para continuar.`}
                    </span>
                  </div>
                )}

                <p className="font-body text-blanco/50 text-xs leading-relaxed">
                  {noHayCupo
                    ? "El aforo solicitado supera la disponibilidad en vivo."
                    : puedeReservar
                    ? "La reserva se confirma directamente con nuestro equipo por WhatsApp. Cupos sujetos a disponibilidad en tiempo real."
                    : "Completa función, zona, nombre y DNI para continuar."}
                </p>

                <div className="border border-gris-textura px-5 py-4">
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-2">Medios de pago</p>
                  <p className="font-body text-blanco/70 text-sm leading-relaxed">
                    Plin: <span className="text-blanco font-semibold">969 821 836</span> (Yenny Huamani Huamani).
                    Coordinamos el resto de medios de pago por WhatsApp al confirmar tu reserva.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gris-textura py-8">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 text-center">
          <p className="font-body text-blanco/40 text-xs uppercase tracking-[0.2em]">
            Chaplin Grupo Cultural · Ica, Perú
          </p>
        </div>
      </footer>
    </div>
  );
}

function ZoneRow({
  zone,
  selected,
  onSelect,
  availability,
}: {
  zone: Zone;
  selected: boolean;
  onSelect: () => void;
  availability?: ZoneAvailability;
}) {
  const isSoldOut = Boolean(availability?.isSoldOut);
  const isLowStock = Boolean(availability?.isLowStock);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isSoldOut}
      className={`w-full flex items-center justify-between px-6 py-5 border-t border-gris-textura text-left transition-colors ${
        selected ? "bg-rojo/10" : "hover:bg-blanco/5"
      } ${isSoldOut ? "opacity-40 cursor-not-allowed bg-rose-950/10" : ""}`}
    >
      <div className="flex items-center gap-4">
        <span className="w-5 h-5 shrink-0" style={{ backgroundColor: zone.color }} />
        <div>
          <span className={`font-body font-semibold uppercase tracking-[0.1em] text-sm ${selected ? "text-rojo" : "text-blanco"}`}>
            {zone.label}
          </span>
          {isSoldOut ? (
            <span className="block text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-0.5">
              ● Agotado para esta función
            </span>
          ) : isLowStock ? (
            <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5 animate-pulse">
              🔥 ¡Últimos {availability?.availableSeats} asientos disponibles!
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        <span className="font-body text-blanco/80 text-xs font-semibold block">
          {availability ? `${availability.availableSeats} disponibles` : `${zone.seats} asientos`}
        </span>
        <span className="font-body text-blanco/40 text-[10px]">de {zone.seats} totales</span>
      </div>
    </button>
  );
}

