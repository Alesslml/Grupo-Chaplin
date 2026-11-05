// Configuración de cada evento con venta de entradas. Archivo compartido
// (navegador y servidor): no importa nada del servidor.

export type EventoKey = "jesucristo" | "shrek";

export interface PriceSet {
  twoXone: number;
  threeXtwo: number;
  twentyPct: number;
  regular: number;
}

export interface EventZoneSetting {
  key: string;
  label: string;
  color: string;
  seats: number;
  prices: PriceSet; // precio de la entrada Adulto (o única, si el evento no tiene categorías)
  pricesNino?: PriceSet; // precio de la entrada Niño (solo eventos con categorías)
}

export interface EventPromoSetting {
  key: string;
  label: string;
  tag: string;
  detalle: string;
  from: string;
  to: string;
  entradasPorPrecio: number;
}

export interface EventSettings {
  zonas: EventZoneSetting[];
  funciones: string[];
  promos: EventPromoSetting[];
}

export interface EventoConfig {
  key: EventoKey;
  nombre: string;
  nombreCorto: string;
  settingsKey: string; // clave en la tabla event_settings
  codePrefix: string; // prefijo del código de ticket: JR-4PM-SUP-001
  zonePrefix: Record<string, string>;
  fechaLarga: string;
  fechaISO: string; // día de la función (hora de Perú)
  lugar: string;
  whatsapp: string;
  tieneCategorias: boolean; // Adulto / Niño
  defaults: EventSettings;
}

const ZONA_CORTESIA = {
  key: "cortesia",
  label: "Zona Cortesía",
  color: "#c59a58",
  seats: 14,
  prices: { twoXone: 0, threeXtwo: 0, twentyPct: 0, regular: 0 },
};

export const EVENTOS: Record<EventoKey, EventoConfig> = {
  jesucristo: {
    key: "jesucristo",
    nombre: "Jesucristo Rockstar",
    nombreCorto: "Jesucristo Rockstar",
    settingsKey: "jesucristo_rockstar_settings",
    codePrefix: "JR",
    zonePrefix: { superstar: "SUP", cortesia: "COR", getsemani: "GET", hosanna: "HOS", pueblo: "PUE" },
    fechaLarga: "Domingo 18 de octubre",
    fechaISO: "2026-10-18",
    lugar: "Auditorio del Colegio de Ingenieros de Ica",
    whatsapp: "51956060826",
    tieneCategorias: false,
    defaults: {
      zonas: [
        {
          key: "superstar",
          label: "Zona Superstar",
          color: "#fe0000",
          seats: 60,
          prices: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 80 },
        },
        ZONA_CORTESIA,
        {
          key: "getsemani",
          label: "Zona Getsemaní",
          color: "#f2d675",
          seats: 47,
          prices: { twoXone: 60, threeXtwo: 120, twentyPct: 48, regular: 60 },
        },
        {
          key: "hosanna",
          label: "Zona Hosanna",
          color: "#7dd3e8",
          seats: 67,
          prices: { twoXone: 40, threeXtwo: 80, twentyPct: 32, regular: 40 },
        },
        {
          key: "pueblo",
          label: "Zona Pueblo (2do piso)",
          color: "#2b3a8f",
          seats: 80,
          prices: { twoXone: 20, threeXtwo: 40, twentyPct: 16, regular: 20 },
        },
      ],
      funciones: ["4:00 pm", "7:00 pm"],
      promos: [
        {
          key: "twoXone",
          label: "Preventa 2x1",
          tag: "2x1",
          detalle: "Del 16 al 22 de setiembre · Llevas 2 entradas por este precio",
          from: "2026-09-16",
          to: "2026-09-22",
          entradasPorPrecio: 2,
        },
        {
          key: "threeXtwo",
          label: "Preventa 3x2",
          tag: "3x2",
          detalle: "Del 23 de setiembre al 2 de octubre · Llevas 3 entradas por este precio",
          from: "2026-09-23",
          to: "2026-10-02",
          entradasPorPrecio: 3,
        },
        {
          key: "twentyPct",
          label: "Preventa 20% dto.",
          tag: "20% dto",
          detalle: "Del 3 al 11 de octubre · Precio por entrada",
          from: "2026-10-03",
          to: "2026-10-11",
          entradasPorPrecio: 1,
        },
        {
          key: "regular",
          label: "Precio regular",
          tag: "Regular",
          detalle: "Del 12 al 18 de octubre · Precio por entrada",
          from: "2026-10-12",
          to: "2026-10-18",
          entradasPorPrecio: 1,
        },
      ],
    },
  },

  shrek: {
    key: "shrek",
    nombre: "SHREK, El inicio de la aventura",
    nombreCorto: "Shrek",
    settingsKey: "shrek_settings",
    codePrefix: "SH",
    zonePrefix: { duloc: "DUL", cortesia: "COR", ogro: "OGR", pantano: "PAN" },
    fechaLarga: "Sábado 28 de noviembre",
    fechaISO: "2026-11-28",
    lugar: "Auditorio del Colegio de Ingenieros de Ica",
    whatsapp: "51956060826",
    tieneCategorias: true,
    defaults: {
      zonas: [
        {
          key: "duloc",
          label: "Zona Duloc",
          color: "#e11d2e",
          seats: 90,
          prices: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 80 },
          pricesNino: { twoXone: 60, threeXtwo: 120, twentyPct: 48, regular: 60 },
        },
        { ...ZONA_CORTESIA, prices: { ...ZONA_CORTESIA.prices }, pricesNino: { ...ZONA_CORTESIA.prices } },
        {
          key: "ogro",
          label: "Zona Ogro",
          color: "#22b04f",
          seats: 80,
          prices: { twoXone: 50, threeXtwo: 100, twentyPct: 40, regular: 50 },
          pricesNino: { twoXone: 30, threeXtwo: 60, twentyPct: 24, regular: 30 },
        },
        {
          key: "pantano",
          label: "Zona Pantano (2do piso)",
          color: "#2f93e0",
          seats: 75,
          prices: { twoXone: 20, threeXtwo: 40, twentyPct: 16, regular: 20 },
          pricesNino: { twoXone: 15, threeXtwo: 30, twentyPct: 12, regular: 15 },
        },
      ],
      funciones: ["4:00 pm", "7:00 pm"],
      promos: [
        {
          key: "twoXone",
          label: "Preventa 2x1",
          tag: "2x1",
          detalle: "Del 4 al 8 de noviembre · Llevas 2 entradas por el precio de 1",
          from: "2026-11-04",
          to: "2026-11-08",
          entradasPorPrecio: 2,
        },
        {
          key: "threeXtwo",
          label: "Preventa 3x2",
          tag: "3x2",
          detalle: "Del 9 al 15 de noviembre · Llevas 3 entradas por el precio de 2",
          from: "2026-11-09",
          to: "2026-11-15",
          entradasPorPrecio: 3,
        },
        {
          key: "twentyPct",
          label: "Preventa 20% dto.",
          tag: "20% dto",
          detalle: "Del 16 al 24 de noviembre · Precio por entrada",
          from: "2026-11-16",
          to: "2026-11-24",
          entradasPorPrecio: 1,
        },
        {
          key: "regular",
          label: "Precio FULL",
          tag: "FULL",
          detalle: "Del 25 al 28 de noviembre · Precio por entrada",
          from: "2026-11-25",
          to: "2026-11-28",
          entradasPorPrecio: 1,
        },
      ],
    },
  },
};

// Evento que se vende hoy en la ticketera pública (/entradas).
export const EVENTO_ACTIVO: EventoKey = "shrek";

export function isEventoKey(v: unknown): v is EventoKey {
  return v === "jesucristo" || v === "shrek";
}

// Deduce el evento de un código de ticket (JR-... / SH-...).
export function eventoFromTicketCode(code?: string | null): EventoKey | null {
  if (!code) return null;
  const p = code.trim().toUpperCase().split("-")[0];
  const found = (Object.values(EVENTOS) as EventoConfig[]).find((e) => e.codePrefix === p);
  return found ? found.key : null;
}
