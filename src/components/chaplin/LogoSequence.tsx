import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 37;

function padded(n: number) {
  return String(n).padStart(3, "0");
}

export function LogoSequence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  /* ── Preload all frames ─────────────────────────────── */
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      img.src = `/sequence/ezgif-frame-${padded(i)}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          framesRef.current = images;
          setLoaded(true);
          drawFrame(0);
        }
      };
      images.push(img);
    }
  }, []);

  /* ── Draw a specific frame index onto canvas ─────────── */
  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    const images = framesRef.current;
    if (!canvas || !images[index]) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[index];
    const { width: cw, height: ch } = canvas;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const x = (cw - img.naturalWidth * scale) / 2;
    const y = (ch - img.naturalHeight * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
  }

  /* ── Resize canvas to fill window ────────────────────── */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [loaded]);

  /* ── Scroll → frame mapping ──────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section || !loaded) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(progress * TOTAL_FRAMES)
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loaded]);

  return (
    /* Section height: TOTAL_FRAMES × 50px = 1850px of scroll space */
    <div
      ref={sectionRef}
      style={{ height: `${TOTAL_FRAMES * 55}px` }}
      className="relative bg-negro"
    >
      {/* Sticky canvas that pins while scrolling */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ background: "#000" }}
        />

        {/* Loading indicator */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-negro">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-[2px] bg-rojo animate-pulse" />
              <p className="font-body text-blanco/40 text-xs uppercase tracking-[0.3em]">
                Cargando
              </p>
            </div>
          </div>
        )}

        {/* Scroll cue shown until user scrolls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
          <span className="font-body text-blanco/40 text-[10px] uppercase tracking-[0.5em]">
            Scroll
          </span>
          <div className="w-[1px] h-8 bg-blanco/20 relative overflow-hidden">
            <span className="scroll-dot absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-rojo" />
          </div>
        </div>
      </div>
    </div>
  );
}
