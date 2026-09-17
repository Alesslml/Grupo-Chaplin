import { createServerFn } from "@tanstack/react-start";
import { ensureTicketsSchema, getSql } from "@/lib/db.server";

export type MetodoPago = "efectivo" | "yape" | "plin" | "transferencia" | "cortesia";

export const METODOS_PAGO_CONFIG: Record<
  MetodoPago,
  { label: string; bg: string; text: string; border: string }
> = {
  yape: { label: "Yape", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  plin: { label: "Plin", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  transferencia: { label: "Transferencia", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  efectivo: { label: "Efectivo", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  cortesia: { label: "Pase de Cortesía", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300" },
};

export interface TicketReservation {
  id: string;
  createdAt: string; // ISO string
  clienteNombre: string;
  clienteTelefono: string;
  clienteDni?: string;
  funcion: "4:00 pm" | "7:00 pm";
  zonaKey: "superstar" | "cortesia" | "getsemani" | "hosanna" | "pueblo";
  cantidad: number;
  etapaPromo: "twoXone" | "threeXtwo" | "twentyPct" | "regular" | "cortesia";
  totalPagado: number;
  metodoPago?: MetodoPago;
  vendedor: string;
  estado: "confirmado" | "pendiente" | "anulado";
  notas?: string;
  ticketCode?: string;
}

export function generateTicketCode(funcion: string, zonaKey: string, sequentialNumber: number): string {
  const funcPrefix = funcion.includes("4:00") ? "4PM" : "7PM";
  const zonePrefixMap: Record<string, string> = {
    superstar: "SUP",
    cortesia: "COR",
    getsemani: "GET",
    hosanna: "HOS",
    pueblo: "PUE",
  };
  const zonePrefix = zonePrefixMap[zonaKey] || "JR";
  const numPad = String(Math.max(1, sequentialNumber)).padStart(3, "0");
  return `JR-${funcPrefix}-${zonePrefix}-${numPad}`;
}

export function buildWhatsAppReservationMessage(
  reservation: TicketReservation,
  baseUrl: string = "https://chaplingrupocultural.com"
): string {
  const isCortesia =
    reservation.etapaPromo === "cortesia" ||
    reservation.zonaKey === "cortesia" ||
    Number(reservation.totalPagado) === 0;

  const meta = ZONAS_CONFIG[reservation.zonaKey] || { label: "Zona General" };
  const promoMeta = isCortesia
    ? { label: "Pase de Cortesía" }
    : PROMOS_CONFIG[reservation.etapaPromo] || { label: "Precio Regular" };
  const metodoLabel = isCortesia
    ? "Pase de Cortesía"
    : METODOS_PAGO_CONFIG[reservation.metodoPago || "yape"]?.label || "Yape";
  const ticketCode = reservation.ticketCode || reservation.id;
  const ticketUrl = `${baseUrl}/ticket/${reservation.ticketCode || reservation.id}`;

  const montoText = isCortesia
    ? `S/. 0.00 SOLES (PASE DE CORTESÍA)`
    : `S/. ${Number(reservation.totalPagado).toFixed(2)} SOLES (${promoMeta.label.toUpperCase()})`;

  return (
    `🎸✝️🤘🔥 🎭\n\n` +
    `RESERVACIÓN "JESUCRISTO ROCKSTAR" (${metodoLabel.toUpperCase()})\n\n` +
    `NOMBRE: ${reservation.clienteNombre.toUpperCase()}\n` +
    `DNI: ${reservation.clienteDni || "Por confirmar"}\n` +
    `CANTIDAD: ${reservation.cantidad}\n` +
    `ZONA: ${meta.label.toUpperCase()}\n` +
    `HORARIO DE FUNCIÓN: ${reservation.funcion.toUpperCase()} (Domingo 18 de Octubre)\n` +
    `MONTO: ${montoText}\n` +
    `VENDEDOR: ${reservation.vendedor}\n` +
    `CÓDIGO DE TICKET: #${ticketCode}\n\n` +
    `🎟️ ENLACE DE TU BOLETO DIGITAL OFICIAL:\n` +
    `${ticketUrl}\n\n` +
    `TENER EN CUENTA:\n\n` +
    `Por favor llegar minutos antes de la función; el ingreso a la sala será por orden de llegada. ⏰\n\n` +
    `Por favor presentar su DNI en boletería el día de la función para hacer entrega de sus entradas. 🎟️\n\n` +
    `Público recomendado: Apto para mayores de 14 años. 👥\n\n` +
    `Una vez iniciada la función no se permitirá el ingreso. 🚪\n\n` +
    `No se permite la grabación ni la toma de fotografías una vez iniciada la función. 📵\n\n` +
    `Los cambios de horario se pueden realizar hasta 48 horas antes de la función y según disponibilidad. 🗓️\n\n` +
    `Muchas gracias 👍🏽 por apoyar el arte y la cultura, en especial el teatro 🎭...\n\n` +
    `¡LOS ESPERAMOS PARA ROCKEAR! 🤘🔥\n\n` +
    `Chaplin Grupo Cultural, pasión por el teatro 🎭\n\n` +
    `🎸✝️🤘🔥 🎭`
  );
}

export interface ZoneMeta {
  key: "superstar" | "cortesia" | "getsemani" | "hosanna" | "pueblo";
  label: string;
  color: string;
  totalSeats: number;
}

export const ZONAS_CONFIG: Record<string, ZoneMeta> = {
  superstar: { key: "superstar", label: "Zona Superstar", color: "#fe0000", totalSeats: 60 },
  cortesia: { key: "cortesia", label: "Zona Cortesía", color: "#c59a58", totalSeats: 14 },
  getsemani: { key: "getsemani", label: "Zona Getsemaní", color: "#f2d675", totalSeats: 47 },
  hosanna: { key: "hosanna", label: "Zona Hosanna", color: "#7dd3e8", totalSeats: 67 },
  pueblo: { key: "pueblo", label: "Zona Pueblo (2do piso)", color: "#2b3a8f", totalSeats: 80 },
};

const STORAGE_KEY = "chaplin_crm_reservations_v2";
const EVENT_NAME = "chaplin_crm_updated";

// CRM INICIA LIMPIO EN 0 PARA SU USO EN PRODUCCIÓN
const INITIAL_EMPTY_RESERVATIONS: TicketReservation[] = [];

export function isHaroldAuthenticated(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return (
    username.trim().toLowerCase() === "harold" &&
    password.trim() === "Chaplin2026!"
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SERVER FUNCTIONS (NEON POSTGRESQL)
   ───────────────────────────────────────────────────────────────────────────── */

// 1. Verificación de credenciales de Harold
export const verifyHaroldLoginServer = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const ok = isHaroldAuthenticated(data.username, data.password);
    return { ok, user: ok ? "Harold López" : null };
  });

// 2. Consulta de aforo en vivo para la ticketera pública y el CRM (Disponible para todos)
export const fetchPublicAvailabilityServer = createServerFn({ method: "POST" }).handler(async () => {
  await ensureTicketsSchema();
  const sql = getSql();
  const rows = (await sql`
    select funcion, zona_key, sum(cantidad)::int as sold
    from ticket_reservations
    where estado != 'anulado'
    group by funcion, zona_key
  `) as any[];

  const soldMap: Record<string, Record<string, number>> = {
    "4:00 pm": { superstar: 0, cortesia: 0, getsemani: 0, hosanna: 0, pueblo: 0 },
    "7:00 pm": { superstar: 0, cortesia: 0, getsemani: 0, hosanna: 0, pueblo: 0 },
  };

  for (const row of rows) {
    const f = String(row.funcion);
    const z = String(row.zona_key);
    const count = Number(row.sold || 0);
    if (soldMap[f]) {
      soldMap[f][z] = count;
    }
  }

  return { ok: true as const, soldMap };
});

// 3. Obtener listado completo de compras en Neon (Requiere login de Harold)
export const fetchAdminReservationsServer = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (!isHaroldAuthenticated(data.username, data.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureTicketsSchema();
    const sql = getSql();
    const rows = (await sql`
      select 
        id, 
        created_at, 
        cliente_nombre, 
        cliente_telefono, 
        cliente_dni, 
        funcion, 
        zona_key, 
        cantidad, 
        etapa_promo, 
        total_pagado::float as total_pagado, 
        metodo_pago, 
        vendedor, 
        estado, 
        notas,
        ticket_code
      from ticket_reservations
      order by created_at desc
    `) as any[];

    const reservations: TicketReservation[] = rows.map((r, idx) => ({
      id: String(r.id),
      createdAt: new Date(r.created_at).toISOString(),
      clienteNombre: String(r.cliente_nombre),
      clienteTelefono: String(r.cliente_telefono),
      clienteDni: r.cliente_dni ? String(r.cliente_dni) : undefined,
      funcion: r.funcion as any,
      zonaKey: r.zona_key as any,
      cantidad: Number(r.cantidad || 1),
      etapaPromo: r.etapa_promo as any,
      totalPagado: Number(r.total_pagado || 0),
      metodoPago: (r.metodo_pago || "yape") as any,
      vendedor: String(r.vendedor || "Boletería"),
      estado: (r.estado || "confirmado") as any,
      notas: r.notas ? String(r.notas) : undefined,
      ticketCode: r.ticket_code ? String(r.ticket_code) : generateTicketCode(String(r.funcion), String(r.zona_key), rows.length - idx),
    }));

    return { ok: true as const, reservations };
  });

// 4. Guardar una nueva venta directamente en Neon PostgreSQL
export const saveAdminReservationServer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      auth: { username: string; password: string };
      reservation: Omit<TicketReservation, "id" | "createdAt">;
    }) => data
  )
  .handler(async ({ data }) => {
    if (!isHaroldAuthenticated(data.auth.username, data.auth.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureTicketsSchema();
    const sql = getSql();
    const id = "res-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6);
    const r = data.reservation;

    // Calcular siguiente secuencial por función y zona
    const countRow = (await sql`
      select count(*)::int as cnt from ticket_reservations 
      where funcion = ${r.funcion} and zona_key = ${r.zonaKey}
    `) as any[];
    const nextSeq = Number(countRow[0]?.cnt || 0) + 1;
    const ticketCode = r.ticketCode || generateTicketCode(r.funcion, r.zonaKey, nextSeq);

    await sql`
      insert into ticket_reservations (
        id,
        cliente_nombre,
        cliente_telefono,
        cliente_dni,
        funcion,
        zona_key,
        cantidad,
        etapa_promo,
        total_pagado,
        metodo_pago,
        vendedor,
        estado,
        notas,
        ticket_code
      ) values (
        ${id},
        ${r.clienteNombre},
        ${r.clienteTelefono},
        ${r.clienteDni || null},
        ${r.funcion},
        ${r.zonaKey},
        ${r.cantidad},
        ${r.etapaPromo},
        ${r.totalPagado},
        ${r.metodoPago || "yape"},
        ${r.vendedor || "Boletería"},
        ${r.estado || "confirmado"},
        ${r.notas || null},
        ${ticketCode}
      )
    `;

    const saved: TicketReservation = {
      ...r,
      id,
      ticketCode,
      createdAt: new Date().toISOString(),
    };

    return { ok: true as const, reservation: saved };
  });

// 5. Consulta pública de un boleto digital por ID o código (Para compradores)
export const fetchTicketByIdServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    if (!data.id) return { ok: false as const, ticket: null };
    await ensureTicketsSchema();
    const sql = getSql();
    const rows = (await sql`
      select 
        id, 
        created_at, 
        cliente_nombre, 
        cliente_telefono, 
        cliente_dni, 
        funcion, 
        zona_key, 
        cantidad, 
        etapa_promo, 
        total_pagado::float as total_pagado, 
        metodo_pago, 
        vendedor, 
        estado, 
        notas,
        ticket_code
      from ticket_reservations
      where id = ${data.id} or ticket_code = ${data.id}
      limit 1
    `) as any[];

    if (!rows || rows.length === 0) {
      return { ok: false as const, ticket: null };
    }

    const r = rows[0];
    const ticket: TicketReservation = {
      id: String(r.id),
      createdAt: new Date(r.created_at).toISOString(),
      clienteNombre: String(r.cliente_nombre),
      clienteTelefono: String(r.cliente_telefono),
      clienteDni: r.cliente_dni ? String(r.cliente_dni) : undefined,
      funcion: r.funcion as any,
      zonaKey: r.zona_key as any,
      cantidad: Number(r.cantidad || 1),
      etapaPromo: r.etapa_promo as any,
      totalPagado: Number(r.total_pagado || 0),
      metodoPago: (r.metodo_pago || "yape") as any,
      vendedor: String(r.vendedor || "Boletería"),
      estado: (r.estado || "confirmado") as any,
      notas: r.notas ? String(r.notas) : undefined,
      ticketCode: r.ticket_code ? String(r.ticket_code) : undefined,
    };

    return { ok: true as const, ticket };
  });

// 5. Eliminar una venta de Neon PostgreSQL (devuelve los cupos automáticamente)
export const deleteAdminReservationServer = createServerFn({ method: "POST" })
  .inputValidator((data: { auth: { username: string; password: string }; id: string }) => data)
  .handler(async ({ data }) => {
    if (!isHaroldAuthenticated(data.auth.username, data.auth.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureTicketsSchema();
    const sql = getSql();
    await sql`delete from ticket_reservations where id = ${data.id}`;
    return { ok: true as const };
  });

/* ─────────────────────────────────────────────────────────────────────────────
   CLIENT-SIDE STORAGE & LIVE EVENT SYNC
   ───────────────────────────────────────────────────────────────────────────── */

export const HAROLD_AUTH_KEY = "chaplin_harold_auth_v1";

export function getStoredHaroldAuth(): { username: string; password: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HAROLD_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isHaroldAuthenticated(parsed.username, parsed.password)) {
      return { username: parsed.username, password: parsed.password };
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredHaroldAuth(auth: { username: string; password: string } | null) {
  if (typeof window === "undefined") return;
  if (!auth) {
    localStorage.removeItem(HAROLD_AUTH_KEY);
  } else {
    localStorage.setItem(HAROLD_AUTH_KEY, JSON.stringify(auth));
  }
}

export function getStoredReservations(): TicketReservation[] {
  if (typeof window === "undefined") return INITIAL_EMPTY_RESERVATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPTY_RESERVATIONS));
      return INITIAL_EMPTY_RESERVATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EMPTY_RESERVATIONS;
  }
}

export function saveStoredReservationsLocally(reservations: TicketReservation[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function onCRMUpdate(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export async function saveReservation(
  reservation: Omit<TicketReservation, "id" | "createdAt">
): Promise<TicketReservation> {
  const auth = getStoredHaroldAuth();
  let newRes: TicketReservation | null = null;

  if (auth) {
    try {
      const res = await saveAdminReservationServer({
        data: {
          auth,
          reservation,
        },
      });
      if (res && res.ok && res.reservation) {
        newRes = res.reservation;
      }
    } catch (err) {
      console.error("Error guardando en Neon:", err);
    }
  }

  if (!newRes) {
    const current = getStoredReservations();
    const sameCount = current.filter(
      (c) => c.funcion === reservation.funcion && c.zonaKey === reservation.zonaKey
    ).length;
    const ticketCode = generateTicketCode(reservation.funcion, reservation.zonaKey, sameCount + 1);

    newRes = {
      ...reservation,
      id: "res-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
      ticketCode,
      createdAt: new Date().toISOString(),
    };
  }

  const current = getStoredReservations();
  const updated = [newRes, ...current.filter((item) => item.id !== newRes!.id)];
  saveStoredReservationsLocally(updated);
  return newRes;
}

export async function deleteReservation(id: string): Promise<boolean> {
  const auth = getStoredHaroldAuth();
  if (auth) {
    try {
      await deleteAdminReservationServer({
        data: {
          auth,
          id,
        },
      });
    } catch (err) {
      console.error("Error eliminando en Neon:", err);
    }
  }

  const current = getStoredReservations();
  const updated = current.filter((r) => r.id !== id);
  saveStoredReservationsLocally(updated);
  return true;
}

export async function syncReservationsWithNeon(): Promise<TicketReservation[]> {
  const auth = getStoredHaroldAuth();
  if (!auth) return getStoredReservations();

  try {
    const res = await fetchAdminReservationsServer({
      data: auth,
    });
    if (res && res.ok) {
      saveStoredReservationsLocally(res.reservations);
      return res.reservations;
    }
  } catch (err) {
    console.error("Error sincronizando con Neon:", err);
  }
  return getStoredReservations();
}

/* ─────────────────────────────────────────────────────────────────────────────
   DISPONIBILIDAD Y ESTADÍSTICAS
   ───────────────────────────────────────────────────────────────────────────── */

export interface ZoneAvailability {
  zonaKey: string;
  totalSeats: number;
  soldSeats: number;
  availableSeats: number;
  percentSold: number;
  isSoldOut: boolean;
  isLowStock: boolean;
}

export function getZoneAvailability(
  reservations: TicketReservation[],
  funcion: string,
  zonaKey: string
): ZoneAvailability {
  const meta = ZONAS_CONFIG[zonaKey] || { totalSeats: 50 };
  const sold = reservations
    .filter((r) => r.funcion === funcion && r.zonaKey === zonaKey && r.estado !== "anulado")
    .reduce((sum, r) => sum + Number(r.cantidad || 0), 0);

  const available = Math.max(0, meta.totalSeats - sold);
  const percent = Math.min(100, Math.round((sold / meta.totalSeats) * 100));

  return {
    zonaKey,
    totalSeats: meta.totalSeats,
    soldSeats: sold,
    availableSeats: available,
    percentSold: percent,
    isSoldOut: available <= 0,
    isLowStock: available > 0 && available <= 10,
  };
}

export function getCRMStats(reservations: TicketReservation[]) {
  const active = reservations.filter((r) => r.estado !== "anulado");
  const totalRevenue = active.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
  const totalTickets = active.reduce((sum, r) => sum + Number(r.cantidad || 0), 0);

  const active4pm = active.filter((r) => r.funcion === "4:00 pm");
  const active7pm = active.filter((r) => r.funcion === "7:00 pm");

  const tickets4pm = active4pm.reduce((sum, r) => sum + Number(r.cantidad || 0), 0);
  const tickets7pm = active7pm.reduce((sum, r) => sum + Number(r.cantidad || 0), 0);

  const revenue4pm = active4pm.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
  const revenue7pm = active7pm.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);

  const totalCap = 268; // 60 + 14 + 47 + 67 + 80

  return {
    totalRevenue,
    totalTickets,
    tickets4pm,
    tickets7pm,
    revenue4pm,
    revenue7pm,
    totalCap,
    percent4pm: Math.round((tickets4pm / totalCap) * 100),
    percent7pm: Math.round((tickets7pm / totalCap) * 100),
  };
}

export interface PromoMeta {
  key: "twoXone" | "threeXtwo" | "twentyPct" | "regular" | "cortesia";
  label: string;
  tag: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dateRange: string;
}

export const PROMOS_CONFIG: Record<string, PromoMeta> = {
  twoXone: {
    key: "twoXone",
    label: "Preventa 2x1",
    tag: "2x1",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    dateRange: "16 al 22 Sep",
  },
  threeXtwo: {
    key: "threeXtwo",
    label: "Preventa 3x2",
    tag: "3x2",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    dateRange: "23 Sep al 2 Oct",
  },
  twentyPct: {
    key: "twentyPct",
    label: "Preventa 20% dto.",
    tag: "20% dto",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    dateRange: "3 al 11 Oct",
  },
  regular: {
    key: "regular",
    label: "Precio Regular",
    tag: "Regular",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    badgeBorder: "border-slate-300",
    dateRange: "12 al 18 Oct",
  },
  cortesia: {
    key: "cortesia",
    label: "Pase de Cortesía",
    tag: "Cortesía",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-300",
    dateRange: "Sin costo (S/ 0.00)",
  },
};

export interface PromoStat {
  key: "twoXone" | "threeXtwo" | "twentyPct" | "regular" | "cortesia";
  meta: PromoMeta;
  ticketsSold: number;
  revenue: number;
  ordersCount: number;
  percentOfTotalTickets: number;
  percentOfTotalRevenue: number;
  avgTicketPrice: number;
  isLeaderTickets: boolean;
  isLeaderRevenue: boolean;
}

export interface PromosBreakdown {
  items: PromoStat[];
  totalTickets: number;
  totalRevenue: number;
  totalOrders: number;
  avgTicketPriceGlobal: number;
  topPromoByTickets: PromoStat | null;
  topPromoByRevenue: PromoStat | null;
}

export function getPromosBreakdown(reservations: TicketReservation[]): PromosBreakdown {
  const active = reservations.filter((r) => r.estado !== "anulado");
  const totalTickets = active.reduce((sum, r) => sum + Number(r.cantidad || 0), 0);
  const totalRevenue = active.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
  const totalOrders = active.length;
  const avgTicketPriceGlobal = totalTickets > 0 ? totalRevenue / totalTickets : 0;

  const promoKeys: Array<"twoXone" | "threeXtwo" | "twentyPct" | "regular" | "cortesia"> = [
    "twoXone",
    "threeXtwo",
    "twentyPct",
    "regular",
    "cortesia",
  ];

  let maxTickets = 0;
  let maxRevenue = 0;

  const rawItems = promoKeys.map((key) => {
    const list = active.filter((r) => r.etapaPromo === key);
    const ticketsSold = list.reduce((sum, r) => sum + Number(r.cantidad || 0), 0);
    const revenue = list.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
    const ordersCount = list.length;
    const avgTicketPrice = ticketsSold > 0 ? revenue / ticketsSold : 0;
    const percentOfTotalTickets = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;
    const percentOfTotalRevenue = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;

    if (ticketsSold > maxTickets) maxTickets = ticketsSold;
    if (revenue > maxRevenue) maxRevenue = revenue;

    return {
      key,
      meta: PROMOS_CONFIG[key],
      ticketsSold,
      revenue,
      ordersCount,
      percentOfTotalTickets,
      percentOfTotalRevenue,
      avgTicketPrice,
      isLeaderTickets: false,
      isLeaderRevenue: false,
    };
  });

  const items = rawItems.map((item) => ({
    ...item,
    isLeaderTickets: maxTickets > 0 && item.key !== "cortesia" && item.ticketsSold === maxTickets,
    isLeaderRevenue: maxRevenue > 0 && item.key !== "cortesia" && item.revenue === maxRevenue,
  }));

  // Excluimos 'cortesia' del cálculo de líderes comerciales de promociones
  const commercialItems = items.filter((i) => i.key !== "cortesia");
  let maxCommercialTickets = 0;
  let maxCommercialRevenue = 0;
  commercialItems.forEach((i) => {
    if (i.ticketsSold > maxCommercialTickets) maxCommercialTickets = i.ticketsSold;
    if (i.revenue > maxCommercialRevenue) maxCommercialRevenue = i.revenue;
  });

  const topPromoByTickets =
    maxCommercialTickets > 0 ? commercialItems.find((i) => i.ticketsSold === maxCommercialTickets) || null : null;
  const topPromoByRevenue =
    maxCommercialRevenue > 0 ? commercialItems.find((i) => i.revenue === maxCommercialRevenue) || null : null;

  return {
    items,
    totalTickets,
    totalRevenue,
    totalOrders,
    avgTicketPriceGlobal,
    topPromoByTickets,
    topPromoByRevenue,
  };
}
