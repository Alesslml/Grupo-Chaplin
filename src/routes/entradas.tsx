import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import { MessageCircle, Minus, Plus, Calendar, Clock, MapPin, Users } from "lucide-react";
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
    seats: 64,
    prices: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 64 },
    sellable: true,
  },
  {
    key: "getsemani",
    label: "Zona Getsemaní",
    color: "#f2d675",
    seats: 46,
    prices: { twoXone: 60, threeXtwo: 120, twentyPct: 48, regular: 48 },
    sellable: true,
  },
  {
    key: "hosanna",
    label: "Zona Hosanna",
    color: "#7dd3e8",
    seats: 66,
    prices: { twoXone: 40, threeXtwo: 80, twentyPct: 32, regular: 32 },
    sellable: true,
  },
  {
    key: "pueblo",
    label: "Zona Pueblo (2do piso)",
    color: "#2b3a8f",
    seats: 80,
    prices: { twoXone: 20, threeXtwo: 40, twentyPct: 16, regular: 16 },
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

function getActiveTier(today: Date): Tier {
  const iso = today.toISOString().slice(0, 10);
  const found = tiers.find((t) => iso >= t.from && iso <= t.to);
  if (found) return found;
  return iso < tiers[0].from ? tiers[0] : tiers[tiers.length - 1];
}

function EntradasPage() {
  const activeTier = useMemo(() => getActiveTier(new Date()), []);
  const [funcion, setFuncion] = useState<string | null>(null);
  const [zonaKey, setZonaKey] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [vendedor, setVendedor] = useState("");

  const zona = zonasVenta.find((z) => z.key === zonaKey) ?? null;
  const precioPorUnidad = zona ? zona.prices[activeTier.key] : null;
  const total = precioPorUnidad != null ? precioPorUnidad * cantidad : null;
  const entradasTotales = cantidad * activeTier.entradasPorPrecio;
  const esPaquete = activeTier.entradasPorPrecio > 1;

  const puedeReservar = Boolean(funcion && zona && nombre.trim() && dni.trim());

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
    <PageLayout>
      <PageHero
        eyebrow="Temporada 2026 · Preventa"
        title={
          <>
            JESUCRISTO
            <br />
            <span className="text-rojo">ROCKSTAR</span>
          </>
        }
        subtitle="Domingo 18 de octubre · Funciones 4:00 pm y 7:00 pm · Auditorio del Colegio de Ingenieros de Ica · Dirección general: Harold López"
      />

      <section className="bg-negro grain relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(254,0,0,0.16),transparent_60%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-20 pb-16 relative z-10">
          <div className="relative max-w-xl mx-auto mb-16 group">
            <div className="absolute -inset-4 bg-rojo/25 blur-3xl rounded-full pointer-events-none" />
            <img
              src={flyerOficial}
              alt="Jesucristo Rockstar — Chaplin Grupo Cultural — Dom 18 de octubre, funciones 4:00 pm y 7:00 pm, Auditorio del Colegio de Ingenieros de Ica"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Mapa de zonas */}
            <div className="min-w-0">
              <h2 className="font-display text-blanco text-3xl mb-8">Mapa de zonas</h2>
              <img
                src={mapaZonas}
                alt="Mapa de asistencia Jesucristo Rockstar: Zona Superstar, Zona Getsemaní, Zona Hosanna y 2do piso Zona Pueblo"
                className="w-full border border-gris-textura mb-6"
              />
              <div className="border border-gris-textura">
                <ZoneRow zone={zonasVenta[0]} selected={zonaKey === "superstar"} onSelect={() => setZonaKey("superstar")} />
                <ZoneRow zone={zonasVenta[1]} selected={zonaKey === "getsemani"} onSelect={() => setZonaKey("getsemani")} />
                <ZoneRow zone={zonasVenta[2]} selected={zonaKey === "hosanna"} onSelect={() => setZonaKey("hosanna")} />
                <ZoneRow zone={zonasVenta[3]} selected={zonaKey === "pueblo"} onSelect={() => setZonaKey("pueblo")} />
              </div>
            </div>

            {/* Tabla de precios + formulario */}
            <div className="min-w-0">
              <h2 className="font-display text-blanco text-3xl mb-8">Precios por zona</h2>
              <div className="border border-gris-textura mb-12 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gris-textura">
                      <th className="font-body text-[11px] uppercase tracking-[0.15em] text-blanco/60 px-4 py-3">Zona</th>
                      {tiers.map((t) => (
                        <th
                          key={t.key}
                          className={`font-body text-[11px] uppercase tracking-[0.15em] px-4 py-3 ${
                            t.key === activeTier.key ? "text-rojo" : "text-blanco/60"
                          }`}
                        >
                          {t.label}
                          <span className="block font-normal normal-case tracking-normal text-[10px] text-blanco/40 mt-1">
                            {t.detalle}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zonasVenta.map((z) => (
                      <tr key={z.key} className="border-b border-gris-textura last:border-0">
                        <td className="font-body text-blanco text-sm px-4 py-3 flex items-center gap-2">
                          <span className="w-3 h-3 inline-block" style={{ backgroundColor: z.color }} />
                          {z.label}
                        </td>
                        {tiers.map((t) => (
                          <td
                            key={t.key}
                            className={`font-body text-sm px-4 py-3 ${
                              t.key === activeTier.key ? "text-rojo font-bold" : "text-blanco/70"
                            }`}
                          >
                            S/{z.prices[t.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="font-display text-blanco text-3xl mb-6">Arma tu reserva</h2>
              <div className="space-y-8">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">Función</p>
                  <div className="flex gap-3">
                    {funciones.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFuncion(f)}
                        className={`font-body text-sm uppercase tracking-[0.1em] px-5 py-2.5 border transition-colors ${
                          funcion === f
                            ? "bg-rojo text-negro border-rojo"
                            : "border-gris-textura text-blanco hover:border-rojo"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">Zona</p>
                  <div className="flex flex-wrap gap-3">
                    {zonasVenta.map((z) => (
                      <button
                        key={z.key}
                        type="button"
                        onClick={() => setZonaKey(z.key)}
                        className={`font-body text-sm uppercase tracking-[0.1em] px-5 py-2.5 border transition-colors ${
                          zonaKey === z.key
                            ? "bg-rojo text-negro border-rojo"
                            : "border-gris-textura text-blanco hover:border-rojo"
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">
                    {esPaquete ? `Promociones ${activeTier.label}` : "Cantidad de entradas"}
                  </p>
                  <div className="flex items-center gap-4">
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
                      <span className="font-body text-blanco/60 text-sm">
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

                <p className="font-body text-blanco/50 text-xs leading-relaxed">
                  {puedeReservar
                    ? "La reserva se confirma directamente con nuestro equipo por WhatsApp. Cupos sujetos a disponibilidad."
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
    </PageLayout>
  );
}

function ZoneRow({ zone, selected, onSelect }: { zone: Zone; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-6 py-5 border-t border-gris-textura text-left transition-colors ${
        selected ? "bg-rojo/10" : "hover:bg-blanco/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="w-5 h-5 shrink-0" style={{ backgroundColor: zone.color }} />
        <span className={`font-body font-semibold uppercase tracking-[0.1em] text-sm ${selected ? "text-rojo" : "text-blanco"}`}>
          {zone.label}
        </span>
      </div>
      <span className="font-body text-blanco/50 text-xs uppercase tracking-[0.15em]">{zone.seats} asientos</span>
    </button>
  );
}

