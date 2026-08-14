import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import {
  submitSurvey,
  EVENT_LABEL,
  type Companion,
  type DiscoveryChannel,
  type FavoriteCharacter,
  type LikedItem,
  type OverallRating,
  type VenueRating,
} from "@/lib/survey";
import { ThemeToggle, useSurveyTheme } from "@/components/chaplin/ThemeToggle";

export const Route = createFileRoute("/encuesta")({
  head: () => ({
    meta: [
      { title: `Encuesta · ${EVENT_LABEL} · Chaplin Grupo Cultural` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EncuestaPage,
});

/* ─── Estado del formulario ───────────────────────────────────────────────── */
interface FormState {
  fullName: string;
  phone: string;
  email: string;
  ageRange: string;
  companion: Companion | "";
  overallRating: OverallRating | "";
  ratingActuacion: number;
  ratingDireccion: number;
  ratingMusica: number;
  ratingCoreografia: number;
  ratingVestuario: number;
  ratingIluminacion: number;
  likedMost: LikedItem[];
  favoriteMoment: string;
  favoriteCharacter: FavoriteCharacter | "";
  discoveryChannels: DiscoveryChannel[];
  venueRating: VenueRating | "";
  scheduleOk: boolean | null;
  schedulePreference: string;
  npsScore: number | null;
  improvementComment: string;
  returnLikelihood: number | null;
  wantsNewsletter: boolean | null;
}

const initialState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  ageRange: "",
  companion: "",
  overallRating: "",
  ratingActuacion: 0,
  ratingDireccion: 0,
  ratingMusica: 0,
  ratingCoreografia: 0,
  ratingVestuario: 0,
  ratingIluminacion: 0,
  likedMost: [],
  favoriteMoment: "",
  favoriteCharacter: "",
  discoveryChannels: [],
  venueRating: "",
  scheduleOk: null,
  schedulePreference: "",
  npsScore: null,
  improvementComment: "",
  returnLikelihood: null,
  wantsNewsletter: null,
};

const ageRanges = ["Menos de 12", "12–17", "18–25", "26–35", "36–50", "51+"];

const companionOptions: { value: Companion; label: string }[] = [
  { value: "familia", label: "Familia" },
  { value: "amigos", label: "Amigos" },
  { value: "pareja", label: "Pareja" },
  { value: "solo", label: "Solo/a" },
  { value: "otro", label: "Otro" },
];

const overallOptions: { value: OverallRating; label: string }[] = [
  { value: "muy_buena", label: "Muy buena" },
  { value: "buena", label: "Buena" },
  { value: "regular", label: "Regular" },
  { value: "mala", label: "Mala" },
];

const categoryRatings: { key: keyof FormState; label: string }[] = [
  { key: "ratingActuacion", label: "Actuación" },
  { key: "ratingDireccion", label: "Dirección" },
  { key: "ratingMusica", label: "Música en vivo" },
  { key: "ratingCoreografia", label: "Coreografías" },
  { key: "ratingVestuario", label: "Vestuario y maquillaje" },
  { key: "ratingIluminacion", label: "Iluminación y sonido" },
];

const likedOptions: { value: LikedItem; label: string }[] = [
  { value: "actuacion", label: "Actuación" },
  { value: "musica", label: "Música" },
  { value: "baile", label: "Baile" },
  { value: "vestuario", label: "Vestuario" },
  { value: "escenografia", label: "Escenografía" },
  { value: "historia", label: "Historia" },
];

const characterOptions: { value: FavoriteCharacter; label: string }[] = [
  { value: "buster_moon", label: "Buster Moon (Koala)" },
  { value: "rosita", label: "Rosita (Cerda)" },
  { value: "ash", label: "Ash (Puercoespín)" },
  { value: "johnny", label: "Johnny (Gorila)" },
  { value: "meena", label: "Meena (Elefanta)" },
  { value: "mike", label: "Mike (Ratón)" },
  { value: "gunter", label: "Gunter (Cerdo)" },
];

const discoveryOptions: { value: DiscoveryChannel; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "afiche", label: "Afiche" },
  { value: "amigos", label: "Amigos/Familia" },
  { value: "auspiciadores", label: "Auspiciadores" },
  { value: "otro", label: "Otro" },
];

const venueOptions: { value: VenueRating; label: string }[] = [
  { value: "excelente", label: "Excelente" },
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
  { value: "malo", label: "Malo" },
];

const TOTAL_STEPS = 7;

/* ─── Chips reutilizables ─────────────────────────────────────────────────── */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-body text-[13px] uppercase tracking-[0.15em] px-5 py-3 border transition-all duration-300 ${
        active
          ? "bg-[var(--gold)] border-[var(--gold)] text-negro font-bold"
          : "bg-transparent border-[var(--t-border)] text-[var(--t-fg-70)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      }`}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="font-body text-[11px] uppercase tracking-[0.3em] text-[var(--t-fg-80)] mb-4">
      {children} {required && <span className="text-rojo">*</span>}
    </p>
  );
}

/* ─── Escala 1-5 ──────────────────────────────────────────────────────────── */
function RatingScale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} de 5`}
          className={`w-11 h-11 border font-display text-lg transition-all duration-300 ${
            n <= value
              ? "bg-[var(--gold)] border-[var(--gold)] text-negro"
              : "bg-transparent border-[var(--t-border)] text-[var(--t-fg-50)] hover:border-[var(--gold)]"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/* ─── Escala NPS 0-10 ─────────────────────────────────────────────────────── */
function NpsScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 11 }, (_, n) => n).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} de 10`}
          className={`w-10 h-10 border font-display text-base transition-all duration-300 ${
            value === n
              ? "bg-[var(--gold)] border-[var(--gold)] text-negro"
              : "bg-transparent border-[var(--t-border)] text-[var(--t-fg-50)] hover:border-[var(--gold)]"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

const inputClass =
  "w-full bg-[var(--t-input-bg)] border-2 border-[var(--t-fg-25)] focus:border-[var(--gold)] outline-none px-4 py-3 font-body text-[var(--t-fg)] text-base placeholder:text-[var(--t-fg-40)] transition-colors duration-300";

/* ─── Fila de luces de marquesina (referencia al póster de SING) ─────────── */
function MarqueeBulbs({ count = 13 }: { count?: number }) {
  return (
    <div className="flex justify-center gap-2.5 my-6" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="marquee-bulb w-2 h-2 rounded-full"
          style={{ background: "var(--gold)", animationDelay: `${(i % 5) * 0.18}s` }}
        />
      ))}
    </div>
  );
}

/* ─── Página ──────────────────────────────────────────────────────────────── */
function EncuestaPage() {
  const [theme, toggleTheme] = useSurveyTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleLiked = (v: LikedItem) => {
    setForm((f) => ({
      ...f,
      likedMost: f.likedMost.includes(v) ? f.likedMost.filter((i) => i !== v) : [...f.likedMost, v],
    }));
  };

  const toggleDiscovery = (v: DiscoveryChannel) => {
    setForm((f) => ({
      ...f,
      discoveryChannels: f.discoveryChannels.includes(v)
        ? f.discoveryChannels.filter((i) => i !== v)
        : [...f.discoveryChannels, v],
    }));
  };

  const canAdvance = () => {
    switch (step) {
      case 0:
        return form.fullName.trim() !== "" && form.phone.trim() !== "";
      case 1:
        return form.companion !== "";
      case 2:
        return (
          form.overallRating !== "" &&
          form.ratingActuacion > 0 &&
          form.ratingDireccion > 0 &&
          form.ratingMusica > 0 &&
          form.ratingCoreografia > 0 &&
          form.ratingVestuario > 0 &&
          form.ratingIluminacion > 0
        );
      case 3:
        return form.likedMost.length > 0;
      case 4:
        return form.discoveryChannels.length > 0 && form.venueRating !== "" && form.scheduleOk !== null;
      case 5:
        return form.npsScore !== null;
      case 6:
        return form.returnLikelihood !== null && form.wantsNewsletter !== null;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (form.npsScore === null || form.returnLikelihood === null || form.wantsNewsletter === null) return;
    setSubmitting(true);
    setError(false);
    try {
      await submitSurvey({
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          ageRange: form.ageRange,
          companion: form.companion as Companion,
          overallRating: form.overallRating as OverallRating,
          ratingActuacion: form.ratingActuacion,
          ratingDireccion: form.ratingDireccion,
          ratingMusica: form.ratingMusica,
          ratingCoreografia: form.ratingCoreografia,
          ratingVestuario: form.ratingVestuario,
          ratingIluminacion: form.ratingIluminacion,
          likedMost: form.likedMost,
          favoriteMoment: form.favoriteMoment,
          favoriteCharacter: form.favoriteCharacter,
          discoveryChannels: form.discoveryChannels,
          venueRating: form.venueRating as VenueRating,
          scheduleOk: form.scheduleOk as boolean,
          schedulePreference: form.schedulePreference,
          npsScore: form.npsScore,
          improvementComment: form.improvementComment,
          returnLikelihood: form.returnLikelihood,
          wantsNewsletter: form.wantsNewsletter,
        },
      });
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        data-survey-theme={theme}
        data-sing-theme={theme}
        className="min-h-screen bg-[var(--t-bg)] grain flex items-center justify-center px-6 py-20 relative"
      >
        <div className="absolute top-6 right-6">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <div className="max-w-md text-center">
          <div
            className="w-20 h-20 mx-auto mb-8 border-2 flex items-center justify-center"
            style={{ borderColor: "var(--gold)" }}
          >
            <Check style={{ color: "var(--gold)" }} size={36} strokeWidth={2} />
          </div>
          <MarqueeBulbs count={9} />
          <h1 className="font-display text-[var(--t-fg)] text-4xl md:text-5xl mb-6">¡GRACIAS!</h1>
          <p className="font-body text-[var(--t-fg-70)] leading-relaxed mb-8">
            Tu opinión ya quedó registrada. Nos ayuda muchísimo a mejorar cada función.
          </p>
          <p className="font-body italic text-sm mb-6" style={{ color: "var(--gold)" }}>
            — Chaplin Grupo Cultural
          </p>
          <img
            src="/logo-chaplin.png"
            alt="Chaplin Grupo Cultural"
            className="h-10 w-auto mx-auto mb-3"
            style={theme === "dark" ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
          />
          <p className="font-body uppercase tracking-[0.35em] text-[var(--t-fg-50)] text-[11px]">
            Pasión por el teatro
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-survey-theme={theme}
      data-sing-theme={theme}
      className="min-h-screen bg-[var(--t-bg)] grain flex flex-col"
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-2 text-center relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-6 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--gold) 0%, transparent 68%)",
            opacity: theme === "dark" ? 0.3 : 0.35,
            filter: "blur(6px)",
          }}
        />
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <div className="relative z-10">
          <img
            src="/logo-chaplin.png"
            alt="Chaplin Grupo Cultural"
            className="h-12 w-auto mx-auto mb-6"
            style={theme === "dark" ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
          />
          <p className="font-body uppercase tracking-[0.4em] text-[var(--gold)] text-[11px] mb-3">
            Encuesta de satisfacción
          </p>
          <h1
            className="font-display text-6xl md:text-7xl leading-[0.85] tracking-wide"
            style={{ color: "var(--gold)", textShadow: "0 0 10px var(--gold-deep), 0 0 30px var(--gold-deep)" }}
          >
            SING
          </h1>
          <p
            className="font-body italic text-lg md:text-xl mt-1"
            style={{ color: "var(--gold)" }}
          >
            ¡Ven y canta!
          </p>
          <MarqueeBulbs />
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6 mb-8 max-w-xl mx-auto w-full">
        <div className="h-[3px] bg-[var(--t-track)] w-full">
          <div
            className="h-full bg-[var(--gold)] transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <p className="font-body text-[var(--t-fg-40)] text-[10px] uppercase tracking-[0.25em] mt-3">
          Paso {step + 1} de {TOTAL_STEPS}
        </p>
      </div>

      {/* Contenido */}
      <main className="flex-1 px-6 pb-32 max-w-xl mx-auto w-full">
        <div className="bg-[var(--t-card)] border border-[var(--t-border)] p-6 md:p-10 space-y-10">
          {step === 0 && (
            <>
              <div className="bg-rojo px-6 py-6 -mt-6 -mx-6 md:-mt-10 md:-mx-10 mb-8 flex items-start gap-4">
                <Ticket className="text-negro shrink-0 mt-1" size={28} strokeWidth={2} />
                <div>
                  <p className="font-display text-negro text-2xl leading-[0.95] mb-2">
                    ¡TU OPINIÓN TIENE PREMIO!
                  </p>
                  <p className="font-body text-negro/80 text-[13px] leading-relaxed">
                    Al completar esta encuesta entras automáticamente al sorteo de entradas para
                    nuestras próximas funciones. Solo asegúrate de dejarnos bien tu contacto.
                  </p>
                </div>
              </div>
              <div>
                <p className="font-body text-[var(--t-fg-70)] text-sm leading-relaxed mb-8">
                  Chaplin Grupo Cultural agradece de antemano el llenado de la siguiente encuesta
                  de satisfacción.
                </p>
                <FieldLabel required>Nombre completo</FieldLabel>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className={`${inputClass} mb-6`}
                />
                <FieldLabel required>Celular</FieldLabel>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+51 000 000 000"
                  className={`${inputClass} mb-6`}
                />
                <FieldLabel>Correo electrónico</FieldLabel>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="tu@correo.com (opcional)"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <FieldLabel>Edad</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {ageRanges.map((r) => (
                    <Chip key={r} active={form.ageRange === r} onClick={() => set("ageRange", r)}>
                      {r}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel required>¿Con quién viniste?</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {companionOptions.map((o) => (
                    <Chip key={o.value} active={form.companion === o.value} onClick={() => set("companion", o.value)}>
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <FieldLabel required>En general, ¿qué tal te pareció la obra?</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {overallOptions.map((o) => (
                    <Chip key={o.value} active={form.overallRating === o.value} onClick={() => set("overallRating", o.value)}>
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel required>Califica cada aspecto del 1 al 5</FieldLabel>
                <div className="space-y-5">
                  {categoryRatings.map((c) => (
                    <div key={String(c.key)} className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="font-body text-[var(--t-fg-80)] text-sm">{c.label}</span>
                      <RatingScale
                        value={form[c.key] as number}
                        onChange={(v) => set(c.key, v as FormState[typeof c.key])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <FieldLabel required>¿Qué fue lo que más te gustó? (elige una o más)</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {likedOptions.map((o) => (
                    <Chip key={o.value} active={form.likedMost.includes(o.value)} onClick={() => toggleLiked(o.value)}>
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>¿Qué escena o canción te emocionó más?</FieldLabel>
                <input
                  type="text"
                  value={form.favoriteMoment}
                  onChange={(e) => set("favoriteMoment", e.target.value)}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel>¿Quién fue tu personaje favorito?</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {characterOptions.map((o) => (
                    <Chip
                      key={o.value}
                      active={form.favoriteCharacter === o.value}
                      onClick={() => set("favoriteCharacter", o.value)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <FieldLabel required>¿Cómo te enteraste del evento? (elige una o más)</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {discoveryOptions.map((o) => (
                    <Chip
                      key={o.value}
                      active={form.discoveryChannels.includes(o.value)}
                      onClick={() => toggleDiscovery(o.value)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel required>¿Qué te pareció el lugar (Auditorio del Colegio de Ingenieros de Ica)?</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {venueOptions.map((o) => (
                    <Chip key={o.value} active={form.venueRating === o.value} onClick={() => set("venueRating", o.value)}>
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel required>¿El horario te pareció adecuado?</FieldLabel>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip active={form.scheduleOk === true} onClick={() => set("scheduleOk", true)}>Sí</Chip>
                  <Chip active={form.scheduleOk === false} onClick={() => set("scheduleOk", false)}>No</Chip>
                </div>
                {form.scheduleOk === false && (
                  <input
                    type="text"
                    value={form.schedulePreference}
                    onChange={(e) => set("schedulePreference", e.target.value)}
                    placeholder="¿Cuál horario preferirías?"
                    className={inputClass}
                  />
                )}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <FieldLabel required>
                  Del 0 al 10, ¿qué tan probable es que recomiendes Chaplin Grupo Cultural?
                </FieldLabel>
                <NpsScale value={form.npsScore} onChange={(v) => set("npsScore", v)} />
                <div className="flex justify-between mt-2 font-body text-[var(--t-fg-40)] text-[10px] uppercase tracking-[0.2em]">
                  <span>Nada probable</span>
                  <span>Muy probable</span>
                </div>
              </div>
              <div>
                <FieldLabel>¿Qué podemos mejorar para la próxima?</FieldLabel>
                <textarea
                  rows={4}
                  value={form.improvementComment}
                  onChange={(e) => set("improvementComment", e.target.value)}
                  placeholder="Tu comentario o sugerencia (opcional)"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div>
                <p className="font-body uppercase tracking-[0.4em] text-rojo text-[11px] mb-3">
                  Antes de despedirnos
                </p>
                <h2 className="font-display text-[var(--t-fg)] text-3xl leading-[0.95] mb-4">
                  SE VIENE MÁS TEATRO
                </h2>
                <p className="font-body text-[var(--t-fg-70)] text-sm leading-relaxed mb-8">
                  En octubre llega <span className="text-rojo font-semibold">Jesucristo Rockstar</span>, con
                  banda en vivo, y cerramos el año en diciembre con{" "}
                  <span className="text-rojo font-semibold">SHREK, El inicio de la aventura</span>.
                </p>
              </div>
              <div>
                <FieldLabel required>¿Qué tan probable es que te volvamos a ver en alguna de estas funciones?</FieldLabel>
                <NpsScale value={form.returnLikelihood} onChange={(v) => set("returnLikelihood", v)} />
                <div className="flex justify-between mt-2 font-body text-[var(--t-fg-40)] text-[10px] uppercase tracking-[0.2em]">
                  <span>Nada probable</span>
                  <span>Muy probable</span>
                </div>
              </div>
              <div>
                <FieldLabel required>
                  ¿Quisieras recibir nuestras novedades (fechas, promociones y sorteos)?
                </FieldLabel>
                <div className="flex flex-wrap gap-2">
                  <Chip active={form.wantsNewsletter === true} onClick={() => set("wantsNewsletter", true)}>Sí</Chip>
                  <Chip active={form.wantsNewsletter === false} onClick={() => set("wantsNewsletter", false)}>No</Chip>
                </div>
              </div>
              {error && (
                <p className="font-body text-rojo text-sm">
                  Hubo un problema al enviar tu respuesta. Inténtalo de nuevo.
                </p>
              )}
            </>
          )}
        </div>
      </main>

      {/* Navegación fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--t-bg)] border-t border-[var(--t-border)] px-6 py-5 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 font-body text-[12px] uppercase tracking-[0.2em] text-[var(--t-fg-60)] hover:text-[var(--gold)] transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} /> Atrás
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={() => canAdvance() && setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))}
              disabled={!canAdvance()}
              className="btn-gold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                form.npsScore === null ||
                form.returnLikelihood === null ||
                form.wantsNewsletter === null ||
                submitting
              }
              className="btn-gold disabled:opacity-30 disabled:pointer-events-none"
            >
              {submitting ? "Enviando..." : "Enviar encuesta"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
