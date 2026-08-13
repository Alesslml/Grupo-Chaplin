import { neon } from "@neondatabase/serverless";

// Lazy init: evaluating neon() at module load time would crash the build
// before DATABASE_URL is provisioned (e.g. first deploy pre-Marketplace setup).
let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL no está configurada.");
    _sql = neon(url);
  }
  return _sql;
}

let _ensured: Promise<void> | null = null;

// Crea la tabla si no existe. Se llama de forma perezosa antes de cada
// insert/consulta para no depender de una migración manual separada.
export function ensureSurveySchema() {
  if (!_ensured) {
    const sql = getSql();
    _ensured = sql`
      create table if not exists survey_responses (
        id bigint generated always as identity primary key,
        created_at timestamptz not null default now(),
        event_slug text not null default 'sing-ven-y-canta',
        full_name text,
        phone text,
        email text,
        age_range text,
        companion text,
        overall_rating text,
        rating_actuacion smallint,
        rating_direccion smallint,
        rating_musica smallint,
        rating_coreografia smallint,
        rating_vestuario smallint,
        rating_iluminacion smallint,
        liked_most text[],
        favorite_moment text,
        discovery_channel text,
        venue_rating text,
        schedule_ok boolean,
        schedule_preference text,
        nps_score smallint,
        improvement_comment text
      )
    `
      // ALTER ... ADD COLUMN IF NOT EXISTS mantiene compatible una tabla ya
      // creada antes de agregar los campos de contacto (CRM).
      .then(() => sql`alter table survey_responses add column if not exists full_name text`)
      .then(() => sql`alter table survey_responses add column if not exists phone text`)
      .then(() => sql`alter table survey_responses add column if not exists email text`)
      .then(() => undefined);
  }
  return _ensured;
}
