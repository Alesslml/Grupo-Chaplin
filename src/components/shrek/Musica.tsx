import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const CLAVE_APAGADA = "shk_musica_apagada";
const VOLUMEN = 0.45;

// Música de ambiente de la ticketera. Intenta sonar apenas se entra; los navegadores no
// permiten audio automático sin un toque del usuario, así que si lo bloquean, empieza con
// el primer toque en cualquier parte de la página. Siempre hay un botón para silenciarla.
export function MusicaAmbiente() {
  const ref = useRef<HTMLAudioElement>(null);
  const quiereSonar = useRef(true);
  const sonandoRef = useRef(false);
  const [sonando, setSonando] = useState(false);
  const [bloqueada, setBloqueada] = useState(false);

  useEffect(() => {
    sonandoRef.current = sonando;
  }, [sonando]);

  const subirVolumen = useCallback(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0;
    let v = 0;
    const paso = setInterval(() => {
      v = Math.min(VOLUMEN, v + 0.03);
      a.volume = v;
      if (v >= VOLUMEN) clearInterval(paso);
    }, 80);
  }, []);

  const iniciar = useCallback(async () => {
    const a = ref.current;
    if (!a) return false;
    try {
      a.volume = 0;
      await a.play();
      setSonando(true);
      setBloqueada(false);
      subirVolumen();
      return true;
    } catch {
      setBloqueada(true);
      return false;
    }
  }, [subirVolumen]);

  useEffect(() => {
    let apagada = false;
    try {
      apagada = localStorage.getItem(CLAVE_APAGADA) === "1";
    } catch {
      /* sin almacenamiento */
    }
    if (apagada) {
      quiereSonar.current = false;
      return;
    }

    const eventos = ["pointerdown", "touchend", "click", "keydown"] as const;
    const alToque = () => {
      eventos.forEach((e) => window.removeEventListener(e, alToque, true));
      if (quiereSonar.current) void iniciar();
    };

    iniciar().then((ok) => {
      if (!ok) eventos.forEach((e) => window.addEventListener(e, alToque, true));
    });

    // Si la pestaña pasa a segundo plano, se pausa; al volver, sigue
    const visibilidad = () => {
      const a = ref.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (quiereSonar.current && sonandoRef.current) void a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", visibilidad);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, alToque, true));
      document.removeEventListener("visibilitychange", visibilidad);
      ref.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alternar = async () => {
    const a = ref.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      setSonando(false);
      quiereSonar.current = false;
      try {
        localStorage.setItem(CLAVE_APAGADA, "1");
      } catch {
        /* sin almacenamiento */
      }
    } else {
      quiereSonar.current = true;
      try {
        localStorage.removeItem(CLAVE_APAGADA);
      } catch {
        /* sin almacenamiento */
      }
      await iniciar();
    }
  };

  return (
    <>
      <audio ref={ref} src="/audio/all-star.m4a" loop preload="auto" playsInline />
      <div className="fixed bottom-[92px] left-3 z-50 flex items-center gap-2 lg:bottom-6 lg:left-6 print:hidden">
        <button
          type="button"
          onClick={alternar}
          aria-label={sonando ? "Silenciar la música" : "Activar la música"}
          title={sonando ? "Silenciar la música" : "Activar la música"}
          className="grid h-12 w-12 place-items-center rounded-full bg-[#0b2014]/90 text-[#caff55] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.8),0_0_0_2px_rgba(166,226,46,0.45)] backdrop-blur transition-transform hover:scale-105 active:scale-95"
        >
          {sonando ? (
            <span className="flex h-5 items-end gap-[3px]" aria-hidden>
              <span className="shk-eq h-full w-[3px] rounded-full bg-[#caff55]" style={{ animationDelay: "0s" }} />
              <span className="shk-eq h-full w-[3px] rounded-full bg-[#caff55]" style={{ animationDelay: "0.25s" }} />
              <span className="shk-eq h-full w-[3px] rounded-full bg-[#caff55]" style={{ animationDelay: "0.5s" }} />
              <span className="shk-eq h-full w-[3px] rounded-full bg-[#caff55]" style={{ animationDelay: "0.15s" }} />
            </span>
          ) : (
            <VolumeX size={20} />
          )}
        </button>
        {bloqueada && !sonando && (
          <button
            type="button"
            onClick={alternar}
            className="animate-pulse rounded-full bg-[#caff55] px-3.5 py-2 text-[12px] font-black text-[#0b2504] shadow-lg"
          >
            Toca para activar la música
          </button>
        )}
      </div>
    </>
  );
}
