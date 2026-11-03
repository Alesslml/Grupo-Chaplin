import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Users,
  DollarSign,
  Ticket,
  Clock,
  PlusCircle,
  Search,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Phone,
  MessageCircle,
  ShieldCheck,
  LayoutDashboard,
  UserPlus,
  ArrowLeft,
  Check,
  Lock,
  LogOut,
  KeyRound,
  AlertCircle,
  Sparkles,
  Trophy,
  Tag,
  TrendingUp,
  BarChart3,
  Copy,
  ExternalLink,
  Share2,
  Download,
  UserCheck,
  ScanLine,
  Ban,
  RotateCcw,
  FileSpreadsheet,
  AlertOctagon,
  Filter,
  Pencil,
  SlidersHorizontal,
  Save,
  Plus,
  X,
  Sliders,
} from "lucide-react";
import {
  getStoredReservations,
  saveReservation,
  updateReservation,
  deleteReservation,
  markTicketAttendance,
  exportTicketsToExcel,
  syncReservationsWithNeon,
  getStoredHaroldAuth,
  setStoredHaroldAuth,
  isHaroldAuthenticated,
  onCRMUpdate,
  startVisiblePolling,
  getActivePromoKey,
  getZoneAvailability,
  getEffectiveTicketsCount,
  getIngresadosCount,
  getPendientesIngresoCount,
  getIngresosLog,
  getSeatStatus,
  getSeatCategory,
  registerTicketEntry,
  getCRMStats,
  getPromosBreakdown,
  buildWhatsAppReservationMessage,
  describeEntradas,
  EVENTOS,
  getEvento,
  setEvento,
  type EventoKey,
  getStoredEventSettings,
  saveEventSettings,
  syncEventSettingsWithNeon,
  ZONAS_CONFIG,
  METODOS_PAGO_CONFIG,
  PROMOS_CONFIG,
  type TicketReservation,
  type MetodoPago,
  type EventSettings,
  type EventZoneSetting,
  DEFAULT_EVENT_SETTINGS,
} from "@/lib/tickets-crm";

import { QrScanner } from "@/components/shrek/QrScanner";
import shrekPersonaje from "@/assets/shrek/shrek-personaje.png";

const fmtIngreso = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const Route = createFileRoute("/admin/entradas")({
  head: () => ({
    meta: [
      { title: "Panel CRM · Chaplin Grupo Cultural" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEntradasPage,
});

const PRECIOS_POR_DEFECTO: Record<string, Record<string, number>> = {
  superstar: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 80, cortesia: 0 },
  cortesia: { twoXone: 0, threeXtwo: 0, twentyPct: 0, regular: 0, cortesia: 0 },
  getsemani: { twoXone: 60, threeXtwo: 120, twentyPct: 48, regular: 60, cortesia: 0 },
  hosanna: { twoXone: 40, threeXtwo: 80, twentyPct: 32, regular: 40, cortesia: 0 },
  pueblo: { twoXone: 20, threeXtwo: 40, twentyPct: 16, regular: 20, cortesia: 0 },
};

function AdminEntradasPage() {
  // Autenticación de Harold
  const [auth, setAuth] = useState<{ username: string; password: string } | null>(() => getStoredHaroldAuth());
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración en vivo del evento (Precios, Promos, Horarios, Aforo)
  const [eventSettings, setEventSettings] = useState<EventSettings>(() => getStoredEventSettings());
  const [evento, setEventoState] = useState<EventoKey>(() => getEvento());
  const cfgEvento = EVENTOS[evento];
  const shrekTema = evento === "shrek";
  const activePromoKey = getActivePromoKey(eventSettings.promos);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // Modal de Edición de Reserva
  const [editingReservation, setEditingReservation] = useState<TicketReservation | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editDni, setEditDni] = useState("");
  const [editFuncion, setEditFuncion] = useState("");
  const [editZona, setEditZona] = useState("");
  const [editCantidad, setEditCantidad] = useState(1);
  const [editCantidadNino, setEditCantidadNino] = useState(0);
  const [editPromo, setEditPromo] = useState<string>(() => getActivePromoKey());
  const [editTotal, setEditTotal] = useState<number>(80);
  const [editMetodo, setEditMetodo] = useState<MetodoPago>("yape");
  const [editVendedor, setEditVendedor] = useState("");
  const [editEstado, setEditEstado] = useState<"confirmado" | "pendiente" | "anulado">("confirmado");
  const [editNotas, setEditNotas] = useState("");
  const [editTicketCode, setEditTicketCode] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "registro" | "asistencia" | "configuracion">("dashboard");
  const [reservations, setReservations] = useState<TicketReservation[]>(() => getStoredReservations());
  const [selectedFuncion, setSelectedFuncion] = useState<string>("4:00 pm");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFuncion, setFiltroFuncion] = useState<string>("todas");
  const [filtroZona, setFiltroZona] = useState<string>("todas");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("todos");
  const [filtroPromo, setFiltroPromo] = useState<string>("todas");
  const [filtroVendedor, setFiltroVendedor] = useState<string>("todos");
  const [filtroAsistencia, setFiltroAsistencia] = useState<string>("todas");

  // Estado del Módulo de Control de Asistencia y Escáner en Puerta
  const [scanQuery, setScanQuery] = useState("");
  const [scannedTicket, setScannedTicket] = useState<TicketReservation | null>(null);
  const [scanAlert, setScanAlert] = useState<{
    type: "success" | "duplicate" | "not_found";
    message: string;
    ticket?: TicketReservation;
    previousUsedAt?: string;
  } | null>(null);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceRevertTarget, setAttendanceRevertTarget] = useState<TicketReservation | null>(null);
  const [entryTargetId, setEntryTargetId] = useState<string | null>(null);
  const [entryQty, setEntryQty] = useState(1);
  // Entrada concreta (1..total) cuando se escanea el QR individual de una persona
  const [scanSeat, setScanSeat] = useState<number | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [filtroAsistenciaTab, setFiltroAsistenciaTab] = useState<"todos" | "asistidos" | "pendientes">("todos");
  const [filtroAsistenciaFuncion, setFiltroAsistenciaFuncion] = useState<string>("todas");
  const [filtroAsistenciaVendedor, setFiltroAsistenciaVendedor] = useState<string>("todos");

  // Form state
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [formFuncion, setFormFuncion] = useState<string>("4:00 pm");
  // La zona inicia en null para que RECIÉN al seleccionarla se muestre el aforo disponible
  const [formZona, setFormZona] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [cantidadNino, setCantidadNino] = useState(0);
  const [promo, setPromo] = useState<string>(() => getActivePromoKey());
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("yape");
  const [vendedor, setVendedor] = useState("");
  const [notas, setNotas] = useState("");
  const [lastRegistered, setLastRegistered] = useState<TicketReservation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Se usa api.whatsapp.com/send directo: wa.me reescribe los emojis como "?" al redirigir.
  const buildWhatsAppUrl = (res: TicketReservation) => {
    const rawPhone = res.clienteTelefono.replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
    const msg = buildWhatsAppReservationMessage(res);
    return `https://api.whatsapp.com/send?${cleanPhone ? `phone=${cleanPhone}&` : ""}text=${encodeURIComponent(msg)}`;
  };

  const handleSendWhatsApp = (res: TicketReservation) => {
    window.open(buildWhatsAppUrl(res), "_blank");
  };

  const handleCopyTicketLink = (res: TicketReservation) => {
    if (typeof window !== "undefined") {
      const ticketUrl = `${window.location.origin}/ticket/${res.ticketCode || res.id}`;
      navigator.clipboard.writeText(ticketUrl);
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Cambia de evento (Shrek / Jesucristo): recarga reservas y configuración de ese evento
  const cambiarEvento = (k: EventoKey) => {
    if (k === evento) return;
    setEvento(k);
    setEventoState(k);
    const st = getStoredEventSettings(k);
    setReservations(getStoredReservations(k));
    setEventSettings(st);
    setPromo(getActivePromoKey(st.promos));
    setFormZona(null);
    setFormFuncion(st.funciones[0] ?? "4:00 pm");
    setSelectedFuncion(st.funciones[0] ?? "4:00 pm");
    setCantidad(1);
    setCantidadNino(0);
    setTotalManual(null);
    setLastRegistered(null);
  };

  // Cargar y sincronizar datos
  const reload = () => {
    setReservations(getStoredReservations());
    setEventSettings(getStoredEventSettings());
  };

  useEffect(() => {
    reload();
    syncEventSettingsWithNeon().then((s) => {
      if (s) setEventSettings(s);
    });
    if (auth) {
      syncReservationsWithNeon().then((res) => {
        if (res) setReservations(res);
      });
    }

    const unsubscribe = onCRMUpdate(reload);
    // Auto sync cada 30s, solo con la pestaña visible y sin solapamiento
    const stopPolling = startVisiblePolling(async () => {
      const s = await syncEventSettingsWithNeon();
      if (s) setEventSettings(s);
      if (getStoredHaroldAuth()) {
        const res = await syncReservationsWithNeon();
        if (res) setReservations(res);
      }
    }, 30000);

    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [auth, evento]);

  // Manejador de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const valid = isHaroldAuthenticated(loginUser, loginPass);
    if (!valid) {
      setLoginError("Usuario o contraseña incorrectos. Verifica tus credenciales.");
      setIsLoggingIn(false);
      return;
    }

    const creds = { username: loginUser.trim(), password: loginPass.trim() };
    setStoredHaroldAuth(creds);
    setAuth(creds);
    setIsSyncing(true);
    try {
      const [syncedRes, syncedSettings] = await Promise.all([
        syncReservationsWithNeon(),
        syncEventSettingsWithNeon(),
      ]);
      setReservations(syncedRes);
      if (syncedSettings) setEventSettings(syncedSettings);
    } catch {
      // Ignorar
    } finally {
      setIsLoggingIn(false);
      setIsSyncing(false);
    }
  };

  // Manejador de Logout
  const handleLogout = () => {
    if (confirm("¿Cerrar sesión del panel CRM?")) {
      setStoredHaroldAuth(null);
      setAuth(null);
      setLoginPass("");
    }
  };

  // Sincronización manual con Neon
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const [syncedRes, syncedSettings] = await Promise.all([
        syncReservationsWithNeon(),
        syncEventSettingsWithNeon(),
      ]);
      setReservations(syncedRes);
      if (syncedSettings) setEventSettings(syncedSettings);
    } finally {
      setIsSyncing(false);
    }
  };

  // Capacidad total y Stats
  const totalCapacity = useMemo(() => {
    return eventSettings.zonas
      .filter((z) => z.key !== "cortesia")
      .reduce((sum, z) => sum + Number(z.seats || 0), 0);
  }, [eventSettings.zonas]);

  const stats = useMemo(
    () => getCRMStats(reservations, totalCapacity, eventSettings.funciones),
    [reservations, totalCapacity, eventSettings.funciones]
  );
  const promosBreakdown = useMemo(() => getPromosBreakdown(reservations), [reservations]);

  // Disponibilidad de la función seleccionada en el monitor
  const zonasMonitor = useMemo(() => {
    return eventSettings.zonas.map((z) =>
      getZoneAvailability(reservations, selectedFuncion, z.key, z.seats)
    );
  }, [reservations, selectedFuncion, eventSettings.zonas]);

  // Disponibilidad en vivo de la zona seleccionada en el formulario según el horario elegido
  const formZoneAvail = useMemo(() => {
    if (!formZona) return null;
    const z = eventSettings.zonas.find((item) => item.key === formZona);
    return getZoneAvailability(reservations, formFuncion, formZona, z?.seats);
  }, [reservations, formFuncion, formZona, eventSettings.zonas]);

  // Detección de Pase de Cortesía activo en el formulario
  const isCortesiaSelected = formZona === "cortesia" || promo === "cortesia";

  // Cuántos asientos entrega cada unidad de "cantidad" según la etapa elegida
  // (2 en 2x1, 3 en 3x2, 1 en 20% y precio regular), tomado de la configuración
  // del evento para que siempre coincida con la página pública.
  const activePromoSettingForm = eventSettings.promos.find((p) => p.key === promo);
  const entradasPorPromoForm = activePromoSettingForm?.entradasPorPrecio ?? 1;
  const promoTagForm = activePromoSettingForm?.tag || activePromoSettingForm?.label || promo;

  // Precio sugerido en el formulario. "Cantidad" es siempre el número de
  // PROMOCIONES compradas (igual en 2x1 y 3x2): cada unidad cuesta el precio
  // base listado para esa etapa, sin importar cuántos asientos entregue.
  const precioSugerido = useMemo(() => {
    if (!formZona) return 0;
    if (formZona === "cortesia" || promo === "cortesia") return 0;
    const z = eventSettings.zonas.find((item) => item.key === formZona);
    const base = z?.prices[promo as keyof EventZoneSetting["prices"]] ?? (PRECIOS_POR_DEFECTO[formZona]?.[promo] || 80);
    const baseNino = (z?.pricesNino ?? z?.prices)?.[promo as keyof EventZoneSetting["prices"]] ?? base;
    return cantidad * base + cantidadNino * baseNino;
  }, [formZona, promo, cantidad, cantidadNino, eventSettings.zonas]);

  const [totalManual, setTotalManual] = useState<number | null>(null);
  const totalFinal = isCortesiaSelected ? 0 : (totalManual !== null ? totalManual : precioSugerido);

  // Manejo de Edición de Reservas
  const handleOpenEdit = (r: TicketReservation) => {
    setEditingReservation(r);
    setEditNombre(r.clienteNombre);
    setEditTelefono(r.clienteTelefono);
    setEditDni(r.clienteDni || "");
    setEditFuncion(r.funcion);
    setEditZona(r.zonaKey);
    setEditCantidad(r.cantidad);
    setEditCantidadNino(Number(r.cantidadNino || 0));
    setEditPromo(r.etapaPromo);
    setEditTotal(Number(r.totalPagado));
    setEditMetodo((r.metodoPago || "yape") as MetodoPago);
    setEditVendedor(r.vendedor);
    setEditEstado(r.estado);
    setEditNotas(r.notas || "");
    setEditTicketCode(r.ticketCode || "");
    setEditSuccessMsg(null);
  };

  // Igual que precioSugerido: "cantidad" es el número de promociones compradas.
  const suggestedEditPrice = useMemo(() => {
    if (!editZona || editZona === "cortesia" || editPromo === "cortesia") return 0;
    const z = eventSettings.zonas.find((item) => item.key === editZona);
    const base = z?.prices[editPromo as keyof EventZoneSetting["prices"]] ?? (PRECIOS_POR_DEFECTO[editZona]?.[editPromo] || 80);
    const baseNino = (z?.pricesNino ?? z?.prices)?.[editPromo as keyof EventZoneSetting["prices"]] ?? base;
    return editCantidad * base + editCantidadNino * baseNino;
  }, [editZona, editPromo, editCantidad, editCantidadNino, eventSettings.zonas]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const isCortesiaEntry = editZona === "cortesia" || editPromo === "cortesia";
      const finalPromo = isCortesiaEntry ? "cortesia" : editPromo;
      const finalMetodo = isCortesiaEntry ? "cortesia" : editMetodo;
      const finalTotal = isCortesiaEntry ? 0 : Number(editTotal || 0);

      const updated = await updateReservation(editingReservation.id, {
        clienteNombre: editNombre.trim(),
        clienteTelefono: editTelefono.trim(),
        clienteDni: editDni.trim() || undefined,
        funcion: editFuncion,
        zonaKey: editZona,
        cantidad: Number(editCantidad) || 0,
        cantidadNino: Number(editCantidadNino) || 0,
        etapaPromo: finalPromo,
        totalPagado: finalTotal,
        metodoPago: finalMetodo,
        vendedor: editVendedor.trim() || (isCortesiaEntry ? "Dirección" : "Boletería"),
        estado: editEstado,
        notas: editNotas.trim() || undefined,
        ticketCode: editTicketCode.trim() || undefined,
      });

      if (updated) {
        setReservations((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setEditSuccessMsg("¡Boleto actualizado correctamente en Neon PostgreSQL!");
        setTimeout(() => {
          setEditingReservation(null);
          setEditSuccessMsg(null);
        }, 1200);
      }
    } catch (err) {
      console.error("Error guardando edición de reserva:", err);
      alert(
        err instanceof Error && err.message.includes("ya existe")
          ? err.message
          : "Hubo un error al guardar los cambios. Intenta nuevamente."
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Manejo de Configuración del Evento (Precios, Promos, Horarios, Aforo)
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSettings) return;

    setIsSavingSettings(true);
    setSettingsSuccessMsg(null);
    try {
      await saveEventSettings(eventSettings);
      setSettingsSuccessMsg("¡Configuración del evento guardada en vivo! Precios, horarios y aforos actualizados en la web pública.");
      setTimeout(() => setSettingsSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error guardando configuración:", err);
      alert("Error al guardar la configuración del evento.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleZonePriceNinoChange = (zoneKey: string, promoKey: string, value: number) => {
    setEventSettings((prev) => ({
      ...prev,
      zonas: prev.zonas.map((z) =>
        z.key === zoneKey
          ? { ...z, pricesNino: { ...(z.pricesNino ?? z.prices), [promoKey]: Math.max(0, value) } }
          : z
      ),
    }));
  };

  const handleZonePriceChange = (zoneKey: string, promoKey: string, value: number) => {
    setEventSettings((prev) => ({
      ...prev,
      zonas: prev.zonas.map((z) =>
        z.key === zoneKey
          ? {
              ...z,
              prices: {
                ...z.prices,
                [promoKey]: Math.max(0, value),
              },
            }
          : z
      ),
    }));
  };

  const handleZoneSeatsChange = (zoneKey: string, seats: number) => {
    setEventSettings((prev) => ({
      ...prev,
      zonas: prev.zonas.map((z) =>
        z.key === zoneKey
          ? {
              ...z,
              seats: Math.max(1, seats),
            }
          : z
      ),
    }));
  };

  const [newFuncionInput, setNewFuncionInput] = useState("");

  const handleAddFuncion = () => {
    const trimmed = newFuncionInput.trim();
    if (!trimmed || eventSettings.funciones.includes(trimmed)) return;
    setEventSettings((prev) => ({
      ...prev,
      funciones: [...prev.funciones, trimmed],
    }));
    setNewFuncionInput("");
  };

  const handleRemoveFuncion = (funcToRemove: string) => {
    if (eventSettings.funciones.length <= 1) {
      alert("Debe haber al menos 1 horario de función.");
      return;
    }
    setEventSettings((prev) => ({
      ...prev,
      funciones: prev.funciones.filter((f) => f !== funcToRemove),
    }));
  };

  // Manejar creación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !formZona || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isCortesiaEntry = formZona === "cortesia" || promo === "cortesia";
      const finalPromo = isCortesiaEntry ? "cortesia" : promo;
      const finalMetodo = isCortesiaEntry ? "cortesia" : metodoPago;
      const finalTotal = isCortesiaEntry ? 0 : (Number(totalFinal) || 0);

      const newRes = await saveReservation({
        clienteNombre: nombre.trim(),
        clienteTelefono: telefono.trim() || "No registrado",
        clienteDni: dni.trim() || undefined,
        funcion: formFuncion,
        zonaKey: formZona as any,
        cantidad: Number(cantidad) || 0,
        cantidadNino: Number(cantidadNino) || 0,
        evento,
        etapaPromo: finalPromo,
        totalPagado: finalTotal,
        metodoPago: finalMetodo,
        vendedor: vendedor.trim() || (isCortesiaEntry ? "Dirección" : "Boletería"),
        estado: "confirmado",
        notas: notas.trim() || (isCortesiaEntry ? "Pase de Cortesía" : undefined),
      });

      setLastRegistered(newRes);
      setNombre("");
      setTelefono("");
      setDni("");
      setVendedor("");
      setNotas("");
      setFormZona(null); // Resetea la zona para el siguiente registro
      setCantidad(1);
      setCantidadNino(0);
      setPromo(activePromoKey);
      setMetodoPago("yape");
      setTotalManual(null);
      setReservations(getStoredReservations());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lista dinámica de vendedores registrados
  const vendedoresList = useMemo(() => {
    const set = new Set<string>();
    reservations.forEach((r) => {
      const v = r.vendedor?.trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort();
  }, [reservations]);

  // Filtrado de reservas para la tabla principal
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchSearch =
        r.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clienteTelefono.includes(searchTerm) ||
        (r.clienteDni && r.clienteDni.includes(searchTerm)) ||
        (r.ticketCode && r.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.metodoPago && r.metodoPago.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.vendedor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFuncion = filtroFuncion === "todas" || r.funcion === filtroFuncion;
      const matchZona = filtroZona === "todas" || r.zonaKey === filtroZona;
      const matchMetodo = filtroMetodo === "todos" || r.metodoPago === filtroMetodo;
      const matchPromo = filtroPromo === "todas" || r.etapaPromo === filtroPromo;
      const matchVendedor =
        filtroVendedor === "todos" || r.vendedor?.trim().toLowerCase() === filtroVendedor.toLowerCase();
      const matchAsistencia =
        filtroAsistencia === "todas"
          ? true
          : filtroAsistencia === "solo_ingresados"
          ? Boolean(r.asistio)
          : !r.asistio;

      return matchSearch && matchFuncion && matchZona && matchMetodo && matchPromo && matchVendedor && matchAsistencia;
    });
  }, [reservations, searchTerm, filtroFuncion, filtroZona, filtroMetodo, filtroPromo, filtroVendedor, filtroAsistencia]);

  // Filtrado específico para la pestaña de Control de Asistencia en Puerta
  const attendanceFilteredList = useMemo(() => {
    return reservations.filter((r) => {
      if (r.estado === "anulado") return false;

      const matchTab =
        filtroAsistenciaTab === "todos"
          ? true
          : filtroAsistenciaTab === "asistidos"
          ? getIngresadosCount(r) > 0
          : getPendientesIngresoCount(r) > 0;

      const matchFuncion =
        filtroAsistenciaFuncion === "todas" || r.funcion === filtroAsistenciaFuncion;

      const matchVendedor =
        filtroAsistenciaVendedor === "todos" ||
        r.vendedor?.trim().toLowerCase() === filtroAsistenciaVendedor.toLowerCase();

      return matchTab && matchFuncion && matchVendedor;
    });
  }, [reservations, filtroAsistenciaTab, filtroAsistenciaFuncion, filtroAsistenciaVendedor]);

  // Validador rápido de boletos en puerta (por código, DNI o nombre)
  const handleValidateScan = (e?: React.FormEvent, textoDirecto?: string) => {
    if (e) e.preventDefault();
    // El QR de cada entrada trae el enlace (…/ticket/CÓDIGO?e=3): se toma el código y el número de entrada
    const rawQuery = (textoDirecto ?? scanQuery).trim();
    let query = rawQuery;
    let seatN: number | null = null;
    if (rawQuery.includes("/ticket/")) {
      const tail = rawQuery.split("/ticket/")[1];
      const [path, qs = ""] = tail.split("?");
      query = decodeURIComponent(path.split(/[#/]/)[0]);
      const m = /(?:^|&)e=(\d+)/.exec(qs.split("#")[0]);
      seatN = m ? Number(m[1]) : null;
    }
    setScanSeat(null);
    if (!query) return;

    const found =
      reservations.find(
        (r) =>
          (r.ticketCode && r.ticketCode.toLowerCase() === query.toLowerCase()) ||
          r.id.toLowerCase() === query.toLowerCase() ||
          (r.clienteDni && r.clienteDni.trim() === query)
      ) ||
      reservations.find(
        (r) =>
          (r.ticketCode && r.ticketCode.toLowerCase().includes(query.toLowerCase())) ||
          r.clienteNombre.toLowerCase().includes(query.toLowerCase())
      );

    if (!found) {
      setScanAlert({
        type: "not_found",
        message: `No se encontró ningún boleto con el término "${query}". Verifica el código o DNI en boletería.`,
      });
      setScannedTicket(null);
      return;
    }

    setScannedTicket(found);

    // QR individual: se valida esa entrada en particular
    if (seatN !== null) {
      const total = getEffectiveTicketsCount(found);
      if (seatN < 1 || seatN > total) {
        setScanAlert({ type: "not_found", message: `Este boleto no tiene una entrada número ${seatN} (solo tiene ${total}).` });
        return;
      }
      const usada = getSeatStatus(found)[seatN - 1];
      if (usada) {
        setScanAlert({
          type: "duplicate",
          message: `¡ALERTA DE DUPLICADO! La entrada ${seatN} de ${total} (${getSeatCategory(found, seatN)}) YA ingresó.`,
          ticket: found,
          previousUsedAt: found.asistioAt,
        });
        return;
      }
      setScanSeat(seatN);
      setScanAlert({
        type: "success",
        message: `Entrada ${seatN} de ${total} (${getSeatCategory(found, seatN)}) VÁLIDA. Confirma para registrar su ingreso.`,
        ticket: found,
      });
      return;
    }

    if (found.asistio && getPendientesIngresoCount(found) === 0) {
      setScanAlert({
        type: "duplicate",
        message: "¡ALERTA DE DUPLICADO! Este boleto YA fue utilizado para ingresar.",
        ticket: found,
        previousUsedAt: found.asistioAt,
      });
    } else {
      setScanAlert({
        type: "success",
        message:
          getIngresadosCount(found) > 0
            ? `Boleto VÁLIDO. Ya ingresaron ${getIngresadosCount(found)} de ${getEffectiveTicketsCount(found)}; faltan ${getPendientesIngresoCount(found)} persona(s).`
            : `Boleto VÁLIDO. Listo para autorizar el ingreso de ${getEffectiveTicketsCount(found)} persona(s).`,
        ticket: found,
      });
    }
  };

  // Registrar ingreso de un ticket: si queda 1 persona se registra directo; si no, se pregunta cuántas entran
  const submitEntry = async (target: TicketReservation, qty: number, entradaN?: number) => {
    setIsMarkingAttendance(true);
    try {
      const result = await registerTicketEntry(target.id, qty, entradaN ? { entradaN } : undefined);
      if (result.ok && result.ticket) {
        const t = result.ticket;
        const total = getEffectiveTicketsCount(t);
        const ing = getIngresadosCount(t);
        setScanAlert({
          type: "success",
          message:
            ing >= total
              ? `¡INGRESO COMPLETO! ${t.clienteNombre}: ${total} de ${total} personas ya ingresaron.`
              : `Ingresaron ${ing} de ${total} personas de ${t.clienteNombre}. Faltan ${total - ing}.`,
          ticket: t,
        });
        setScannedTicket(t);
        setScanSeat(null);
        setReservations(getStoredReservations());
        setEntryTargetId(null);
      } else if (result.error === "ENTRADA_YA_USADA") {
        alert("Esa entrada ya fue registrada: el QR no se puede usar otra vez.");
        setReservations(getStoredReservations());
      } else if (result.error === "EXCEDE_ENTRADAS") {
        alert("Esa cantidad supera las entradas pendientes de este boleto.");
      } else if (result.error === "CONFLICTO_REINTENTAR") {
        alert("Otro dispositivo registró un ingreso al mismo tiempo. Revisa el estado y vuelve a intentar.");
        setReservations(getStoredReservations());
      } else {
        alert("No se pudo registrar el ingreso. Revisa tu conexión e intenta de nuevo.");
      }
    } catch (err) {
      console.error("Error al registrar asistencia:", err);
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleConfirmAttendance = async (target: TicketReservation) => {
    const pending = getPendientesIngresoCount(target);
    if (pending === 0) {
      setScanAlert({
        type: "duplicate",
        message: "¡ALERTA DE DUPLICADO! Este boleto YA fue ingresado completamente.",
        ticket: target,
        previousUsedAt: target.asistioAt,
      });
      return;
    }
    if (pending === 1) {
      await submitEntry(target, 1);
      return;
    }
    setEntryQty(pending);
    setEntryTargetId(target.id);
  };

  const handleUndoLastEntry = async (target: TicketReservation) => {
    setIsMarkingAttendance(true);
    try {
      const result = await registerTicketEntry(target.id, 0, { undoLast: true });
      if (result.ok && result.ticket) {
        setReservations(getStoredReservations());
        if (scannedTicket && scannedTicket.id === target.id) setScannedTicket(result.ticket);
      } else {
        alert("No se pudo deshacer el último ingreso.");
      }
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  // Revertir asistencia si hubo error de dedo
  const handleRevertAttendance = async (target: TicketReservation) => {
    setIsMarkingAttendance(true);
    try {
      const result = await markTicketAttendance(target.id, false);
      if (result.ok && result.ticket) {
        setReservations(getStoredReservations());
        if (scannedTicket && scannedTicket.id === target.id) {
          setScannedTicket(result.ticket);
          setScanAlert({
            type: "success",
            message: `Se restableció el boleto #${result.ticket.ticketCode} a PENDIENTE de ingreso.`,
            ticket: result.ticket,
          });
        }
      }
    } catch (err) {
      console.error("Error al desmarcar asistencia:", err);
    } finally {
      setIsMarkingAttendance(false);
      setAttendanceRevertTarget(null);
    }
  };

  // Pantalla de Inicio de Sesión si Harold no está autenticado
  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex flex-col items-center justify-center p-4 selection:bg-red-600 selection:text-white font-body relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 relative z-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-red-50 border border-red-100 mb-4 shadow-xs">
              <img
                src="/logo-chaplin.png"
                alt="Chaplin Grupo Cultural"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 mb-2.5">
              <Lock className="w-3.5 h-3.5" />
              Acceso Exclusivo · Harold López
            </div>
            <h1 className="font-display text-2xl text-slate-900 tracking-tight font-bold">
              CRM · Chaplin Grupo Cultural
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Ingresa tus credenciales autorizadas para gestionar el aforo y las reservas en tiempo real.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => {
                  setLoginUser(e.target.value);
                  setLoginError(null);
                }}
                placeholder="Harold"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => {
                  setLoginPass(e.target.value);
                  setLoginError(null);
                }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoggingIn ? (
                <span>Validando...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Ingresar al Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Servidor en Línea · Conexión Segura
            </span>
            <Link to="/entradas" className="hover:text-red-600 transition-colors font-medium">
              Ir a la Ticketera →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`crm-skin ${shrekTema ? "crm-shrek" : ""} min-h-screen bg-[#f4f1ea] text-[#1f1d19] selection:bg-red-500 selection:text-white font-body`}>
      {/* Encabezado: sobrio, sin cajas. El color de acento cambia con el evento. */}
      <header className="sticky top-0 z-30 border-b border-[#e3dccb] bg-[#fbf9f3]/95 backdrop-blur-md">
        <div className="h-[3px] w-full" style={{ background: shrekTema ? "linear-gradient(90deg,#a6e22e,#4c8a1f 55%,#a6e22e)" : "#dc2626" }} />
        <div className="relative mx-auto flex max-w-[1300px] items-center justify-between gap-4 px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link to="/entradas" className="shrink-0" aria-label="Ver la ticketera">
              <img src="/logo-chaplin.png" alt="Chaplin Grupo Cultural" className="h-8 w-auto object-contain sm:h-9" />
            </Link>
            <div className="min-w-0 border-l border-[#e3dccb] pl-3 sm:pl-4">
              <p className="text-[11px] text-[#7b715d]">Panel de ventas</p>
              <div className="flex items-baseline gap-4">
                {Object.values(EVENTOS).map((e) => (
                  <button
                    key={e.key}
                    type="button"
                    onClick={() => cambiarEvento(e.key)}
                    className={`relative cursor-pointer pb-0.5 text-[17px] leading-tight transition-colors sm:text-[20px] ${
                      evento === e.key ? "font-bold text-[#1f1d19]" : "font-medium text-[#a79d86] hover:text-[#6b624f]"
                    }`}
                  >
                    {e.nombreCorto}
                    <span
                      className="absolute -bottom-0.5 left-0 h-[3px] rounded-full transition-all"
                      style={{ width: evento === e.key ? "100%" : 0, background: shrekTema && e.key === "shrek" ? "#4c8a1f" : "#dc2626" }}
                    />
                  </button>
                ))}
              </div>
            </div>
            {shrekTema && (
              <img
                src={shrekPersonaje}
                alt=""
                className="pointer-events-none -mb-[14px] hidden h-[50px] w-auto select-none self-end xl:block"
                style={{ clipPath: "inset(0 0 42% 0)" }}
              />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3 text-[13px]">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-[#6b624f] hover:bg-[#efe9da] disabled:opacity-60"
              title="Sincronizar con la base de datos"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">{isSyncing ? "Sincronizando…" : "Sincronizar"}</span>
            </button>
            <Link
              to="/entradas"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-[#6b624f] hover:bg-[#efe9da]"
              title="Ver la ticketera pública"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="hidden md:inline">Ver ticketera</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-[#6b624f] hover:bg-[#efe9da] hover:text-red-700"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>

        </div>

        {/* Pestañas */}
        <div className="border-t border-[#e3dccb]">
          <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-3 overflow-x-auto px-3 no-scrollbar sm:px-6 lg:px-8">
            <nav className="flex items-center gap-5 sm:gap-8" aria-label="Secciones">
              {(
                [
                  ["dashboard", "Resumen", `${reservations.length}`],
                  ["registro", "Nueva venta", ""],
                  ["asistencia", "Puerta", stats.totalAttendedTickets > 0 ? `${stats.totalAttendedTickets} adentro` : ""],
                  ["configuracion", "Precios y show", ""],
                ] as const
              ).map(([key, label, nota]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveTab(key);
                    setLastRegistered(null);
                  }}
                  className={`relative cursor-pointer whitespace-nowrap py-3 text-[14px] transition-colors ${
                    activeTab === key ? "font-bold text-[#1f1d19]" : "font-medium text-[#8c8268] hover:text-[#4d4636]"
                  }`}
                >
                  {label}
                  {nota && <span className="ml-1.5 text-[12px] font-medium text-[#a79d86]">{nota}</span>}
                  <span
                    className="absolute inset-x-0 -bottom-px h-[3px] rounded-full transition-opacity"
                    style={{ background: shrekTema ? "#4c8a1f" : "#dc2626", opacity: activeTab === key ? 1 : 0 }}
                  />
                </button>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2 py-1.5">
              <button
                type="button"
                onClick={() => exportTicketsToExcel(filteredReservations)}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#6b624f] hover:bg-[#efe9da]"
                title="Descargar las ventas en Excel (.xlsx)"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              {activeTab === "dashboard" && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("registro");
                    setLastRegistered(null);
                  }}
                  className="hidden cursor-pointer whitespace-nowrap rounded-md px-4 py-1.5 text-[13px] font-bold text-white sm:inline-flex"
                  style={{ background: shrekTema ? "#3f7d1f" : "#dc2626" }}
                >
                  + Nueva venta
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* ==================================================================== */}
        {/* PARTE 1: DASHBOARD CON MÉTRICAS, AFORO EN VIVO Y REGISTRO DE COMPRADORES */}
        {/* ==================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* 1. Cifras principales en una sola franja, separadas por líneas (sin tarjetas) */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-7 border-b border-[#e3dccb] pb-7 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-[#e3dccb]">
              <div className="lg:pr-8">
                <p className="text-[13px] text-[#7b715d]">Recaudación</p>
                <p className="font-display mt-1 text-[38px] leading-none sm:text-[46px]">
                  S/ {stats.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 0 })}
                </p>
                <p className="mt-2 text-[12px] text-[#7b715d]">
                  {stats.funcionStats?.map((fs) => `${fs.funcion}: S/ ${fs.revenue.toFixed(0)}`).join("  ·  ")}
                </p>
              </div>

              <div className="lg:px-8">
                <p className="text-[13px] text-[#7b715d]">Entradas vendidas</p>
                <p className="font-display mt-1 text-[38px] leading-none sm:text-[46px]">
                  {stats.totalTickets}
                  <span className="ml-1.5 font-body text-[14px] font-medium text-[#a79d86]">asientos</span>
                </p>
                <p className="mt-2 text-[12px] text-[#7b715d]">
                  {stats.funcionStats?.map((fs) => `${fs.funcion}: ${fs.tickets}`).join("  ·  ")}
                </p>
              </div>

              {stats.funcionStats?.map((fs) => (
                <div key={fs.funcion} className="lg:px-8">
                  <p className="text-[13px] text-[#7b715d]">Función {fs.funcion}</p>
                  <p className="font-display mt-1 text-[38px] leading-none sm:text-[46px]">
                    {fs.tickets}
                    <span className="ml-1.5 font-body text-[14px] font-medium text-[#a79d86]">/ {stats.totalCap}</span>
                  </p>
                  <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-[#e8e1d1]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${fs.percent}%`, background: shrekTema ? "#4c8a1f" : "#dc2626" }} />
                  </div>
                  <p className="mt-2 text-[12px] text-[#7b715d]">
                    {fs.percent}% del aforo · {Math.max(0, stats.totalCap - fs.tickets)} libres
                  </p>
                </div>
              ))}
            </div>

            {/* 2. Ventas por etapa: una tabla simple */}
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-[28px] leading-none">Ventas por etapa</h2>
                  <p className="mt-1.5 text-[13px] text-[#7b715d]">
                    Entradas y dinero de cada promoción. Hoy rige: <strong className="text-[#1f1d19]">{eventSettings.promos.find((p) => p.key === activePromoKey)?.label}</strong>.
                  </p>
                </div>
                <p className="text-[13px] text-[#7b715d]">
                  Precio promedio por entrada: <strong className="text-[#1f1d19]">S/ {promosBreakdown.avgTicketPriceGlobal.toFixed(2)}</strong>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px] sm:min-w-[560px]">
                  <thead>
                    <tr className="border-b border-[#d9d0bb] text-[12px] text-[#7b715d]">
                      <th className="py-2 pr-3 font-medium">Etapa</th>
                      <th className="px-3 py-2 font-medium">Fechas</th>
                      <th className="px-3 py-2 text-right font-medium">Entradas</th>
                      <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">Compras</th>
                      <th className="px-3 py-2 text-right font-medium">Recaudado</th>
                      <th className="hidden py-2 pl-3 text-right font-medium sm:table-cell">Prom. por entrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promosBreakdown.items.map((item) => {
                      const cfgPromo = eventSettings.promos.find((p) => p.key === item.key);
                      const hoy = item.key === activePromoKey;
                      const fmt = (iso: string) => {
                        const [, m, d] = iso.split("-").map(Number);
                        return `${d}/${m}`;
                      };
                      return (
                        <tr key={item.key} className="border-b border-[#e8e1d1]">
                          <td className="py-3 pr-3">
                            <span className={`font-semibold ${item.ticketsSold === 0 ? "text-[#a79d86]" : ""}`}>
                              {cfgPromo?.label ?? item.meta?.label}
                            </span>
                            {hoy && <span className="ml-2 text-[12px] font-bold" style={{ color: shrekTema ? "#3f7d1f" : "#dc2626" }}>● hoy</span>}
                            {item.isLeaderTickets && <span className="ml-2 text-[12px] text-[#7b715d]">la que más vende</span>}
                          </td>
                          <td className="px-3 py-3 text-[#7b715d]">{cfgPromo ? `${fmt(cfgPromo.from)} al ${fmt(cfgPromo.to)}` : "—"}</td>
                          <td className="px-3 py-3 text-right font-semibold tabular-nums">{item.ticketsSold}</td>
                          <td className="hidden px-3 py-3 text-right tabular-nums text-[#7b715d] sm:table-cell">{item.ordersCount}</td>
                          <td className="px-3 py-3 text-right font-semibold tabular-nums">S/ {item.revenue.toFixed(0)}</td>
                          <td className="hidden py-3 pl-3 text-right tabular-nums text-[#7b715d] sm:table-cell">
                            {item.ticketsSold > 0 ? `S/ ${item.avgTicketPrice.toFixed(0)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Aforo por zonas: filas con una barra fina */}
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-[28px] leading-none">Aforo por zonas</h2>
                  <p className="mt-1.5 text-[13px] text-[#7b715d]">
                    Auditorio del Colegio de Ingenieros de Ica · {stats.totalCap} asientos por función. Es lo mismo que ve el público.
                  </p>
                </div>
                <div className="flex items-center gap-5" role="tablist" aria-label="Función">
                  {eventSettings.funciones.map((func) => (
                    <button
                      key={func}
                      type="button"
                      onClick={() => setSelectedFuncion(func)}
                      className={`relative cursor-pointer pb-1 text-[15px] transition-colors ${
                        selectedFuncion === func ? "font-bold text-[#1f1d19]" : "font-medium text-[#a79d86] hover:text-[#6b624f]"
                      }`}
                    >
                      {func.toUpperCase()}
                      <span
                        className="absolute inset-x-0 -bottom-px h-[3px] rounded-full"
                        style={{ background: shrekTema ? "#4c8a1f" : "#dc2626", opacity: selectedFuncion === func ? 1 : 0 }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {zonasMonitor.map((z) => {
                  const meta = ZONAS_CONFIG[z.zonaKey];
                  return (
                    <div key={z.zonaKey} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-[#e8e1d1] py-4 first:border-t-0 sm:grid-cols-[220px_1fr_auto]">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span className="text-[15px] font-semibold">{meta.label.replace(" (2do piso)", "")}</span>
                      </div>
                      <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
                        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#e8e1d1]">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${z.percentSold}%`, backgroundColor: z.isSoldOut ? "#dc2626" : meta.color }} />
                        </div>
                        <p className="mt-1.5 text-[12px] text-[#7b715d]">
                          {z.soldSeats} vendidos de {z.totalSeats} · {z.percentSold}%
                        </p>
                      </div>
                      <p className="text-right">
                        <span className="font-display text-[30px] leading-none">{z.availableSeats}</span>
                        <span className="ml-1 text-[12px] text-[#7b715d]">libres</span>
                        {z.isSoldOut && <span className="mt-0.5 block text-[12px] font-bold text-red-700">Agotada</span>}
                        {!z.isSoldOut && z.isLowStock && <span className="mt-0.5 block text-[12px] font-bold text-amber-700">Quedan pocas</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Compradores */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d9d0bb] pb-4">
                <div>
                  <h2 className="font-display text-[28px] leading-none">Compradores</h2>
                  <p className="mt-1.5 text-[13px] text-[#7b715d]">
                    {reservations.length} compras registradas. Toca una fila para ver o editar el boleto.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start flex-wrap">
                  <button
                    type="button"
                    onClick={() => exportTicketsToExcel(filteredReservations)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider border border-slate-300 hover:border-emerald-400 rounded-md transition-all shadow-2xs cursor-pointer"
                    title="Exportar registros filtrados a Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exportar ({filteredReservations.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("registro")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 rounded-md transition-colors shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Registrar Nueva Venta
                  </button>
                </div>
              </div>

              {/* Filtros: Búsqueda prominente arriba, dropdowns en grid responsive */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, DNI, teléfono o código #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <div>
                    <select
                      value={filtroFuncion}
                      onChange={(e) => setFiltroFuncion(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                    >
                      <option value="todas">Horario (Todas)</option>
                      {eventSettings.funciones.map((f) => (
                        <option key={f} value={f}>
                          Solo {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={filtroZona}
                      onChange={(e) => setFiltroZona(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                    >
                      <option value="todas">Zonas (Todas)</option>
                      {eventSettings.zonas.map((z) => (
                        <option key={z.key} value={z.key}>
                          {z.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={filtroPromo}
                      onChange={(e) => setFiltroPromo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                    >
                      <option value="todas">Promos (Todas)</option>
                      <option value="twoXone">Preventa 2x1{activePromoKey === "twoXone" ? " (Hoy)" : ""}</option>
                      <option value="threeXtwo">Preventa 3x2{activePromoKey === "threeXtwo" ? " (Hoy)" : ""}</option>
                      <option value="twentyPct">Preventa 20%{activePromoKey === "twentyPct" ? " (Hoy)" : ""}</option>
                      <option value="regular">Precio Regular{activePromoKey === "regular" ? " (Hoy)" : ""}</option>
                      <option value="cortesia">🎁 Cortesía</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filtroMetodo}
                      onChange={(e) => setFiltroMetodo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                    >
                      <option value="todos">Pagos (Todos)</option>
                      <option value="yape">🟣 Yape</option>
                      <option value="plin">🔵 Plin</option>
                      <option value="transferencia">🏦 Transferencia</option>
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="cortesia">🎁 Cortesía</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filtroVendedor}
                      onChange={(e) => setFiltroVendedor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600 font-medium"
                    >
                      <option value="todos">Vendedores ({vendedoresList.length})</option>
                      {vendedoresList.map((vend) => (
                        <option key={vend} value={vend}>
                          👤 {vend}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={filtroAsistencia}
                      onChange={(e) => setFiltroAsistencia(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600 font-medium"
                    >
                      <option value="todas">Puerta (Todas)</option>
                      <option value="solo_ingresados">Ingresados</option>
                      <option value="solo_pendientes">Pendientes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* VISTA MOBILE (<md): Tarjetas compactas sin scroll horizontal */}
              <div className="md:hidden space-y-3">
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                    No se encontraron registros con los filtros actuales.
                  </div>
                ) : (
                  filteredReservations.map((r) => {
                    const meta = ZONAS_CONFIG[r.zonaKey];
                    const effectiveTickets = getEffectiveTicketsCount(r);
                    return (
                      <div
                        key={r.id}
                        className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                              {r.clienteNombre}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              DNI: {r.clienteDni || "-"} · {new Date(r.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-1.5 py-0.5 rounded-sm shrink-0">
                            #{r.ticketCode || r.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {r.funcion}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800 border"
                            style={{ backgroundColor: `${meta?.color}15`, borderColor: `${meta?.color}40` }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta?.color }} />
                            {meta?.label}
                          </span>
                          {r.asistio ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 ml-auto">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Ingresado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 ml-auto">
                              <span>Pendiente</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Entradas:</span>
                            <span className="font-extrabold text-slate-900 text-sm">
                              {effectiveTickets} {effectiveTickets === 1 ? "asiento" : "asientos"}
                            </span>
                            {(r.etapaPromo === "twoXone" || r.etapaPromo === "threeXtwo" || (r.cantidadNino ?? 0) > 0) && (
                              <span className="text-[12px] text-[#7b715d] block">
                                ({describeEntradas(r)})
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total & Pago:</span>
                            <div className="font-extrabold text-red-600 text-sm">
                              {Number(r.totalPagado) === 0 ? "S/ 0.00" : `S/ ${Number(r.totalPagado).toFixed(2)}`}
                            </div>
                            <span className="text-[10px] text-slate-500 capitalize truncate block">
                              {r.metodoPago || "yape"} · {r.vendedor || "Boletería"}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción mobile */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 flex-wrap">
                          <a
                            href={buildWhatsAppUrl(r)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>

                          <div className="flex items-center gap-1">
                            {r.asistio ? (
                              <button
                                type="button"
                                onClick={() => setAttendanceRevertTarget(r)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200"
                              >
                                <RotateCcw className="w-3 h-3 text-slate-500" />
                                <span>Desmarcar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleConfirmAttendance(r)}
                                disabled={isMarkingAttendance}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-2xs"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Ingresar</span>
                              </button>
                            )}

                            <a
                              href={`/ticket/${r.ticketCode || r.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-500 hover:text-red-600 bg-slate-100 rounded-md border border-slate-200"
                              title="Ver boleto"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(r)}
                              className="p-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors cursor-pointer"
                              title="Editar entrada"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  confirm(
                                    `¿Eliminar la reserva de ${r.clienteNombre}? Se devolverán ${effectiveTickets} asientos al aforo disponible de ${meta?.label}.`
                                  )
                                ) {
                                  await deleteReservation(r.id);
                                  setReservations(getStoredReservations());
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* VISTA DESKTOP (>=md): Tabla completa */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Contacto WhatsApp</th>
                      <th className="px-4 py-3">Función & Zona</th>
                      <th className="px-4 py-3 text-center">Entradas</th>
                      <th className="px-4 py-3">Total & Método</th>
                      <th className="px-4 py-3">Vendedor</th>
                      <th className="px-4 py-3 text-center">Asistencia Puerta</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                          No se encontraron registros con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((r) => {
                        const meta = ZONAS_CONFIG[r.zonaKey];
                        const effectiveTickets = getEffectiveTicketsCount(r);
                        return (
                          <tr
                            key={r.id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900 text-sm">{r.clienteNombre}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {new Date(r.createdAt).toLocaleTimeString("es-PE", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                · DNI: {r.clienteDni || "-"}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="font-mono text-[11px] font-bold text-[#5d5644]">
                                  #{r.ticketCode || r.id}
                                </span>
                                {r.notas && <span className="text-[11px] text-[#7b715d]">· {r.notas}</span>}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{r.clienteTelefono}</span>
                              </div>
                              <a
                                href={buildWhatsAppUrl(r)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 mt-1 font-bold"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Abrir chat WhatsApp
                              </a>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900">{r.funcion}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: meta?.color }}
                                />
                                <span className="text-slate-700 text-[11px] font-medium">{meta?.label}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-[15px] font-bold">
                                  {effectiveTickets} {effectiveTickets === 1 ? "asiento" : "asientos"}
                                </span>
                                {(r.etapaPromo === "twoXone" || r.etapaPromo === "threeXtwo" || (r.cantidadNino ?? 0) > 0) && (
                                  <span className="mt-0.5 text-[11px] text-[#7b715d]">
                                    {describeEntradas(r).replace(/ \(.*\)$/, "")}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              {r.etapaPromo === "cortesia" || r.zonaKey === "cortesia" || Number(r.totalPagado) === 0 ? (
                                <div className="font-bold text-amber-600 text-sm flex items-center gap-1.5">
                                  <span>S/ 0.00</span>
                                  <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-extrabold">
                                    Cortesía
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[15px] font-bold">S/ {r.totalPagado.toFixed(2)}</div>
                              )}
                              <p className="mt-0.5 text-[12px] text-[#7b715d]">
                                {(PROMOS_CONFIG[r.etapaPromo]?.tag || r.etapaPromo)}
                                {r.metodoPago ? ` · ${METODOS_PAGO_CONFIG[r.metodoPago]?.label || r.metodoPago}` : ""}
                              </p>
                            </td>

                            <td className="px-4 py-3.5 text-slate-600 text-xs">
                              {r.vendedor}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              {r.asistio ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-700">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Ingresó</span>
                                  </span>
                                  {r.asistioAt && (
                                    <span className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                      {new Date(r.asistioAt).toLocaleTimeString("es-PE", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmAttendance(r)}
                                  disabled={isMarkingAttendance}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d3c9b2] px-3 py-1.5 text-[13px] font-semibold text-[#3f3a2e] transition-colors hover:border-emerald-600 hover:text-emerald-700"
                                  title="Marcar ingreso en puerta"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Marcar ingreso</span>
                                </button>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSendWhatsApp(r)}
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                  title="Enviar ticket por WhatsApp al cliente"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>

                                <a
                                  href={`/ticket/${r.ticketCode || r.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors inline-block"
                                  title="Ver boleto digital en nueva pestaña"
                                >
                                  <Ticket className="w-4 h-4" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleCopyTicketLink(r)}
                                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                  title="Copiar enlace del boleto"
                                >
                                  {copiedId === r.id ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(r)}
                                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                  title="Editar precio, horario, promo o cantidad de esta entrada"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                {r.asistio && (
                                  <button
                                    type="button"
                                    onClick={() => setAttendanceRevertTarget(r)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                                    title="Desmarcar asistencia / Restablecer a pendiente"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        `¿Eliminar la reserva de ${r.clienteNombre}? Se devolverán ${effectiveTickets} asientos al aforo disponible de ${meta?.label}.`
                                      )
                                    ) {
                                      await deleteReservation(r.id);
                                      setReservations(getStoredReservations());
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="Eliminar reserva y devolver asientos al aforo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PARTE 2: REGISTRO DE VENTA (LIMPIO, CLARO Y CON APARICIÓN DE ZONA SEGÚN HORARIO) */}
        {/* ==================================================================== */}
        {activeTab === "registro" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Cabecera del formulario con botón de retorno */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dashboard");
                  setLastRegistered(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>Volver al Dashboard</span>
              </button>

              <span className="text-xs text-slate-500 font-medium">
                {cfgEvento.nombreCorto} · Confirmación WhatsApp
              </span>
            </div>

            {/* Mensaje de Confirmación tras Registrar con Enlace de Ticket */}
            {lastRegistered && (() => {
              const isCortesia =
                lastRegistered.etapaPromo === "cortesia" ||
                lastRegistered.zonaKey === "cortesia" ||
                Number(lastRegistered.totalPagado) === 0;

              return (
                <div
                  className={`p-6 border-2 rounded-2xl shadow-sm space-y-4 animate-fade-in ${
                    isCortesia
                      ? "bg-amber-50/90 border-amber-300 text-amber-950"
                      : "bg-emerald-50 border-emerald-300 text-emerald-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {isCortesia ? (
                        <Sparkles className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div
                          className={`inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 ${
                            isCortesia
                              ? "bg-amber-200/80 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <span>Ticket #{lastRegistered.ticketCode || lastRegistered.id}</span>
                          {isCortesia && (
                            <span className="font-bold text-amber-800">· PASE DE CORTESÍA (S/ 0.00)</span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg">
                          {isCortesia
                            ? `¡Pase de cortesía registrado con éxito para ${lastRegistered.clienteNombre}!`
                            : `¡Venta registrada con éxito para ${lastRegistered.clienteNombre}!`}
                        </h3>
                        <p className={`text-xs mt-1 ${isCortesia ? "text-amber-900" : "text-emerald-800"}`}>
                          Se asignaron <strong>{getEffectiveTicketsCount(lastRegistered)} asientos</strong> de{" "}
                          <strong>{ZONAS_CONFIG[lastRegistered.zonaKey]?.label}</strong> para la función de las{" "}
                          <strong>{lastRegistered.funcion}</strong>. Total:{" "}
                          <strong className={isCortesia ? "text-amber-800" : ""}>
                            {isCortesia ? "S/ 0.00 (Sin Costo)" : `S/ ${lastRegistered.totalPagado.toFixed(2)}`}
                          </strong>{" "}
                          vía{" "}
                          <strong>
                            {isCortesia
                              ? "Pase de Cortesía"
                              : METODOS_PAGO_CONFIG[lastRegistered.metodoPago || "yape"]?.label || "Yape"}
                          </strong>.
                        </p>
                      </div>
                    </div>

                    <a
                      href={`/ticket/${lastRegistered.ticketCode || lastRegistered.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border text-xs font-bold rounded-lg transition-colors shadow-2xs shrink-0 ${
                        isCortesia
                          ? "border-amber-300 hover:border-amber-400 text-amber-900"
                          : "border-emerald-300 hover:border-emerald-400 text-emerald-800"
                      }`}
                    >
                      <span>Ver Boleto Digital</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                {/* Acciones directas para enviar por WhatsApp al comprador */}
                <div className="p-4 bg-white border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Enviar confirmación con enlace personalizado a {lastRegistered.clienteNombre}:</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700">{lastRegistered.clienteTelefono}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(lastRegistered)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enviar por WhatsApp al Cliente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyTicketLink(lastRegistered)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copiedId === lastRegistered.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === lastRegistered.id ? "¡Link Copiado!" : "Copiar Link del Boleto"}</span>
                    </button>

                    <a
                      href={`/ticket/${lastRegistered.ticketCode || lastRegistered.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm:hidden px-3.5 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Ver Boleto</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setLastRegistered(null)}
                    className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors shadow-2xs ${
                      isCortesia ? "bg-amber-800 hover:bg-amber-900" : "bg-emerald-800 hover:bg-emerald-900"
                    }`}
                  >
                    {isCortesia ? "+ Registrar Otro Pase de Cortesía" : "+ Registrar Otra Venta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("dashboard");
                      setLastRegistered(null);
                    }}
                    className={`px-4 py-2 bg-white border text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                      isCortesia
                        ? "border-amber-300 text-amber-900 hover:bg-amber-100"
                        : "border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    Ver en el Dashboard
                  </button>
                </div>
              </div>
            ); })()}

            {/* Tarjeta del Formulario Limpio en Color Claro */}
            <div className="border border-slate-200 bg-white p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-3xl text-slate-900 tracking-wide flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-red-600" />
                  Registrar Nueva Venta
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa los datos del cliente tras confirmar su depósito bancario o por Yape/Plin.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Paso 1: Función / Horario */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-2">
                    1. Selecciona el Horario de Función *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {eventSettings.funciones.map((func) => {
                      const isSelected = formFuncion === func;
                      return (
                        <button
                          key={func}
                          type="button"
                          onClick={() => setFormFuncion(func)}
                          className={`py-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-red-600 text-white border-red-600 shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>Función {func.toUpperCase()}</span>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Paso 2: Selección de Zona */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-2">
                    2. Selecciona la Zona Comprada *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {eventSettings.zonas.map((meta) => {
                      const avail = getZoneAvailability(reservations, formFuncion, meta.key, meta.seats);
                      const isSelected = formZona === meta.key;
                      return (
                        <button
                          key={meta.key}
                          type="button"
                          onClick={() => {
                            setFormZona(meta.key);
                            if (meta.key === "cortesia") {
                              setPromo("cortesia");
                              setMetodoPago("cortesia");
                              setTotalManual(0);
                            } else if (promo === "cortesia") {
                              setPromo(activePromoKey);
                              setMetodoPago("yape");
                              setTotalManual(null);
                            }
                          }}
                          className={`p-3 rounded-lg border text-left transition-all relative cursor-pointer ${
                            isSelected
                              ? "border-red-600 bg-red-50/80 ring-2 ring-red-600/30 shadow-xs"
                              : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            <span className={`text-xs font-bold ${isSelected ? "text-red-700" : "text-slate-800"}`}>
                              {meta.label.replace("Zona ", "")}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {avail.availableSeats} disp.
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RECIÉN CUANDO SELECCIONA LA ZONA APARECE EL INDICADOR DE STOCK SEGÚN EL HORARIO */}
                {formZona && formZoneAvail && (
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                        style={{ backgroundColor: eventSettings.zonas.find((z) => z.key === formZona)?.color || "#fe0000" }}
                      />
                      <div>
                        <div className="font-bold text-sm text-white">
                          {eventSettings.zonas.find((z) => z.key === formZona)?.label || formZona} · {formFuncion}
                        </div>
                        <span className="text-slate-400 text-xs">
                          Auditorio del Colegio de Ingenieros
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-white leading-none">
                        {formZoneAvail.availableSeats}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mt-0.5">
                        Asientos Libres
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Datos del Comprador */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Mendoza"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="956 000 000"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      DNI (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="8 dígitos"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>

                {/* 4. Cantidad y Promoción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      {cfgEvento.tieneCategorias
                        ? entradasPorPromoForm > 1
                          ? `Adultos · Promos ${promoTagForm} *`
                          : "Entradas Adulto *"
                        : entradasPorPromoForm > 1
                        ? `Cantidad de Promos ${promoTagForm} Compradas *`
                        : "Número de Entradas a Descontar *"}
                    </label>
                    <input
                      type="number"
                      min={cfgEvento.tieneCategorias ? 0 : 1}
                      max={formZoneAvail ? Math.max(1, Math.floor(formZoneAvail.availableSeats / entradasPorPromoForm)) : 50}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(cfgEvento.tieneCategorias ? 0 : 1, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />

                    {cfgEvento.tieneCategorias && (
                      <div className="mt-3">
                        <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                          {entradasPorPromoForm > 1 ? `Niños · Promos ${promoTagForm}` : "Entradas Niño"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={formZoneAvail ? Math.max(0, Math.floor(formZoneAvail.availableSeats / entradasPorPromoForm)) : 50}
                          value={cantidadNino}
                          onChange={(e) => setCantidadNino(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          Total: <strong>{(cantidad + cantidadNino) * entradasPorPromoForm} asientos</strong> ({cantidad} Adulto{cantidad === 1 ? "" : "s"} + {cantidadNino} Niño{cantidadNino === 1 ? "" : "s"}
                          {entradasPorPromoForm > 1 ? ` · ×${entradasPorPromoForm} por promo` : ""})
                        </p>
                      </div>
                    )}

                    {entradasPorPromoForm > 1 && (
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Promo {promoTagForm}: {cantidad + cantidadNino} paquete(s) = {(cantidad + cantidadNino) * entradasPorPromoForm} asientos a entregar</span>
                        </div>
                        <p className="mt-1 text-[11px] text-amber-800">
                          Cada promo {promoTagForm} que pagó el cliente son <strong>{entradasPorPromoForm} asientos</strong>. Si pagó 1 promo, coloca <strong>1</strong>; si pagó 2, coloca <strong>2</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Etapa / Promoción
                    </label>
                    {formZona === "cortesia" ? (
                      <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-md px-3.5 py-2 text-xs text-amber-900 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Pase de Cortesía · Costo S/ 0.00 (Sin promociones)</span>
                      </div>
                    ) : (
                      <select
                        value={promo}
                        onChange={(e) => {
                          const newPromo = e.target.value as any;
                          setPromo(newPromo);
                          if (newPromo === "cortesia") {
                            setMetodoPago("cortesia");
                            setTotalManual(0);
                          } else if (metodoPago === "cortesia") {
                            setMetodoPago("yape");
                            setTotalManual(null);
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-red-600 font-medium"
                      >
                        <option value="twoXone">Preventa 2x1{activePromoKey === "twoXone" ? " (Hoy)" : ""}</option>
                        <option value="threeXtwo">Preventa 3x2{activePromoKey === "threeXtwo" ? " (Hoy)" : ""}</option>
                        <option value="twentyPct">Preventa 20%{activePromoKey === "twentyPct" ? " (Hoy)" : ""}</option>
                        <option value="regular">Precio Regular{activePromoKey === "regular" ? " (Hoy)" : ""}</option>
                        <option value="cortesia">🎁 Pase de Cortesía (Costo S/ 0.00)</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* 5. Total Pagado y Método de Pago (Desplegable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Total Pagado por el Cliente (S/) *
                    </label>
                    {isCortesiaSelected ? (
                      <div>
                        <input
                          type="text"
                          disabled
                          value="S/ 0.00 (Cortesía)"
                          className="w-full bg-amber-50 border-2 border-amber-300 rounded-md px-3.5 py-2.5 text-base text-amber-800 font-extrabold cursor-not-allowed"
                        />
                        <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                          🎁 Costo S/ 0.00 obligatorio por pase oficial de cortesía.
                        </span>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="number"
                          step="1"
                          value={totalFinal}
                          onChange={(e) => setTotalManual(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-base text-red-600 font-extrabold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Calculado automáticamente según la promo.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Método de Pago *
                    </label>
                    {isCortesiaSelected ? (
                      <div>
                        <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-md px-3.5 py-2.5 text-sm text-amber-900 font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>🎁 Pase de Cortesía (Sin Costo)</span>
                        </div>
                        <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                          Entrada oficial de honor sin abono bancario.
                        </span>
                      </div>
                    ) : (
                      <div>
                        <select
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                          className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        >
                          <option value="efectivo">💵 Efectivo</option>
                          <option value="yape">🟣 Yape</option>
                          <option value="plin">🔵 Plin</option>
                          <option value="transferencia">🏦 Transferencia Bancaria</option>
                          <option value="cortesia">🎁 Pase de Cortesía</option>
                        </select>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Medio por el cual el cliente realizó el abono.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Vendedor y Notas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Vendedor / Canal
                    </label>
                    <input
                      type="text"
                      value={vendedor}
                      onChange={(e) => setVendedor(e.target.value)}
                      placeholder="Ej. Mariana, Harold, Boletería, Venta directa..."
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Notas / Comprobante (Opcional)
                    </label>
                    <input
                      type="text"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Ej. Yape verificado, asiento fila 3, amigo de la casa"
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!formZona || isSubmitting || cantidad + cantidadNino < 1}
                  className={`w-full py-3.5 font-bold uppercase tracking-wider text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm ${
                    formZona && !isSubmitting
                      ? isCortesiaSelected
                        ? "bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                        : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? "Registrando en el Sistema..."
                      : isCortesiaSelected
                      ? `Confirmar Pase de Cortesía (${cantidad + cantidadNino} Asientos · S/ 0.00)`
                      : formZona
                      ? entradasPorPromoForm > 1
                        ? `Confirmar Venta ${promoTagForm} y Descontar ${(cantidad + cantidadNino) * entradasPorPromoForm} Asientos (${cantidad + cantidadNino} promo = ${(cantidad + cantidadNino) * entradasPorPromoForm} entradas)`
                        : `Confirmar Venta y Descontar ${cantidad + cantidadNino} Asientos (${ZONAS_CONFIG[formZona]?.label})`
                      : "Selecciona una zona arriba para continuar"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PARTE 3: CONTROL DE ASISTENCIA EN PUERTA & PREVENCIÓN DE DUPLICADOS */}
        {/* ==================================================================== */}
        {activeTab === "asistencia" && (
          <div className="space-y-8 animate-fade-in">
            {/* Cabecera del módulo de puerta */}
            <div className="flex flex-col gap-4 border-b border-[#d9d0bb] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] text-[#7b715d]">Control de acceso · {cfgEvento.nombreCorto}</p>
                <h2 className="font-display text-[30px] leading-none sm:text-[36px]">Puerta</h2>
                <p className="mt-2 max-w-2xl text-[13px] text-[#7b715d]">
                  Escanea el QR de cada entrada o busca por código o DNI. Si una entrada ya ingresó, el sistema avisa y no la deja repetir.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportTicketsToExcel(reservations, { onlyAttended: true })}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d3c9b2] px-3.5 py-2 text-[13px] font-semibold text-[#3f3a2e] hover:bg-[#efe9da]"
                  title="Descargar solo los asistentes ingresados"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Asistentes ({stats.totalAttendedTickets})
                </button>
                <button
                  type="button"
                  onClick={() => exportTicketsToExcel(reservations)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d3c9b2] px-3.5 py-2 text-[13px] font-semibold text-[#3f3a2e] hover:bg-[#efe9da]"
                  title="Descargar la base completa"
                >
                  <Download className="h-4 w-4" />
                  Todo
                </button>
              </div>
            </div>

            {/* Cifras de ingreso en una franja */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-7 pb-1 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-[#e3dccb]">
              <div className="lg:pr-8">
                <p className="text-[13px] text-[#7b715d]">En sala</p>
                <p className="font-display mt-1 text-[38px] leading-none sm:text-[46px]">
                  {stats.totalAttendedTickets}
                  <span className="ml-1.5 font-body text-[14px] font-medium text-[#a79d86]">/ {stats.totalTickets}</span>
                </p>
                <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-[#e8e1d1]">
                  <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${stats.percentAttendedTotal}%` }} />
                </div>
                <p className="mt-2 text-[12px] text-[#7b715d]">
                  {stats.percentAttendedTotal}% · {Math.max(0, stats.totalTickets - stats.totalAttendedTickets)} faltan por entrar
                </p>
              </div>
              {[
                ["Función 4:00 pm", stats.attended4pm, stats.tickets4pm, stats.percentAttended4pm],
                ["Función 7:00 pm", stats.attended7pm, stats.tickets7pm, stats.percentAttended7pm],
              ].map(([label, ing, tot, pct]) => (
                <div key={label as string} className="lg:px-8">
                  <p className="text-[13px] text-[#7b715d]">{label}</p>
                  <p className="font-display mt-1 text-[38px] leading-none sm:text-[46px]">
                    {ing}
                    <span className="ml-1.5 font-body text-[14px] font-medium text-[#a79d86]">/ {tot}</span>
                  </p>
                  <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-[#e8e1d1]">
                    <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-[12px] text-[#7b715d]">
                    {pct}% ingresó · {Math.max(0, Number(tot) - Number(ing))} faltan
                  </p>
                </div>
              ))}
              <div className="lg:pl-8">
                <p className="text-[13px] text-[#7b715d]">Compras que ya entraron</p>
                <p className="font-display mt-1 text-[38px] leading-none sm:text-[46px]">
                  {stats.attendedOrdersCount}
                  <span className="ml-1.5 font-body text-[14px] font-medium text-[#a79d86]">
                    / {reservations.filter((r) => r.estado !== "anulado").length}
                  </span>
                </p>
                <p className="mt-2 text-[12px] text-[#7b715d]">Al menos una persona del grupo ya está adentro</p>
              </div>
            </div>

            {/* SECCIÓN VALIDADOR RÁPIDO EN PUERTA (ESCANEAR / DIGITAR) */}
            <div className="space-y-5 rounded-2xl bg-[#14201a] p-4 text-white sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">

                  <div>
                    <h3 className="font-display text-xl sm:text-2xl text-white font-bold tracking-wide">
                      Escanear o Validar Entrada
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ingresa el código oficial (ej. <strong className="text-white">{cfgEvento.codePrefix}-4PM-{Object.values(cfgEvento.zonePrefix)[0]}-001</strong>), el <strong className="text-white">DNI</strong> o el nombre.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Detección de duplicados activa</span>
                </div>
              </div>

              {/* Formulario de Escaneo */}
              <button
                type="button"
                onClick={() => setCamaraAbierta(true)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <ScanLine className="w-5 h-5" />
                <span>Escanear QR con la cámara</span>
              </button>
              {camaraAbierta && (
                <QrScanner
                  onClose={() => setCamaraAbierta(false)}
                  onResult={(texto) => {
                    setCamaraAbierta(false);
                    setScanQuery(texto);
                    handleValidateScan(undefined, texto);
                  }}
                />
              )}

              <form onSubmit={(e) => handleValidateScan(e)} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <ScanLine className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={scanQuery}
                    onChange={(e) => setScanQuery(e.target.value)}
                    placeholder="Código de ticket o DNI del cliente..."
                    className="w-full bg-slate-800/80 border-2 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-hidden focus:border-red-500 focus:bg-slate-800 font-mono tracking-wide uppercase"
                    autoFocus
                  />
                  {scanQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setScanQuery("");
                        setScanAlert(null);
                        setScannedTicket(null);
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-700/50 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Validar Boleto</span>
                </button>
              </form>

              {/* RESULTADOS DEL VALIDADOR */}
              {/* CASO 1: 🚨 TICKET YA USADO (DUPLICADO - NO PROCEDE) */}
              {scanAlert && scanAlert.type === "duplicate" && (
                <div className="p-4 sm:p-6 bg-red-950/90 border-2 border-red-500 rounded-2xl shadow-2xl text-white animate-fade-in space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
                      <AlertOctagon className="w-7 sm:w-8 h-7 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800 border border-red-400 text-[11px] font-black uppercase tracking-wider text-red-100 mb-1.5 shadow-xs">
                        <Ban className="w-3.5 h-3.5 text-red-300" />
                        <span>ACCESO DENEGADO · NO PROCEDE</span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-white font-extrabold tracking-tight leading-tight">
                        ¡ALERTA DE SEGURIDAD! ESTE TICKET YA FUE UTILIZADO
                      </h3>
                      <p className="text-xs sm:text-sm text-red-200 mt-1 font-medium">
                        El boleto ya fue registrado en puerta anteriormente. Queda terminantemente prohibido autorizar el reingreso con el mismo boleto.
                      </p>
                    </div>
                  </div>

                  {/* Detalle del canje previo */}
                  <div className="bg-red-900/60 border border-red-700/80 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-red-300 font-bold block uppercase text-[10px]">Primer Ingreso Registrado</span>
                      <span className="text-white font-extrabold text-xs sm:text-sm block mt-0.5">
                        {scanAlert.previousUsedAt
                          ? new Date(scanAlert.previousUsedAt).toLocaleString("es-PE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "Previamente registrado"}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-300 font-bold block uppercase text-[10px]">Titular Registrado</span>
                      <span className="text-white font-bold text-xs sm:text-sm block mt-0.5">
                        {scanAlert.ticket?.clienteNombre}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-300 font-bold block uppercase text-[10px]">Código & DNI</span>
                      <span className="font-mono text-amber-300 font-bold text-xs sm:text-sm block mt-0.5">
                        #{scanAlert.ticket?.ticketCode || scanAlert.ticket?.id} · DNI: {scanAlert.ticket?.clienteDni || "No reg."}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-300 font-bold block uppercase text-[10px]">Función & Asistentes</span>
                      <span className="text-white font-bold text-xs sm:text-sm block mt-0.5">
                        {scanAlert.ticket?.funcion} ({scanAlert.ticket ? getEffectiveTicketsCount(scanAlert.ticket) : 0} pers.{scanAlert.ticket && (scanAlert.ticket.etapaPromo === "twoXone" || scanAlert.ticket.etapaPromo === "threeXtwo") ? ` · ${PROMOS_CONFIG[scanAlert.ticket.etapaPromo]?.tag}` : ""}) · {ZONAS_CONFIG[scanAlert.ticket?.zonaKey || ""]?.label || scanAlert.ticket?.zonaKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-red-800/80 text-xs">
                    <span className="text-red-300">
                      Se recomienda verificar el DNI físico del portador para comprobar si es el titular original o una captura duplicada.
                    </span>
                    {scanAlert.ticket && (
                      <button
                        type="button"
                        onClick={() => setAttendanceRevertTarget(scanAlert.ticket!)}
                        className="text-red-200 hover:text-white underline font-semibold cursor-pointer shrink-0"
                      >
                        Desmarcar en caso de error administrativo
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* CASO 2: 🟢 TICKET VÁLIDO - LISTO PARA INGRESAR (PENDIENTE) */}
              {scanAlert && scanAlert.type === "success" && scannedTicket && getPendientesIngresoCount(scannedTicket) > 0 && (() => {
                const effectiveCount = getEffectiveTicketsCount(scannedTicket);
                const pendCount = getPendientesIngresoCount(scannedTicket);
                const ingCount = getIngresadosCount(scannedTicket);
                return (
                  <div className="p-4 sm:p-6 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl shadow-2xl text-white animate-fade-in space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                          <UserCheck className="w-7 sm:w-8 h-7 sm:h-8" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 border border-emerald-400 text-[11px] font-black uppercase tracking-wider text-emerald-100 mb-1.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            <span>BOLETO VÁLIDO · LISTO PARA INGRESAR</span>
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
                            {scannedTicket.clienteNombre}
                          </h3>
                          <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                            DNI: <strong className="text-white">{scannedTicket.clienteDni || "Registrado al canje"}</strong> · Tel: {scannedTicket.clienteTelefono} · Vendedor: {scannedTicket.vendedor}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-extrabold px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-400/50 text-emerald-300 block w-fit sm:ml-auto">
                          #{scannedTicket.ticketCode || scannedTicket.id}
                        </span>
                      </div>
                    </div>

                    {/* Resumen de entradas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-900/60 border border-emerald-700/60 rounded-xl p-4 text-xs">
                      <div>
                        <span className="text-emerald-300 font-bold block uppercase text-[10px]">Función</span>
                        <span className="text-white font-extrabold text-base block mt-0.5">
                          {scannedTicket.funcion}
                        </span>
                      </div>
                      <div>
                        <span className="text-emerald-300 font-bold block uppercase text-[10px]">Zona en Sala</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ZONAS_CONFIG[scannedTicket.zonaKey]?.color }}
                          />
                          <span className="text-white font-extrabold text-base">
                            {ZONAS_CONFIG[scannedTicket.zonaKey]?.label || scannedTicket.zonaKey}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-emerald-300 font-bold block uppercase text-[10px]">Cantidad de Asistentes</span>
                        <span className="text-yellow-300 font-black text-2xl block mt-0.5">
                          {effectiveCount} {effectiveCount === 1 ? "PERSONA" : "PERSONAS"}
                        </span>
                        {ingCount > 0 && (
                          <span className="text-[11px] text-emerald-100 block font-bold mt-0.5">
                            Ya ingresaron {ingCount} · Faltan {pendCount}
                          </span>
                        )}
                        {(scannedTicket.etapaPromo === "twoXone" || scannedTicket.etapaPromo === "threeXtwo" || (scannedTicket.cantidadNino ?? 0) > 0) && (
                          <span className="text-[11px] text-emerald-200 block font-normal mt-0.5">
                            ({describeEntradas(scannedTicket)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón Gigante de Confirmación de Ingreso */}
                    <button
                      type="button"
                      onClick={() => (scanSeat ? submitEntry(scannedTicket, 1, scanSeat) : handleConfirmAttendance(scannedTicket))}
                      disabled={isMarkingAttendance}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-wider text-base rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-6 h-6 text-slate-950" />
                      <span>
                        {isMarkingAttendance
                          ? "Registrando Ingreso en el Sistema..."
                          : scanSeat
                          ? `CONFIRMAR INGRESO · ENTRADA ${scanSeat} DE ${effectiveCount} (${getSeatCategory(scannedTicket, scanSeat).toUpperCase()})`
                          : pendCount === 1
                          ? "CONFIRMAR INGRESO · ADMITIR A 1 PERSONA"
                          : `REGISTRAR INGRESO · FALTAN ${pendCount} PERSONA(S)`}
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* CASO 3: 🎉 INGRESO RECIÉN CONFIRMADO */}
              {scanAlert && scanAlert.type === "success" && scannedTicket?.asistio && getPendientesIngresoCount(scannedTicket) === 0 && (
                <div className="p-4 sm:p-6 bg-emerald-900/80 border-2 border-emerald-400 rounded-2xl shadow-xl text-white animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xl shadow-lg">
                      ✓
                    </div>
                    <div>
                      <div className="font-extrabold text-lg sm:text-xl text-emerald-100">
                        ¡Ingreso Registrado con Éxito!
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                        {scannedTicket.clienteNombre} · {getEffectiveTicketsCount(scannedTicket)} persona(s) {(scannedTicket.etapaPromo === "twoXone" || scannedTicket.etapaPromo === "threeXtwo") ? `(promo ${PROMOS_CONFIG[scannedTicket.etapaPromo]?.tag}) ` : ""}en {ZONAS_CONFIG[scannedTicket.zonaKey]?.label} ({scannedTicket.funcion}).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setScannedTicket(null);
                      setScanAlert(null);
                      setScanQuery("");
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0 cursor-pointer text-center"
                  >
                    Validar Siguiente Boleto →
                  </button>
                </div>
              )}

              {/* CASO 4: ❌ TICKET NO ENCONTRADO */}
              {scanAlert && scanAlert.type === "not_found" && (
                <div className="p-4 sm:p-5 bg-amber-950/90 border border-amber-500/80 rounded-2xl text-amber-200 animate-fade-in flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-100 text-sm">Boleto no localizado</div>
                    <p className="text-xs text-amber-300/90 mt-0.5">{scanAlert.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* TABLA: LISTA DE ASISTENCIA EN PUERTA (CANJES Y CONTROL) */}
            <div className="border border-slate-200 bg-white p-4 sm:p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-slate-900 tracking-wide font-bold">
                    Lista de Asistencia en Puerta
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historial en vivo de boletos canjeados en puerta y público pendiente de ingresar.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportTicketsToExcel(attendanceFilteredList, { onlyAttended: filtroAsistenciaTab === "asistidos" })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-2xs cursor-pointer w-full sm:w-auto justify-center"
                    title="Exportar esta vista filtrada de asistencia a Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Descargar Lista ({attendanceFilteredList.length})</span>
                  </button>
                </div>
              </div>

              {/* Filtros de la Lista de Asistencia */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Pestañas de Asistencia con scroll horizontal en móvil */}
                <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap no-scrollbar" role="tablist">
                  {(
                    [
                      ["todos", "Todos", reservations.filter((r) => r.estado !== "anulado").length],
                      ["asistidos", "En sala", stats.totalAttendedTickets],
                      ["pendientes", "Pendientes", Math.max(0, stats.totalTickets - stats.totalAttendedTickets)],
                    ] as const
                  ).map(([k, label, n]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFiltroAsistenciaTab(k)}
                      className={`relative shrink-0 cursor-pointer pb-2 text-[14px] transition-colors ${
                        filtroAsistenciaTab === k ? "font-bold text-[#1f1d19]" : "font-medium text-[#8c8268] hover:text-[#4d4636]"
                      }`}
                    >
                      {label} <span className="font-medium text-[#a79d86]">{n}</span>
                      <span
                        className="absolute inset-x-0 -bottom-px h-[3px] rounded-full"
                        style={{ background: shrekTema ? "#4c8a1f" : "#dc2626", opacity: filtroAsistenciaTab === k ? 1 : 0 }}
                      />
                    </button>
                  ))}
                </div>

                {/* Filtros secundarios: Función y Vendedor */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                  <select
                    value={filtroAsistenciaFuncion}
                    onChange={(e) => setFiltroAsistenciaFuncion(e.target.value)}
                    className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-red-600"
                  >
                    <option value="todas">Todas las funciones</option>
                    <option value="4:00 pm">Función 4:00 PM</option>
                    <option value="7:00 pm">Función 7:00 PM</option>
                  </select>

                  <select
                    value={filtroAsistenciaVendedor}
                    onChange={(e) => setFiltroAsistenciaVendedor(e.target.value)}
                    className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-red-600"
                  >
                    <option value="todos">Todos los vendedores</option>
                    {vendedoresList.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* VISTA 1: MÓVIL (< md) - Tarjetas para porteros y staff en celular */}
              <div className="md:hidden space-y-3">
                {attendanceFilteredList.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                    No hay asistentes registrados con los filtros seleccionados.
                  </div>
                ) : (
                  attendanceFilteredList.map((r) => {
                    const meta = ZONAS_CONFIG[r.zonaKey];
                    const effectiveCount = getEffectiveTicketsCount(r);
                    const ingCount = getIngresadosCount(r);
                    const pendCount = getPendientesIngresoCount(r);
                    const isPartial = ingCount > 0 && pendCount > 0;
                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-xl border transition-all ${
                          pendCount === 0 && ingCount > 0
                            ? "bg-emerald-50/40 border-emerald-300/80 shadow-2xs"
                            : "bg-white border-slate-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-[#5d5644] text-[12px]">
                            #{r.ticketCode || r.id}
                          </span>
                          {isPartial ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <span>PARCIAL {ingCount}/{effectiveCount}</span>
                            </span>
                          ) : ingCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>INGRESADO</span>
                              {r.asistioAt && (
                                <span className="font-mono ml-1">
                                  {new Date(r.asistioAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>PENDIENTE</span>
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-slate-900 text-sm">{r.clienteNombre}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          DNI: <strong className="text-slate-700">{r.clienteDni || "Sin DNI"}</strong> · Tel: {r.clienteTelefono}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Función & Zona</span>
                            <div className="font-bold text-slate-800 mt-0.5">{r.funcion}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: meta?.color }} />
                              <span className="text-[11px] text-slate-700 font-medium">{meta?.label}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Asistentes</span>
                            <span className="font-bold text-slate-900 text-sm block mt-0.5">
                              {effectiveCount} {effectiveCount === 1 ? "persona" : "personas"}
                            </span>
                            {(r.etapaPromo === "twoXone" || r.etapaPromo === "threeXtwo") && (
                              <span className="text-[12px] text-[#7b715d] inline-block mt-0.5">
                                {PROMOS_CONFIG[r.etapaPromo]?.tag || r.etapaPromo} · {describeEntradas(r).replace(/ \(.*\)$/, "")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Vendedor: <strong className="text-slate-700">{r.vendedor || "Boletería"}</strong></span>
                        </div>

                        {ingCount > 0 && (
                          <div className="mt-2 text-[11px] text-slate-600">
                            Ingresaron <strong>{ingCount}</strong> de {effectiveCount}
                            {pendCount > 0 && <> · <strong className="text-amber-700">faltan {pendCount}</strong></>}
                          </div>
                        )}

                        <div className="mt-3 space-y-2">
                          {pendCount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleConfirmAttendance(r)}
                              disabled={isMarkingAttendance}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>
                                {ingCount > 0 ? `Registrar ingreso (faltan ${pendCount})` : `Marcar Ingreso (${effectiveCount} pers.)`}
                              </span>
                            </button>
                          )}
                          {ingCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setEntryTargetId(r.id)}
                              className="w-full py-2 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ver historial / corregir</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* VISTA 2: ESCRITORIO (>= md) - Tabla clásica completa */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-4 py-3">Hora de Ingreso</th>
                      <th className="px-4 py-3">Código Ticket</th>
                      <th className="px-4 py-3">Cliente & DNI</th>
                      <th className="px-4 py-3">Función & Zona</th>
                      <th className="px-4 py-3 text-center">Entradas / Asientos</th>
                      <th className="px-4 py-3">Vendedor</th>
                      <th className="px-4 py-3 text-center">Estado de Puerta</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceFilteredList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                          No hay asistentes registrados con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      attendanceFilteredList.map((r) => {
                        const meta = ZONAS_CONFIG[r.zonaKey];
                        const effectiveCount = getEffectiveTicketsCount(r);
                        const ingCount = getIngresadosCount(r);
                        const pendCount = getPendientesIngresoCount(r);
                        const isPartial = ingCount > 0 && pendCount > 0;
                        const log = getIngresosLog(r);
                        return (
                          <tr
                            key={r.id}
                            className={`border-b border-slate-100 last:border-0 transition-colors ${
                              ingCount > 0 && pendCount === 0 ? "bg-emerald-50/30 hover:bg-emerald-50/60" : isPartial ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              {log.length > 0 ? (
                                <div className="space-y-0.5">
                                  {log.map((l, i) => (
                                    <div key={i} className="font-mono text-emerald-900 font-bold text-[11px] whitespace-nowrap">
                                      {fmtIngreso(l.at)} <span className="text-slate-500 font-semibold">· {l.cantidad} pers.</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium italic text-[11px]">
                                  Pendiente
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="font-mono font-bold text-[#5d5644] text-[12px]">
                                #{r.ticketCode || r.id}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900 text-sm">{r.clienteNombre}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                DNI: {r.clienteDni || "Sin DNI"} · Tel: {r.clienteTelefono}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900">{r.funcion}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: meta?.color }}
                                />
                                <span className="text-slate-700 text-[11px] font-medium">{meta?.label}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <div className="inline-block font-bold text-slate-900 text-[15px]">
                                {effectiveCount} pers.
                              </div>
                              {ingCount > 0 && (
                                <div className="text-[10px] font-bold mt-0.5 text-slate-600">
                                  Ingresaron {ingCount} · {pendCount > 0 ? <span className="text-amber-700">faltan {pendCount}</span> : "completo"}
                                </div>
                              )}
                              {(r.etapaPromo === "twoXone" || r.etapaPromo === "threeXtwo") && (
                                <div className="text-[12px] text-[#7b715d] mt-0.5">
                                  {PROMOS_CONFIG[r.etapaPromo]?.tag || r.etapaPromo} · {describeEntradas(r).replace(/ \(.*\)$/, "")}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-slate-600 text-xs">
                              {r.vendedor}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              {isPartial ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  <span>PARCIAL {ingCount}/{effectiveCount}</span>
                                </span>
                              ) : ingCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>INGRESADO</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  <span>PENDIENTE</span>
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex flex-col items-end gap-1">
                                {pendCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmAttendance(r)}
                                    disabled={isMarkingAttendance}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d3c9b2] px-3 py-1.5 text-[13px] font-semibold text-[#3f3a2e] transition-colors hover:border-emerald-600 hover:text-emerald-700"
                                    title="Registrar ingreso de este boleto"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{ingCount > 0 ? `Registrar (faltan ${pendCount})` : "Marcar Ingreso"}</span>
                                  </button>
                                )}
                                {ingCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setEntryTargetId(r.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
                                    title="Ver historial de ingresos o corregir"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Historial / corregir</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: CONFIGURAR PRECIOS, HORARIOS Y SHOW */}
        {activeTab === "configuracion" && (
          <div className="space-y-6 animate-fade-in pb-12">
            {/* Header de Configuración */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                                <h2 className="font-display text-2xl text-slate-900 tracking-tight font-bold">
                  Configuración de Precios, Promociones, Horarios y Aforo
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Modifica las tarifas por zona, las etapas promocionales, las funciones del show y la capacidad de sala. Todos los cambios se guardan en la base de datos de Neon y se actualizan al instante en la ticketera pública (<strong className="text-slate-700">/entradas</strong>), en el link de las entradas generadas y en el CRM.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? "Guardando en Neon..." : "Guardar Configuración en Vivo"}</span>
                </button>
              </div>
            </div>

            {settingsSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm text-emerald-800 animate-fade-in shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{settingsSuccessMsg}</span>
              </div>
            )}

            {/* SECCIÓN 1: HORARIOS DE FUNCIONES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Horarios de Funciones del Show</h3>
                    <p className="text-xs text-slate-500">Agrega o retira funciones. Se actualizarán inmediatamente en la web pública y en el CRM.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {eventSettings.funciones.map((func) => (
                  <div
                    key={func}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs text-xs font-bold text-slate-800"
                  >
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>{func}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFuncion(func)}
                      className="ml-1 text-slate-400 hover:text-red-600 cursor-pointer p-0.5 rounded-full hover:bg-red-50 transition-colors"
                      title="Eliminar este horario"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Input para nuevo horario */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFuncionInput}
                    onChange={(e) => setNewFuncionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFuncion();
                      }
                    }}
                    placeholder="Ej: 9:30 pm"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 w-32"
                  />
                  <button
                    type="button"
                    onClick={handleAddFuncion}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PRECIOS Y AFORO POR ZONA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Tarifas y Capacidad por Zona</h3>
                    <p className="text-xs text-slate-500">
                      Configura el precio en Soles (S/) de cada zona para cada promoción y la capacidad máxima de asientos.
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                  Capacidad Total del Teatro: <strong className="text-slate-900 font-bold">{totalCapacity} butacas</strong>
                </div>
              </div>

              {/* Guía explicativa para Harold */}
              <p className="text-[13px] leading-relaxed text-[#7b715d]">
                En 2x1 el cliente paga 1 promoción y recibe 2 entradas; en 3x2 paga 2 y recibe 3. Los precios de cada zona son <strong className="text-[#1f1d19]">por promoción</strong>; el 20% y el FULL son por entrada.
              </p>

              {/* Grid de Zonas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {eventSettings.zonas
                  .filter((z) => z.key !== "cortesia")
                  .map((z) => {
                    return (
                      <div
                        key={z.key}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: z.color }}
                            />
                            <div>
                              <span className="font-bold text-slate-900 text-sm block leading-tight">
                                {z.label}
                              </span>
                              <span className="text-[10px] text-slate-500">{z.subtitle}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Aforo:</label>
                            <input
                              type="number"
                              min="1"
                              value={z.seats}
                              onChange={(e) => handleZoneSeatsChange(z.key, Number(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        {/* Precios por promo */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-semibold text-slate-800 block text-[11px]">Preventa 2x1</span>
                              <span className="text-[10px] text-slate-400">Paga 1, lleva 2 asientos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold text-xs">S/</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={z.prices.twoXone}
                                onChange={(e) => handleZonePriceChange(z.key, "twoXone", Number(e.target.value) || 0)}
                                className="w-18 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-semibold text-slate-800 block text-[11px]">Preventa 3x2</span>
                              <span className="text-[10px] text-slate-400">Paga 2, lleva 3 asientos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold text-xs">S/</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={z.prices.threeXtwo}
                                onChange={(e) => handleZonePriceChange(z.key, "threeXtwo", Number(e.target.value) || 0)}
                                className="w-18 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-semibold text-slate-800 block text-[11px]">Preventa -20%</span>
                              <span className="text-[10px] text-slate-400">Precio por entrada individual</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold text-xs">S/</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={z.prices.twentyPct}
                                onChange={(e) => handleZonePriceChange(z.key, "twentyPct", Number(e.target.value) || 0)}
                                className="w-18 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-semibold text-slate-800 block text-[11px]">Tarifa Regular</span>
                              <span className="text-[10px] text-slate-400">Precio estándar por asiento</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold text-xs">S/</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={z.prices.regular}
                                onChange={(e) => handleZonePriceChange(z.key, "regular", Number(e.target.value) || 0)}
                                className="w-18 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>

                          {cfgEvento.tieneCategorias && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
                              <span className="mb-1.5 block text-[11px] font-bold text-emerald-800">Precios Niño</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {(
                                  [
                                    ["twoXone", "2x1"],
                                    ["threeXtwo", "3x2"],
                                    ["twentyPct", "-20%"],
                                    ["regular", "FULL"],
                                  ] as const
                                ).map(([k, label]) => (
                                  <label key={k} className="flex items-center justify-between gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                                    {label}
                                    <span className="flex items-center gap-1">
                                      <span className="text-slate-400">S/</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={(z.pricesNino ?? z.prices)[k]}
                                        onChange={(e) => handleZonePriceNinoChange(z.key, k, Number(e.target.value) || 0)}
                                        className="w-14 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                                      />
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* SECCIÓN 3: CONTROL DE ACTIVACIÓN DE PROMOCIONES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Etapas Promocionales Activas</h3>
                  <p className="text-xs text-slate-500">Activa o desactiva las promociones visibles para el público y para el equipo de ventas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {eventSettings.promos.map((promoItem) => (
                  <div
                    key={promoItem.key}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      promoItem.active
                        ? "bg-emerald-50/40 border-emerald-300"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{promoItem.label}</span>
                      <span className="text-[10px] text-slate-500">Multiplicador: {promoItem.multiplier} asientos</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEventSettings((prev) => ({
                          ...prev,
                          promos: prev.promos.map((p) =>
                            p.key === promoItem.key ? { ...p, active: !p.active } : p
                          ),
                        }));
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                        promoItem.active
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {promoItem.active ? "Activa" : "Inactiva"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN FINAL DE GUARDAR */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingSettings}
                className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{isSavingSettings ? "Guardando en Neon..." : "Guardar Todos los Cambios en Vivo"}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Edición de Reservas (Harold Admin) */}
      {editingReservation && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 mb-1">
                  <Pencil className="w-3 h-3" />
                  Modo Corrección de Boleto
                </div>
                <h3 className="font-display text-xl text-slate-900 font-bold">
                  Editar Reserva #{editingReservation.ticketCode || editingReservation.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Modifica los datos del cliente, la función, la zona, la cantidad de asientos o el monto cobrado. Al guardar se actualizará la base de datos Neon y el link digital del cliente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingReservation(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Bloque 1: Datos del Cliente */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Información del Titular
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Teléfono</label>
                    <input
                      type="tel"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">DNI (Para Canje)</label>
                    <input
                      type="text"
                      value={editDni}
                      onChange={(e) => setEditDni(e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Función y Zona */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  2. Ubicación y Horario
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Función / Horario</label>
                    <select
                      value={editFuncion}
                      onChange={(e) => setEditFuncion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    >
                      {eventSettings.funciones.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Zona en Sala</label>
                    <select
                      value={editZona}
                      onChange={(e) => setEditZona(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    >
                      {eventSettings.zonas.map((z) => (
                        <option key={z.key} value={z.key}>
                          {z.label} ({z.subtitle})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Promoción, Cantidad y Monto */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  3. Tarifa, Cantidad y Monto Cobrado
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Promoción / Etapa</label>
                    <select
                      value={editPromo}
                      onChange={(e) => setEditPromo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    >
                      <option value="twoXone">Preventa 2x1 (Paga 1, entran 2){activePromoKey === "twoXone" ? " · Hoy" : ""}</option>
                      <option value="threeXtwo">Preventa 3x2 (Paga 2, entran 3){activePromoKey === "threeXtwo" ? " · Hoy" : ""}</option>
                      <option value="twentyPct">Preventa -20% Desc</option>
                      <option value="regular">Tarifa Regular</option>
                      <option value="cortesia">Pase de Cortesía (S/ 0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {cfgEvento.tieneCategorias ? "Entradas / Promos Adulto" : "Cantidad Comprada"}
                    </label>
                    {cfgEvento.tieneCategorias && (
                      <div className="mb-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Entradas / Promos Niño</label>
                        <input
                          type="number"
                          min="0"
                          value={editCantidadNino}
                          onChange={(e) => setEditCantidadNino(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}
                    <input
                      type="number"
                      min={cfgEvento.tieneCategorias ? 0 : 1}
                      value={editCantidad}
                      onChange={(e) => setEditCantidad(Math.max(cfgEvento.tieneCategorias ? 0 : 1, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <div className="text-[10px] text-amber-700 font-semibold mt-1">
                      {editPromo === "twoXone" && (
                        <span>En 2x1: {editCantidad} compra(s) = <strong>{editCantidad * 2} asientos</strong>.</span>
                      )}
                      {editPromo === "threeXtwo" && (
                        <span>En 3x2: {editCantidad} compra(s) = <strong>{editCantidad * 3} asientos</strong>.</span>
                      )}
                      {editPromo !== "twoXone" && editPromo !== "threeXtwo" && (
                        <span>Total de asientos: <strong>{editCantidad}</strong>.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Total Pagado (S/)</label>
                      <button
                        type="button"
                        onClick={() => setEditTotal(suggestedEditPrice)}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
                        title="Aplicar precio sugerido oficial según tarifa"
                      >
                        Sugerir S/ {suggestedEditPrice}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">S/</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editTotal}
                        onChange={(e) => setEditTotal(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Precio oficial estimado: S/ {suggestedEditPrice}.00
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 4: Método, Vendedor y Estado */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  4. Control Administrativo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Método de Pago</label>
                    <select
                      value={editMetodo}
                      onChange={(e) => setEditMetodo(e.target.value as MetodoPago)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    >
                      <option value="yape">Yape</option>
                      <option value="plin">Plin</option>
                      <option value="transferencia">Transferencia BCP</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="cortesia">Pase de Cortesía</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vendedor</label>
                    <input
                      type="text"
                      value={editVendedor}
                      onChange={(e) => setEditVendedor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value as TicketReservation["estado"])}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    >
                      <option value="confirmado">Confirmado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="anulado">Anulado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código de Ticket / N.° de serie</label>
                    <input
                      type="text"
                      value={editTicketCode}
                      onChange={(e) => setEditTicketCode(e.target.value.toUpperCase())}
                      placeholder={`Ej: ${cfgEvento.codePrefix}-4PM-${Object.values(cfgEvento.zonePrefix)[0]}-001`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Observaciones</label>
                  <textarea
                    rows={2}
                    value={editNotas}
                    onChange={(e) => setEditNotas(e.target.value)}
                    placeholder="Detalles sobre el pago, cortesía o motivo de corrección..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReservation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? "Guardando en Neon..." : "Guardar Cambios en Vivo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: registrar ingresos parciales y ver historial por ticket */}
      {entryTargetId && (() => {
        const t = reservations.find((x) => x.id === entryTargetId);
        if (!t) return null;
        const total = getEffectiveTicketsCount(t);
        const ing = getIngresadosCount(t);
        const pend = getPendientesIngresoCount(t);
        const log = getIngresosLog(t);
        const qty = Math.min(Math.max(1, entryQty), Math.max(1, pend));
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div>
                <h4 className="font-display text-lg font-bold text-slate-900">Registrar ingreso</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong className="font-mono text-slate-900">#{t.ticketCode || t.id}</strong> · {t.clienteNombre}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                  <div className="text-xl font-black text-slate-900">{total}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">Ingresaron</div>
                  <div className="text-xl font-black text-emerald-700">{ing}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <div className="text-[10px] uppercase font-bold text-amber-600">Pendientes</div>
                  <div className="text-xl font-black text-amber-700">{pend}</div>
                </div>
              </div>

              {pend > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">¿Cuántas personas ingresan ahora?</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEntryQty(Math.max(1, qty - 1))}
                      className="w-11 h-11 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center text-3xl font-black text-slate-900">{qty}</div>
                    <button
                      type="button"
                      onClick={() => setEntryQty(Math.min(pend, qty + 1))}
                      className="w-11 h-11 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {qty < pend
                      ? `Quedarán ${pend - qty} pendiente(s) hasta que lleguen los demás.`
                      : "Con esto el ticket queda completo."}
                  </p>
                  <button
                    type="button"
                    onClick={() => submitEntry(t, qty)}
                    disabled={isMarkingAttendance}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isMarkingAttendance ? "Registrando..." : `Registrar ingreso de ${qty}`}</span>
                  </button>
                </div>
              )}

              {log.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Historial de ingresos</div>
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
                    {log.map((l, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-2">
                        <span className="font-mono text-slate-700">{fmtIngreso(l.at)}</span>
                        <span className="font-bold text-emerald-700">{l.cantidad} {l.cantidad === 1 ? "persona" : "personas"}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(t.ingresos?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => handleUndoLastEntry(t)}
                        disabled={isMarkingAttendance}
                        className="px-3 py-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md cursor-pointer"
                      >
                        Deshacer último ingreso
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEntryTargetId(null);
                        setAttendanceRevertTarget(t);
                      }}
                      className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-md cursor-pointer"
                    >
                      Reiniciar todo a Pendiente
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setEntryTargetId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Confirmación para Desmarcar Asistencia */}
      {attendanceRevertTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">
                ¿Desmarcar Asistencia?
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Estás a punto de restablecer el estado del boleto{" "}
              <strong className="text-slate-900 font-mono">#{attendanceRevertTarget.ticketCode || attendanceRevertTarget.id}</strong> perteneciente a{" "}
              <strong className="text-slate-900">{attendanceRevertTarget.clienteNombre}</strong>.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              El boleto volverá al estado <strong>PENDIENTE DE INGRESO</strong> y podrá ser canjeado nuevamente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAttendanceRevertTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleRevertAttendance(attendanceRevertTarget)}
                disabled={isMarkingAttendance}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {isMarkingAttendance ? "Restableciendo..." : "Sí, restablecer a Pendiente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
