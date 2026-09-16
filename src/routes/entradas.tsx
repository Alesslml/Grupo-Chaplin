import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/chaplin/PageLayout";
import { PageHero } from "@/components/chaplin/PageHero";
import { MessageCircle, Minus, Plus } from "lucide-react";
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

interface Zone {
  key: string;
  label: string;
  color: string;
  seats: number;
  prices: { twoXone: number; threeXtwo: number; twentyPct: number };
  sellable: true;
}

const zonasVenta: Zone[] = [
  {
    key: "superstar",
    label: "Zona Superstar",
    color: "#fe0000",
    seats: 64,
    prices: { twoXone: 80, threeXtwo: 160, twentyPct: 64 },
    sellable: true,
  },
  {
    key: "getsemani",
    label: "Zona Getsemaní",
    color: "#f2d675",
    seats: 46,
    prices: { twoXone: 60, threeXtwo: 120, twentyPct: 48 },
    sellable: true,
  },
  {
    key: "hosanna",
    label: "Zona Hosanna",
    color: "#7dd3e8",
    seats: 66,
    prices: { twoXone: 40, threeXtwo: 80, twentyPct: 32 },
    sellable: true,
  },
  {
    key: "pueblo",
    label: "Zona Pueblo (2do piso)",
    color: "#2b3a8f",
    seats: 80,
    prices: { twoXone: 20, threeXtwo: 40, twentyPct: 16 },
    sellable: true,
  },
];

type TierKey = "twoXone" | "threeXtwo" | "twentyPct";

interface Tier {
  key: TierKey;
  label: string;
  detalle: string;
  from: string;
  to: string;
}

const tiers: Tier[] = [
  { key: "twoXone", label: "Preventa 2x1", detalle: "Del 16 al 22 de setiembre", from: "2026-09-16", to: "2026-09-22" },
  { key: "threeXtwo", label: "Preventa 3x2", detalle: "Del 23 de setiembre al 2 de octubre", from: "2026-09-23", to: "2026-10-02" },
  { key: "twentyPct", label: "Preventa 20% dto.", detalle: "Del 3 al 11 de octubre", from: "2026-10-03", to: "2026-10-11" },
];

function getActiveTier(today: Date): { key: TierKey; label: string; detalle: string } {
  const iso = today.toISOString().slice(0, 10);
  const found = tiers.find((t) => iso >= t.from && iso <= t.to);
  if (found) return found;
  if (iso < tiers[0].from) return { key: "twoXone", label: "Preventa 2x1", detalle: "Del 16 al 22 de setiembre" };
  return { key: "twentyPct", label: "Precio regular", detalle: "Desde el 12 de octubre" };
}

function EntradasPage() {
  const activeTier = useMemo(() => getActiveTier(new Date()), []);
  const [funcion, setFuncion] = useState(funciones[0]);
  const [zonaKey, setZonaKey] = useState(zonasVenta[0].key);
  const [cantidad, setCantidad] = useState(1);

  const zona = zonasVenta.find((z) => z.key === zonaKey) ?? zonasVenta[0];
  const precioUnitario = zona.prices[activeTier.key];
  const total = precioUnitario * cantidad;

  const mensaje = encodeURIComponent(
    `Hola Harold, quiero reservar entradas para JESUCRISTO ROCKSTAR (Dom 18 de octubre):\n\n` +
      `• Función: ${funcion}\n` +
      `• Zona: ${zona.label}\n` +
      `• Cantidad: ${cantidad} entrada(s)\n` +
      `• Precio aplicado: ${activeTier.label} (S/${precioUnitario} c/u)\n` +
      `• Total estimado: S/${total}\n\n` +
      `Quedo atento/a para confirmar disponibilidad y coordinar el pago. ¡Gracias!`
  );

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
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-20">
          <img
            src={flyerOficial}
            alt="Jesucristo Rockstar — Chaplin Grupo Cultural — Dom 18 de octubre, funciones 4:00 pm y 7:00 pm, Auditorio del Colegio de Ingenieros de Ica"
            className="w-full max-w-md mx-auto shadow-black border border-gris-textura mb-16"
          />

          {/* Banda de promo activa */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-rojo text-negro px-6 py-4 mb-16">
            <span className="font-body font-bold text-sm uppercase tracking-[0.2em]">
              {activeTier.label} vigente
            </span>
            <span className="font-body text-xs uppercase tracking-[0.15em]">{activeTier.detalle}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Mapa de zonas */}
            <div>
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
            <div>
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
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-blanco/60 mb-3">Cantidad</p>
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
                  </div>
                </div>

                <div className="border-t border-gris-textura pt-6 flex items-baseline justify-between">
                  <span className="font-body text-blanco/60 text-sm uppercase tracking-[0.15em]">Total estimado</span>
                  <span className="font-display text-rojo text-4xl">S/{total}</span>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rojo w-full flex items-center justify-center gap-3"
                >
                  <MessageCircle size={18} />
                  Reservar por WhatsApp
                </a>

                <p className="font-body text-blanco/50 text-xs leading-relaxed">
                  La reserva se confirma directamente con nuestro equipo por WhatsApp. Cupos sujetos a disponibilidad.
                </p>
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

