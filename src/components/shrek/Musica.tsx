import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export const MUSICA_SRC = "/audio/all-star.m4a";
export const MUSICA_CLAVE_APAGADA = "shk_musica_apagada";
const VOLUMEN = 0.45;

// Script que se ejecuta en la cabecera de la página, apenas llega el HTML (antes de que cargue
// el resto del sitio), para que la música empiece lo antes posible y a volumen normal.
// Si el navegador bloquea el audio automático, empieza con el primer toque en la página.
export const MUSICA_SCRIPT = `(function(){try{
if(localStorage.getItem('${MUSICA_CLAVE_APAGADA}')==='1')return;
var a=new Audio('${MUSICA_SRC}');a.loop=true;a.preload='auto';a.volume=${VOLUMEN};window.__shkAudio=a;
var p=a.play();
if(p&&p.catch){p.catch(function(){
var ev=['pointerdown','touchend','click','keydown'];
function go(){ev.forEach(function(e){window.removeEventListener(e,go,true)});a.play().catch(function(){});}
ev.forEach(function(e){window.addEventListener(e,go,true)});
});}
}catch(e){}})();`;

type Estado = "inicio" | "sonando" | "pausada" | "bloqueada";

// Música de ambiente de la ticketera. Siempre hay un botón para silenciarla.
export function MusicaAmbiente() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [estado, setEstado] = useState<Estado>("inicio");

  useEffect(() => {
    let apagada = false;
    try {
      apagada = localStorage.getItem(MUSICA_CLAVE_APAGADA) === "1";
    } catch {
      /* sin almacenamiento */
    }

    const w = window as unknown as { __shkAudio?: HTMLAudioElement };
    let a = w.__shkAudio;
    if (!a) {
      a = new Audio(MUSICA_SRC);
      a.loop = true;
      a.preload = "auto";
      w.__shkAudio = a;
    }
    a.volume = VOLUMEN;
    audioRef.current = a;

    const alPlay = () => setEstado("sonando");
    const alPause = () => setEstado((e) => (e === "bloqueada" ? e : "pausada"));
    a.addEventListener("playing", alPlay);
    a.addEventListener("pause", alPause);

    if (apagada) {
      a.pause();
      setEstado("pausada");
    } else if (!a.paused) {
      setEstado("sonando");
    } else {
      // Si todavía no empezó, se intenta aquí también; si el navegador lo bloquea, se avisa
      a.play().catch(() => setEstado("bloqueada"));
      const t = setTimeout(() => {
        if (a && a.paused) setEstado("bloqueada");
      }, 1200);
      const eventos = ["pointerdown", "touchend", "click", "keydown"] as const;
      const alToque = () => {
        eventos.forEach((e) => window.removeEventListener(e, alToque, true));
        void a?.play().catch(() => {});
      };
      eventos.forEach((e) => window.addEventListener(e, alToque, true));
      return () => {
        clearTimeout(t);
        eventos.forEach((e) => window.removeEventListener(e, alToque, true));
        a?.removeEventListener("playing", alPlay);
        a?.removeEventListener("pause", alPause);
        a?.pause();
      };
    }

    return () => {
      a?.removeEventListener("playing", alPlay);
      a?.removeEventListener("pause", alPause);
      a?.pause();
    };
  }, []);

  // Se pausa si la pestaña pasa a segundo plano y sigue al volver
  useEffect(() => {
    const visibilidad = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (estado === "sonando" || estado === "inicio") void a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", visibilidad);
    return () => document.removeEventListener("visibilitychange", visibilidad);
  }, [estado]);

  const alternar = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      setEstado("pausada");
      try {
        localStorage.setItem(MUSICA_CLAVE_APAGADA, "1");
      } catch {
        /* sin almacenamiento */
      }
    } else {
      try {
        localStorage.removeItem(MUSICA_CLAVE_APAGADA);
      } catch {
        /* sin almacenamiento */
      }
      a.volume = VOLUMEN;
      await a.play().catch(() => setEstado("bloqueada"));
    }
  };

  const mostrandoSonido = estado === "sonando" || estado === "inicio";

  return (
    <div className="fixed bottom-[92px] left-3 z-50 flex items-center gap-2 lg:bottom-6 lg:left-6 print:hidden">
      <button
        type="button"
        onClick={alternar}
        aria-label={mostrandoSonido ? "Silenciar la música" : "Activar la música"}
        title={mostrandoSonido ? "Silenciar la música" : "Activar la música"}
        className="grid h-12 w-12 place-items-center rounded-full bg-[#0b2014]/90 text-[#caff55] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.8),0_0_0_2px_rgba(166,226,46,0.45)] backdrop-blur transition-transform hover:scale-105 active:scale-95"
      >
        {mostrandoSonido ? (
          <span className="flex h-5 items-end gap-[3px]" aria-hidden>
            {[0, 0.25, 0.5, 0.15].map((d) => (
              <span key={d} className="shk-eq h-full w-[3px] rounded-full bg-[#caff55]" style={{ animationDelay: `${d}s` }} />
            ))}
          </span>
        ) : estado === "bloqueada" ? (
          <Volume2 size={20} />
        ) : (
          <VolumeX size={20} />
        )}
      </button>
      {estado === "bloqueada" && (
        <button
          type="button"
          onClick={alternar}
          className="animate-pulse rounded-full bg-[#caff55] px-3.5 py-2 text-[12px] font-black text-[#0b2504] shadow-lg"
        >
          Toca para activar la música
        </button>
      )}
    </div>
  );
}
