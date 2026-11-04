import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  MapPin,
  Users,
  Minus,
  Plus,
  MessageCircle,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Navigation,
  Ticket,
  Lock,
  PartyPopper,
} from "lucide-react";
import {
  EVENTOS,
  getActivePromoKey,
  getPeruToday,
  getStoredEventSettings,
  saveStoredEventSettingsLocally,
  setEvento,
  startVisiblePolling,
  fetchPublicAvailabilityV3Server,
  fetchPublicEventSettingsV3Server,
  type EventSettings,
  type EventZoneSetting,
  type EventPromoSetting,
} from "@/lib/tickets-crm";
import { SeatMap, type MapAvailability } from "@/components/shrek/SeatMap";
import { Fireflies } from "@/components/shrek/Fireflies";
import { Tutorial } from "@/components/shrek/Tutorial";
import { MusicaAmbiente } from "@/components/shrek/Musica";
import flyerOficial from "@/assets/shrek/flyer-oficial.jpg";
import shrekPersonaje from "@/assets/shrek/shrek-personaje.png";

const EV = EVENTOS.shrek;

export const Route = createFileRoute("/entradas")({
  head: () => ({
    meta: [
      { title: "Entradas · Shrek, El inicio de la aventura · Chaplin Grupo Cultural" },
      {
        name: "description",
        content:
          "Reserva tus entradas para SHREK, El inicio de la aventura: sábado 28 de noviembre, 4:00 pm y 7:00 pm, Auditorio del Colegio de Ingenieros de Ica. Preventa 2x1, 3x2 y 20% de descuento.",
      },
      { property: "og:title", content: "SHREK, El inicio de la aventura · Entradas" },
      {
        property: "og:description",
        content: "Sábado 28 de noviembre · 4:00 pm y 7:00 pm · Auditorio del Colegio de Ingenieros de Ica. Preventa con promociones.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lilita+One&family=Cinzel:wght@700;900&display=swap",
      },
    ],
  }),
  component: EntradasPage,
});

/* ─────────────────────────── contenido ─────────────────────────── */

const SINOPSIS =
  "En esta superproducción familiar, el pantano de Shrek ha sido invadido y, para recuperarlo, deberá embarcarse en la aventura más grande de su vida. Junto a su inseparable y parlanchín amigo Burro, se enfrentará a dragones, villanos de cuentos y muchas locuras para rescatar a la hermosa y rebelde Princesa Fiona de su torre. Es la presentación final de nuestro taller montaje: una mezcla dinámica y explosiva de la película original y el musical de Broadway, con voces en vivo, coreografías increíbles y todo el humor del ogro más querido del mundo. ¡Una historia sobre la amistad, el amor y aprender a querernos tal como somos!";

const FICHA = [
  { rol: "Dirección general", nombre: "Harold López" },
  { rol: "Dirección ejecutiva", nombre: "Jonathan López" },
  { rol: "Dirección coreográfica", nombre: "Thian Ramos" },
  { rol: "Dirección vocal", nombre: "Dayana Navarrete" },
  { rol: "Asistentes de dirección", nombre: "Francia Reategui y Ángel López" },
];

const ELENCO = [
  "Karina Félix",
  "Kleber Martinez",
  "Alex Meza",
  "José Manuel García",
  "Antoinette Hernández",
  "Marth Fernández",
  "Angelina Rosas",
  "Anyeli",
  "Victoria Di Antonis",
  "Keselhy Martinez",
  "Esteban Anicama",
  "Valentino",
  "Abraham",
  "Patrick",
  "Arianna",
  "Gabriela",
  "Sebastián",
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "¿Cómo reservo mis entradas?",
    a: "Elige función, zona y cantidad en esta página, completa tus datos y toca “Reservar por WhatsApp”. El mensaje sale listo con todo tu pedido. Después envías tu captura de pago por el mismo chat y te confirmamos.",
  },
  {
    q: "¿Cómo pago?",
    a: "Plin: 969 821 836 (Yenny Huamani Huamani). Los demás medios de pago (como Yape) los coordinamos por WhatsApp al confirmar tu reserva.",
  },
  {
    q: "¿Cómo funcionan el 2x1 y el 3x2?",
    a: "Cada promoción que compras trae 2 entradas (2x1: pagas 1 y llevas 2) o 3 entradas (3x2: pagas 2 y llevas 3) de la misma categoría y zona. El precio aplica según la fecha en que compras, no la fecha de la función: mientras antes reservas, más ahorras.",
  },
  {
    q: "¿Los niños pagan entrada?",
    a: "Sí, hay entrada Niño con precio más bajo en todas las zonas. Si tienes dudas sobre la edad, escríbenos por WhatsApp y te ayudamos.",
  },
  {
    q: "¿Cómo y cuándo recibo mi ticket?",
    a: "Apenas validamos tu pago te enviamos por WhatsApp tu código de ticket y el enlace a tu boleto digital con código QR. El día de la función presentas tu boleto y tu DNI en boletería.",
  },
  {
    q: "¿Puedo cambiar de horario?",
    a: "Sí, los cambios de horario se pueden hacer hasta 48 horas antes de la función y según disponibilidad.",
  },
  {
    q: "Mi grupo no llega junto, ¿qué hago?",
    a: "No hay problema: en puerta registramos cuántas personas ingresan en cada momento. Las entradas restantes de tu ticket siguen vigentes hasta que llegue todo el grupo, siempre antes de que inicie la función.",
  },
  {
    q: "¿Cuánto dura y para qué público es?",
    a: "La función dura 100 minutos (incluyendo intermedio) y es apta para todo público.",
  },
  {
    q: "¿Hay devoluciones?",
    a: (
      <>
        Una vez confirmada la compra no hay devoluciones por arrepentimiento. Lee los{" "}
        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-[#caff55] underline underline-offset-2">
          Términos y condiciones
        </a>{" "}
        para ver todos los casos.
      </>
    ),
  },
];

/* ─────────────────────────── utilidades ─────────────────────────── */

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];

function fechaCorta(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}
function fechaLarga(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
}
function peruDate(iso: string, time = "00:00:00") {
  return new Date(`${iso}T${time}-05:00`);
}
function diasEntre(aIso: string, bIso: string) {
  return Math.round((Date.parse(`${bIso}T00:00:00Z`) - Date.parse(`${aIso}T00:00:00Z`)) / 86400000);
}
const soles = (n: number) => `S/${Number.isInteger(n) ? n : n.toFixed(2)}`;

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`shk-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Borde de agua entre secciones (en lugar de cajas)
function Wave({ flip = false, tone = "#0b2014" }: { flip?: boolean; tone?: string }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden
      className={`block h-[40px] w-full sm:h-[64px] ${flip ? "rotate-180" : ""}`}
    >
      <path
        d="M0 40 C 120 10, 240 70, 360 40 S 600 10, 720 40 S 960 70, 1080 40 S 1320 10, 1440 40 V80 H0 Z"
        fill={tone}
      />
    </svg>
  );
}

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <Reveal className="mb-9 sm:mb-12 text-center max-w-3xl mx-auto">
      <p className="shk-eyebrow mb-3">{eyebrow}</p>
      <h2 className="shk-h2 text-[34px] sm:text-5xl lg:text-6xl">{title}</h2>
      {sub && <p className="mt-4 text-white/65 text-[15px] sm:text-base leading-relaxed">{sub}</p>}
    </Reveal>
  );
}

/* ─────────────────────────── cuenta regresiva ─────────────────────────── */

function Countdown({ target, now }: { target: Date; now: Date }) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cell = (v: number, l: string) => (
    <div className="text-center">
      <div className="shk-digit w-[64px] sm:w-[84px] py-2 sm:py-3 text-[32px] sm:text-[46px] leading-none tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
      <p className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/50">{l}</p>
    </div>
  );
  return (
    <div className="flex items-start justify-center gap-2.5 sm:gap-4">
      {cell(d, "días")}
      {cell(h, "horas")}
      {cell(m, "min")}
      {cell(s, "seg")}
    </div>
  );
}

/* ─────────────────────────── piezas del formulario ─────────────────────────── */

function Stepper({
  label,
  sub,
  value,
  onChange,
  max,
  priceLabel,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  priceLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[17px] font-bold leading-tight">{label}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-white/50">{sub}</p>
        <p className="mt-1 text-[14px] font-bold text-[#f6c744]">{priceLabel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/25 hover:bg-white/10 disabled:opacity-25 transition-colors"
          aria-label={`Quitar ${label}`}
        >
          <Minus size={18} />
        </button>
        <span className="w-8 text-center text-[28px] font-black tabular-nums" style={{ fontFamily: "var(--shk-title)" }} aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#a6e22e] text-[#0b2504] hover:brightness-110 disabled:opacity-30 transition-all"
          aria-label={`Agregar ${label}`}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{label}</span>
        {hint && <span className="text-[11px] text-white/35">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[12px] text-[#ff8a8a]">{error}</span>}
    </label>
  );
}

function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <span className="text-[38px] leading-none text-[#f6c744]" style={{ fontFamily: "var(--shk-title)" }}>
        {n}
      </span>
      <h3 className="shk-h2 text-[26px] sm:text-[30px]">{title}</h3>
    </div>
  );
}

/* ─────────────────────────── página ─────────────────────────── */

type Disp = Record<string, Record<string, number>>;

function EntradasPage() {
  const [settings, setSettings] = useState<EventSettings>(() => EV.defaults);
  const [sold, setSold] = useState<Disp | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  const [funcion, setFuncion] = useState<string>(EV.defaults.funciones[0]);
  const [zonaKey, setZonaKey] = useState<string | null>(null);
  const [adultos, setAdultos] = useState(1);
  const [ninos, setNinos] = useState(0);
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [nota, setNota] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [promoVista, setPromoVista] = useState<string | null>(null);
  const [showMsg, setShowMsg] = useState(false);
  // Solo en desarrollo (npm run dev): ?abierta=1 simula que la preventa ya abrió, para probar el flujo.
  const [forzarAbierta, setForzarAbierta] = useState(false);

  // Este navegador trabaja con el evento de Shrek
  useEffect(() => {
    setEvento("shrek");
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("abierta")) setForzarAbierta(true);
    setSettings(getStoredEventSettings("shrek"));
    setNow(new Date());
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Stock y precios en vivo desde Neon (cada 30 s, solo con la pestaña visible)
  useEffect(() => {
    const syncStock = async () => {
      try {
        const res = await fetchPublicAvailabilityV3Server({ data: { evento: "shrek" } });
        if (res && res.ok && res.soldMap) setSold(res.soldMap);
      } catch {
        /* sin conexión: se mantiene lo último que se vio */
      }
    };
    const syncSettings = async () => {
      try {
        const res = await fetchPublicEventSettingsV3Server({ data: { evento: "shrek" } });
        if (res && res.ok && res.settings) {
          setSettings(res.settings);
          saveStoredEventSettingsLocally(res.settings);
        }
      } catch {
        /* sin conexión */
      }
    };
    syncStock();
    syncSettings();
    return startVisiblePolling(() => Promise.all([syncStock(), syncSettings()]), 30000);
  }, []);

  /* ── promoción vigente y estado de la venta ── */
  const hoy = now ? getPeruToday(now) : getPeruToday();
  const promos = settings.promos;
  const activeKey = getActivePromoKey(promos, now ?? new Date());
  const promo: EventPromoSetting = promos.find((p) => p.key === activeKey) ?? promos[0];
  const per = promo.entradasPorPrecio;
  const ventaDesde = promos[0].from;
  const antes = hoy < ventaDesde && !forzarAbierta;
  const finalizada = hoy > EV.fechaISO;
  const ventaAbierta = !antes && !finalizada;

  const zonasVenta = useMemo(() => settings.zonas.filter((z) => z.key !== "cortesia"), [settings.zonas]);
  const zona = zonasVenta.find((z) => z.key === zonaKey) ?? null;

  const precioAdulto = zona ? zona.prices[promo.key as keyof EventZoneSetting["prices"]] : 0;
  const precioNino = zona ? (zona.pricesNino ?? zona.prices)[promo.key as keyof EventZoneSetting["prices"]] : 0;
  const total = adultos * precioAdulto + ninos * precioNino;
  const entradas = (adultos + ninos) * per;
  const totalFull = zona
    ? per * adultos * zona.prices.regular + per * ninos * (zona.pricesNino ?? zona.prices).regular
    : 0;
  const ahorro = Math.max(0, totalFull - total);

  /* ── disponibilidad por zona para la función elegida ── */
  const disp: Record<string, MapAvailability> | null = useMemo(() => {
    if (!sold) return null;
    const out: Record<string, MapAvailability> = {};
    for (const z of zonasVenta) {
      const vendidos = sold[funcion]?.[z.key] ?? 0;
      const available = Math.max(0, z.seats - vendidos);
      out[z.key] = { available, total: z.seats, soldOut: available <= 0 };
    }
    return out;
  }, [sold, funcion, zonasVenta]);

  const dispZona = zona && disp ? disp[zona.key] : null;
  const maxEntradas = dispZona ? dispZona.available : 999;
  const sinCupo = Boolean(dispZona && (dispZona.soldOut || entradas > dispZona.available));

  const totalPorFuncion = (f: string) =>
    sold ? zonasVenta.reduce((n, z) => n + Math.max(0, z.seats - (sold[f]?.[z.key] ?? 0)), 0) : null;

  /* ── validación ── */
  const errNombre = nombre.trim().length >= 3 ? null : "Escribe tus nombres y apellidos";
  const errDni = /^\d{8,9}$/.test(dni.trim()) ? null : "El DNI debe tener 8 dígitos";
  const errCel = /^9\d{8}$/.test(celular.replace(/\s/g, "")) ? null : "Escribe tu celular de 9 dígitos";
  const listo = ventaAbierta && Boolean(zona) && entradas > 0 && !sinCupo && !errNombre && !errDni && !errCel;

  /* ── mensaje de WhatsApp (mismo orden del formulario de Chaplin) ── */
  const categoria = adultos > 0 && ninos > 0 ? "Adulto y Niño" : ninos > 0 ? "Niño" : "Adulto";
  const sufijo = per > 1 ? ` (${per} entradas c/promo ${promo.tag})` : "";
  const mensaje = zona
    ? `Hola Chaplin 👋 Quiero reservar para *SHREK, EL INICIO DE LA AVENTURA* 💚\n\n` +
      `👤 *Nombres y apellidos:* ${nombre.trim() || "—"}\n\n` +
      `🆔 *DNI:* ${dni.trim() || "—"}\n\n` +
      `🎟️ *Zona elegida:* ${zona.label.replace(/^Zona /, "")}\n\n` +
      `👨‍👩‍👧 *Categoría:* ${categoria}\n\n` +
      `⏰ *Horario de función:* ${funcion.toUpperCase()} · ${EV.fechaLarga}\n\n` +
      `🔢 *Cantidad de entradas:*\n` +
      `_Adulto:_ ${adultos}${adultos > 0 ? sufijo : ""}\n` +
      `_Niño:_ ${ninos}${ninos > 0 ? sufijo : ""}\n` +
      `_Total de entradas:_ ${entradas}\n\n` +
      `📱 *Número de celular:* ${celular.replace(/\s/g, "") || "—"}\n\n` +
      `📌 *Nota importante:* ${nota.trim() || "Recibiré las entradas yo mismo/a."}\n\n` +
      `💰 *Total a pagar:* ${soles(total)} (${promo.label})${ahorro > 0 ? ` · ahorro ${soles(ahorro)}` : ""}\n` +
      (vendedor.trim() ? `🧑‍💼 *Vendedor:* ${vendedor.trim()}\n` : "") +
      `\nEnviaré mi captura de pago por este chat. ¡Gracias! 🍃`
    : "";
  const waUrl = (text: string) => `https://api.whatsapp.com/send?phone=${EV.whatsapp}&text=${encodeURIComponent(text)}`;

  const avisoMsg =
    "Hola Chaplin 👋 Quiero que me avisen apenas abra la preventa de *SHREK, EL INICIO DE LA AVENTURA* 💚🍃";

  const irAReservar = () => document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ── fechas para las cuentas regresivas ── */
  const objetivoPrincipal = antes
    ? { fecha: peruDate(ventaDesde), titulo: "La preventa abre en" }
    : finalizada
    ? null
    : { fecha: peruDate(promo.to, "23:59:59"), titulo: `La promo ${promo.tag} termina en` };
  const diasFuncion = Math.max(0, diasEntre(hoy, EV.fechaISO));

  const estadoPromo = (p: EventPromoSetting, i: number) => {
    if (hoy > p.to) return "pasada" as const;
    if (p.key === promo.key && !antes) return "activa" as const;
    if (antes && i === 0) return "proxima" as const;
    return "futura" as const;
  };

  return (
    <div className="shk-root min-h-screen pb-24 font-body lg:pb-0">
      <MusicaAmbiente />

      {/* ─────────── barra superior ─────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06120b]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="Chaplin Grupo Cultural">
            <img
              src="/logo-chaplin.png"
              alt="Chaplin Grupo Cultural"
              className="h-9 w-auto object-contain"
              style={{ filter: "invert(1) hue-rotate(180deg)" }}
            />
          </Link>
          <button onClick={irAReservar} className="shk-btn !px-5 !py-2.5 !text-[16px]">
            Reservar
          </button>
        </div>
      </header>

      {/* ─────────── hero ─────────── */}
      <section className="relative overflow-hidden">
        <Fireflies count={22} />
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1fr_0.9fr] lg:gap-10 lg:px-10 lg:pb-20 lg:pt-14">
          {/* Flyer oficial: trae el logo de Shrek. En celular va primero. */}
          <Reveal delay={100} className="relative z-10 order-1 mx-auto w-full max-w-[380px] lg:order-2 lg:max-w-[440px]">
            <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(166,226,46,0.34),transparent_65%)] blur-2xl" />
            <div className="shk-poster relative">
              <h1 className="sr-only">SHREK, El inicio de la aventura</h1>
              <img
                src={flyerOficial}
                alt="Flyer oficial: Chaplin Grupo Cultural presenta Shrek, el inicio de la aventura. Sábado 28 de noviembre, 4:00 y 7:00 pm, Auditorio del Colegio de Ingenieros de Ica"
                className="w-full rounded-[20px] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9),0_0_80px_-10px_rgba(166,226,46,0.45)]"
                fetchPriority="high"
              />
              <span className="absolute -right-2 -top-3 rotate-6 rounded-full bg-[#e11d2e] px-4 py-2 text-[13px] font-black uppercase tracking-wider text-white shadow-lg">
                {antes ? "¡Mañana inicia!" : finalizada ? "Función realizada" : "Preventa"}
              </span>
            </div>
          </Reveal>

          <div className="relative z-10 order-2 text-center lg:order-1 lg:text-left">
            <Reveal>
              <p className="shk-eyebrow mb-4">Preventa de entradas</p>
              <p className="text-[42px] leading-[0.95] sm:text-[60px] lg:text-[68px]" style={{ fontFamily: "var(--shk-title)" }}>
                Sábado 28
                <br />
                de noviembre
              </p>
              <p className="mt-4 text-[20px] font-bold text-[#caff55] sm:text-2xl">{settings.funciones.join("  ·  ")}</p>
              <p className="mt-3 flex items-center justify-center gap-2 text-[14px] text-white/65 lg:justify-start">
                <MapPin size={15} className="shrink-0 text-[#a6e22e]" />
                Auditorio del Colegio de Ingenieros de Ica
              </p>
            </Reveal>

            <Reveal delay={120}>
              <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-white/65 sm:text-base lg:mx-0">
                La presentación final de nuestro taller montaje: voces en vivo, coreografías increíbles y todo el humor del ogro más
                querido del mundo. Apta para todo público.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <button onClick={irAReservar} className="shk-btn">
                  <Ticket size={22} /> {antes ? "Ver cómo reservar" : "Reservar mis entradas"}
                </button>
                <a href="#precios" className="text-[15px] font-bold text-[#f6c744] underline-offset-4 hover:underline">
                  Ver todos los precios →
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Cuenta regresiva: un solo bloque, sin caja */}
        {now && !finalizada && objetivoPrincipal && (
          <Reveal className="relative z-10 mx-auto max-w-[760px] px-4 pb-20 text-center sm:px-6">
            <p className="shk-eyebrow mb-5">{objetivoPrincipal.titulo}</p>
            <Countdown target={objetivoPrincipal.fecha} now={now} />
            <p className="mt-6 text-[14px] text-white/55">
              {diasFuncion === 0 ? "¡La función es hoy!" : `Faltan ${diasFuncion} días para la función`}
            </p>
          </Reveal>
        )}
      </section>

      <Wave tone="#0a1f13" />

      {/* ─────────── línea de promociones ─────────── */}
      <section className="bg-[#0a1f13] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <SectionTitle
            eyebrow="Preventa"
            title={
              <>
                Mientras antes reservas,
                <br />
                <span className="shk-gold !font-normal" style={{ fontFamily: "var(--shk-title)" }}>
                  más ahorras
                </span>
              </>
            }
            sub="Cada etapa dura pocos días. Pagas el precio de la fecha en que reservas."
          />

          {/* Línea de tiempo: vertical en celular, horizontal en pantallas grandes */}
          <ol className="relative mx-auto max-w-[460px] space-y-9 pl-9 sm:max-w-none sm:space-y-0 sm:pl-0 sm:grid sm:grid-cols-4 sm:gap-6">
            <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-[2px] bg-gradient-to-b from-[#a6e22e]/60 via-[#a6e22e]/25 to-transparent sm:hidden" />
            <span aria-hidden className="absolute left-0 right-0 top-[11px] hidden h-[2px] bg-gradient-to-r from-[#a6e22e]/60 via-[#a6e22e]/30 to-[#a6e22e]/10 sm:block" />
            {promos.map((p, i) => {
              const st = estadoPromo(p, i);
              const dias = diasEntre(hoy, p.to);
              const titulo =
                p.key === "twoXone"
                  ? "2 entradas por el precio de 1"
                  : p.key === "threeXtwo"
                  ? "3 entradas por el precio de 2"
                  : p.key === "twentyPct"
                  ? "20% de descuento en cada entrada"
                  : "Precio FULL por entrada";
              return (
                <Reveal key={p.key} delay={i * 90} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-9 top-1 h-[24px] w-[24px] rounded-full border-[3px] border-[#0a1f13] sm:left-0 sm:top-0 ${
                      st === "activa"
                        ? "bg-[#caff55] shadow-[0_0_0_6px_rgba(166,226,46,0.25),0_0_22px_rgba(190,255,70,0.8)]"
                        : st === "pasada"
                        ? "bg-white/25"
                        : "bg-[#3a6b2a]"
                    }`}
                  />
                  <div className="sm:pt-9">
                    <p
                      className={`shk-title text-[52px] sm:text-[58px] ${st === "pasada" ? "!opacity-40 !drop-shadow-none" : ""} ${
                        st === "activa" ? "" : st === "pasada" ? "" : "!opacity-80"
                      }`}
                    >
                      {p.tag.replace(" dto", "")}
                    </p>
                    <p className={`mt-2 text-[15px] font-bold leading-snug ${st === "pasada" ? "text-white/40 line-through" : "text-white"}`}>
                      {titulo}
                    </p>
                    <p className="mt-1.5 text-[13px] text-white/50">
                      {fechaLarga(p.from)} al {fechaLarga(p.to)}
                    </p>
                    {st === "activa" && (
                      <p className="mt-2.5 text-[13px] font-black uppercase tracking-wider text-[#caff55]">
                        ● Hoy · {dias <= 0 ? "último día" : `quedan ${dias + 1} días`}
                      </p>
                    )}
                    {st === "proxima" && (
                      <p className="mt-2.5 text-[13px] font-black uppercase tracking-wider text-[#f6c744]">Abre el {fechaLarga(p.from)}</p>
                    )}
                    {st === "pasada" && <p className="mt-2.5 text-[12px] uppercase tracking-wider text-white/35">Finalizada</p>}
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      <Wave flip tone="#0a1f13" />

      {/* ─────────── reservar ─────────── */}
      <section id="reservar" className="relative scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <Fireflies count={12} />
        <div className="relative mx-auto max-w-[1240px]">
          <SectionTitle
            eyebrow="Reserva en 2 minutos"
            title="Elige tu lugar en el pantano"
            sub="Toca una zona en el mapa o en la lista. El stock se actualiza en vivo."
          />

          {!ventaAbierta && (
            <Reveal className="mx-auto mb-12 max-w-xl text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center text-[#f6c744]">
                {finalizada ? <PartyPopper size={34} /> : <Lock size={32} />}
              </span>
              <p className="shk-h2 text-[28px] sm:text-[34px]">
                {finalizada ? "La función ya se realizó" : `La preventa abre el ${fechaLarga(ventaDesde)}`}
              </p>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-white/60">
                {finalizada
                  ? "¡Gracias por apoyar el teatro de Ica! Síguenos para conocer nuestras próximas producciones."
                  : "Mira el mapa y los precios desde ya. Te avisamos por WhatsApp apenas se abra la venta."}
              </p>
              {!finalizada && (
                <a href={waUrl(avisoMsg)} target="_blank" rel="noopener noreferrer" className="shk-btn mt-6 !text-[18px]">
                  <MessageCircle size={20} /> Avísame cuando abra
                </a>
              )}
            </Reveal>
          )}

          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-16">
            {/* Mapa (sin caja) */}
            <Reveal className="lg:sticky lg:top-24">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <p className="shk-h2 text-[28px]">Mapa de asientos</p>
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#caff55]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#a6e22e]" />
                  {sold ? `En vivo · ${funcion}` : "Cargando…"}
                </span>
              </div>
              <SeatMap
                zonas={zonasVenta.map((z) => ({ key: z.key, label: z.label, color: z.color }))}
                availability={disp}
                selected={zonaKey}
                onSelect={setZonaKey}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/50">
                <span>Duloc y Ogro están en el 1.er piso; Pantano está en el 2.º piso (balcón). Los asientos son por orden de llegada dentro de tu zona.</span>
                <a
                  href="https://maps.google.com/?q=Colegio+de+Ingenieros+del+Peru+CD+Ica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-[#f6c744] hover:underline"
                >
                  <Navigation size={14} /> Cómo llegar
                </a>
              </div>
            </Reveal>

            {/* Formulario: un solo panel, secciones separadas por líneas finas */}
            <Reveal delay={100}>
              <div className={`rounded-[26px] bg-white/[0.045] p-5 sm:p-8 ${!ventaAbierta ? "opacity-85" : ""}`}>
                {/* 1 · Función */}
                <StepHead n={1} title="Elige la función" />
                <div className="mb-9 grid grid-cols-2 gap-6 border-b border-white/10 pb-1">
                  {settings.funciones.map((f) => {
                    const quedan = totalPorFuncion(f);
                    const activa = funcion === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFuncion(f)}
                        aria-pressed={activa}
                        className={`relative pb-4 text-left transition-opacity ${activa ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
                      >
                        <p className="shk-h2 whitespace-nowrap text-[30px] sm:text-[36px]">{f.toUpperCase()}</p>
                        {quedan != null && (
                          <p className={`mt-1 text-[13px] font-bold ${quedan <= 30 ? "text-[#ffb86b]" : "text-[#caff55]"}`}>
                            {quedan <= 0 ? "Agotada" : `Quedan ${quedan}`}
                          </p>
                        )}
                        <span
                          className={`absolute -bottom-px left-0 h-[3px] rounded-full bg-[#caff55] shadow-[0_0_14px_rgba(190,255,70,0.8)] transition-all duration-300 ${
                            activa ? "w-full" : "w-0"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* 2 · Zona */}
                <StepHead n={2} title="Elige tu zona" />
                <div className="mb-9">
                  {zonasVenta.map((z) => {
                    const av = disp?.[z.key];
                    const activa = zonaKey === z.key;
                    const pA = z.prices[promo.key as keyof EventZoneSetting["prices"]];
                    const pN = (z.pricesNino ?? z.prices)[promo.key as keyof EventZoneSetting["prices"]];
                    const pct = av ? Math.round(((av.total - av.available) / av.total) * 100) : 0;
                    return (
                      <button
                        key={z.key}
                        type="button"
                        onClick={() => !av?.soldOut && setZonaKey(z.key)}
                        disabled={Boolean(av?.soldOut)}
                        aria-pressed={activa}
                        className={`relative w-full border-t border-white/10 px-4 py-4 text-left transition-colors first:border-t-0 disabled:cursor-not-allowed disabled:opacity-40 ${
                          activa ? "bg-gradient-to-r from-[#a6e22e]/16 to-transparent" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <span
                          className={`absolute bottom-3 left-0 top-3 w-[4px] rounded-full bg-[#caff55] shadow-[0_0_14px_rgba(190,255,70,0.8)] transition-opacity ${
                            activa ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: z.color, boxShadow: `0 0 12px ${z.color}` }} />
                            <div>
                              <p className="text-[17px] font-bold leading-tight">{z.label.replace(" (2do piso)", "")}</p>
                              <p className="mt-0.5 text-[12px] text-white/50">
                                {z.key === "pantano" ? "2.º piso" : "1.er piso"} · {z.seats} asientos
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right leading-tight">
                            <p className="text-[14px] font-bold text-[#f6c744]">Adulto {soles(pA)}</p>
                            <p className="mt-0.5 text-[13px] text-white/60">Niño {soles(pN)}</p>
                          </div>
                        </div>
                        {av && (
                          <div className="mt-3 pl-7">
                            <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                              <span
                                className="block h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  background: av.soldOut
                                    ? "#6b7280"
                                    : av.available <= 15
                                    ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                                    : "linear-gradient(90deg,#4f9a1a,#a6e22e)",
                                }}
                              />
                            </div>
                            <p
                              className={`mt-1.5 text-[12px] font-semibold ${
                                av.soldOut ? "text-white/45" : av.available <= 15 ? "text-[#ffb86b]" : "text-white/55"
                              }`}
                            >
                              {av.soldOut
                                ? "AGOTADA"
                                : av.available <= 15
                                ? `🔥 ¡Últimos ${av.available} asientos!`
                                : `${av.available} disponibles`}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {per > 1 && (
                    <p className="mt-2 px-4 text-[12px] leading-snug text-[#ffe38a]/85">
                      Los precios son <strong>por promoción {promo.tag}</strong>: cada una trae {per} entradas.
                    </p>
                  )}
                </div>

                {/* 3 · Entradas */}
                <StepHead n={3} title="¿Cuántas entradas?" />
                <div className="mb-2">
                  <Stepper
                    label="Adulto"
                    sub={per > 1 ? `Cada promo ${promo.tag} = ${per} entradas` : "Entrada por persona"}
                    value={adultos}
                    onChange={setAdultos}
                    max={Math.max(0, Math.floor(maxEntradas / per) - ninos)}
                    priceLabel={zona ? `${soles(precioAdulto)}${per > 1 ? " por promo" : " c/u"}` : "Elige una zona"}
                  />
                  <Stepper
                    label="Niño"
                    sub={per > 1 ? `Cada promo ${promo.tag} = ${per} entradas` : "Entrada por persona"}
                    value={ninos}
                    onChange={setNinos}
                    max={Math.max(0, Math.floor(maxEntradas / per) - adultos)}
                    priceLabel={zona ? `${soles(precioNino)}${per > 1 ? " por promo" : " c/u"}` : "Elige una zona"}
                  />
                </div>
                {per > 1 && entradas > 0 ? (
                  <p className="mb-9 mt-2 text-[14px] font-bold text-[#caff55]">
                    🎉 Llevas {entradas} entradas ({adultos > 0 ? `${adultos * per} Adulto` : ""}
                    {adultos > 0 && ninos > 0 ? " + " : ""}
                    {ninos > 0 ? `${ninos * per} Niño` : ""}) pagando {adultos + ninos} promo{adultos + ninos === 1 ? "" : "s"}
                  </p>
                ) : (
                  <div className="mb-9" />
                )}

                {/* 4 · Datos */}
                <StepHead n={4} title="Tus datos" />
                <div className="mb-9 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Nombres y apellidos" error={touched.nombre ? errNombre : null}>
                      <input
                        className={`shk-input ${touched.nombre && errNombre ? "is-bad" : ""}`}
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                        placeholder="Como aparece en tu DNI"
                        autoComplete="name"
                      />
                    </Field>
                  </div>
                  <Field label="DNI" error={touched.dni ? errDni : null}>
                    <input
                      className={`shk-input ${touched.dni && errDni ? "is-bad" : ""}`}
                      value={dni}
                      inputMode="numeric"
                      maxLength={9}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                      onBlur={() => setTouched((t) => ({ ...t, dni: true }))}
                      placeholder="8 dígitos"
                    />
                  </Field>
                  <Field label="Celular" error={touched.cel ? errCel : null}>
                    <input
                      className={`shk-input ${touched.cel && errCel ? "is-bad" : ""}`}
                      value={celular}
                      inputMode="tel"
                      maxLength={11}
                      onChange={(e) => setCelular(e.target.value.replace(/[^\d ]/g, ""))}
                      onBlur={() => setTouched((t) => ({ ...t, cel: true }))}
                      placeholder="9XX XXX XXX"
                      autoComplete="tel"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="¿Quién recogerá las entradas?" hint="Opcional">
                      <input
                        className="shk-input"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        placeholder="Nombre y celular de quien las recibirá"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Vendedor" hint="Si alguien del equipo te ayudó">
                      <input className="shk-input" value={vendedor} onChange={(e) => setVendedor(e.target.value)} placeholder="Opcional" />
                    </Field>
                  </div>
                </div>

                {/* Resumen: texto grande, sin caja */}
                <div id="resumen" className="scroll-mt-24 border-t border-white/15 pt-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Total a pagar</p>
                      <p className="mt-1 text-[13px] text-white/55">
                        {zona ? `${entradas} entrada${entradas === 1 ? "" : "s"} · ${promo.label}` : "Elige zona y cantidad"}
                      </p>
                    </div>
                    <p className="shk-h2 text-[54px] leading-none text-[#f6c744]" aria-live="polite">
                      {zona ? soles(total) : "—"}
                    </p>
                  </div>
                  {ahorro > 0 && (
                    <p className="mt-3 flex items-center gap-2 text-[14px] font-black text-[#caff55]">
                      <Sparkles size={16} /> ¡Ahorras {soles(ahorro)} frente al precio FULL!
                    </p>
                  )}
                </div>

                {sinCupo && dispZona && (
                  <p className="mt-4 flex items-start gap-2 text-[13px] font-semibold text-[#ffb3b3]">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {dispZona.soldOut
                      ? `${zona?.label} está agotada para las ${funcion}. Elige otro horario u otra zona.`
                      : `Solo quedan ${dispZona.available} asientos en ${zona?.label} para las ${funcion}. Reduce la cantidad.`}
                  </p>
                )}

                {listo ? (
                  <a href={waUrl(mensaje)} target="_blank" rel="noopener noreferrer" className="shk-btn mt-6 w-full !text-[22px]">
                    <MessageCircle size={24} /> Reservar por WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled={!ventaAbierta || !zona}
                    onClick={() => setTouched({ nombre: true, dni: true, cel: true })}
                    className="shk-btn mt-6 w-full !text-[20px]"
                  >
                    <MessageCircle size={22} />
                    {!ventaAbierta ? "La preventa aún no abre" : !zona ? "Elige una zona" : "Completa tus datos"}
                  </button>
                )}

                {listo && (
                  <button
                    type="button"
                    onClick={() => setShowMsg((v) => !v)}
                    className="mt-3 flex w-full items-center justify-center gap-1 text-[12px] text-white/50 hover:text-white/80"
                  >
                    Ver el mensaje que se enviará <ChevronDown size={14} className={`transition-transform ${showMsg ? "rotate-180" : ""}`} />
                  </button>
                )}
                {listo && showMsg && (
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 font-body text-[12px] leading-relaxed text-white/75">
                    {mensaje}
                  </pre>
                )}

                <div className="mt-7 space-y-3 text-[12.5px] leading-relaxed text-white/50">
                  <p>
                    La reserva se confirma con nuestro equipo por WhatsApp. Cupos sujetos a disponibilidad en tiempo real.
                  </p>
                  <p>
                    <strong className="text-white/80">Medios de pago:</strong> Plin 969 821 836 (Yenny Huamani Huamani). Los demás medios,
                    como Yape, los coordinamos por WhatsApp al confirmar.
                  </p>
                  <p>
                    Al reservar aceptas nuestros{" "}
                    <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-[#caff55] underline underline-offset-2">
                      Términos y condiciones
                    </a>
                    .
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────── tabla de precios (el único panel de madera, como en el flyer) ─────────── */}
      <section id="precios" className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <SectionTitle
            eyebrow="Tarifas oficiales"
            title="Todos los precios"
            sub={
              <>
                La promo de hoy aparece resaltada. En 2x1 y 3x2 el precio es <strong className="text-white">por promoción</strong> (trae 2 o 3
                entradas).
              </>
            }
          />
          <Reveal>
            {/* Celular: eliges la promo y ves los precios de todas las zonas, sin desplazarte hacia los lados */}
            <div className="sm:hidden">
              <div className="mb-6 grid grid-cols-4 border-b border-white/10">
                {promos.map((p) => {
                  const vista = (promoVista ?? promo.key) === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPromoVista(p.key)}
                      className={`relative pb-3 text-center transition-colors ${vista ? "text-white" : "text-white/40"}`}
                    >
                      <span className="block text-[26px] leading-none" style={{ fontFamily: "var(--shk-title)" }}>
                        {p.tag.replace(" dto", "")}
                      </span>
                      <span className="mt-1 block text-[10px] font-semibold">{fechaCorta(p.from)}</span>
                      {p.key === promo.key && ventaAbierta && (
                        <span className="mt-0.5 block text-[9px] font-black uppercase tracking-wider text-[#caff55]">Hoy</span>
                      )}
                      <span
                        className={`absolute -bottom-px left-1 right-1 h-[3px] rounded-full bg-[#caff55] shadow-[0_0_12px_rgba(190,255,70,0.8)] transition-opacity ${
                          vista ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {(() => {
                const pv = promos.find((x) => x.key === (promoVista ?? promo.key)) ?? promo;
                return (
                  <div>
                    <p className="mb-4 text-center text-[13px] text-white/55">
                      {pv.detalle.split("·")[0].trim()}
                      {pv.entradasPorPrecio > 1 && <span className="text-[#ffe38a]"> · precio por promo de {pv.entradasPorPrecio} entradas</span>}
                    </p>
                    {zonasVenta.map((z) => {
                      const pa = z.prices[pv.key as keyof EventZoneSetting["prices"]];
                      const pn = (z.pricesNino ?? z.prices)[pv.key as keyof EventZoneSetting["prices"]];
                      return (
                        <button
                          key={z.key}
                          type="button"
                          onClick={() => {
                            setZonaKey(z.key);
                            irAReservar();
                          }}
                          className="flex w-full items-center justify-between gap-3 border-t border-white/10 py-4 text-left first:border-t-0"
                        >
                          <span className="flex items-center gap-3">
                            <span className="h-4 w-4 rounded-full" style={{ background: z.color, boxShadow: `0 0 12px ${z.color}` }} />
                            <span>
                              <span className="block text-[18px] font-bold leading-tight">{z.label.replace("Zona ", "").replace(" (2do piso)", "")}</span>
                              <span className="block text-[12px] text-white/45">{z.key === "pantano" ? "2.º piso" : "1.er piso"}</span>
                            </span>
                          </span>
                          <span className="flex gap-5 text-right">
                            <span>
                              <span className="block text-[10px] uppercase tracking-wider text-white/45">Adulto</span>
                              <span className="block text-[22px] font-black leading-none text-[#f6c744]">{soles(pa)}</span>
                              {pv.entradasPorPrecio > 1 && <span className="block text-[10px] text-white/40">{soles(pa / pv.entradasPorPrecio)} c/u</span>}
                            </span>
                            <span>
                              <span className="block text-[10px] uppercase tracking-wider text-white/45">Niño</span>
                              <span className="block text-[22px] font-black leading-none">{soles(pn)}</span>
                              {pv.entradasPorPrecio > 1 && <span className="block text-[10px] text-white/40">{soles(pn / pv.entradasPorPrecio)} c/u</span>}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Pantallas grandes: el panel de madera del flyer */}
            <div className="hidden shk-wood p-5 sm:block">
              <div>
                <table className="w-full border-separate border-spacing-1.5 text-center">
                  <thead>
                    <tr>
                      <th className="w-[26%] px-2 py-3 text-left text-[14px] uppercase tracking-wider text-[#fdf0c4]" style={{ fontFamily: "var(--shk-title)" }}>
                        Zona
                      </th>
                      {promos.map((p) => {
                        const on = p.key === promo.key && ventaAbierta;
                        return (
                          <th
                            key={p.key}
                            className={`rounded-xl px-2 py-2.5 transition-all ${on ? "bg-[#a6e22e] text-[#0b2504] shadow-[0_0_24px_rgba(166,226,46,0.7)]" : "text-[#fdf0c4]"}`}
                          >
                            <span className="block text-2xl leading-none" style={{ fontFamily: "var(--shk-title)" }}>
                              {p.tag.replace(" dto", "")}
                            </span>
                            <span className="mt-1 block text-[10px] font-semibold normal-case opacity-80">
                              {fechaCorta(p.from)} – {fechaCorta(p.to)}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {zonasVenta.flatMap((z) =>
                      [
                        { cat: "Adulto", set: z.prices },
                        { cat: "Niño", set: z.pricesNino ?? z.prices },
                      ].map(({ cat, set }, ci) => (
                        <tr
                          key={`${z.key}-${cat}`}
                          className="cursor-pointer"
                          onClick={() => {
                            setZonaKey(z.key);
                            irAReservar();
                          }}
                        >
                          {ci === 0 && (
                            <td rowSpan={2} className="px-3 py-3 text-left align-middle">
                              <span className="flex items-center gap-2 text-[#fdf0c4]" style={{ fontFamily: "var(--shk-title)", fontSize: 22 }}>
                                <span className="h-3.5 w-3.5 rounded-full ring-2 ring-white/30" style={{ background: z.color }} />
                                {z.label.replace("Zona ", "").replace(" (2do piso)", "")}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-[#fdf0c4]/70">{z.key === "pantano" ? "2.º piso" : "1.er piso"}</span>
                            </td>
                          )}
                          {promos.map((p) => {
                            const price = set[p.key as keyof typeof set];
                            const on = p.key === promo.key && ventaAbierta;
                            return (
                              <td
                                key={p.key}
                                className={`shk-cream rounded-xl px-2 py-2.5 transition-all ${on ? "ring-4 ring-[#a6e22e] shadow-[0_0_22px_rgba(166,226,46,0.55)]" : p.key !== promo.key ? "opacity-85" : ""}`}
                              >
                                <span className="block text-[11px] font-bold uppercase text-[#6b4a1a]">{cat}</span>
                                <span className="block text-[22px] font-black leading-none">{soles(price)}</span>
                                {p.entradasPorPrecio > 1 && (
                                  <span className="mt-0.5 block text-[10px] font-semibold text-[#7a5a22]">
                                    {soles(price / p.entradasPorPrecio)} c/u
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-center text-[12px] text-white/45">Precios en soles (PEN). Toca una zona para elegirla.</p>
          </Reveal>
        </div>
      </section>

      <Wave tone="#0a1f13" />

      {/* ─────────── tutorial ─────────── */}
      <section className="bg-[#0a1f13] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <SectionTitle
            eyebrow="Paso a paso"
            title="Así de fácil es vivir la aventura"
            sub="Mira cómo comprar, cómo recibes tu ticket y cómo usarlo el día de la función."
          />
          <Reveal>
            <Tutorial />
          </Reveal>
        </div>
      </section>

      <Wave flip tone="#0a1f13" />

      {/* ─────────── sobre la obra ─────────── */}
      <section className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <SectionTitle eyebrow="La obra" title="¿De qué trata?" />
          <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <Reveal>
              <p className="text-[16px] leading-[1.9] text-white/80 sm:text-[17px]">{SINOPSIS}</p>
              <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#caff55]">
                100 min con intermedio · Apta para todo público
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="shk-h2 mb-4 text-[26px]">Ficha técnica</p>
              <dl>
                {FICHA.map((f) => (
                  <div key={f.rol} className="border-t border-white/10 py-3 first:border-t-0">
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-white/45">{f.rol}</dt>
                    <dd className="mt-0.5 text-[16px] font-semibold">{f.nombre}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal className="mt-14 text-center">
            <p className="shk-h2 mb-5 text-[28px]">
              <Users className="mr-2 -mt-1 inline text-[#a6e22e]" size={22} />
              Elenco de lujo
            </p>
            <p className="mx-auto max-w-3xl text-[16px] leading-[2] text-white/75">
              {ELENCO.map((n, i) => (
                <span key={n}>
                  {n}
                  {i < ELENCO.length - 1 && <span className="mx-2.5 text-[#a6e22e]">•</span>}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─────────── preguntas frecuentes ─────────── */}
      <section className="px-4 pb-14 pt-4 sm:px-6 sm:pb-20 lg:px-10">
        <div className="mx-auto max-w-[780px]">
          <SectionTitle eyebrow="Dudas" title="Preguntas frecuentes" />
          <div>
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={f.q} delay={i * 30}>
                  <div className="border-t border-white/10 last:border-b">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className={`text-[16px] font-bold transition-colors sm:text-[17px] ${open ? "text-[#caff55]" : ""}`}>{f.q}</span>
                      <ChevronDown size={20} className={`shrink-0 text-[#a6e22e] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <p className="pb-5 pr-8 text-[15px] leading-relaxed text-white/65">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── cierre ─────────── */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-10">
        <Fireflies count={16} />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <img
            src={shrekPersonaje}
            alt="Shrek"
            loading="lazy"
            className="shk-t-bounce mx-auto h-44 w-auto drop-shadow-[0_20px_30px_rgba(120,220,40,0.35)] sm:h-60"
          />
          <h2 className="shk-title mt-3 text-[48px] sm:text-[72px]">¡NOS VEMOS EN EL PANTANO!</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/65">
            {EV.fechaLarga} · {settings.funciones.join(" y ")} · Auditorio del Colegio de Ingenieros de Ica
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={irAReservar} className="shk-btn">
              <Ticket size={22} /> Reservar mis entradas
            </button>
            <a
              href={`https://wa.me/${EV.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[15px] font-bold text-[#f6c744] underline-offset-4 hover:underline"
            >
              <MessageCircle size={18} /> Consultas: 956 060 826
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 px-4 py-8">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="text-[12px] uppercase tracking-[0.2em] text-white/45">Chaplin Grupo Cultural · Ica, Perú</p>
          <p className="mt-3 space-x-5 text-[12px] text-white/45">
            <a href="/terminos" className="underline underline-offset-2 hover:text-[#caff55]">
              Términos y condiciones
            </a>
            <Link to="/" className="underline underline-offset-2 hover:text-[#caff55]">
              Ir al sitio de Chaplin
            </Link>
          </p>
        </div>
      </footer>

      {/* ─────────── barra fija en celular ─────────── */}
      {ventaAbierta && zona && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#06120b]/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-[520px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/50">
                {zona ? `${entradas} entrada${entradas === 1 ? "" : "s"} · ${promo.tag}` : "Total"}
              </p>
              <p className="shk-h2 text-[28px] leading-none text-[#f6c744]">{zona ? soles(total) : "—"}</p>
            </div>
            <button
              onClick={() => document.getElementById("resumen")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="shk-btn !px-6 !py-3 !text-[18px]"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
