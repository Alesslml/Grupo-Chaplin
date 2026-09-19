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
  getZoneAvailability,
  getEffectiveTicketsCount,
  getCRMStats,
  getPromosBreakdown,
  buildWhatsAppReservationMessage,
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

export const Route = createFileRoute("/admin/entradas")({
  head: () => ({
    meta: [
      { title: "Panel CRM · Jesucristo Rockstar · Chaplin Grupo Cultural" },
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
  const [editPromo, setEditPromo] = useState("twoXone");
  const [editTotal, setEditTotal] = useState<number>(80);
  const [editMetodo, setEditMetodo] = useState<MetodoPago>("yape");
  const [editVendedor, setEditVendedor] = useState("");
  const [editEstado, setEditEstado] = useState<"confirmado" | "pendiente" | "anulado">("confirmado");
  const [editNotas, setEditNotas] = useState("");
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
  const [promo, setPromo] = useState<string>("twoXone");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("yape");
  const [vendedor, setVendedor] = useState("");
  const [notas, setNotas] = useState("");
  const [lastRegistered, setLastRegistered] = useState<TicketReservation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendWhatsApp = (res: TicketReservation) => {
    const rawPhone = res.clienteTelefono.replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
    const msg = buildWhatsAppReservationMessage(res);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleCopyTicketLink = (res: TicketReservation) => {
    if (typeof window !== "undefined") {
      const ticketUrl = `${window.location.origin}/ticket/${res.ticketCode || res.id}`;
      navigator.clipboard.writeText(ticketUrl);
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
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
    // Auto sync cada 15 segundos para mantener aforo en vivo
    const interval = setInterval(() => {
      syncEventSettingsWithNeon().then((s) => {
        if (s) setEventSettings(s);
      });
      if (getStoredHaroldAuth()) {
        syncReservationsWithNeon().then((res) => {
          if (res) setReservations(res);
        });
      }
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [auth]);

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

  // Precio sugerido en el formulario
  const precioSugerido = useMemo(() => {
    if (!formZona) return 0;
    if (formZona === "cortesia" || promo === "cortesia") return 0;
    const z = eventSettings.zonas.find((item) => item.key === formZona);
    const base = z?.prices[promo as keyof EventZoneSetting["prices"]] ?? (PRECIOS_POR_DEFECTO[formZona]?.[promo] || 80);
    if (promo === "twoXone") {
      // En Preventa 2x1, cada unidad comprada entrega 2 entradas por el precio base listado
      return cantidad * base;
    }
    if (promo === "threeXtwo") {
      const grupos = Math.ceil(cantidad / 3);
      return grupos * base;
    }
    return cantidad * base;
  }, [formZona, promo, cantidad, eventSettings.zonas]);

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
    setEditPromo(r.etapaPromo);
    setEditTotal(Number(r.totalPagado));
    setEditMetodo((r.metodoPago || "yape") as MetodoPago);
    setEditVendedor(r.vendedor);
    setEditEstado(r.estado);
    setEditNotas(r.notas || "");
    setEditSuccessMsg(null);
  };

  const suggestedEditPrice = useMemo(() => {
    if (!editZona || editZona === "cortesia" || editPromo === "cortesia") return 0;
    const z = eventSettings.zonas.find((item) => item.key === editZona);
    const base = z?.prices[editPromo as keyof EventZoneSetting["prices"]] ?? (PRECIOS_POR_DEFECTO[editZona]?.[editPromo] || 80);
    if (editPromo === "twoXone") {
      return editCantidad * base;
    }
    if (editPromo === "threeXtwo") {
      const grupos = Math.ceil(editCantidad / 3);
      return grupos * base;
    }
    return editCantidad * base;
  }, [editZona, editPromo, editCantidad, eventSettings.zonas]);

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
        cantidad: Number(editCantidad) || 1,
        etapaPromo: finalPromo,
        totalPagado: finalTotal,
        metodoPago: finalMetodo,
        vendedor: editVendedor.trim() || (isCortesiaEntry ? "Dirección" : "Boletería"),
        estado: editEstado,
        notas: editNotas.trim() || undefined,
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
      alert("Hubo un error al guardar los cambios. Intenta nuevamente.");
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
      setSettingsSuccessMsg("✅ ¡Configuración del evento guardada en vivo! Precios, horarios y aforos actualizados en la web pública.");
      setTimeout(() => setSettingsSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error guardando configuración:", err);
      alert("Error al guardar la configuración del evento.");
    } finally {
      setIsSavingSettings(false);
    }
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
        cantidad: Number(cantidad) || 1,
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
      setPromo("twoXone");
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
          ? Boolean(r.asistio)
          : !r.asistio;

      const matchFuncion =
        filtroAsistenciaFuncion === "todas" || r.funcion === filtroAsistenciaFuncion;

      const matchVendedor =
        filtroAsistenciaVendedor === "todos" ||
        r.vendedor?.trim().toLowerCase() === filtroAsistenciaVendedor.toLowerCase();

      return matchTab && matchFuncion && matchVendedor;
    });
  }, [reservations, filtroAsistenciaTab, filtroAsistenciaFuncion, filtroAsistenciaVendedor]);

  // Validador rápido de boletos en puerta (por código, DNI o nombre)
  const handleValidateScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = scanQuery.trim();
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

    if (found.asistio) {
      setScanAlert({
        type: "duplicate",
        message: "¡ALERTA DE DUPLICADO! Este boleto YA fue utilizado para ingresar.",
        ticket: found,
        previousUsedAt: found.asistioAt,
      });
    } else {
      setScanAlert({
        type: "success",
        message: `Boleto VÁLIDO. Listo para autorizar el ingreso de ${found.cantidad} persona(s).`,
        ticket: found,
      });
    }
  };

  // Confirmar ingreso de un ticket
  const handleConfirmAttendance = async (target: TicketReservation) => {
    if (target.asistio) {
      setScanAlert({
        type: "duplicate",
        message: "¡ALERTA DE DUPLICADO! Este boleto YA fue ingresado previamente.",
        ticket: target,
        previousUsedAt: target.asistioAt,
      });
      return;
    }

    setIsMarkingAttendance(true);
    try {
      const result = await markTicketAttendance(target.id, true);
      if (result.alreadyUsed) {
        setScanAlert({
          type: "duplicate",
          message: "¡ALERTA DE SEGURIDAD! El boleto fue marcado como usado hace instantes.",
          ticket: result.ticket || target,
          previousUsedAt: result.previousUsedAt,
        });
      } else if (result.ok && result.ticket) {
        setScanAlert({
          type: "success",
          message: `¡INGRESO EXITOSO! Se autorizó el acceso a ${result.ticket.clienteNombre} (${result.ticket.cantidad} entradas).`,
          ticket: result.ticket,
        });
        setScannedTicket(result.ticket);
        setReservations(getStoredReservations());
      }
    } catch (err) {
      console.error("Error al registrar asistencia:", err);
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
              CRM · Jesucristo Rockstar
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white font-body">
      {/* Top Header en Modo Claro */}
      {/* Top Header en Modo Claro */}
      <header className="border-b border-slate-200 sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-[1300px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <Link to="/entradas" className="shrink-0 group">
                <img
                  src="/logo-chaplin.png"
                  alt="Chaplin Grupo Cultural"
                  className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] px-1.5 sm:px-2 py-0.5 rounded-xs">
                    CRM · Rockstar
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 text-[10px] sm:text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En vivo
                  </span>
                </div>
                <h1 className="font-display text-slate-900 text-lg sm:text-2xl tracking-wide leading-tight mt-0.5">
                  Panel de Control de Harold
                </h1>
              </div>
            </div>

            {/* Acciones en Mobile */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="Sincronizar reservas"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-red-600" : ""}`} />
              </button>
              <Link
                to="/entradas"
                target="_blank"
                className="p-2 bg-red-600 text-white rounded-md transition-all shadow-xs"
                title="Ver Ticketera pública"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:border-slate-400 hover:text-slate-900 rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              title="Sincronizar reservas en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? "animate-spin text-red-600" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Harold López</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>

            <Link
              to="/entradas"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 rounded-md transition-all shadow-sm ml-1"
            >
              Ver Ticketera
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL: 1. DASHBOARD & CRM vs 2. REGISTRAR VENTA vs 3. ASISTENCIA */}
        <div className="border-t border-slate-200 bg-slate-100/80">
          <div className="max-w-[1300px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dashboard");
                  setLastRegistered(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-white text-slate-900 border-slate-300 shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <LayoutDashboard className={`w-3.5 h-3.5 ${activeTab === "dashboard" ? "text-red-600" : "text-slate-500"}`} />
                <span>1. Dashboard & CRM</span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-full">
                  {reservations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("registro");
                  setLastRegistered(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "registro"
                    ? "bg-white text-slate-900 border-slate-300 shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <UserPlus className={`w-3.5 h-3.5 ${activeTab === "registro" ? "text-red-600" : "text-slate-500"}`} />
                <span>2. Nueva Venta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("asistencia");
                  setLastRegistered(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "asistencia"
                    ? "bg-white text-slate-900 border-slate-300 shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${activeTab === "asistencia" ? "text-emerald-600" : "text-slate-500"}`} />
                <span>3. Asistencia (Puerta)</span>
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  stats.totalAttendedTickets > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}>
                  {stats.totalAttendedTickets} en sala
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("configuracion");
                  setLastRegistered(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "configuracion"
                    ? "bg-white text-slate-900 border-slate-300 shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <SlidersHorizontal className={`w-3.5 h-3.5 ${activeTab === "configuracion" ? "text-red-600" : "text-slate-500"}`} />
                <span>4. Configurar Precios & Show</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => exportTicketsToExcel(filteredReservations)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-300 rounded-md transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                title="Descargar base de datos del CRM a Excel (.csv con formato UTF-8 BOM)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Exportar a Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>

              {activeTab === "dashboard" && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("registro");
                    setLastRegistered(null);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Venta</span>
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
            {/* 1. Tarjetas de Métricas Globales (KPIs) en Grid 2x2 para Móviles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="border border-slate-200 bg-white p-3.5 sm:p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
                  <span>Recaudación Total</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="font-display text-xl sm:text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
                  S/ {stats.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 0 })}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 mt-1.5 sm:mt-2 font-medium flex-wrap">
                  <span className="text-amber-800 font-bold bg-amber-50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded border border-amber-200">
                    4pm: S/ {stats.revenue4pm.toFixed(0)}
                  </span>
                  <span className="text-sky-800 font-bold bg-sky-50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded border border-sky-200">
                    7pm: S/ {stats.revenue7pm.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* ENTRADAS VENDIDAS TOTALES (Con conteo x2 en 2x1) */}
              <div className="border border-slate-200 bg-white p-3.5 sm:p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
                  <span>Entradas Vendidas</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-50 flex items-center justify-center">
                    <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  </div>
                </div>
                <div className="font-display text-xl sm:text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
                  {stats.totalTickets}{" "}
                  <span className="text-xs sm:text-sm font-normal text-slate-400 font-body">asientos</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 mt-1.5 sm:mt-2 font-medium flex-wrap">
                  {stats.funcionStats?.map((fs) => (
                    <span
                      key={fs.funcion}
                      className="font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      {fs.funcion}: {fs.tickets} ent.
                    </span>
                  ))}
                </div>
              </div>

              {stats.funcionStats?.map((fs, idx) => {
                const colors = [
                  { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500", rev: "text-amber-700" },
                  { bg: "bg-sky-50", text: "text-sky-600", bar: "bg-sky-500", rev: "text-sky-700" },
                  { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500", rev: "text-purple-700" },
                  { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500", rev: "text-emerald-700" },
                ];
                const c = colors[idx % colors.length];
                return (
                  <div
                    key={fs.funcion}
                    className="border border-slate-200 bg-white p-3.5 sm:p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
                      <span>Función {fs.funcion}</span>
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${c.bg} flex items-center justify-center`}>
                        <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${c.text}`} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between flex-wrap gap-1">
                      <div className="font-display text-xl sm:text-3xl text-slate-900 font-bold tracking-tight">
                        {fs.tickets}{" "}
                        <span className="text-xs sm:text-sm text-slate-400 font-normal font-body">/ {stats.totalCap}</span>
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold ${c.rev}`}>
                        S/ {fs.revenue.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 sm:h-2 mt-2 rounded-full overflow-hidden">
                      <div className={`${c.bar} h-full transition-all`} style={{ width: `${fs.percent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mt-1 font-medium">
                      <span>{fs.percent}% aforo</span>
                      <span>{Math.max(0, stats.totalCap - fs.tickets)} libres</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Métricas de Promociones & Rendimiento General */}
            <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                      <Tag className="w-4 h-4" />
                    </span>
                    <h2 className="font-display text-2xl text-slate-900 tracking-wide">
                      Métricas por Promociones & Rendimiento General
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Análisis en tiempo real de entradas vendidas y recaudación por cada etapa de preventa y precio regular.
                  </p>
                </div>

                {/* Destacado: ¿En qué promo se vendió más? */}
                {promosBreakdown.topPromoByTickets && promosBreakdown.topPromoByTickets.ticketsSold > 0 ? (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-xs self-start md:self-auto">
                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                          🏆 Promo Más Vendida
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {promosBreakdown.topPromoByTickets.meta.label}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        <strong className="text-amber-950 font-extrabold">{promosBreakdown.topPromoByTickets.ticketsSold} entradas</strong> · S/ {promosBreakdown.topPromoByTickets.revenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 self-start md:self-auto">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span>Aún sin ventas registradas. El CRM destacará la promo líder automáticamente.</span>
                  </div>
                )}
              </div>

              {/* Métrica General Global */}
              <div className="mt-5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Recaudación General
                  </span>
                  <div className="font-display text-2xl text-slate-900 font-bold mt-1">
                    S/ {promosBreakdown.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">100% de ingresos totales</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Total Boletos Vendidos
                  </span>
                  <div className="font-display text-2xl text-slate-900 font-bold mt-1">
                    {promosBreakdown.totalTickets} <span className="text-xs font-normal text-slate-400 font-body">entradas</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {promosBreakdown.totalOrders} compras registradas
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Ticket Promedio / Entrada
                  </span>
                  <div className="font-display text-2xl text-slate-900 font-bold mt-1">
                    S/ {promosBreakdown.avgTicketPriceGlobal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Promedio por cada asiento</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Promo con Más Ventas
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1 truncate">
                    {promosBreakdown.topPromoByTickets && promosBreakdown.topPromoByTickets.ticketsSold > 0
                      ? promosBreakdown.topPromoByTickets.meta.label
                      : "Sin ventas aún"}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {promosBreakdown.topPromoByTickets && promosBreakdown.topPromoByTickets.ticketsSold > 0
                      ? `${promosBreakdown.topPromoByTickets.percentOfTotalTickets}% del volumen total`
                      : "Todas las promos en 0"}
                  </span>
                </div>
              </div>

              {/* Tarjetas Detalladas por cada Promoción */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {promosBreakdown.items.map((item) => {
                  return (
                    <div
                      key={item.key}
                      className={`p-4 rounded-xl border transition-all ${
                        item.isLeaderTickets
                          ? "bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${item.meta.badgeBg} ${item.meta.badgeText} ${item.meta.badgeBorder}`}
                          >
                            {item.meta.tag}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">
                            {item.meta.label}
                          </h3>
                          <span className="text-[10px] text-slate-400 block">
                            {item.meta.dateRange}
                          </span>
                        </div>

                        {item.isLeaderTickets && (
                          <span
                            className="flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs shrink-0"
                            title="Promoción con mayor cantidad de entradas vendidas"
                          >
                            <Trophy className="w-3 h-3" />
                            Líder
                          </span>
                        )}
                      </div>

                      {/* Cantidad y Recaudado */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">Recaudación:</span>
                          <span className="font-display text-lg text-slate-900 font-bold">
                            S/ {item.revenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">Entradas vendidas:</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {item.ticketsSold} <span className="text-[11px] font-normal text-slate-400">entradas</span>
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-slate-400">Transacciones:</span>
                          <span className="text-[11px] font-medium text-slate-600">
                            {item.ordersCount} compras
                          </span>
                        </div>

                        {/* Barra de progreso de participación en entradas */}
                        <div className="mt-3 pt-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                item.isLeaderTickets ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${item.percentOfTotalTickets}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                            <span>{item.percentOfTotalTickets}% del volumen total</span>
                            {item.ticketsSold > 0 && (
                              <span>Prom: S/ {item.avgTicketPrice.toFixed(0)}/ent.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Monitor de Aforo en Vivo por Zonas */}
            <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl text-slate-900 tracking-wide flex items-center gap-2">
                    Monitor de Aforo por Zonas
                    <span className="text-xs font-body font-normal text-slate-500">
                      (Descontado en vivo de la web pública)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Auditorio del Colegio de Ingenieros de Ica · Capacidad: {stats.totalCap} asientos por función.
                  </p>
                </div>

                {/* Selector de Función */}
                <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-lg self-start flex-wrap gap-1">
                  {eventSettings.funciones.map((func) => (
                    <button
                      key={func}
                      type="button"
                      onClick={() => setSelectedFuncion(func)}
                      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                        selectedFuncion === func
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Función {func.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {zonasMonitor.map((z) => {
                  const meta = ZONAS_CONFIG[z.zonaKey];
                  return (
                    <div
                      key={z.zonaKey}
                      className={`p-4 border rounded-xl transition-all relative ${
                        z.isSoldOut
                          ? "border-red-200 bg-red-50/60"
                          : z.isLowStock
                          ? "border-amber-200 bg-amber-50/60"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs" style={{ backgroundColor: meta.color }} />
                          <span className="font-bold text-sm text-slate-900">{meta.label}</span>
                        </div>
                        {z.isSoldOut ? (
                          <span className="bg-red-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                            AGOTADO
                          </span>
                        ) : z.isLowStock ? (
                          <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm animate-pulse">
                            ÚLTIMOS {z.availableSeats}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">
                            Disponible
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-3xl font-bold font-display text-slate-900">{z.availableSeats}</span>
                          <span className="text-xs text-slate-500 ml-1 font-medium">disponibles</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {z.soldSeats} / {z.totalSeats} vendidos
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${z.percentSold}%`,
                            backgroundColor: z.isSoldOut ? "#dc2626" : meta.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                        <span>{z.percentSold}% ocupado</span>
                        <span>{meta.totalSeats} asientos totales</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. CRM: Registro Completo de Compradores (Sin botón de exportar excel) */}
            <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-slate-900 tracking-wide">
                    Registro de Compradores (CRM)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lista completa de clientes con entradas confirmadas ({reservations.length} compras registradas).
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start flex-wrap">
                  <button
                    type="button"
                    onClick={() => exportTicketsToExcel(filteredReservations)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider border border-slate-300 hover:border-emerald-400 rounded-md transition-all shadow-2xs cursor-pointer"
                    title="Exportar registros filtrados a Excel (.csv UTF-8 BOM)"
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
                      <option value="twoXone">Preventa 2x1</option>
                      <option value="threeXtwo">Preventa 3x2</option>
                      <option value="twentyPct">Preventa 20%</option>
                      <option value="regular">Precio Regular</option>
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
                      <option value="solo_ingresados">🟢 Ingresados</option>
                      <option value="solo_pendientes">⚪ Pendientes</option>
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
                            {r.etapaPromo === "twoXone" && (
                              <span className="text-[10px] text-amber-700 font-bold block">
                                ({r.cantidad} promo 2x1)
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
                            href={`https://wa.me/51${r.clienteTelefono.replace(/\D/g, "")}`}
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
                                <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-1.5 py-0.5 rounded-sm">
                                  #{r.ticketCode || r.id}
                                </span>
                                {r.notas && (
                                  <span className="bg-slate-100 text-[10px] text-slate-600 px-1.5 py-0.5 rounded-sm border border-slate-200">
                                    {r.notas}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{r.clienteTelefono}</span>
                              </div>
                              <a
                                href={`https://wa.me/51${r.clienteTelefono.replace(/\D/g, "")}`}
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
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 font-bold text-slate-800 rounded-md text-xs">
                                  {effectiveTickets} {effectiveTickets === 1 ? "asiento" : "asientos"}
                                </span>
                                {r.etapaPromo === "twoXone" && (
                                  <span className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                    ({r.cantidad} promo 2x1)
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
                                <div className="font-bold text-red-600 text-sm">S/ {r.totalPagado.toFixed(2)}</div>
                              )}
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {PROMOS_CONFIG[r.etapaPromo] ? (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                      PROMOS_CONFIG[r.etapaPromo].badgeBg
                                    } ${PROMOS_CONFIG[r.etapaPromo].badgeText} ${
                                      PROMOS_CONFIG[r.etapaPromo].badgeBorder
                                    }`}
                                  >
                                    {PROMOS_CONFIG[r.etapaPromo].tag}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                                    {r.etapaPromo}
                                  </span>
                                )}
                                {r.metodoPago && (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                      METODOS_PAGO_CONFIG[r.metodoPago]?.bg || "bg-slate-100"
                                    } ${
                                      METODOS_PAGO_CONFIG[r.metodoPago]?.text || "text-slate-700"
                                    } ${
                                      METODOS_PAGO_CONFIG[r.metodoPago]?.border || "border-slate-200"
                                    }`}
                                  >
                                    {METODOS_PAGO_CONFIG[r.metodoPago]?.label || r.metodoPago}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-slate-600 text-xs">
                              {r.vendedor}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              {r.asistio ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>INGRESADO</span>
                                  </span>
                                  {r.asistioAt && (
                                    <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
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
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
                                  title="Marcar ingreso en puerta"
                                >
                                  <UserCheck className="w-3 h-3 text-slate-500" />
                                  <span>Marcar Ingreso</span>
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
            </div>
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
                Jesucristo Rockstar · Confirmación WhatsApp
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
                          Se asignaron <strong>{lastRegistered.cantidad} asientos</strong> de{" "}
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
                              setPromo("twoXone");
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
                      {promo === "twoXone" ? "Cantidad de Promos 2x1 Compradas *" : "Número de Entradas a Descontar *"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formZoneAvail ? (promo === "twoXone" ? Math.max(1, Math.floor(formZoneAvail.availableSeats / 2)) : formZoneAvail.availableSeats) : 50}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />

                    {promo === "twoXone" && (
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Promo 2x1: {cantidad} paquete(s) = {cantidad * 2} asientos a entregar</span>
                        </div>
                        <p className="mt-1 text-[11px] text-amber-800">
                          📌 Si el cliente pagó por <strong>2 asientos</strong>, coloca <strong>Cantidad = 1</strong> (1 promo 2x1).
                          <br />
                          📌 Si pagó por <strong>4 asientos</strong>, coloca <strong>Cantidad = 2</strong> (2 promos 2x1).
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
                        <option value="twoXone">Preventa 2x1 (Hoy)</option>
                        <option value="threeXtwo">Preventa 3x2</option>
                        <option value="twentyPct">Preventa 20%</option>
                        <option value="regular">Precio Regular</option>
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
                  disabled={!formZona || isSubmitting}
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
                      ? `Confirmar Pase de Cortesía (${cantidad} Asientos · S/ 0.00)`
                      : formZona
                      ? promo === "twoXone"
                        ? `Confirmar Venta 2x1 y Descontar ${cantidad * 2} Asientos (${cantidad} promo = ${cantidad * 2} entradas)`
                        : `Confirmar Venta y Descontar ${cantidad} Asientos (${ZONAS_CONFIG[formZona]?.label})`
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
            {/* Cabecera del Módulo de Asistencia */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Control de Acceso en Puerta · Jesucristo Rockstar</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-slate-900 tracking-wide font-bold">
                  Validador de Boletos & Lista de Asistencia
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Registra la llegada de los asistentes en el Auditorio del Colegio de Ingenieros. Si un asistente intenta ingresar con un boleto ya presentado, el sistema lo bloqueará automáticamente para impedir el reingreso duplicado.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => exportTicketsToExcel(reservations, { onlyAttended: true })}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 hover:border-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer"
                  title="Descargar solo los asistentes ingresados a Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Exportar Asistentes ({stats.totalAttendedTickets})</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportTicketsToExcel(reservations)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer"
                  title="Descargar base completa de boletos a Excel"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Exportar Todo</span>
                </button>
              </div>
            </div>

            {/* Tarjetas de Aforo y Asistencia en Vivo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-5 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="truncate">Asistentes en Sala</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-200/70 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-emerald-800" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-emerald-950 font-bold tracking-tight">
                  {stats.totalAttendedTickets}{" "}
                  <span className="text-sm sm:text-base text-emerald-700 font-normal font-body">/ {stats.totalTickets}</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${stats.percentAttendedTotal}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-emerald-800 mt-1.5 font-bold">
                  <span>{stats.percentAttendedTotal}% en sala</span>
                  <span>{Math.max(0, stats.totalTickets - stats.totalAttendedTickets)} pendientes</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-3.5 sm:p-5 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="truncate">Función 4:00 PM</span>
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-slate-900 font-bold tracking-tight">
                  {stats.attended4pm}{" "}
                  <span className="text-sm sm:text-base text-slate-400 font-normal font-body">/ {stats.tickets4pm}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${stats.percentAttended4pm}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{stats.percentAttended4pm}% ingresados</span>
                  <span>{Math.max(0, stats.tickets4pm - stats.attended4pm)} faltan</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-3.5 sm:p-5 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="truncate">Función 7:00 PM</span>
                  <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-slate-900 font-bold tracking-tight">
                  {stats.attended7pm}{" "}
                  <span className="text-sm sm:text-base text-slate-400 font-normal font-body">/ {stats.tickets7pm}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full transition-all"
                    style={{ width: `${stats.percentAttended7pm}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{stats.percentAttended7pm}% ingresados</span>
                  <span>{Math.max(0, stats.tickets7pm - stats.attended7pm)} faltan</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-3.5 sm:p-5 rounded-xl shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="truncate">Órdenes / Grupos</span>
                  <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-slate-900 font-bold tracking-tight">
                  {stats.attendedOrdersCount}{" "}
                  <span className="text-sm sm:text-base text-slate-400 font-normal font-body">
                    / {reservations.filter((r) => r.estado !== "anulado").length}
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-2 font-medium">
                  Boletos / compras validadas en puerta
                </div>
              </div>
            </div>

            {/* SECCIÓN VALIDADOR RÁPIDO EN PUERTA (ESCANEAR / DIGITAR) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-4 sm:p-8 border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl text-white font-bold tracking-wide">
                      Escanear o Validar Entrada
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ingresa el código oficial (ej. <strong className="text-white">JR-4PM-SUP-001</strong>), el <strong className="text-white">DNI</strong> o el nombre.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Detección de duplicados activa</span>
                </div>
              </div>

              {/* Formulario de Escaneo */}
              <form onSubmit={handleValidateScan} className="flex flex-col sm:flex-row gap-3">
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
                        {scanAlert.ticket?.funcion} ({scanAlert.ticket ? getEffectiveTicketsCount(scanAlert.ticket) : 0} pers.{scanAlert.ticket?.etapaPromo === "twoXone" ? " · 2x1" : ""}) · {ZONAS_CONFIG[scanAlert.ticket?.zonaKey || ""]?.label || scanAlert.ticket?.zonaKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-red-800/80 text-xs">
                    <span className="text-red-300">
                      ⚠️ Se recomienda verificar el DNI físico del portador para comprobar si es el titular original o una captura duplicada.
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
              {scanAlert && scanAlert.type === "success" && scannedTicket && !scannedTicket.asistio && (() => {
                const effectiveCount = getEffectiveTicketsCount(scannedTicket);
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
                        {scannedTicket.etapaPromo === "twoXone" && (
                          <span className="text-[11px] text-emerald-200 block font-normal mt-0.5">
                            ({scannedTicket.cantidad} compras en promo 2x1 = {effectiveCount} entradas)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón Gigante de Confirmación de Ingreso */}
                    <button
                      type="button"
                      onClick={() => handleConfirmAttendance(scannedTicket)}
                      disabled={isMarkingAttendance}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-wider text-base rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-6 h-6 text-slate-950" />
                      <span>
                        {isMarkingAttendance
                          ? "Registrando Ingreso en el Sistema..."
                          : `✅ CONFIRMAR INGRESO · ADMITIR A ${effectiveCount} PERSONA(S)`}
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* CASO 3: 🎉 INGRESO RECIÉN CONFIRMADO */}
              {scanAlert && scanAlert.type === "success" && scannedTicket?.asistio && (
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
                        {scannedTicket.clienteNombre} · {getEffectiveTicketsCount(scannedTicket)} persona(s) {scannedTicket.etapaPromo === "twoXone" ? "(promo 2x1) " : ""}en {ZONAS_CONFIG[scannedTicket.zonaKey]?.label} ({scannedTicket.funcion}).
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
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80 overflow-x-auto no-scrollbar whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setFiltroAsistenciaTab("todos")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer shrink-0 ${
                      filtroAsistenciaTab === "todos"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Todos ({reservations.filter((r) => r.estado !== "anulado").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroAsistenciaTab("asistidos")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer shrink-0 ${
                      filtroAsistenciaTab === "asistidos"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-emerald-700"
                    }`}
                  >
                    🟢 En Sala ({stats.totalAttendedTickets})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroAsistenciaTab("pendientes")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer shrink-0 ${
                      filtroAsistenciaTab === "pendientes"
                        ? "bg-slate-800 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⚪ Pendientes ({Math.max(0, stats.totalTickets - stats.totalAttendedTickets)})
                  </button>
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
                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-xl border transition-all ${
                          r.asistio
                            ? "bg-emerald-50/40 border-emerald-300/80 shadow-2xs"
                            : "bg-white border-slate-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                            #{r.ticketCode || r.id}
                          </span>
                          {r.asistio ? (
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
                            {r.etapaPromo === "twoXone" && (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                                Promo 2x1 ({r.cantidad})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Vendedor: <strong className="text-slate-700">{r.vendedor || "Boletería"}</strong></span>
                        </div>

                        <div className="mt-3">
                          {r.asistio ? (
                            <button
                              type="button"
                              onClick={() => setAttendanceRevertTarget(r)}
                              className="w-full py-2 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Desmarcar Asistencia (Error)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmAttendance(r)}
                              disabled={isMarkingAttendance}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Marcar Ingreso ({effectiveCount} pers.)</span>
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
                        return (
                          <tr
                            key={r.id}
                            className={`border-b border-slate-100 last:border-0 transition-colors ${
                              r.asistio ? "bg-emerald-50/30 hover:bg-emerald-50/60" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              {r.asistio && r.asistioAt ? (
                                <div className="font-mono text-emerald-900 font-bold text-xs">
                                  {new Date(r.asistioAt).toLocaleTimeString("es-PE", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium italic text-[11px]">
                                  Pendiente
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
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
                              <div className="inline-block bg-slate-100 border border-slate-200 px-2.5 py-1 font-bold text-slate-800 rounded-md text-xs">
                                {effectiveCount} pers.
                              </div>
                              {r.etapaPromo === "twoXone" && (
                                <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                                  Promo 2x1 ({r.cantidad})
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-slate-600 text-xs">
                              {r.vendedor}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              {r.asistio ? (
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
                              {r.asistio ? (
                                <button
                                  type="button"
                                  onClick={() => setAttendanceRevertTarget(r)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
                                  title="Desmarcar asistencia de este boleto"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Desmarcar</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmAttendance(r)}
                                  disabled={isMarkingAttendance}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-2xs cursor-pointer"
                                  title="Confirmar ingreso de este boleto"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Marcar Ingreso</span>
                                </button>
                              )}
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Control Maestro del Evento
                </div>
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
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                💡 <strong>Regla de cálculo:</strong> Recuerda que el precio oficial por entrada es <strong>S/ 80.00</strong>.
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-blue-800 text-[11px]">
                  <li><strong>Preventa 2x1:</strong> El cliente paga por 1 boleto (ej: S/ 80.00) y recibe 2 asientos autorizados.</li>
                  <li><strong>Preventa 3x2:</strong> El cliente paga por 2 boletos (ej: S/ 160.00) y recibe 3 asientos autorizados.</li>
                  <li><strong>Preventa 20% Desc:</strong> Cada asiento cuesta S/ 64.00 (20% de descuento sobre S/ 80).</li>
                  <li><strong>Tarifa Regular:</strong> Cada asiento cuesta S/ 80.00.</li>
                </ul>
              </div>

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
                      <option value="twoXone">Preventa 2x1 (Paga 1, entran 2)</option>
                      <option value="threeXtwo">Preventa 3x2 (Paga 2, entran 3)</option>
                      <option value="twentyPct">Preventa -20% Desc</option>
                      <option value="regular">Tarifa Regular</option>
                      <option value="cortesia">Pase de Cortesía (S/ 0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cantidad Comprada
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editCantidad}
                      onChange={(e) => setEditCantidad(Math.max(1, Number(e.target.value) || 1))}
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
              ⚠️ El boleto volverá al estado <strong>PENDIENTE DE INGRESO</strong> y podrá ser canjeado nuevamente.
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
