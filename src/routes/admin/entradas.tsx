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
} from "lucide-react";
import {
  getStoredReservations,
  saveReservation,
  deleteReservation,
  syncReservationsWithNeon,
  getStoredHaroldAuth,
  setStoredHaroldAuth,
  isHaroldAuthenticated,
  onCRMUpdate,
  getZoneAvailability,
  getCRMStats,
  getPromosBreakdown,
  buildWhatsAppReservationMessage,
  ZONAS_CONFIG,
  METODOS_PAGO_CONFIG,
  PROMOS_CONFIG,
  type TicketReservation,
  type MetodoPago,
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
  superstar: { twoXone: 80, threeXtwo: 160, twentyPct: 64, regular: 80 },
  cortesia: { twoXone: 0, threeXtwo: 0, twentyPct: 0, regular: 0 },
  getsemani: { twoXone: 60, threeXtwo: 120, twentyPct: 48, regular: 60 },
  hosanna: { twoXone: 40, threeXtwo: 80, twentyPct: 32, regular: 40 },
  pueblo: { twoXone: 20, threeXtwo: 40, twentyPct: 16, regular: 20 },
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

  const [activeTab, setActiveTab] = useState<"dashboard" | "registro">("dashboard");
  const [reservations, setReservations] = useState<TicketReservation[]>(() => getStoredReservations());
  const [selectedFuncion, setSelectedFuncion] = useState<"4:00 pm" | "7:00 pm">("4:00 pm");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFuncion, setFiltroFuncion] = useState<string>("todas");
  const [filtroZona, setFiltroZona] = useState<string>("todas");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("todos");
  const [filtroPromo, setFiltroPromo] = useState<string>("todas");

  // Form state
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [formFuncion, setFormFuncion] = useState<"4:00 pm" | "7:00 pm">("4:00 pm");
  // La zona inicia en null para que RECIÉN al seleccionarla se muestre el aforo disponible
  const [formZona, setFormZona] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(2);
  const [promo, setPromo] = useState<"twoXone" | "threeXtwo" | "twentyPct" | "regular">("twoXone");
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
  };

  useEffect(() => {
    reload();
    if (auth) {
      syncReservationsWithNeon().then((res) => {
        if (res) setReservations(res);
      });
    }

    const unsubscribe = onCRMUpdate(reload);
    // Auto sync cada 15 segundos para mantener aforo en vivo
    const interval = setInterval(() => {
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
      const synced = await syncReservationsWithNeon();
      setReservations(synced);
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
      const synced = await syncReservationsWithNeon();
      setReservations(synced);
    } finally {
      setIsSyncing(false);
    }
  };

  // Stats
  const stats = useMemo(() => getCRMStats(reservations), [reservations]);
  const promosBreakdown = useMemo(() => getPromosBreakdown(reservations), [reservations]);

  // Disponibilidad de la función seleccionada en el monitor
  const zonasMonitor = useMemo(() => {
    return Object.keys(ZONAS_CONFIG).map((key) =>
      getZoneAvailability(reservations, selectedFuncion, key)
    );
  }, [reservations, selectedFuncion]);

  // Disponibilidad en vivo de la zona seleccionada en el formulario según el horario elegido
  const formZoneAvail = useMemo(() => {
    if (!formZona) return null;
    return getZoneAvailability(reservations, formFuncion, formZona);
  }, [reservations, formFuncion, formZona]);

  // Precio sugerido en el formulario
  const precioSugerido = useMemo(() => {
    if (!formZona) return 0;
    const base = PRECIOS_POR_DEFECTO[formZona]?.[promo] || 80;
    if (promo === "twoXone") {
      const grupos = Math.ceil(cantidad / 2);
      return grupos * base;
    }
    if (promo === "threeXtwo") {
      const grupos = Math.ceil(cantidad / 3);
      return grupos * base;
    }
    return cantidad * base;
  }, [formZona, promo, cantidad]);

  const [totalManual, setTotalManual] = useState<number | null>(null);
  const totalFinal = totalManual !== null ? totalManual : precioSugerido;

  // Manejar creación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !formZona || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newRes = await saveReservation({
        clienteNombre: nombre.trim(),
        clienteTelefono: telefono.trim() || "No registrado",
        clienteDni: dni.trim() || undefined,
        funcion: formFuncion,
        zonaKey: formZona as any,
        cantidad: Number(cantidad) || 1,
        etapaPromo: promo,
        totalPagado: Number(totalFinal) || 0,
        metodoPago,
        vendedor: vendedor.trim() || "Boletería",
        estado: "confirmado",
        notas: notas.trim() || undefined,
      });

      setLastRegistered(newRes);
      setNombre("");
      setTelefono("");
      setDni("");
      setVendedor("");
      setNotas("");
      setFormZona(null); // Resetea la zona para el siguiente registro
      setTotalManual(null);
      setReservations(getStoredReservations());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado de reservas para la tabla
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchSearch =
        r.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clienteTelefono.includes(searchTerm) ||
        (r.clienteDni && r.clienteDni.includes(searchTerm)) ||
        (r.metodoPago && r.metodoPago.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.vendedor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFuncion = filtroFuncion === "todas" || r.funcion === filtroFuncion;
      const matchZona = filtroZona === "todas" || r.zonaKey === filtroZona;
      const matchMetodo = filtroMetodo === "todos" || r.metodoPago === filtroMetodo;
      const matchPromo = filtroPromo === "todas" || r.etapaPromo === filtroPromo;

      return matchSearch && matchFuncion && matchZona && matchMetodo && matchPromo;
    });
  }, [reservations, searchTerm, filtroFuncion, filtroZona, filtroMetodo, filtroPromo]);

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
      <header className="border-b border-slate-200 sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/entradas" className="shrink-0 group">
              <img
                src="/logo-chaplin.png"
                alt="Chaplin Grupo Cultural"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm">
                  CRM · Jesucristo Rockstar
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sistema en Vivo · Tiempo Real
                </span>
              </div>
              <h1 className="font-display text-slate-900 text-2xl tracking-wide leading-tight mt-0.5">
                Panel de Control de Harold
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        {/* NAVEGACIÓN PRINCIPAL: 1. DASHBOARD & CRM vs 2. REGISTRAR VENTA */}
        <div className="border-t border-slate-200 bg-slate-100/70">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex gap-2 py-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dashboard");
                  setLastRegistered(null);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md border transition-all ${
                  activeTab === "dashboard"
                    ? "bg-white text-slate-900 border-slate-300 shadow-sm"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === "dashboard" ? "text-red-600" : "text-slate-500"}`} />
                <span>1. Dashboard & CRM</span>
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-full">
                  {reservations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("registro");
                  setLastRegistered(null);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md border transition-all ${
                  activeTab === "registro"
                    ? "bg-white text-slate-900 border-slate-300 shadow-sm"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <UserPlus className={`w-4 h-4 ${activeTab === "registro" ? "text-red-600" : "text-slate-500"}`} />
                <span>2. Registrar Nueva Venta</span>
              </button>
            </div>

            {activeTab === "dashboard" && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("registro");
                  setLastRegistered(null);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Registrar Venta</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ==================================================================== */}
        {/* PARTE 1: DASHBOARD CON MÉTRICAS, AFORO EN VIVO Y REGISTRO DE COMPRADORES */}
        {/* ==================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* 1. Tarjetas de Métricas Globales (KPIs) Separadas por Función */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Recaudación Total</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="font-display text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
                  S/ {stats.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-medium flex-wrap">
                  <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    4pm: S/ {stats.revenue4pm.toFixed(0)}
                  </span>
                  <span className="text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    7pm: S/ {stats.revenue7pm.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* ENTRADAS VENDIDAS SEPARADAS POR FUNCIÓN (Sin mezclar en 512) */}
              <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Entradas por Función</span>
                  <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      4:00 PM
                    </span>
                    <div className="font-display text-2xl text-slate-900 font-bold leading-tight mt-0.5">
                      {stats.tickets4pm}{" "}
                      <span className="text-xs text-slate-400 font-normal font-body">/ {stats.totalCap}</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                      {stats.percent4pm}% ocupado
                    </span>
                  </div>

                  <div className="p-2 bg-sky-50/70 border border-sky-200/80 rounded-lg">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                      7:00 PM
                    </span>
                    <div className="font-display text-2xl text-slate-900 font-bold leading-tight mt-0.5">
                      {stats.tickets7pm}{" "}
                      <span className="text-xs text-slate-400 font-normal font-body">/ {stats.totalCap}</span>
                    </div>
                    <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">
                      {stats.percent7pm}% ocupado
                    </span>
                  </div>
                </div>
                <span className="block text-[11px] text-slate-500 mt-2 font-medium">
                  Total acumulado: <strong className="text-slate-800 font-bold">{stats.totalTickets} entradas</strong>
                </span>
              </div>

              <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Función 4:00 PM</span>
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="font-display text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
                    {stats.tickets4pm}{" "}
                    <span className="text-base text-slate-400 font-normal font-body">/ {stats.totalCap}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700">
                    S/ {stats.revenue4pm.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 mt-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${stats.percent4pm}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{stats.percent4pm}% del aforo</span>
                  <span>{stats.totalCap - stats.tickets4pm} libres</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Función 7:00 PM</span>
                  <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="font-display text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
                    {stats.tickets7pm}{" "}
                    <span className="text-base text-slate-400 font-normal font-body">/ {stats.totalCap}</span>
                  </div>
                  <span className="text-xs font-bold text-sky-700">
                    S/ {stats.revenue7pm.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 mt-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full transition-all" style={{ width: `${stats.percent7pm}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{stats.percent7pm}% del aforo</span>
                  <span>{stats.totalCap - stats.tickets7pm} libres</span>
                </div>
              </div>
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
                <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-lg self-start">
                  <button
                    type="button"
                    onClick={() => setSelectedFuncion("4:00 pm")}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                      selectedFuncion === "4:00 pm"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Función 4:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFuncion("7:00 pm")}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                      selectedFuncion === "7:00 pm"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Función 7:00 PM
                  </button>
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

                <div className="flex items-center gap-3 self-start">
                  <button
                    type="button"
                    onClick={() => setActiveTab("registro")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 rounded-md transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Registrar Nueva Venta
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, DNI, método..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <select
                    value={filtroFuncion}
                    onChange={(e) => setFiltroFuncion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                  >
                    <option value="todas">Todas las funciones</option>
                    <option value="4:00 pm">Solo Función 4:00 PM</option>
                    <option value="7:00 pm">Solo Función 7:00 PM</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filtroZona}
                    onChange={(e) => setFiltroZona(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                  >
                    <option value="todas">Todas las zonas</option>
                    <option value="superstar">Superstar</option>
                    <option value="cortesia">Cortesía</option>
                    <option value="getsemani">Getsemaní</option>
                    <option value="hosanna">Hosanna</option>
                    <option value="pueblo">Pueblo</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filtroPromo}
                    onChange={(e) => setFiltroPromo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                  >
                    <option value="todas">Todas las promociones</option>
                    <option value="twoXone">Preventa 2x1</option>
                    <option value="threeXtwo">Preventa 3x2</option>
                    <option value="twentyPct">Preventa 20% dto.</option>
                    <option value="regular">Precio Regular</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filtroMetodo}
                    onChange={(e) => setFiltroMetodo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-red-600"
                  >
                    <option value="todos">Todos los métodos</option>
                    <option value="yape">🟣 Solo Yape</option>
                    <option value="plin">🔵 Solo Plin</option>
                    <option value="transferencia">🏦 Solo Transferencia</option>
                    <option value="efectivo">💵 Solo Efectivo</option>
                  </select>
                </div>
              </div>

              {/* Tabla Cómoda y Espaciosa */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Contacto WhatsApp</th>
                      <th className="px-4 py-3">Función & Zona</th>
                      <th className="px-4 py-3 text-center">Entradas</th>
                      <th className="px-4 py-3">Total & Método</th>
                      <th className="px-4 py-3">Vendedor</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                          No se encontraron registros con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((r) => {
                        const meta = ZONAS_CONFIG[r.zonaKey];
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
                              <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 font-bold text-slate-800 rounded-md text-xs">
                                {r.cantidad}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="font-bold text-red-600 text-sm">S/ {r.totalPagado.toFixed(2)}</div>
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

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSendWhatsApp(r)}
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
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
                                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
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
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        `¿Eliminar la reserva de ${r.clienteNombre}? Se devolverán ${r.cantidad} asientos al aforo disponible de ${meta?.label}.`
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
            {lastRegistered && (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                        <span>Ticket #{lastRegistered.ticketCode || lastRegistered.id}</span>
                      </div>
                      <h3 className="font-bold text-lg text-emerald-950">
                        ¡Venta registrada con éxito para {lastRegistered.clienteNombre}!
                      </h3>
                      <p className="text-xs text-emerald-800 mt-1">
                        Se descontaron <strong>{lastRegistered.cantidad} asientos</strong> de{" "}
                        <strong>{ZONAS_CONFIG[lastRegistered.zonaKey]?.label}</strong> para la función de las{" "}
                        <strong>{lastRegistered.funcion}</strong>. Total: <strong>S/ {lastRegistered.totalPagado.toFixed(2)}</strong> vía{" "}
                        <strong>{METODOS_PAGO_CONFIG[lastRegistered.metodoPago || "yape"]?.label || "Yape"}</strong>.
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/ticket/${lastRegistered.ticketCode || lastRegistered.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-emerald-300 hover:border-emerald-400 text-emerald-800 text-xs font-bold rounded-lg transition-colors shadow-2xs shrink-0"
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

                    <button
                      type="button"
                      onClick={() => {
                        const msg = buildWhatsAppReservationMessage(lastRegistered);
                        navigator.clipboard.writeText(msg);
                        setCopiedId("msg-" + lastRegistered.id);
                        setTimeout(() => setCopiedId(null), 2500);
                      }}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copiedId === "msg-" + lastRegistered.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === "msg-" + lastRegistered.id ? "¡Mensaje Copiado!" : "Copiar Texto Completo"}</span>
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
                    className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 rounded-md transition-colors shadow-2xs"
                  >
                    + Registrar Otra Venta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("dashboard");
                      setLastRegistered(null);
                    }}
                    className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 rounded-md transition-colors"
                  >
                    Ver en el Dashboard
                  </button>
                </div>
              </div>
            )}

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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormFuncion("4:00 pm")}
                      className={`py-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        formFuncion === "4:00 pm"
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Función 4:00 PM</span>
                      {formFuncion === "4:00 pm" && <Check className="w-4 h-4 text-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormFuncion("7:00 pm")}
                      className={`py-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        formFuncion === "7:00 pm"
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Función 7:00 PM</span>
                      {formFuncion === "7:00 pm" && <Check className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                {/* 2. Paso 2: Selección de Zona */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-2">
                    2. Selecciona la Zona Comprada *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {Object.values(ZONAS_CONFIG).map((meta) => {
                      const avail = getZoneAvailability(reservations, formFuncion, meta.key);
                      const isSelected = formZona === meta.key;
                      return (
                        <button
                          key={meta.key}
                          type="button"
                          onClick={() => setFormZona(meta.key)}
                          className={`p-3 rounded-lg border text-left transition-all relative ${
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
                        style={{ backgroundColor: ZONAS_CONFIG[formZona]?.color }}
                      />
                      <div>
                        <div className="font-bold text-sm text-white">
                          {ZONAS_CONFIG[formZona]?.label} · {formFuncion}
                        </div>
                        <span className="text-slate-400 text-xs">
                          Auditorio del Colegio de Ingenieros
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-emerald-400 text-base">
                        {formZoneAvail.availableSeats} asientos disponibles
                      </div>
                      <span className="text-slate-400 text-xs">
                        de {formZoneAvail.totalSeats} totales
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Datos del Cliente */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                    Nombre Completo del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rosa Alvarado"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Celular / WhatsApp *
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
                      Número de Entradas a Descontar
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formZoneAvail ? formZoneAvail.availableSeats : 50}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Etapa / Promoción
                    </label>
                    <select
                      value={promo}
                      onChange={(e) => setPromo(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-red-600 font-medium"
                    >
                      <option value="twoXone">Preventa 2x1 (Hoy)</option>
                      <option value="threeXtwo">Preventa 3x2</option>
                      <option value="twentyPct">Preventa 20%</option>
                      <option value="regular">Precio Regular</option>
                    </select>
                  </div>
                </div>

                {/* 5. Total Pagado y Método de Pago (Desplegable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Total Pagado por el Cliente (S/) *
                    </label>
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

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                      Método de Pago *
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="yape">🟣 Yape</option>
                      <option value="plin">🔵 Plin</option>
                      <option value="transferencia">🏦 Transferencia Bancaria</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Medio por el cual el cliente realizó el abono.
                    </span>
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
                      ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? "Registrando Venta en el Sistema..."
                      : formZona
                      ? `Confirmar Venta y Descontar ${cantidad} Asientos (${ZONAS_CONFIG[formZona]?.label})`
                      : "Selecciona una zona arriba para continuar"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
