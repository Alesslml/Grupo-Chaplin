import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Lock,
  RefreshCw,
  Users,
  TrendingUp,
  Smile,
  Clock,
  ChevronDown,
  Search,
  TrendingDown,
  Minus,
  Repeat2,
  Mail,
} from "lucide-react";
import {
  getSurveyStats,
  getSurveyResponses,
  EVENT_LABEL,
  type SurveyStats,
  type SurveyResponseRow,
} from "@/lib/survey";
import { ThemeToggle, useSurveyTheme } from "@/components/chaplin/ThemeToggle";

export const Route = createFileRoute("/admin/encuestas")({
  head: () => ({
    meta: [
      { title: "Panel de encuestas · Chaplin Grupo Cultural" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEncuestasPage,
});

const STORAGE_KEY = "chaplin_survey_admin_pw";

const overallLabels: Record<string, string> = {
  muy_buena: "Muy buena",
  buena: "Buena",
  regular: "Regular",
  mala: "Mala",
};
const likedLabels: Record<string, string> = {
  actuacion: "Actuación",
  musica: "Música",
  baile: "Baile",
  vestuario: "Vestuario",
  escenografia: "Escenografía",
  historia: "Historia",
};
const discoveryLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  afiche: "Afiche",
  amigos: "Amigos/Familia",
  auspiciadores: "Auspiciadores",
  otro: "Otro",
};
const venueLabels: Record<string, string> = {
  excelente: "Excelente",
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
};
const companionLabels: Record<string, string> = {
  familia: "Familia",
  amigos: "Amigos",
  pareja: "Pareja",
  solo: "Solo/a",
  otro: "Otro",
};
const characterLabels: Record<string, string> = {
  buster_moon: "Buster Moon (Koala)",
  rosita: "Rosita (Cerda)",
  ash: "Ash (Puercoespín)",
  johnny: "Johnny (Gorila)",
  meena: "Meena (Elefanta)",
  mike: "Mike (Ratón)",
  gunter: "Gunter (Cerdo)",
};

/* ─── Encabezado de sección con explicación ───────────────────────────────── */
function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-[var(--t-fg)] text-2xl mb-2">{title}</h2>
      <p className="font-body text-[var(--t-fg-50)] text-[13px] leading-relaxed max-w-xl">{hint}</p>
    </div>
  );
}

/* ─── Estado (bueno/neutral/atención) ─────────────────────────────────────── */
type Status = "good" | "neutral" | "attention";
function StatusBadge({ status, label }: { status: Status; label: string }) {
  const Icon = status === "good" ? TrendingUp : status === "attention" ? TrendingDown : Minus;
  const color = status === "attention" ? "text-rojo" : "text-[var(--t-fg-60)]";
  return (
    <span className={`inline-flex items-center gap-1.5 font-body text-[11px] uppercase tracking-[0.15em] ${color}`}>
      <Icon size={12} strokeWidth={2.5} /> {label}
    </span>
  );
}

/* ─── Barra de ranking (conteo + %) ────────────────────────────────────────── */
function RankedBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-[var(--t-fg-80)] text-[13px]">{label}</span>
        <span className="font-body text-[var(--t-fg-50)] text-[12px] tabular-nums">
          {value} <span className="text-[var(--t-fg-40)]">({pct}%)</span>
        </span>
      </div>
      <div className="h-5 bg-[var(--t-track)] w-full">
        <div className="h-full bg-rojo transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Barra de calificación (0-5) ─────────────────────────────────────────── */
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-[var(--t-fg-80)] text-[13px]">{label}</span>
        <span className="font-display text-rojo text-lg leading-none">{value.toFixed(1)}</span>
      </div>
      <div className="h-5 bg-[var(--t-track)] w-full">
        <div className="h-full bg-rojo transition-all duration-700" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

/* ─── Tile de estadística con explicación y estado ────────────────────────── */
function StatTile({
  icon: Icon,
  label,
  hint,
  value,
  status,
  statusLabel,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  hint: string;
  value: string;
  status?: Status;
  statusLabel?: string;
}) {
  return (
    <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8">
      <div className="flex items-start justify-between mb-4">
        <Icon className="text-rojo" size={24} strokeWidth={1.5} />
        {status && statusLabel && <StatusBadge status={status} label={statusLabel} />}
      </div>
      <p className="font-display text-[var(--t-fg)] text-4xl md:text-5xl leading-none mb-2">{value}</p>
      <p className="font-body text-[var(--t-fg-70)] text-[11px] uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="font-body text-[var(--t-fg-40)] text-[12px] leading-relaxed">{hint}</p>
    </div>
  );
}

function statusFor(pct: number): Status {
  if (pct >= 80) return "good";
  if (pct >= 50) return "neutral";
  return "attention";
}
function npsStatus(score: number): { status: Status; label: string } {
  if (score >= 50) return { status: "good", label: "Excelente" };
  if (score >= 0) return { status: "neutral", label: "Aceptable" };
  return { status: "attention", label: "Necesita atención" };
}

/* ─── Fila de detalle (CRM) ───────────────────────────────────────────────── */
function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-body text-[var(--t-fg-40)] text-[10px] uppercase tracking-[0.2em] mb-0.5">{label}</p>
      <p className="font-body text-[var(--t-fg-80)] text-sm">{value || "—"}</p>
    </div>
  );
}

/* ─── Card de respuesta individual (CRM) ──────────────────────────────────── */
function ResponseCard({ r }: { r: SurveyResponseRow }) {
  const [open, setOpen] = useState(false);
  const date = new Date(r.createdAt).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-[var(--t-card)] border border-[var(--t-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0">
          <p className="font-display text-[var(--t-fg)] text-lg leading-tight truncate">
            {r.fullName || "Sin nombre"}
          </p>
          <p className="font-body text-[var(--t-fg-50)] text-[12px] truncate">
            {[r.phone, r.email].filter(Boolean).join(" · ") || "Sin datos de contacto"} · {date}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {r.wantsNewsletter && (
            <Mail size={14} className="text-rojo" aria-label="Quiere recibir novedades" />
          )}
          {r.overallRating && (
            <span className="hidden sm:inline font-body text-[11px] uppercase tracking-[0.15em] text-[var(--t-fg-60)]">
              {overallLabels[r.overallRating]}
            </span>
          )}
          {r.npsScore !== null && (
            <span className="font-display text-rojo text-xl leading-none" title="Puntaje NPS">
              {r.npsScore}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-[var(--t-fg-50)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-6 border-t border-[var(--t-border)] pt-5 grid sm:grid-cols-3 gap-x-6 gap-y-4">
          <DetailRow label="Nombre completo" value={r.fullName} />
          <DetailRow label="Celular" value={r.phone} />
          <DetailRow label="Correo" value={r.email} />
          <DetailRow label="Edad" value={r.ageRange} />
          <DetailRow label="Vino con" value={r.companion ? companionLabels[r.companion] : null} />
          <DetailRow label="Calificación general" value={r.overallRating ? overallLabels[r.overallRating] : null} />
          <DetailRow label="Actuación" value={r.ratingActuacion != null ? `${r.ratingActuacion}/5` : null} />
          <DetailRow label="Dirección" value={r.ratingDireccion != null ? `${r.ratingDireccion}/5` : null} />
          <DetailRow label="Música en vivo" value={r.ratingMusica != null ? `${r.ratingMusica}/5` : null} />
          <DetailRow label="Coreografías" value={r.ratingCoreografia != null ? `${r.ratingCoreografia}/5` : null} />
          <DetailRow label="Vestuario" value={r.ratingVestuario != null ? `${r.ratingVestuario}/5` : null} />
          <DetailRow label="Iluminación" value={r.ratingIluminacion != null ? `${r.ratingIluminacion}/5` : null} />
          <DetailRow
            label="Le gustó"
            value={r.likedMost.length ? r.likedMost.map((l) => likedLabels[l] ?? l).join(", ") : null}
          />
          <DetailRow
            label="Personaje favorito"
            value={r.favoriteCharacter ? characterLabels[r.favoriteCharacter] ?? r.favoriteCharacter : null}
          />
          <DetailRow
            label="Cómo se enteró"
            value={r.discoveryChannels.length ? r.discoveryChannels.map((c) => discoveryLabels[c] ?? c).join(", ") : null}
          />
          <DetailRow label="Lugar" value={r.venueRating ? venueLabels[r.venueRating] : null} />
          <DetailRow label="Horario adecuado" value={r.scheduleOk === null ? null : r.scheduleOk ? "Sí" : "No"} />
          {r.schedulePreference && <DetailRow label="Horario preferido" value={r.schedulePreference} />}
          <DetailRow label="NPS" value={r.npsScore != null ? `${r.npsScore}/10` : null} />
          <DetailRow
            label="Probabilidad de volver"
            value={r.returnLikelihood != null ? `${r.returnLikelihood}/10` : null}
          />
          <DetailRow
            label="Quiere novedades"
            value={r.wantsNewsletter === null ? null : r.wantsNewsletter ? "Sí" : "No"}
          />
          {r.favoriteMoment && (
            <div className="sm:col-span-3">
              <DetailRow label="Escena o canción favorita" value={r.favoriteMoment} />
            </div>
          )}
          {r.improvementComment && (
            <div className="sm:col-span-3">
              <DetailRow label="Comentario / sugerencia" value={r.improvementComment} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Página ──────────────────────────────────────────────────────────────── */
function AdminEncuestasPage() {
  const [theme, toggleTheme] = useSurveyTheme();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState<string | null>(null);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [responses, setResponses] = useState<SurveyResponseRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [gateError, setGateError] = useState("");
  const [search, setSearch] = useState("");

  const load = async (pw: string) => {
    setLoading(true);
    setGateError("");
    try {
      const [statsData, responsesData] = await Promise.all([
        getSurveyStats({ data: { password: pw } }),
        getSurveyResponses({ data: { password: pw } }),
      ]);
      setStats(statsData);
      setResponses(responsesData);
      setAuthed(pw);
      localStorage.setItem(STORAGE_KEY, pw);
    } catch {
      setGateError("Contraseña incorrecta.");
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) load(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <div
        data-survey-theme={theme}
        className="min-h-screen bg-[var(--t-bg)] grain flex items-center justify-center px-6 relative"
      >
        <div className="absolute top-6 right-6">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          className="max-w-sm w-full text-center"
        >
          <img
            src="/logo-chaplin.png"
            alt="Chaplin Grupo Cultural"
            className="h-14 w-auto mx-auto mb-8"
            style={theme === "dark" ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
          />
          <div className="w-14 h-14 mx-auto mb-6 border-2 border-rojo flex items-center justify-center">
            <Lock className="text-rojo" size={22} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-[var(--t-fg)] text-2xl mb-6">PANEL DE ENCUESTAS</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="w-full bg-[var(--t-input-bg)] border-2 border-[var(--t-fg-25)] focus:border-rojo outline-none px-4 py-3 font-body text-[var(--t-fg)] text-base text-center placeholder:text-[var(--t-fg-40)] transition-colors duration-300 mb-4"
          />
          {gateError && <p className="font-body text-rojo text-sm mb-4">{gateError}</p>}
          <button type="submit" disabled={loading} className="btn-rojo w-full justify-center py-4 disabled:opacity-50">
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  const satisfactionPct =
    stats && stats.total > 0
      ? Math.round(((stats.overallCounts.muy_buena + stats.overallCounts.buena) / stats.total) * 100)
      : 0;

  const filteredResponses = (responses ?? []).filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.fullName, r.phone, r.email].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <div data-survey-theme={theme} className="min-h-screen bg-[var(--t-bg)] grain">
      <header className="border-b border-[var(--t-border)] px-6 lg:px-12 py-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <img
              src="/logo-chaplin.png"
              alt="Chaplin Grupo Cultural"
              className="h-10 w-auto"
              style={theme === "dark" ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
            />
            <div>
              <p className="font-body uppercase tracking-[0.3em] text-rojo text-[10px] mb-1">Panel de resultados</p>
              <h1 className="font-display text-[var(--t-fg)] text-2xl leading-none">{EVENT_LABEL}</h1>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => load(authed)}
              disabled={loading}
              className="flex items-center gap-2 font-body text-[12px] uppercase tracking-[0.2em] text-[var(--t-fg-60)] hover:text-rojo transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {stats && (
        <main className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 space-y-16">
          {/* Hero stats */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={Users}
              label="Respuestas totales"
              hint="Cuántas personas completaron la encuesta hasta ahora."
              value={String(stats.total)}
            />
            <StatTile
              icon={TrendingUp}
              label="NPS · Recomendación"
              hint="De -100 a 100. Mide qué tan probable es que el público te recomiende."
              value={stats.total > 0 ? String(stats.nps.score) : "—"}
              status={stats.total > 0 ? npsStatus(stats.nps.score).status : undefined}
              statusLabel={stats.total > 0 ? npsStatus(stats.nps.score).label : undefined}
            />
            <StatTile
              icon={Smile}
              label="Satisfacción"
              hint="% que calificó la obra como 'Muy buena' o 'Buena'."
              value={stats.total > 0 ? `${satisfactionPct}%` : "—"}
              status={stats.total > 0 ? statusFor(satisfactionPct) : undefined}
              statusLabel={
                stats.total > 0
                  ? statusFor(satisfactionPct) === "good"
                    ? "Excelente"
                    : statusFor(satisfactionPct) === "neutral"
                      ? "Aceptable"
                      : "Necesita atención"
                  : undefined
              }
            />
            <StatTile
              icon={Clock}
              label="Horario adecuado"
              hint="% que dijo que el horario de la función le pareció bien."
              value={stats.total > 0 ? `${stats.scheduleOkPct}%` : "—"}
              status={stats.total > 0 ? statusFor(stats.scheduleOkPct) : undefined}
              statusLabel={
                stats.total > 0
                  ? statusFor(stats.scheduleOkPct) === "good"
                    ? "Excelente"
                    : statusFor(stats.scheduleOkPct) === "neutral"
                      ? "Aceptable"
                      : "Necesita atención"
                  : undefined
              }
            />
          </section>

          {stats.total === 0 ? (
            <p className="font-body text-[var(--t-fg-50)] text-center py-20">
              Aún no hay respuestas. Comparte el enlace de la encuesta para empezar a recibirlas.
            </p>
          ) : (
            <>
              {/* Calificación por categoría */}
              <section>
                <SectionHeader
                  title="Calificación por categoría"
                  hint="Promedio de 1 a 5 en cada aspecto de la producción. Te ayuda a identificar qué está funcionando muy bien y qué necesita más atención de cara a la próxima función."
                />
                <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                  <RatingBar label="Actuación" value={stats.categoryAverages.actuacion} />
                  <RatingBar label="Dirección" value={stats.categoryAverages.direccion} />
                  <RatingBar label="Música en vivo" value={stats.categoryAverages.musica} />
                  <RatingBar label="Coreografías" value={stats.categoryAverages.coreografia} />
                  <RatingBar label="Vestuario y maquillaje" value={stats.categoryAverages.vestuario} />
                  <RatingBar label="Iluminación y sonido" value={stats.categoryAverages.iluminacion} />
                </div>
              </section>

              {/* NPS detallado */}
              <section>
                <SectionHeader
                  title="Promotores, pasivos y detractores"
                  hint="Promotores (9–10) son fans que te recomendarán activamente. Pasivos (7–8) están conformes pero no entusiasmados. Detractores (0–6) tuvieron una mala experiencia y pueden hablar mal de la obra. NPS = % Promotores − % Detractores."
                />
                <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8">
                  <div className="h-8 w-full flex bg-[var(--t-track)] overflow-hidden mb-6">
                    {stats.nps.detractors > 0 && (
                      <div
                        className="h-full bg-[var(--t-fg-25)]"
                        style={{ width: `${(stats.nps.detractors / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.nps.passives > 0 && (
                      <div
                        className="h-full bg-[var(--t-fg-50)]"
                        style={{ width: `${(stats.nps.passives / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.nps.promoters > 0 && (
                      <div
                        className="h-full bg-rojo"
                        style={{ width: `${(stats.nps.promoters / stats.total) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-display text-[var(--t-fg-40)] text-3xl mb-1">{stats.nps.detractors}</p>
                      <p className="font-body text-[var(--t-fg-50)] text-[10px] uppercase tracking-[0.2em]">
                        Detractores
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-[var(--t-fg-70)] text-3xl mb-1">{stats.nps.passives}</p>
                      <p className="font-body text-[var(--t-fg-50)] text-[10px] uppercase tracking-[0.2em]">Pasivos</p>
                    </div>
                    <div>
                      <p className="font-display text-rojo text-3xl mb-1">{stats.nps.promoters}</p>
                      <p className="font-body text-[var(--t-fg-50)] text-[10px] uppercase tracking-[0.2em]">
                        Promotores
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Próximas funciones */}
              <section>
                <SectionHeader
                  title="Próximas funciones"
                  hint="Qué tan dispuesto está tu público a volver, y cuántos quieren que les avises de futuras funciones. Esta es tu base para armar una lista de contacto e invitar directamente a Jesucristo Rockstar y SHREK."
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatTile
                    icon={Repeat2}
                    label="Probabilidad de volver"
                    hint="Promedio de 0 a 10 de qué tan probable es que el público asista a una próxima función."
                    value={stats.total > 0 ? `${stats.avgReturnLikelihood}/10` : "—"}
                    status={stats.total > 0 ? statusFor((stats.avgReturnLikelihood / 10) * 100) : undefined}
                    statusLabel={
                      stats.total > 0
                        ? statusFor((stats.avgReturnLikelihood / 10) * 100) === "good"
                          ? "Excelente"
                          : statusFor((stats.avgReturnLikelihood / 10) * 100) === "neutral"
                            ? "Aceptable"
                            : "Necesita atención"
                        : undefined
                    }
                  />
                  <StatTile
                    icon={Mail}
                    label="Quieren recibir novedades"
                    hint={`% que aceptó que le avisemos de futuras funciones${stats.total > 0 ? ` (${stats.newsletterOptInCount} personas)` : ""}.`}
                    value={stats.total > 0 ? `${stats.newsletterOptInPct}%` : "—"}
                  />
                </div>
              </section>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calificación general */}
                <section>
                  <SectionHeader
                    title="Calificación general"
                    hint="Cómo calificó el público la obra en conjunto, en una sola pregunta."
                  />
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {(["muy_buena", "buena", "regular", "mala"] as const).map((k) => (
                      <RankedBar key={k} label={overallLabels[k]} value={stats.overallCounts[k]} max={stats.total} />
                    ))}
                  </div>
                </section>

                {/* Qué les gustó */}
                <section>
                  <SectionHeader
                    title="Qué les gustó más"
                    hint="Los aspectos que más mencionó el público al elegir qué disfrutó de la función."
                  />
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {Object.entries(stats.likedMostCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => (
                        <RankedBar key={k} label={likedLabels[k] ?? k} value={v} max={stats.total} />
                      ))}
                  </div>
                </section>

                {/* Personaje favorito */}
                <section>
                  <SectionHeader
                    title="Personaje favorito"
                    hint="Con cuál personaje de SING se quedó el público. Útil para saber a quién destacar en la difusión de la próxima temporada."
                  />
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {Object.entries(stats.favoriteCharacterCounts)
                      .sort((a, b) => b[1] - a[1])
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => (
                        <RankedBar key={k} label={characterLabels[k] ?? k} value={v} max={stats.total} />
                      ))}
                  </div>
                </section>

                {/* Cómo se enteraron */}
                <section>
                  <SectionHeader
                    title="Cómo se enteraron del evento"
                    hint="Qué canal trajo más público (pueden marcar varios). Útil para saber dónde invertir en difusión la próxima vez."
                  />
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {Object.entries(stats.discoveryCounts)
                      .sort((a, b) => b[1] - a[1])
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => (
                        <RankedBar key={k} label={discoveryLabels[k] ?? k} value={v} max={stats.total} />
                      ))}
                  </div>
                </section>

                {/* Lugar */}
                <section>
                  <SectionHeader
                    title="Lugar de la función"
                    hint="Qué tan bien recibido fue el Auditorio del Colegio de Ingenieros de Ica como espacio."
                  />
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {(["excelente", "bueno", "regular", "malo"] as const)
                      .filter((k) => stats.venueCounts[k] > 0)
                      .map((k) => (
                        <RankedBar key={k} label={venueLabels[k]} value={stats.venueCounts[k]} max={stats.total} />
                      ))}
                  </div>
                </section>

                {/* Compañía */}
                <section>
                  <SectionHeader
                    title="¿Con quién vinieron?"
                    hint="El tipo de acompañante más común entre tu público. Útil para pensar promociones (ej. familiares, parejas)."
                  />
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {Object.entries(stats.companionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => (
                        <RankedBar key={k} label={companionLabels[k] ?? k} value={v} max={stats.total} />
                      ))}
                  </div>
                </section>
              </div>

              {/* Comentarios */}
              {stats.recentComments.length > 0 && (
                <section>
                  <SectionHeader
                    title="Comentarios y sugerencias"
                    hint="Lo que el público escribió textualmente cuando le preguntamos qué se puede mejorar."
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    {stats.recentComments.map((c, i) => (
                      <div key={i} className="bg-[var(--t-card)] border-l-2 border-rojo p-5">
                        <p className="font-body italic text-[var(--t-fg-80)] text-sm leading-relaxed">"{c.comment}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Momentos favoritos */}
              {stats.favoriteMoments.length > 0 && (
                <section>
                  <SectionHeader
                    title="Escenas y canciones más mencionadas"
                    hint="Los momentos de la obra que más emocionaron al público, en sus propias palabras."
                  />
                  <div className="flex flex-wrap gap-2">
                    {stats.favoriteMoments.map((m, i) => (
                      <span
                        key={i}
                        className="font-body text-[12px] text-[var(--t-fg-70)] border border-[var(--t-border)] px-4 py-2"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* CRM: respuestas individuales */}
              <section id="respuestas">
                <SectionHeader
                  title="Respuestas individuales"
                  hint="Cada persona que llenó la encuesta, con sus datos de contacto. Haz clic en cualquiera para ver todas sus respuestas — útil para dar seguimiento, invitar a próximas funciones o resolver una queja puntual."
                />
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t-fg-40)]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, celular o correo..."
                    className="w-full bg-[var(--t-input-bg)] border-2 border-[var(--t-fg-25)] focus:border-rojo outline-none pl-11 pr-4 py-3 font-body text-[var(--t-fg)] text-sm placeholder:text-[var(--t-fg-40)] transition-colors duration-300"
                  />
                </div>
                <p className="font-body text-[var(--t-fg-40)] text-[11px] uppercase tracking-[0.2em] mb-4">
                  Mostrando {filteredResponses.length} de {responses?.length ?? 0}
                </p>
                <div className="space-y-3">
                  {filteredResponses.map((r) => (
                    <ResponseCard key={r.id} r={r} />
                  ))}
                  {filteredResponses.length === 0 && (
                    <p className="font-body text-[var(--t-fg-50)] text-sm text-center py-10">
                      No se encontraron respuestas para "{search}".
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      )}
    </div>
  );
}
