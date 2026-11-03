import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { X } from "lucide-react";

interface Props {
  onResult: (texto: string) => void;
  onClose: () => void;
}

// Lector de QR con la cámara del celular (funciona en Android y iPhone, sin costo:
// todo se decodifica en el propio teléfono). Requiere HTTPS, que ya tiene el sitio.
export function QrScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let vivo = true;
    let ultimo = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const v = videoRef.current;
      if (!vivo || !v || !ctx || v.readyState < 2 || t - ultimo < 140) return;
      ultimo = t;
      const w = v.videoWidth;
      const h = v.videoHeight;
      if (!w || !h) return;
      const escala = Math.min(1, 720 / Math.max(w, h));
      canvas.width = Math.round(w * escala);
      canvas.height = Math.round(h * escala);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code && code.data) {
        vivo = false;
        if (navigator.vibrate) navigator.vibrate(60);
        onResult(code.data);
      }
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!vivo) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.setAttribute("playsinline", "true");
          await v.play();
          setListo(true);
          raf = requestAnimationFrame(tick);
        }
      } catch (e: any) {
        setError(
          e?.name === "NotAllowedError"
            ? "No diste permiso para usar la cámara. Actívalo en los ajustes del navegador y vuelve a intentar."
            : "No se pudo abrir la cámara de este dispositivo."
        );
      }
    })();

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-bold">Apunta al QR del boleto</p>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/15" aria-label="Cerrar cámara">
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
        {/* Marco de lectura */}
        {listo && !error && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative h-[64vmin] w-[64vmin] max-h-[360px] max-w-[360px] rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"].map((c) => (
                <span key={c} className={`absolute h-10 w-10 border-[#a6e22e] ${c}`} />
              ))}
              <span className="absolute left-3 right-3 top-1/2 h-[3px] animate-pulse rounded bg-[#a6e22e] shadow-[0_0_14px_3px_rgba(166,226,46,0.8)]" />
            </div>
          </div>
        )}
        {!listo && !error && <p className="absolute inset-0 grid place-items-center text-sm text-white/70">Abriendo cámara…</p>}
        {error && (
          <div className="absolute inset-0 grid place-items-center px-8 text-center text-white">
            <div>
              <p className="text-base font-bold">{error}</p>
              <button onClick={onClose} className="mt-5 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="px-6 py-4 text-center text-xs text-white/60">Mantén el QR dentro del marco, con buena luz. Se registra solo al leerlo.</p>
    </div>
  );
}
