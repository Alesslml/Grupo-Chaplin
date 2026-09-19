import { createServerFn } from "@tanstack/react-start";
import { ensureTicketsSchema, ensureEventSettingsSchema, getSql } from "@/lib/db.server";

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

export interface EventZoneSetting {
  key: string;
  label: string;
  color: string;
  seats: number;
  prices: { twoXone: number; threeXtwo: number; twentyPct: number; regular: number };
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

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  zonas: [
    {
      key: "superstar",
      label: "Zona Superstar",
      color: "#fe0000",
      seats: 60,
      prices: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 80 },
    },
    {
      key: "cortesia",
      label: "Zona Cortesía",
      color: "#c59a58",
      seats: 14,
      prices: { twoXone: 0, threeXtwo: 0, twentyPct: 0, regular: 0 },
    },
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
};

export interface TicketReservation {
  id: string;
  createdAt: string; // ISO string
  clienteNombre: string;
  clienteTelefono: string;
  clienteDni?: string;
  funcion: string;
  zonaKey: string;
  cantidad: number;
  etapaPromo: string;
  totalPagado: number;
  metodoPago?: MetodoPago;
  vendedor: string;
  estado: "confirmado" | "pendiente" | "anulado";
  notas?: string;
  ticketCode?: string;
  asistio?: boolean;
  asistioAt?: string; // ISO string
  asistioNotas?: string;
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

  const effectiveTickets =
    reservation.etapaPromo === "twoXone"
      ? Number(reservation.cantidad || 0) * 2
      : Number(reservation.cantidad || 0);

  const cantidadText =
    reservation.etapaPromo === "twoXone"
      ? `${reservation.cantidad} promo(s) 2x1 (${effectiveTickets} entradas entregadas)`
      : `${reservation.cantidad} ${reservation.cantidad === 1 ? "entrada" : "entradas"}`;

  return (
    `🎸✝️🤘🔥 🎭\n\n` +
    `RESERVACIÓN "JESUCRISTO ROCKSTAR" (${metodoLabel.toUpperCase()})\n\n` +
    `NOMBRE: ${reservation.clienteNombre.toUpperCase()}\n` +
    `DNI: ${reservation.clienteDni || "Por confirmar"}\n` +
    `CANTIDAD: ${cantidadText}\n` +
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
    select 
      funcion, 
      zona_key, 
      sum(case when etapa_promo = 'twoXone' then cantidad * 2 else cantidad end)::int as sold
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
    if (!soldMap[f]) {
      soldMap[f] = {};
    }
    soldMap[f][z] = count;
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
        ticket_code,
        asistio,
        asistio_at,
        asistio_notas
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
      asistio: Boolean(r.asistio),
      asistioAt: r.asistio_at ? new Date(r.asistio_at).toISOString() : undefined,
      asistioNotas: r.asistio_notas ? String(r.asistio_notas) : undefined,
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
        ticket_code,
        asistio,
        asistio_at,
        asistio_notas
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
      asistio: Boolean(r.asistio),
      asistioAt: r.asistio_at ? new Date(r.asistio_at).toISOString() : undefined,
      asistioNotas: r.asistio_notas ? String(r.asistio_notas) : undefined,
    };

    return { ok: true as const, ticket };
  });

// 6. Marcar o desmarcar asistencia en puerta en Neon PostgreSQL
export const markTicketAttendanceServer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      auth: { username: string; password: string };
      id: string;
      asistio: boolean;
      asistioNotas?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    if (!isHaroldAuthenticated(data.auth.username, data.auth.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureTicketsSchema();
    const sql = getSql();
    const asistioAt = data.asistio ? new Date().toISOString() : null;

    const rows = (await sql`
      update ticket_reservations
      set 
        asistio = ${data.asistio},
        asistio_at = ${asistioAt},
        asistio_notas = ${data.asistioNotas || null}
      where id = ${data.id} or ticket_code = ${data.id}
      returning *
    `) as any[];

    if (!rows || rows.length === 0) {
      return { ok: false as const, error: "TICKET_NOT_FOUND", ticket: null };
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
      asistio: Boolean(r.asistio),
      asistioAt: r.asistio_at ? new Date(r.asistio_at).toISOString() : undefined,
      asistioNotas: r.asistio_notas ? String(r.asistio_notas) : undefined,
    };

    return { ok: true as const, ticket };
  });

// 7. Eliminar una venta de Neon PostgreSQL (devuelve los cupos automáticamente)
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

// 8. Actualizar una venta existente en Neon PostgreSQL (Edición directa por Harold)
export const updateAdminReservationServer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      auth: { username: string; password: string };
      reservation: Partial<TicketReservation> & { id: string };
    }) => data
  )
  .handler(async ({ data }) => {
    if (!isHaroldAuthenticated(data.auth.username, data.auth.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureTicketsSchema();
    const sql = getSql();
    const r = data.reservation;

    const rows = (await sql`
      update ticket_reservations
      set
        cliente_nombre = coalesce(${r.clienteNombre !== undefined ? r.clienteNombre : null}, cliente_nombre),
        cliente_telefono = coalesce(${r.clienteTelefono !== undefined ? r.clienteTelefono : null}, cliente_telefono),
        cliente_dni = ${r.clienteDni !== undefined ? r.clienteDni : sql`cliente_dni`},
        funcion = coalesce(${r.funcion !== undefined ? r.funcion : null}, funcion),
        zona_key = coalesce(${r.zonaKey !== undefined ? r.zonaKey : null}, zona_key),
        cantidad = coalesce(${r.cantidad !== undefined ? r.cantidad : null}, cantidad),
        etapa_promo = coalesce(${r.etapaPromo !== undefined ? r.etapaPromo : null}, etapa_promo),
        total_pagado = coalesce(${r.totalPagado !== undefined ? Number(r.totalPagado) : null}, total_pagado),
        metodo_pago = coalesce(${r.metodoPago !== undefined ? r.metodoPago : null}, metodo_pago),
        vendedor = coalesce(${r.vendedor !== undefined ? r.vendedor : null}, vendedor),
        estado = coalesce(${r.estado !== undefined ? r.estado : null}, estado),
        notas = ${r.notas !== undefined ? r.notas : sql`notas`}
      where id = ${r.id} or ticket_code = ${r.id}
      returning *
    `) as any[];

    if (!rows || rows.length === 0) {
      return { ok: false as const, error: "TICKET_NOT_FOUND", ticket: null };
    }

    const row = rows[0];
    const ticket: TicketReservation = {
      id: String(row.id),
      createdAt: new Date(row.created_at).toISOString(),
      clienteNombre: String(row.cliente_nombre),
      clienteTelefono: String(row.cliente_telefono),
      clienteDni: row.cliente_dni ? String(row.cliente_dni) : undefined,
      funcion: String(row.funcion),
      zonaKey: String(row.zona_key),
      cantidad: Number(row.cantidad || 1),
      etapaPromo: String(row.etapa_promo),
      totalPagado: Number(row.total_pagado || 0),
      metodoPago: (row.metodo_pago || "yape") as any,
      vendedor: String(row.vendedor || "Boletería"),
      estado: (row.estado || "confirmado") as any,
      notas: row.notas ? String(row.notas) : undefined,
      ticketCode: row.ticket_code ? String(row.ticket_code) : undefined,
      asistio: Boolean(row.asistio),
      asistioAt: row.asistio_at ? new Date(row.asistio_at).toISOString() : undefined,
      asistioNotas: row.asistio_notas ? String(row.asistio_notas) : undefined,
    };

    return { ok: true as const, ticket };
  });

// 9. Consulta pública de la configuración activa del evento (precios, horarios, promos, aforo)
export const fetchPublicEventSettingsServer = createServerFn({ method: "POST" }).handler(async () => {
  try {
    await ensureEventSettingsSchema();
    const sql = getSql();
    const rows = (await sql`
      select value from event_settings where key = 'jesucristo_rockstar_settings' limit 1
    `) as any[];

    if (rows && rows.length > 0 && rows[0]?.value) {
      return { ok: true as const, settings: rows[0].value as EventSettings };
    }
  } catch (err) {
    console.error("Error fetching event settings from Neon:", err);
  }
  return { ok: true as const, settings: DEFAULT_EVENT_SETTINGS };
});

// 10. Guardar configuración activa del evento en Neon (solo Harold)
export const saveAdminEventSettingsServer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      auth: { username: string; password: string };
      settings: EventSettings;
    }) => data
  )
  .handler(async ({ data }) => {
    if (!isHaroldAuthenticated(data.auth.username, data.auth.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureEventSettingsSchema();
    const sql = getSql();
    await sql`
      insert into event_settings (key, value, updated_at)
      values ('jesucristo_rockstar_settings', ${JSON.stringify(data.settings)}, now())
      on conflict (key) do update
      set value = excluded.value, updated_at = now()
    `;
    return { ok: true as const, settings: data.settings };
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

export async function markTicketAttendance(
  idOrCode: string,
  asistio: boolean,
  notas?: string
): Promise<{ ok: boolean; ticket: TicketReservation | null; alreadyUsed?: boolean; previousUsedAt?: string }> {
  const current = getStoredReservations();
  const targetIndex = current.findIndex((r) => r.id === idOrCode || r.ticketCode === idOrCode);

  if (targetIndex === -1) {
    return { ok: false, ticket: null };
  }

  const existing = current[targetIndex];

  // Si se está intentando marcar como asistido pero YA ESTABA marcado:
  if (asistio && existing.asistio) {
    return {
      ok: false,
      alreadyUsed: true,
      previousUsedAt: existing.asistioAt,
      ticket: existing,
    };
  }

  const nowIso = asistio ? new Date().toISOString() : undefined;
  const updatedTicket: TicketReservation = {
    ...existing,
    asistio,
    asistioAt: nowIso,
    asistioNotas: notas !== undefined ? notas : existing.asistioNotas,
  };

  current[targetIndex] = updatedTicket;
  saveStoredReservationsLocally(current);

  const auth = getStoredHaroldAuth();
  if (auth) {
    try {
      const serverRes = await markTicketAttendanceServer({
        data: {
          auth,
          id: existing.id,
          asistio,
          asistioNotas: notas,
        },
      });
      if (serverRes && serverRes.ok && serverRes.ticket) {
        current[targetIndex] = serverRes.ticket;
        saveStoredReservationsLocally(current);
        return { ok: true, ticket: serverRes.ticket };
      }
    } catch (err) {
      console.error("Error sincronizando asistencia en Neon:", err);
    }
  }

  return { ok: true, ticket: updatedTicket };
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

export async function updateReservation(
  id: string,
  reservationData: Partial<TicketReservation>
): Promise<TicketReservation | null> {
  const current = getStoredReservations();
  const targetIndex = current.findIndex((r) => r.id === id || r.ticketCode === id);

  let updatedTicket: TicketReservation;
  if (targetIndex !== -1) {
    updatedTicket = { ...current[targetIndex], ...reservationData };
    current[targetIndex] = updatedTicket;
    saveStoredReservationsLocally(current);
  }

  const auth = getStoredHaroldAuth();
  if (auth) {
    try {
      const res = await updateAdminReservationServer({
        data: {
          auth,
          reservation: { ...reservationData, id },
        },
      });
      if (res && res.ok && res.ticket) {
        if (targetIndex !== -1) {
          current[targetIndex] = res.ticket;
          saveStoredReservationsLocally(current);
        }
        return res.ticket;
      }
    } catch (err) {
      console.error("Error actualizando en Neon:", err);
    }
  }

  return targetIndex !== -1 ? updatedTicket! : null;
}

const SETTINGS_STORAGE_KEY = "chaplin_crm_event_settings_v1";

export function getStoredEventSettings(): EventSettings {
  if (typeof window === "undefined") return DEFAULT_EVENT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_EVENT_SETTINGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EVENT_SETTINGS;
  }
}

export function saveStoredEventSettingsLocally(settings: EventSettings) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export async function saveEventSettings(settings: EventSettings): Promise<boolean> {
  saveStoredEventSettingsLocally(settings);
  const auth = getStoredHaroldAuth();
  if (auth) {
    try {
      const res = await saveAdminEventSettingsServer({
        data: {
          auth,
          settings,
        },
      });
      if (res && res.ok) {
        return true;
      }
    } catch (err) {
      console.error("Error guardando settings en Neon:", err);
    }
  }
  return true;
}

export async function syncEventSettingsWithNeon(): Promise<EventSettings> {
  try {
    const res = await fetchPublicEventSettingsServer();
    if (res && res.ok && res.settings) {
      saveStoredEventSettingsLocally(res.settings);
      return res.settings;
    }
  } catch (err) {
    console.error("Error sincronizando settings:", err);
  }
  return getStoredEventSettings();
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

/**
 * Calcula el número efectivo de entradas físicas entregadas / asientos descontados del aforo.
 * REGLA ESPECIAL: Únicamente en la promoción 2x1 ('twoXone'), cada unidad comprada entrega y descuenta 2 asientos.
 * En todas las demás promociones (3x2, 20%, regular, cortesía), el conteo es 1 a 1.
 */
export function getEffectiveTicketsCount(r: { cantidad: number; etapaPromo?: string }): number {
  const qty = Number(r.cantidad || 0);
  return r.etapaPromo === "twoXone" ? qty * 2 : qty;
}

export function getZoneAvailability(
  reservations: TicketReservation[],
  funcion: string,
  zonaKey: string,
  customSeats?: number
): ZoneAvailability {
  const meta = ZONAS_CONFIG[zonaKey] || { totalSeats: 50 };
  const totalSeats = typeof customSeats === "number" && customSeats > 0 ? customSeats : meta.totalSeats;
  const sold = reservations
    .filter((r) => r.funcion === funcion && r.zonaKey === zonaKey && r.estado !== "anulado")
    .reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);

  const available = Math.max(0, totalSeats - sold);
  const percent = totalSeats > 0 ? Math.min(100, Math.round((sold / totalSeats) * 100)) : 0;

  return {
    zonaKey,
    totalSeats,
    soldSeats: sold,
    availableSeats: available,
    percentSold: percent,
    isSoldOut: available <= 0,
    isLowStock: available > 0 && available <= 10,
  };
}

export function getCRMStats(reservations: TicketReservation[], customCap?: number, customFunciones?: string[]) {
  const active = reservations.filter((r) => r.estado !== "anulado");
  const totalRevenue = active.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
  const totalTickets = active.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);

  const active4pm = active.filter((r) => r.funcion === "4:00 pm");
  const active7pm = active.filter((r) => r.funcion === "7:00 pm");

  const tickets4pm = active4pm.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
  const tickets7pm = active7pm.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);

  const revenue4pm = active4pm.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
  const revenue7pm = active7pm.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);

  // Asistencia en sala / puerta (contabiliza personas reales que ingresan)
  const attended = active.filter((r) => r.asistio);
  const totalAttendedTickets = attended.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
  const attendedOrdersCount = attended.length;
  const attended4pm = attended
    .filter((r) => r.funcion === "4:00 pm")
    .reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
  const attended7pm = attended
    .filter((r) => r.funcion === "7:00 pm")
    .reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
  const percentAttendedTotal = totalTickets > 0 ? Math.round((totalAttendedTickets / totalTickets) * 100) : 0;
  const percentAttended4pm = tickets4pm > 0 ? Math.round((attended4pm / tickets4pm) * 100) : 0;
  const percentAttended7pm = tickets7pm > 0 ? Math.round((attended7pm / tickets7pm) * 100) : 0;

  const totalCap = customCap && customCap > 0 ? customCap : 268; // 60 + 14 + 47 + 67 + 80 por defecto

  const funcionesList = customFunciones && customFunciones.length > 0 ? customFunciones : ["4:00 pm", "7:00 pm"];
  const funcionStats = funcionesList.map((func) => {
    const list = active.filter((r) => r.funcion === func);
    const tickets = list.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
    const rev = list.reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);
    const attList = list.filter((r) => r.asistio);
    const attTickets = attList.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
    return {
      funcion: func,
      tickets,
      revenue: rev,
      attendedTickets: attTickets,
      percent: Math.round((tickets / totalCap) * 100),
    };
  });

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
    totalAttendedTickets,
    attendedOrdersCount,
    attended4pm,
    attended7pm,
    percentAttendedTotal,
    percentAttended4pm,
    percentAttended7pm,
    funcionStats,
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
  const totalTickets = active.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
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
    const ticketsSold = list.reduce((sum, r) => sum + getEffectiveTicketsCount(r), 0);
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

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORTACIÓN A EXCEL (CSV CON FORMATO BOM UTF-8)
   ───────────────────────────────────────────────────────────────────────────── */

function toCsvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n;\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportTicketsToExcel(
  reservations: TicketReservation[],
  options?: { filename?: string; onlyAttended?: boolean }
) {
  if (typeof window === "undefined") return;

  const items = options?.onlyAttended ? reservations.filter((r) => r.asistio) : reservations;

  const headers = [
    "CÓDIGO DE TICKET",
    "FECHA Y HORA COMPRA",
    "CLIENTE",
    "TELÉFONO / WHATSAPP",
    "DNI",
    "FUNCIÓN",
    "ZONA",
    "CANTIDAD COMPRADA",
    "ENTRADAS ENTREGADAS / ASIENTOS",
    "PROMOCIÓN / TARIFA",
    "TOTAL PAGADO (S/)",
    "MÉTODO DE PAGO",
    "VENDEDOR / CANAL",
    "ESTADO RESERVA",
    "ASISTENCIA EN PUERTA",
    "FECHA Y HORA INGRESO",
    "NOTAS / COMPROBANTE",
  ];

  const rows = items.map((r) => {
    const createdDate = new Date(r.createdAt).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const attendedDate =
      r.asistio && r.asistioAt
        ? new Date(r.asistioAt).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "";

    const zonaLabel = ZONAS_CONFIG[r.zonaKey]?.label || r.zonaKey;
    const promoLabel = PROMOS_CONFIG[r.etapaPromo]?.label || r.etapaPromo;
    const metodoLabel = METODOS_PAGO_CONFIG[r.metodoPago || "yape"]?.label || r.metodoPago || "Yape";
    const effectiveTickets = getEffectiveTicketsCount(r);

    return [
      r.ticketCode || r.id,
      createdDate,
      r.clienteNombre,
      r.clienteTelefono,
      r.clienteDni || "",
      r.funcion,
      zonaLabel,
      r.cantidad,
      effectiveTickets,
      promoLabel,
      Number(r.totalPagado).toFixed(2),
      metodoLabel,
      r.vendedor,
      r.estado.toUpperCase(),
      r.asistio ? "INGRESADO" : "PENDIENTE",
      attendedDate,
      r.notas || "",
    ]
      .map(toCsvCell)
      .join(",");
  });

  const csvContent = [headers.map(toCsvCell).join(","), ...rows].join("\r\n");
  // BOM UTF-8 (\uFEFF) para compatibilidad total con Microsoft Excel en español (acentos, ñ, números)
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const defaultName = options?.onlyAttended
    ? `asistencia-jesucristo-rockstar-${new Date().toISOString().slice(0, 10)}.csv`
    : `crm-reservas-jesucristo-rockstar-${new Date().toISOString().slice(0, 10)}.csv`;
  a.download = options?.filename || defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

