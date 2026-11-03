// Luciérnagas decorativas. Posiciones deterministas (sin Math.random) para que el
// HTML del servidor y el del navegador sean idénticos.
export function Fireflies({ count = 18 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => {
    const a = (i * 137.508) % 360; // ángulo áureo
    const left = Math.round((((Math.sin((a * Math.PI) / 180) + 1) / 2) * 96 + 2) * 100) / 100;
    const top = Math.round((((i * 53) % 100) * 0.92 + 3) * 100) / 100;
    const size = 4 + ((i * 7) % 5);
    return {
      left,
      top,
      size,
      delay: -Math.round(((i * 1.7) % 9) * 10) / 10,
      dur: 10 + ((i * 3) % 8),
      tw: Math.round((2.4 + ((i * 5) % 4) * 0.7) * 10) / 10,
    };
  });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {items.map((f, i) => (
        <span
          key={i}
          className="shk-fly"
          style={
            {
              left: `${f.left}%`,
              top: `${f.top}%`,
              "--s": `${f.size}px`,
              "--d": `${f.dur}s`,
              "--t": `${f.tw}s`,
              "--delay": `${f.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
