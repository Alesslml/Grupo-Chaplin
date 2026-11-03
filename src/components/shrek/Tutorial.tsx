import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import shrekPersonaje from "@/assets/shrek/shrek-personaje.png";

/* ─────────────────────────────────────────────────────────────────────────────
   Tutorial animado ("video" paso a paso) para clientes:
   1) cómo comprar, 2) cómo recibir el ticket, 3) cómo usarlo el día de la función.
   Todo está dibujado con HTML/CSS (sin archivos de video): siempre se ve nítido,
   pesa casi nada y coincide con la web real. Si más adelante hay un video grabado,
   se puede poner su enlace en `videoUrl` de cada guía y reemplaza la animación.
   ───────────────────────────────────────────────────────────────────────────── */

interface Paso {
  titulo: string;
  texto: string;
  escena: ReactNode;
}

interface Guia {
  id: string;
  tab: string;
  emoji: string;
  resumen: string;
  videoUrl?: string; // opcional: YouTube/MP4 propio (reemplaza la animación)
  pasos: Paso[];
}

const PASO_MS = 5200;

/* ───────── piezas visuales reutilizables ───────── */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[236px] sm:w-[250px] h-[470px] sm:h-[500px] rounded-[38px] p-[9px] bg-gradient-to-b from-[#2a3a2d] to-[#0c130e] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),0_0_0_2px_rgba(166,226,46,0.25)]">
      <div className="absolute left-1/2 top-[14px] -translate-x-1/2 h-[18px] w-[78px] rounded-full bg-black z-20" />
      <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-[#06120b]">{children}</div>
    </div>
  );
}

function Finger({ x, y, delay = 0.6 }: { x: string; y: string; delay?: number }) {
  return (
    <span
      className="shk-t-finger absolute z-30 pointer-events-none"
      style={{ left: x, top: y, animationDelay: `${delay}s` } as CSSProperties}
      aria-hidden
    >
      <span className="block h-9 w-9 -ml-4 -mt-4 rounded-full bg-[#caff55]/80 shadow-[0_0_0_6px_rgba(202,255,85,0.25)]" />
    </span>
  );
}

function Typed({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  return (
    <span
      className={`shk-t-typed inline-block overflow-hidden whitespace-nowrap align-bottom ${className}`}
      style={{ ["--n" as string]: text.length, animationDelay: `${delay}s` } as CSSProperties}
    >
      {text}
    </span>
  );
}

function Bubble({
  side,
  children,
  delay,
}: {
  side: "in" | "out";
  children: ReactNode;
  delay: number;
}) {
  return (
    <div
      className={`shk-t-pop max-w-[86%] rounded-2xl px-3 py-2 text-[11px] leading-snug ${
        side === "out"
          ? "self-end bg-[#1f6b3a] text-white rounded-br-sm"
          : "self-start bg-[#1b2a20] text-white/90 rounded-bl-sm"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function WaHeader({ nombre }: { nombre: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#0f3d22] px-3 pt-9 pb-2.5">
      <span className="h-7 w-7 rounded-full bg-[#caff55] text-[#0b2504] grid place-items-center text-[11px] font-black">C</span>
      <div className="leading-tight">
        <p className="text-[11px] font-bold text-white">{nombre}</p>
        <p className="text-[9px] text-[#9be06a]">en línea</p>
      </div>
    </div>
  );
}

function MiniQR({ scan = false }: { scan?: boolean }) {
  // QR decorativo determinista
  const cells = useMemo(() => {
    const arr: boolean[] = [];
    for (let i = 0; i < 169; i++) arr.push(((i * 7 + (i % 13) * 3 + ((i / 13) | 0) * 5) % 5) < 2);
    return arr;
  }, []);
  const finder = (r: number, c: number) =>
    (r < 4 && c < 4) || (r < 4 && c > 8) || (r > 8 && c < 4);
  return (
    <div className="relative h-[108px] w-[108px] rounded-lg bg-white p-2">
      <div className="grid h-full w-full grid-cols-13 gap-[1px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
        {cells.map((on, i) => {
          const r = (i / 13) | 0;
          const c = i % 13;
          return <span key={i} className={finder(r, c) || on ? "bg-[#0b1a0f]" : "bg-white"} />;
        })}
      </div>
      {scan && <span className="shk-t-scan absolute left-1 right-1 h-[3px] rounded bg-[#39d353] shadow-[0_0_10px_3px_rgba(57,211,83,0.7)]" />}
    </div>
  );
}

/* ───────── escenas ───────── */

const Chip = ({ children, on }: { children: ReactNode; on?: boolean }) => (
  <span
    className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
      on ? "bg-[#a6e22e] text-[#0b2504]" : "bg-white/10 text-white/70"
    }`}
  >
    {children}
  </span>
);

function EscenaElige() {
  return (
    <Phone>
      <div className="px-3 pt-10 text-[10px]">
        <p className="mb-1 text-[9px] tracking-[0.2em] text-[#f6c744]">1 · FUNCIÓN</p>
        <div className="flex gap-2">
          <Chip on>4:00 PM</Chip>
          <span className="shk-t-swap">
            <Chip>7:00 PM</Chip>
          </span>
        </div>
        <p className="mt-4 mb-1 text-[9px] tracking-[0.2em] text-[#f6c744]">2 · ZONA</p>
        {[
          ["Duloc", "#e11d2e", "S/80"],
          ["Ogro", "#22b04f", "S/50"],
          ["Pantano", "#2f93e0", "S/20"],
        ].map(([n, c, p], i) => (
          <div
            key={n}
            className={`mb-2 flex items-center justify-between rounded-xl border px-3 py-2.5 ${
              i === 0 ? "shk-t-pick border-[#a6e22e]" : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <span className="flex items-center gap-2 font-bold">
              <span className="h-3 w-3 rounded-full" style={{ background: c }} />
              Zona {n}
            </span>
            <span className="text-white/60">{p}</span>
          </div>
        ))}
      </div>
      <Finger x="55%" y="46%" delay={0.9} />
    </Phone>
  );
}

function EscenaCantidad() {
  return (
    <Phone>
      <div className="px-3 pt-10 text-[10px]">
        <p className="mb-2 text-[9px] tracking-[0.2em] text-[#f6c744]">3 · ¿CUÁNTAS ENTRADAS?</p>
        {[
          ["Adulto", "S/80", "2"],
          ["Niño", "S/60", "1"],
        ].map(([n, p, q], i) => (
          <div key={n} className="mb-2 flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-3">
            <div>
              <p className="font-bold">{n}</p>
              <p className="text-white/50">{p} c/promo</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-white/20">−</span>
              <span className="shk-t-count w-4 text-center text-sm font-black" style={{ animationDelay: `${0.8 + i * 0.7}s` }} data-to={q}>
                <span className="shk-t-n0">0</span>
                <span className="shk-t-n1">{q}</span>
              </span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#a6e22e] font-black text-[#0b2504]">+</span>
            </div>
          </div>
        ))}
        <div className="shk-t-pop mt-3 rounded-xl bg-[#a6e22e]/15 p-3" style={{ animationDelay: "1.9s" }}>
          <p className="text-[9px] text-[#caff55]">LLEVAS 6 ENTRADAS (PROMO 2x1)</p>
          <p className="mt-1 flex items-end justify-between">
            <span className="text-white/60">Total</span>
            <span className="text-xl font-black text-[#f6c744]">S/ 200</span>
          </p>
          <p className="mt-1 text-[9px] font-bold text-[#caff55]">¡Ahorras S/ 200 frente al precio FULL!</p>
        </div>
      </div>
      <Finger x="82%" y="30%" delay={0.7} />
    </Phone>
  );
}

function EscenaDatos() {
  return (
    <Phone>
      <div className="px-3 pt-10 text-[10px]">
        <p className="mb-2 text-[9px] tracking-[0.2em] text-[#f6c744]">4 · TUS DATOS</p>
        {[
          ["Nombres y apellidos", "María Pérez Rojas"],
          ["DNI", "45872136"],
          ["Celular", "956 060 826"],
        ].map(([l, v], i) => (
          <div key={l} className="mb-2">
            <p className="mb-1 text-white/50">{l}</p>
            <div className="rounded-lg border border-[#a6e22e]/40 bg-black/40 px-3 py-2 text-[11px] font-semibold text-white">
              <Typed text={v} delay={0.4 + i * 0.9} />
            </div>
          </div>
        ))}
        <div className="shk-t-press mt-4 rounded-full bg-gradient-to-b from-[#d3ff6a] to-[#6cbf1f] py-3 text-center text-[12px] font-black text-[#0b2504]">
          Reservar por WhatsApp
        </div>
      </div>
      <Finger x="50%" y="84%" delay={3.4} />
    </Phone>
  );
}

function EscenaPago() {
  return (
    <Phone>
      <WaHeader nombre="Chaplin Grupo Cultural" />
      <div className="flex h-[calc(100%-64px)] flex-col gap-2 bg-[#0a1610] p-3">
        <Bubble side="out" delay={0.3}>
          Hola 👋 Quiero reservar para <b>SHREK</b> 💚<br />
          🎟️ Zona Duloc · 4:00 pm<br />
          🔢 Adulto: 2 · Niño: 1
        </Bubble>
        <Bubble side="in" delay={1.5}>
          💚 ¡Hola de nuevo! Ya casi estás dentro del pantano. Adjunta tu <b>captura de pago</b>.
        </Bubble>
        <Bubble side="out" delay={2.9}>
          <div className="w-[120px] rounded-md bg-[#6b2a8f] p-2 text-center">
            <p className="text-[9px] font-black">Yape</p>
            <p className="text-base font-black">S/ 200</p>
            <p className="text-[8px] opacity-80">¡Yapeaste con éxito!</p>
          </div>
        </Bubble>
      </div>
    </Phone>
  );
}

function EscenaConfirma() {
  return (
    <Phone>
      <WaHeader nombre="Chaplin Grupo Cultural" />
      <div className="flex h-[calc(100%-64px)] flex-col gap-2 bg-[#0a1610] p-3">
        <Bubble side="in" delay={0.3}>
          ✅ <b>¡Pago recibido!</b> Tu reserva de SHREK está confirmada 🎉
        </Bubble>
        <Bubble side="in" delay={1.5}>
          <p className="font-bold">CÓDIGO DE TICKET:</p>
          <p className="font-mono text-[#caff55]">#SH-4PM-DUL-001</p>
          <p className="mt-1">🎟️ Enlace de tu boleto digital:</p>
          <p className="shk-t-link text-[#7dd3ff] underline">chaplingrupocultural.com/ticket/SH-4PM-DUL-001</p>
        </Bubble>
      </div>
      <Finger x="60%" y="62%" delay={3.2} />
    </Phone>
  );
}

function BoletoMini({ scan }: { scan?: boolean }) {
  return (
    <div className="mx-3 mt-9 overflow-hidden rounded-2xl border border-[#a6e22e]/40 bg-gradient-to-b from-[#12361f] to-[#08180e]">
      <div className="bg-gradient-to-r from-[#2f6b1c] to-[#6cbf1f] px-3 py-2">
        <p className="text-[8px] tracking-[0.25em] text-[#0b2504]">BOLETO OFICIAL</p>
        <p className="text-[13px] font-black text-white" style={{ fontFamily: "var(--shk-title)" }}>
          SHREK · EL INICIO DE LA AVENTURA
        </p>
      </div>
      <div className="flex items-center gap-3 p-3">
        <MiniQR scan={scan} />
        <div className="text-[9px] leading-tight text-white/80">
          <p className="font-mono text-[11px] font-bold text-[#caff55]">SH-4PM-DUL-001</p>
          <p className="mt-1">Sáb 28 nov · 4:00 pm</p>
          <p className="mt-1 flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e11d2e]" /> Zona Duloc
          </p>
          <p className="mt-1 font-bold text-white">6 entradas</p>
        </div>
      </div>
      <div className="border-t border-dashed border-white/20 px-3 py-2 text-[9px] text-white/60">
        María Pérez Rojas · DNI 45872136
      </div>
    </div>
  );
}

function EscenaBoleto() {
  return (
    <Phone>
      <div className="shk-t-rise">
        <BoletoMini />
      </div>
      <div className="mx-3 mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold">
        <span className="rounded-lg bg-white py-2 text-center text-[#0b1a0f]">Descargar</span>
        <span className="rounded-lg bg-[#25d366] py-2 text-center text-[#06210f]">Compartir</span>
      </div>
      <p className="shk-t-pop mx-3 mt-3 rounded-lg bg-[#f6c744]/15 p-2 text-center text-[10px] text-[#ffe38a]" style={{ animationDelay: "1.6s" }}>
        💡 Haz una captura o guarda el enlace: es tu entrada
      </p>
      <Finger x="30%" y="73%" delay={2.4} />
    </Phone>
  );
}

function EscenaLlega() {
  return (
    <Phone>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
        <div className="shk-t-pop grid h-28 w-28 place-items-center rounded-full border-4 border-[#f6c744]/60 bg-[#f6c744]/10">
          <div className="relative h-16 w-16 rounded-full border-4 border-[#f6c744]">
            <span className="shk-t-hand absolute left-1/2 top-1/2 h-6 w-[3px] origin-bottom -translate-x-1/2 -translate-y-full rounded bg-[#f6c744]" />
            <span className="absolute left-1/2 top-1/2 h-4 w-[3px] origin-bottom -translate-x-1/2 -translate-y-full rotate-90 rounded bg-white" />
          </div>
        </div>
        <p className="shk-t-pop text-lg font-black text-[#caff55]" style={{ animationDelay: "0.5s", fontFamily: "var(--shk-title)" }}>
          LLEGA CON TIEMPO
        </p>
        <p className="shk-t-pop text-[11px] text-white/70" style={{ animationDelay: "1s" }}>
          El ingreso es por orden de llegada y, una vez iniciada la función, no se permite entrar.
        </p>
        <p className="shk-t-pop rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold" style={{ animationDelay: "1.6s" }}>
          📍 Auditorio del Colegio de Ingenieros de Ica
        </p>
      </div>
    </Phone>
  );
}

function EscenaPuerta() {
  return (
    <Phone>
      <BoletoMini scan />
      <div className="shk-t-slide mx-3 mt-4 flex items-center gap-3 rounded-xl bg-[#dbe7f5] p-3 text-[#10233b]">
        <span className="grid h-10 w-14 place-items-center rounded-md bg-[#9bb8d9] text-[9px] font-black">DNI</span>
        <div className="text-[10px] leading-tight">
          <p className="font-bold">MARÍA PÉREZ ROJAS</p>
          <p>45872136</p>
        </div>
      </div>
      <p className="mx-3 mt-3 text-center text-[10px] text-white/70">Muestra tu boleto y tu DNI en boletería</p>
    </Phone>
  );
}

function EscenaValida() {
  return (
    <Phone>
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="shk-t-check grid h-24 w-24 place-items-center rounded-full bg-[#39d353] shadow-[0_0_40px_rgba(57,211,83,0.6)]">
          <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="#04210d" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path className="shk-t-tick" d="M5 12.5l4.2 4.2L19 7" />
          </svg>
        </div>
        <p className="shk-t-pop text-xl font-black text-[#caff55]" style={{ animationDelay: "0.8s", fontFamily: "var(--shk-title)" }}>
          ¡INGRESO REGISTRADO!
        </p>
        <p className="shk-t-pop font-mono text-[11px] text-white/80" style={{ animationDelay: "1.1s" }}>
          SH-4PM-DUL-001
        </p>
        <div className="shk-t-pop w-full rounded-xl bg-white/[0.07] p-3 text-[11px]" style={{ animationDelay: "1.5s" }}>
          <p className="font-bold text-white">Ingresaron 4 de 6</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <span className="shk-t-fill block h-full rounded-full bg-[#a6e22e]" />
          </div>
          <p className="mt-2 text-[10px] text-white/60">¿Tu grupo llega por partes? Cada ingreso queda registrado y el resto sigue vigente.</p>
        </div>
      </div>
    </Phone>
  );
}

function EscenaDisfruta() {
  const conf = Array.from({ length: 16 }, (_, i) => i);
  return (
    <Phone>
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
        {conf.map((i) => (
          <span
            key={i}
            className="shk-t-conf absolute top-0 h-2.5 w-2.5 rounded-sm"
            style={{
              left: `${(i * 37) % 100}%`,
              background: ["#a6e22e", "#f6c744", "#ffffff", "#e11d2e", "#2f93e0"][i % 5],
              animationDelay: `${(i % 6) * 0.35}s`,
            }}
          />
        ))}
        <img src={shrekPersonaje} alt="" className="shk-t-bounce h-28 w-auto drop-shadow-[0_10px_20px_rgba(120,220,40,0.4)]" />
        <p className="text-2xl font-black text-[#caff55]" style={{ fontFamily: "var(--shk-title)" }}>
          ¡A DISFRUTAR LA AVENTURA!
        </p>
        <p className="text-[11px] text-white/70">Nos vemos en el pantano 🍃 Gracias por apoyar el teatro.</p>
      </div>
    </Phone>
  );
}

/* ───────── guías ───────── */

const GUIAS: Guia[] = [
  {
    id: "compra",
    tab: "Comprar",
    emoji: "🛒",
    resumen: "Elige, reserva por WhatsApp y paga. Toma 2 minutos.",
    pasos: [
      { titulo: "Elige función y zona", texto: "Escoge las 4:00 pm o las 7:00 pm y toca la zona que prefieras en el mapa o en la lista.", escena: <EscenaElige /> },
      { titulo: "Cuántas entradas llevas", texto: "Indica cuántas de Adulto y cuántas de Niño. La web calcula la promoción del día y cuánto ahorras.", escena: <EscenaCantidad /> },
      { titulo: "Completa tus datos", texto: "Nombre, DNI y celular. Luego toca “Reservar por WhatsApp”: el mensaje sale listo, sin escribir nada.", escena: <EscenaDatos /> },
      { titulo: "Paga y envía tu captura", texto: "Yapea o Plinea el monto y manda la captura por el mismo chat. Nuestro equipo confirma tu pago.", escena: <EscenaPago /> },
    ],
  },
  {
    id: "ticket",
    tab: "Tu ticket",
    emoji: "🎟️",
    resumen: "Te llega por WhatsApp con un enlace a tu boleto digital.",
    pasos: [
      { titulo: "Te confirmamos por WhatsApp", texto: "Apenas validamos tu pago recibes tu código de ticket y el enlace a tu boleto.", escena: <EscenaConfirma /> },
      { titulo: "Abre tu boleto digital", texto: "Ahí está tu código QR, tu zona, tu función y cuántas entradas incluye. Se actualiza solo.", escena: <EscenaBoleto /> },
    ],
  },
  {
    id: "funcion",
    tab: "La función",
    emoji: "🎭",
    resumen: "Llegas, muestras tu boleto y tu DNI, y entras.",
    pasos: [
      { titulo: "Llega con tiempo", texto: "El ingreso es por orden de llegada. Una vez iniciada la función no se permite el ingreso.", escena: <EscenaLlega /> },
      { titulo: "Muestra boleto y DNI", texto: "Abre tu boleto en el celular (o llévalo impreso) y presenta tu DNI en boletería.", escena: <EscenaPuerta /> },
      { titulo: "Te validan en puerta", texto: "Escaneamos tu código y registramos el ingreso. Si tu grupo llega por partes, cada persona queda anotada.", escena: <EscenaValida /> },
      { titulo: "Disfruta la aventura", texto: "Ya estás dentro del pantano. ¡Gracias por apoyar el teatro de Ica!", escena: <EscenaDisfruta /> },
    ],
  },
];

/* ───────── reproductor ───────── */

export function Tutorial() {
  const [guiaIdx, setGuiaIdx] = useState(0);
  const [pasoIdx, setPasoIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0); // reinicia animaciones
  const boxRef = useRef<HTMLDivElement>(null);

  const guia = GUIAS[guiaIdx];
  const paso = guia.pasos[pasoIdx];

  // Solo corre mientras se ve en pantalla
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible || guia.videoUrl) return;
    const t = setTimeout(() => {
      if (pasoIdx < guia.pasos.length - 1) setPasoIdx(pasoIdx + 1);
      else setPasoIdx(0);
      setTick((n) => n + 1);
    }, PASO_MS);
    return () => clearTimeout(t);
  }, [playing, visible, pasoIdx, guiaIdx, tick, guia]);

  const irA = (g: number, p = 0) => {
    setGuiaIdx(g);
    setPasoIdx(p);
    setTick((n) => n + 1);
  };

  return (
    <div ref={boxRef}>
      {/* Pestañas */}
      <div className="mb-10 grid grid-cols-3 border-b border-white/10 sm:flex sm:justify-center sm:gap-x-10" role="tablist" aria-label="Guías">
        {GUIAS.map((g, i) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={i === guiaIdx}
            onClick={() => irA(i)}
            className={`relative px-1 pb-3 text-center text-[15px] font-bold transition-colors ${
              i === guiaIdx ? "text-white" : "text-white/45 hover:text-white/75"
            }`}
          >
            <span className="mr-1.5 hidden sm:inline">{g.emoji}</span>
            {g.tab}
            <span
              className={`absolute -bottom-px left-0 h-[3px] rounded-full bg-[#caff55] shadow-[0_0_12px_rgba(190,255,70,0.8)] transition-all duration-300 ${
                i === guiaIdx ? "w-full" : "w-0"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
        {/* Escena (se reinicia con cada paso) */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-0 mx-auto h-full w-[80%] rounded-full bg-[#a6e22e]/10 blur-3xl" />
          {guia.videoUrl ? (
            <video src={guia.videoUrl} controls playsInline className="mx-auto w-full max-w-[300px] rounded-3xl" />
          ) : (
            <div key={`${guiaIdx}-${pasoIdx}-${tick}`} className="shk-t-scene relative z-10">
              {paso.escena}
            </div>
          )}
        </div>

        {/* Texto y controles */}
        <div>
          <p className="shk-eyebrow mb-2">
            Paso {pasoIdx + 1} de {guia.pasos.length}
          </p>
          <h3 key={`h-${guiaIdx}-${pasoIdx}`} className="shk-h2 shk-t-fade mb-3 text-3xl sm:text-4xl">
            {paso.titulo}
          </h3>
          <p key={`p-${guiaIdx}-${pasoIdx}`} className="shk-t-fade mb-6 max-w-lg text-[15px] leading-relaxed text-white/75">
            {paso.texto}
          </p>

          {/* Lista de pasos */}
          <ol className="mb-6 space-y-2">
            {guia.pasos.map((p, i) => (
              <li key={p.titulo}>
                <button
                  onClick={() => irA(guiaIdx, i)}
                  className={`flex w-full items-center gap-3 py-2 text-left text-[14px] transition-colors ${
                    i === pasoIdx ? "text-white" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                      i < pasoIdx
                        ? "bg-[#a6e22e] text-[#0b2504]"
                        : i === pasoIdx
                        ? "bg-[#f6c744] text-[#2a1a00]"
                        : "border border-white/25"
                    }`}
                  >
                    {i < pasoIdx ? "✓" : i + 1}
                  </span>
                  <span className="font-semibold">{p.titulo}</span>
                  {i === pasoIdx && playing && !guia.videoUrl && (
                    <span className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-white/10">
                      <span
                        key={`b-${tick}-${pasoIdx}`}
                        className="shk-t-progress block h-full rounded-full bg-[#a6e22e]"
                        style={{ animationDuration: `${PASO_MS}ms` }}
                      />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>

          {/* Controles tipo reproductor */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPasoIdx(Math.max(0, pasoIdx - 1));
                setTick((n) => n + 1);
              }}
              className="grid h-10 w-10 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Paso anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPlaying((v) => !v)}
              className="grid h-12 w-12 place-items-center rounded-full bg-[#a6e22e] text-[#0b2504] shadow-[0_6px_20px_-6px_rgba(166,226,46,0.8)]"
              aria-label={playing ? "Pausar" : "Reproducir"}
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => {
                setPasoIdx(Math.min(guia.pasos.length - 1, pasoIdx + 1));
                setTick((n) => n + 1);
              }}
              className="grid h-10 w-10 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Paso siguiente"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => irA(guiaIdx, 0)}
              className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Ver de nuevo"
            >
              <RotateCcw size={16} />
            </button>
            <span className="ml-3 hidden text-[12px] text-white/50 sm:block">{guia.resumen}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
