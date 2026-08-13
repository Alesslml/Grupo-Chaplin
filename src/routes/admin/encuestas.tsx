import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, RefreshCw, Users, TrendingUp, Smile, Clock } from "lucide-react";
import { getSurveyStats, EVENT_LABEL, type SurveyStats } from "@/lib/survey";
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

/* ─── Barra de ranking ────────────────────────────────────────────────────── */
function RankedBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-[var(--t-fg-80)] text-[13px]">{label}</span>
        <span className="font-body text-[var(--t-fg-50)] text-[12px] tabular-nums">{value}</span>
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

/* ─── Tile de estadística ─────────────────────────────────────────────────── */
function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8">
      <Icon className="text-rojo mb-4" size={24} strokeWidth={1.5} />
      <p className="font-display text-[var(--t-fg)] text-4xl md:text-5xl leading-none mb-2">{value}</p>
      <p className="font-body text-[var(--t-fg-50)] text-[11px] uppercase tracking-[0.25em]">{label}</p>
    </div>
  );
}

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

function AdminEncuestasPage() {
  const [theme, toggleTheme] = useSurveyTheme();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState<string | null>(null);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [gateError, setGateError] = useState("");

  const load = async (pw: string) => {
    setLoading(true);
    setGateError("");
    try {
      const data = await getSurveyStats({ data: { password: pw } });
      setStats(data);
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
            <StatTile icon={Users} label="Respuestas totales" value={String(stats.total)} />
            <StatTile
              icon={TrendingUp}
              label="NPS (recomendación)"
              value={stats.total > 0 ? String(stats.nps.score) : "—"}
            />
            <StatTile
              icon={Smile}
              label="Satisfacción (muy buena + buena)"
              value={
                stats.total > 0
                  ? `${Math.round(((stats.overallCounts.muy_buena + stats.overallCounts.buena) / stats.total) * 100)}%`
                  : "—"
              }
            />
            <StatTile icon={Clock} label="Horario adecuado" value={stats.total > 0 ? `${stats.scheduleOkPct}%` : "—"} />
          </section>

          {stats.total === 0 ? (
            <p className="font-body text-[var(--t-fg-50)] text-center py-20">
              Aún no hay respuestas. Comparte el enlace de la encuesta para empezar a recibirlas.
            </p>
          ) : (
            <>
              {/* Calificación por categoría */}
              <section>
                <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Calificación por categoría (1–5)</h2>
                <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                  <RatingBar label="Actuación" value={stats.categoryAverages.actuacion} />
                  <RatingBar label="Dirección" value={stats.categoryAverages.direccion} />
                  <RatingBar label="Música en vivo" value={stats.categoryAverages.musica} />
                  <RatingBar label="Coreografías" value={stats.categoryAverages.coreografia} />
                  <RatingBar label="Vestuario y maquillaje" value={stats.categoryAverages.vestuario} />
                  <RatingBar label="Iluminación y sonido" value={stats.categoryAverages.iluminacion} />
                </div>
              </section>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calificación general */}
                <section>
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Calificación general</h2>
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {(["muy_buena", "buena", "regular", "mala"] as const).map((k) => (
                      <RankedBar key={k} label={overallLabels[k]} value={stats.overallCounts[k]} max={stats.total} />
                    ))}
                  </div>
                </section>

                {/* NPS breakdown */}
                <section>
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Promotores / Pasivos / Detractores</h2>
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-display text-rojo text-4xl mb-2">{stats.nps.promoters}</p>
                      <p className="font-body text-[var(--t-fg-50)] text-[10px] uppercase tracking-[0.2em]">Promotores (9–10)</p>
                    </div>
                    <div>
                      <p className="font-display text-[var(--t-fg-70)] text-4xl mb-2">{stats.nps.passives}</p>
                      <p className="font-body text-[var(--t-fg-50)] text-[10px] uppercase tracking-[0.2em]">Pasivos (7–8)</p>
                    </div>
                    <div>
                      <p className="font-display text-[var(--t-fg-40)] text-4xl mb-2">{stats.nps.detractors}</p>
                      <p className="font-body text-[var(--t-fg-50)] text-[10px] uppercase tracking-[0.2em]">Detractores (0–6)</p>
                    </div>
                  </div>
                </section>

                {/* Qué les gustó */}
                <section>
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Qué les gustó más</h2>
                  <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 lg:p-8 space-y-5">
                    {Object.entries(stats.likedMostCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => (
                        <RankedBar key={k} label={likedLabels[k] ?? k} value={v} max={stats.total} />
                      ))}
                  </div>
                </section>

                {/* Cómo se enteraron */}
                <section>
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Cómo se enteraron del evento</h2>
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
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">
                    Lugar: Auditorio del Colegio de Ingenieros de Ica
                  </h2>
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
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">¿Con quién vinieron?</h2>
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
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Comentarios y sugerencias</h2>
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
                  <h2 className="font-display text-[var(--t-fg)] text-2xl mb-6">Escenas y canciones más mencionadas</h2>
                  <div className="flex flex-wrap gap-2">
                    {stats.favoriteMoments.map((m, i) => (
                      <span key={i} className="font-body text-[12px] text-[var(--t-fg-70)] border border-[var(--t-border)] px-4 py-2">
                        {m}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      )}
    </div>
  );
}
