import { useId } from "react";

export interface MapZone {
  key: string; // duloc | ogro | pantano
  label: string;
  color: string;
}

export interface MapAvailability {
  available: number;
  total: number;
  soldOut: boolean;
}

interface Props {
  zonas: MapZone[];
  availability: Record<string, MapAvailability> | null;
  selected: string | null;
  onSelect: (key: string) => void;
}

// Plano del auditorio (basado en el mapa oficial de Chaplin): escenario arriba,
// Duloc al frente (dos bloques escalonados), Ogro detrás y Pantano en el 2.º piso.
const SHAPES: Record<string, { paths: string[]; label: { x: number; y: number }; short: string }> = {
  duloc: {
    paths: [
      "M130 120 H349 V285 H56 V240 H93 V168 H130 Z",
      "M409 120 H591 V144 H627 V190 H665 V285 H409 Z",
    ],
    label: { x: 380, y: 200 },
    short: "DULOC",
  },
  ogro: {
    paths: ["M56 314 H349 V433 H56 Z", "M409 314 H702 V433 H409 Z"],
    label: { x: 380, y: 372 },
    short: "OGRO",
  },
  pantano: {
    paths: ["M0 506 H758 V612 H0 Z"],
    label: { x: 379, y: 562 },
    short: "PANTANO",
  },
};

export function SeatMap({ zonas, availability, selected, onSelect }: Props) {
  const uid = useId().replace(/:/g, "");
  const byKey = Object.fromEntries(zonas.map((z) => [z.key, z]));

  return (
    <svg
      viewBox="0 0 758 628"
      role="group"
      aria-label="Mapa de asientos del Auditorio del Colegio de Ingenieros de Ica"
      className="w-full h-auto select-none"
    >
      <defs>
        <pattern id={`seats-${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="3.2" fill="#ffffff" fillOpacity="0.22" />
        </pattern>
        <linearGradient id={`wood-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5524" />
          <stop offset="1" stopColor="#4f2d12" />
        </linearGradient>
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Escenario */}
      <g>
        <rect x="0" y="0" width="758" height="96" rx="16" fill={`url(#wood-${uid})`} stroke="#2a1608" strokeWidth="3" />
        {[24, 48, 72].map((y) => (
          <line key={y} x1="10" x2="748" y1={y} y2={y} stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
        ))}
        <text
          x="379"
          y="60"
          textAnchor="middle"
          fontSize="42"
          fill="#fdf0c4"
          style={{ fontFamily: "var(--shk-title)", letterSpacing: "0.08em" }}
        >
          ESCENARIO
        </text>
      </g>

      {/* Pasillos */}
      <rect x="56" y="289" width="293" height="19" rx="6" fill="#6b7280" fillOpacity="0.55" />
      <rect x="409" y="289" width="293" height="19" rx="6" fill="#6b7280" fillOpacity="0.55" />
      <text x="205" y="303" textAnchor="middle" fontSize="14" fill="#e5e7eb" fillOpacity="0.85" letterSpacing="3">
        PASILLO
      </text>
      <text x="555" y="303" textAnchor="middle" fontSize="14" fill="#e5e7eb" fillOpacity="0.85" letterSpacing="3">
        PASILLO
      </text>

      {/* Primer piso: rótulo lateral */}
      <text
        transform="translate(22 302) rotate(-90)"
        textAnchor="middle"
        fontSize="15"
        letterSpacing="5"
        fill="#caff55"
        fillOpacity="0.9"
        style={{ fontFamily: "var(--shk-serif)", fontWeight: 900 }}
      >
        PRIMER PISO
      </text>

      {/* Separación entre pisos */}
      <line x1="0" x2="758" y1="470" y2="470" stroke="#f6c744" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="6 7" />
      <g>
        <rect x="199" y="452" width="360" height="38" rx="19" fill="#f6c744" />
        <text
          x="379"
          y="478"
          textAnchor="middle"
          fontSize="19"
          letterSpacing="4"
          fill="#2a1a00"
          style={{ fontFamily: "var(--shk-serif)", fontWeight: 900 }}
        >
          ▲ SEGUNDO PISO ▲
        </text>
      </g>

      {/* Zonas */}
      {Object.entries(SHAPES).map(([key, shape]) => {
        const zona = byKey[key];
        if (!zona) return null;
        const av = availability?.[key];
        const soldOut = Boolean(av?.soldOut);
        const isSelected = selected === key;
        const label = `${zona.label}${av ? `: ${soldOut ? "agotada" : `${av.available} disponibles`}` : ""}`;
        return (
          <g
            key={key}
            className={`shk-zone${isSelected ? " is-selected" : ""}${soldOut ? " is-soldout" : ""}`}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={label}
            onClick={() => !soldOut && onSelect(key)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !soldOut) {
                e.preventDefault();
                onSelect(key);
              }
            }}
          >
            <title>{label}</title>
            {shape.paths.map((d, i) => (
              <g key={i}>
                <path d={d} fill={zona.color} stroke="#04130a" strokeWidth="3" strokeLinejoin="round" />
                <path d={d} fill={`url(#seats-${uid})`} />
                <path d={d} fill={`url(#shine-${uid})`} />
                <path
                  className="shk-zone-stroke"
                  d={d}
                  fill="none"
                  stroke={isSelected ? "#caff55" : "transparent"}
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              </g>
            ))}
            <text
              x={shape.label.x}
              y={shape.label.y}
              textAnchor="middle"
              fontSize={key === "pantano" ? 46 : 46}
              fill="#fff"
              stroke="#04130a"
              strokeWidth="6"
              paintOrder="stroke"
              style={{ fontFamily: "var(--shk-title)", letterSpacing: "0.05em" }}
            >
              {shape.short}
            </text>
            {key === "pantano" && (
              <g aria-hidden>
                <line x1="0" x2="758" y1="514" y2="514" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" />
                {Array.from({ length: 31 }, (_, i) => (
                  <line key={i} x1={12 + i * 24.5} x2={12 + i * 24.5} y1="514" y2="528" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" />
                ))}
              </g>
            )}
            {av && (
              <text
                x={shape.label.x}
                y={shape.label.y + 34}
                textAnchor="middle"
                fontSize="24"
                fill={soldOut ? "#fecaca" : "#fff"}
                stroke="#04130a"
                strokeWidth="5"
                paintOrder="stroke"
                style={{ fontFamily: "var(--font-body)", fontWeight: 800 }}
              >
                {soldOut ? "AGOTADO" : `${av.available} disp.`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
