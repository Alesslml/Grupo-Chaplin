import { useMemo } from "react";
import {
  EVENTOS,
  getEffectiveTicketsCount,
  getPeruToday,
  type EventSettings,
  type TicketReservation,
} from "@/lib/tickets-crm";
import { Fireflies } from "@/components/shrek/Fireflies";
import shrekPersonaje from "@/assets/shrek/shrek-personaje.png";

/* Tablero del CRM para Shrek: ventas, ocupación y puerta con gráficas dibujadas en SVG
   (sin librerías). Todo sale de las mismas reservas que usa el resto del CRM. */

const EV = EVENTOS.shrek;
const COLOR_PROMO: Record<string, string> = {
  twoXone: "#a6e22e",
  threeXtwo: "#f6c744",
  twentyPct: "#35c0e0",
  regular: "#ff7a59",
  cortesia: "#c59a58",
};

interface Props {
  reservations: TicketReservation[];
  settings: EventSettings;
  stats: {
    totalRevenue: number;
    totalTickets: number;
    totalCap: number;
    totalAttendedTickets: number;
    percentAttendedTotal: number;
    funcionStats?: { funcion: string; tickets: number; revenue: number; percent: number }[];
  };
  zonas: { zonaKey: string; totalSeats: number; soldSeats: number; availableSeats: number; percentSold: number; isSoldOut: boolean }[];
  zonaMeta: Record<string, { label: string; color: string }>;
  funcionActual: string;
  onFuncion: (f: string) => void;
  promoActiva: string;
  onNuevaVenta: () => void;
}

const soles = (n: number) => `S/ ${Math.round(n).toLocaleString("es-PE")}`;
const fechaCorta = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}/${m}`;
};
const peruDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const diasEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function Ring({ valor, max, color, titulo, sub }: { valor: number; max: number; color: string; titulo: string; sub: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, valor / max) : 0;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-[140px] w-[140px]">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="14" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.2,0.7,0.2,1)", filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <p className="text-[34px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>
              {Math.round(pct * 100)}%
            </p>
            <p className="mt-0.5 text-[11px] text-white/50">{valor} de {max}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[15px] font-bold">{titulo}</p>
      <p className="text-[12px] text-white/50">{sub}</p>
    </div>
  );
}

function Dona({ items, centro }: { items: { label: string; value: number; color: string }[]; centro: string }) {
  const total = items.reduce((n, i) => n + i.value, 0);
  const r = 46;
  const c = 2 * Math.PI * r;
  let acum = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[120px] w-[120px] shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
          {total > 0 &&
            items
              .filter((i) => i.value > 0)
              .map((i) => {
                const len = (i.value / total) * c;
                const el = (
                  <circle
                    key={i.label}
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke={i.color}
                    strokeWidth="16"
                    strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
                    strokeDashoffset={-acum}
                  />
                );
                acum += len;
                return el;
              })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[26px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>
              {total}
            </p>
            <p className="text-[10px] text-white/50">{centro}</p>
          </div>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-[13px]">
        {items.map((i) => (
          <li key={i.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-white/80">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />
              {i.label}
            </span>
            <span className="font-bold tabular-nums">{i.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShrekDashboard({ reservations, settings, stats, zonas, zonaMeta, funcionActual, onFuncion, promoActiva, onNuevaVenta }: Props) {
  // En desarrollo se puede simular otra fecha con ?hoy=2026-11-12 para revisar las gráficas.
  const hoy =
    (import.meta.env.DEV && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("hoy") : null) || getPeruToday();
  const promos = settings.promos;
  const promo = promos.find((p) => p.key === promoActiva) ?? promos[0];
  const activas = reservations.filter((r) => r.estado !== "anulado");
  const diasFuncion = Math.max(0, diasEntre(hoy, EV.fechaISO));
  const ventaAbierta = hoy >= promos[0].from;
  const diasPromo = Math.max(0, diasEntre(hoy, promo.to)) + 1;

  // Ventas por día (en hora de Perú), desde que abre la preventa
  const dias = useMemo(() => {
    const inicio = promos[0].from;
    const fin = hoy < EV.fechaISO ? (hoy < inicio ? inicio : hoy) : EV.fechaISO;
    const n = Math.max(1, Math.min(60, diasEntre(inicio, fin) + 1));
    const lista = Array.from({ length: n }, (_, i) => ({ fecha: addDays(inicio, i), entradas: 0, dinero: 0 }));
    for (const r of activas) {
      const d = peruDay(r.createdAt);
      const item = lista.find((x) => x.fecha === d);
      if (item) {
        item.entradas += getEffectiveTicketsCount(r);
        item.dinero += Number(r.totalPagado || 0);
      }
    }
    return lista;
  }, [activas, promos, hoy]);
  const maxDia = Math.max(1, ...dias.map((d) => d.entradas));

  // Adultos / niños (asientos) y mezcla por etapa
  const { adultos, ninos, porEtapa } = useMemo(() => {
    let a = 0;
    let n = 0;
    const etapas: Record<string, number> = {};
    for (const r of activas) {
      const total = getEffectiveTicketsCount(r);
      const base = Number(r.cantidad || 0) + Number(r.cantidadNino || 0);
      const por = base > 0 ? total / base : 1;
      a += Math.round(Number(r.cantidad || 0) * por);
      n += Math.round(Number(r.cantidadNino || 0) * por);
      etapas[r.etapaPromo] = (etapas[r.etapaPromo] || 0) + total;
    }
    return { adultos: a, ninos: n, porEtapa: etapas };
  }, [activas]);

  const capTotal = stats.totalCap * Math.max(1, settings.funciones.length);
  const W = 640;
  const H = 230;
  const pad = { l: 34, r: 8, t: 14, b: 30 };
  const bw = (W - pad.l - pad.r) / dias.length;

  return (
    <div className="relative">
      {/* ─── Portada del tablero ─── */}
      <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(166,226,46,0.28),transparent_60%),linear-gradient(180deg,#0d2a17,#081a0f)] px-5 pb-8 pt-7 text-white sm:px-9 sm:pt-9">
        <Fireflies count={14} />
        <img
          src={shrekPersonaje}
          alt=""
          className="pointer-events-none absolute -bottom-6 right-4 hidden h-[290px] w-auto select-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] lg:block xl:right-12 xl:h-[320px]"
        />
        <div className="relative z-10 max-w-[640px] xl:max-w-[720px]">
          <p className="shk-eyebrow">Shrek · El inicio de la aventura</p>
          <h2 className="mt-2 text-[40px] leading-[0.95] sm:text-[56px]" style={{ fontFamily: "var(--shk-title)" }}>
            {ventaAbierta ? (
              <>
                Faltan <span className="text-[#caff55]">{diasFuncion}</span> días para la función
              </>
            ) : (
              <>
                La preventa abre el <span className="text-[#caff55]">{fechaCorta(promos[0].from)}</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-[15px] text-white/70">
            Sábado 28 de noviembre · 4:00 y 7:00 pm.{" "}
            {ventaAbierta && hoy <= EV.fechaISO && (
              <>
                Hoy rige <strong className="text-[#f6c744]">{promo.label}</strong>
                {diasPromo > 0 ? ` · quedan ${diasPromo} ${diasPromo === 1 ? "día" : "días"}` : ""}.
              </>
            )}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-white/12">
            {[
              ["Recaudado", soles(stats.totalRevenue), "#f6c744"],
              ["Entradas vendidas", `${stats.totalTickets}`, "#caff55"],
              ["Aforo vendido", `${capTotal > 0 ? Math.round((stats.totalTickets / capTotal) * 100) : 0}%`, "#35c0e0"],
              ["Ya en sala", `${stats.totalAttendedTickets}`, "#ff9d7a"],
            ].map(([label, valor, color], i) => (
              <div key={label} className={i === 0 ? "lg:pr-5" : "lg:px-5"}>
                <p className="text-[12px] text-white/55">{label}</p>
                <p className="mt-1 whitespace-nowrap text-[34px] leading-none sm:text-[40px]" style={{ fontFamily: "var(--shk-title)", color }}>
                  {valor}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onNuevaVenta}
            className="shk-btn mt-8 !px-7 !py-3 !text-[18px]"
          >
            Registrar una venta
          </button>
        </div>
      </section>

      {/* ─── Ventas por día + ocupación ─── */}
      <section className="mt-9 grid gap-9 text-white lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-[26px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>Ventas por día</h3>
              <p className="mt-1 text-[12px] text-white/50">Entradas vendidas cada día, con el color de la promo vigente.</p>
            </div>
            <ul className="hidden flex-wrap justify-end gap-x-4 gap-y-1 text-[11px] text-white/65 sm:flex">
              {promos.map((p) => (
                <li key={p.key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLOR_PROMO[p.key] }} />
                  {p.tag}
                </li>
              ))}
            </ul>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Entradas vendidas por día">
            {[0, 1].map((f) => {
              const y = pad.t + (H - pad.t - pad.b) * (1 - f);
              return (
                <g key={f}>
                  <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 5" />
                  <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.45)">
                    {Math.round(maxDia * f)}
                  </text>
                </g>
              );
            })}
            {dias.map((d, i) => {
              const promoDia = promos.find((p) => d.fecha >= p.from && d.fecha <= p.to);
              const color = COLOR_PROMO[promoDia?.key ?? "regular"];
              const h = ((H - pad.t - pad.b) * d.entradas) / maxDia;
              const x = pad.l + i * bw + bw * 0.14;
              const esHoy = d.fecha === hoy;
              return (
                <g key={d.fecha}>
                  <rect
                    x={x}
                    y={H - pad.b - Math.max(h, d.entradas > 0 ? 2 : 0)}
                    width={bw * 0.72}
                    height={Math.max(h, d.entradas > 0 ? 2 : 0)}
                    rx="4"
                    fill={color}
                    opacity={esHoy ? 1 : 0.85}
                    style={{ filter: esHoy ? `drop-shadow(0 0 8px ${color})` : undefined }}
                  >
                    <title>{`${fechaCorta(d.fecha)}: ${d.entradas} entradas · ${soles(d.dinero)}`}</title>
                  </rect>
                  {(i % Math.ceil(dias.length / 8) === 0 || esHoy) && (
                    <text x={x + bw * 0.36} y={H - 10} textAnchor="middle" fontSize="11" fill={esHoy ? "#caff55" : "rgba(255,255,255,0.5)"} fontWeight={esHoy ? 700 : 400}>
                      {fechaCorta(d.fecha)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {activas.length === 0 && <p className="mt-1 text-center text-[13px] text-white/50">Aún no hay ventas registradas.</p>}
        </div>

        <div>
          <h3 className="mb-4 text-[26px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>Ocupación por función</h3>
          <div className="grid grid-cols-2 gap-4">
            {(stats.funcionStats ?? []).map((fs, i) => (
              <Ring
                key={fs.funcion}
                valor={fs.tickets}
                max={stats.totalCap}
                color={i === 0 ? "#a6e22e" : "#35c0e0"}
                titulo={fs.funcion.toUpperCase()}
                sub={`${soles(fs.revenue)} · ${Math.max(0, stats.totalCap - fs.tickets)} libres`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Zonas + mezcla ─── */}
      <section className="mt-10 grid gap-9 text-white lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h3 className="text-[26px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>Zonas</h3>
            <div className="flex items-center gap-4">
              {settings.funciones.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFuncion(f)}
                  className={`relative cursor-pointer pb-1 text-[14px] ${funcionActual === f ? "font-bold text-white" : "text-white/45 hover:text-white/75"}`}
                >
                  {f.toUpperCase()}
                  <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#caff55]" style={{ opacity: funcionActual === f ? 1 : 0 }} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            {zonas.map((z) => {
              const m = zonaMeta[z.zonaKey];
              return (
                <div key={z.zonaKey}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="flex items-center gap-2 text-[15px] font-bold">
                      <span className="h-3 w-3 rounded-full" style={{ background: m?.color, boxShadow: `0 0 10px ${m?.color}` }} />
                      {m?.label.replace(" (2do piso)", "")}
                    </p>
                    <p className="text-[13px] text-white/60">
                      <strong className="text-white">{z.availableSeats}</strong> libres de {z.totalSeats}
                      {z.isSoldOut && <span className="ml-2 font-bold text-[#ff8a8a]">Agotada</span>}
                    </p>
                  </div>
                  <div className="h-[10px] w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${z.percentSold}%`, background: `linear-gradient(90deg, ${m?.color}, #caff55)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[26px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>Quién compra</h3>
          <div className="space-y-7">
            <Dona
              centro="asientos"
              items={[
                { label: "Adultos", value: adultos, color: "#a6e22e" },
                { label: "Niños", value: ninos, color: "#f6c744" },
              ]}
            />
            <Dona
              centro="entradas"
              items={promos.map((p) => ({ label: p.label.replace("Preventa ", ""), value: porEtapa[p.key] || 0, color: COLOR_PROMO[p.key] }))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
