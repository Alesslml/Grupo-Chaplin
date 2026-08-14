import { createServerFn } from "@tanstack/react-start";
import { getSql, ensureSurveySchema } from "@/lib/db.server";

export const EVENT_SLUG = "sing-ven-y-canta";
export const EVENT_LABEL = "SING, Ven y Canta";

export type OverallRating = "muy_buena" | "buena" | "regular" | "mala";
export type Companion = "familia" | "amigos" | "pareja" | "solo" | "otro";
export type LikedItem =
  | "actuacion"
  | "musica"
  | "baile"
  | "vestuario"
  | "escenografia"
  | "historia";
export type DiscoveryChannel =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "afiche"
  | "amigos"
  | "auspiciadores"
  | "otro";
export type VenueRating = "excelente" | "bueno" | "regular" | "malo";
export type FavoriteCharacter =
  | "buster_moon"
  | "rosita"
  | "ash"
  | "johnny"
  | "meena"
  | "mike"
  | "gunter"
  | "otro";

export interface SurveyPayload {
  fullName: string;
  phone: string;
  email: string;
  functionTime: string;
  ageRange: string;
  companion: Companion;
  overallRating: OverallRating;
  ratingActuacion: number;
  ratingDireccion: number;
  ratingMusica: number;
  ratingCoreografia: number;
  ratingVestuario: number;
  ratingIluminacion: number;
  likedMost: LikedItem[];
  favoriteMoment: string;
  favoriteCharacter: FavoriteCharacter | "";
  favoriteCharacterOther: string;
  discoveryChannels: DiscoveryChannel[];
  venueRating: VenueRating;
  scheduleOk: boolean;
  schedulePreference: string;
  npsScore: number;
  improvementComment: string;
  returnLikelihood: number;
  wantsNewsletter: boolean;
}

export const submitSurvey = createServerFn({ method: "POST" })
  .inputValidator((data: SurveyPayload) => data)
  .handler(async ({ data }) => {
    await ensureSurveySchema();
    const sql = getSql();
    await sql`
      insert into survey_responses (
        event_slug, full_name, phone, email, function_time, age_range, companion, overall_rating,
        rating_actuacion, rating_direccion, rating_musica,
        rating_coreografia, rating_vestuario, rating_iluminacion,
        liked_most, favorite_moment, favorite_character, favorite_character_other,
        discovery_channels, venue_rating,
        schedule_ok, schedule_preference, nps_score, improvement_comment,
        return_likelihood, wants_newsletter
      ) values (
        ${EVENT_SLUG}, ${data.fullName}, ${data.phone}, ${data.email || null}, ${data.functionTime || null},
        ${data.ageRange || null}, ${data.companion}, ${data.overallRating},
        ${data.ratingActuacion}, ${data.ratingDireccion}, ${data.ratingMusica},
        ${data.ratingCoreografia}, ${data.ratingVestuario}, ${data.ratingIluminacion},
        ${data.likedMost}, ${data.favoriteMoment || null}, ${data.favoriteCharacter || null},
        ${data.favoriteCharacterOther || null},
        ${data.discoveryChannels}, ${data.venueRating},
        ${data.scheduleOk}, ${data.schedulePreference || null}, ${data.npsScore}, ${data.improvementComment || null},
        ${data.returnLikelihood}, ${data.wantsNewsletter}
      )
    `;
    return { ok: true as const };
  });

function checkAdminPassword(password: string) {
  const expected = process.env.SURVEY_ADMIN_PASSWORD || "ChaplinSing2026!";
  return password === expected;
}

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    return { ok: checkAdminPassword(data.password) };
  });

export interface SurveyStats {
  total: number;
  overallCounts: Record<OverallRating, number>;
  categoryAverages: {
    actuacion: number;
    direccion: number;
    musica: number;
    coreografia: number;
    vestuario: number;
    iluminacion: number;
  };
  nps: { score: number; promoters: number; passives: number; detractors: number };
  likedMostCounts: Record<LikedItem, number>;
  discoveryCounts: Record<DiscoveryChannel, number>;
  favoriteCharacterCounts: Record<FavoriteCharacter, number>;
  venueCounts: Record<VenueRating, number>;
  companionCounts: Record<Companion, number>;
  scheduleOkPct: number;
  recentComments: { comment: string; createdAt: string }[];
  favoriteMoments: string[];
  avgReturnLikelihood: number;
  returnLikelihoodCount: number;
  newsletterOptInPct: number;
  newsletterOptInCount: number;
  newsletterAnsweredCount: number;
}

const emptyOverall: Record<OverallRating, number> = { muy_buena: 0, buena: 0, regular: 0, mala: 0 };
const emptyLiked: Record<LikedItem, number> = {
  actuacion: 0, musica: 0, baile: 0, vestuario: 0, escenografia: 0, historia: 0,
};
const emptyDiscovery: Record<DiscoveryChannel, number> = {
  facebook: 0, instagram: 0, tiktok: 0, afiche: 0, amigos: 0, auspiciadores: 0, otro: 0,
};
const emptyVenue: Record<VenueRating, number> = { excelente: 0, bueno: 0, regular: 0, malo: 0 };
const emptyCompanion: Record<Companion, number> = { familia: 0, amigos: 0, pareja: 0, solo: 0, otro: 0 };
const emptyFavoriteCharacter: Record<FavoriteCharacter, number> = {
  buster_moon: 0, rosita: 0, ash: 0, johnny: 0, meena: 0, mike: 0, gunter: 0, otro: 0,
};

// Compatibilidad: las respuestas viejas guardaron un solo canal en
// discovery_channel; las nuevas guardan varios en discovery_channels.
// Se fusionan para no perder datos históricos al calcular los conteos.
function discoveryChannelsOf(r: any): string[] {
  if (Array.isArray(r.discovery_channels) && r.discovery_channels.length > 0) return r.discovery_channels;
  if (r.discovery_channel) return [r.discovery_channel];
  return [];
}

export const getSurveyStats = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }): Promise<SurveyStats> => {
    if (!checkAdminPassword(data.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureSurveySchema();
    const sql = getSql();

    const rows = (await sql`select * from survey_responses where event_slug = ${EVENT_SLUG} order by created_at desc`) as any[];

    const total = rows.length;
    const overallCounts = { ...emptyOverall };
    const likedMostCounts = { ...emptyLiked };
    const discoveryCounts = { ...emptyDiscovery };
    const favoriteCharacterCounts = { ...emptyFavoriteCharacter };
    const venueCounts = { ...emptyVenue };
    const companionCounts = { ...emptyCompanion };

    let sumActuacion = 0, sumDireccion = 0, sumMusica = 0, sumCoreografia = 0, sumVestuario = 0, sumIluminacion = 0;
    let promoters = 0, passives = 0, detractors = 0;
    let scheduleOkCount = 0;
    let sumReturnLikelihood = 0;
    let returnLikelihoodCount = 0;
    let newsletterOptInCount = 0;
    let newsletterAnsweredCount = 0;
    const recentComments: { comment: string; createdAt: string }[] = [];
    const favoriteMoments: string[] = [];

    for (const r of rows) {
      if (r.overall_rating in overallCounts) overallCounts[r.overall_rating as OverallRating]++;
      if (r.companion in companionCounts) companionCounts[r.companion as Companion]++;
      for (const ch of discoveryChannelsOf(r)) {
        if (ch in discoveryCounts) discoveryCounts[ch as DiscoveryChannel]++;
      }
      if (r.favorite_character in favoriteCharacterCounts) {
        favoriteCharacterCounts[r.favorite_character as FavoriteCharacter]++;
      }
      if (r.venue_rating in venueCounts) venueCounts[r.venue_rating as VenueRating]++;

      sumActuacion += r.rating_actuacion ?? 0;
      sumDireccion += r.rating_direccion ?? 0;
      sumMusica += r.rating_musica ?? 0;
      sumCoreografia += r.rating_coreografia ?? 0;
      sumVestuario += r.rating_vestuario ?? 0;
      sumIluminacion += r.rating_iluminacion ?? 0;

      const nps = r.nps_score ?? 0;
      if (nps >= 9) promoters++;
      else if (nps >= 7) passives++;
      else detractors++;

      if (r.schedule_ok) scheduleOkCount++;

      if (r.return_likelihood !== null && r.return_likelihood !== undefined) {
        sumReturnLikelihood += r.return_likelihood;
        returnLikelihoodCount++;
      }
      if (r.wants_newsletter !== null && r.wants_newsletter !== undefined) {
        newsletterAnsweredCount++;
        if (r.wants_newsletter) newsletterOptInCount++;
      }

      for (const item of r.liked_most ?? []) {
        if (item in likedMostCounts) likedMostCounts[item as LikedItem]++;
      }

      if (r.improvement_comment) {
        recentComments.push({ comment: r.improvement_comment, createdAt: r.created_at });
      }
      if (r.favorite_moment) favoriteMoments.push(r.favorite_moment);
    }

    const avg = (sum: number) => (total > 0 ? Math.round((sum / total) * 10) / 10 : 0);
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    return {
      total,
      overallCounts,
      categoryAverages: {
        actuacion: avg(sumActuacion),
        direccion: avg(sumDireccion),
        musica: avg(sumMusica),
        coreografia: avg(sumCoreografia),
        vestuario: avg(sumVestuario),
        iluminacion: avg(sumIluminacion),
      },
      nps: { score: npsScore, promoters, passives, detractors },
      likedMostCounts,
      discoveryCounts,
      favoriteCharacterCounts,
      venueCounts,
      companionCounts,
      scheduleOkPct: total > 0 ? Math.round((scheduleOkCount / total) * 100) : 0,
      recentComments: recentComments.slice(0, 30),
      favoriteMoments: favoriteMoments.slice(0, 30),
      avgReturnLikelihood: returnLikelihoodCount > 0 ? Math.round((sumReturnLikelihood / returnLikelihoodCount) * 10) / 10 : 0,
      returnLikelihoodCount,
      newsletterOptInPct: newsletterAnsweredCount > 0 ? Math.round((newsletterOptInCount / newsletterAnsweredCount) * 100) : 0,
      newsletterOptInCount,
      newsletterAnsweredCount,
    };
  });

export interface SurveyResponseRow {
  id: string;
  createdAt: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  functionTime: string | null;
  ageRange: string | null;
  companion: Companion | null;
  overallRating: OverallRating | null;
  ratingActuacion: number | null;
  ratingDireccion: number | null;
  ratingMusica: number | null;
  ratingCoreografia: number | null;
  ratingVestuario: number | null;
  ratingIluminacion: number | null;
  likedMost: LikedItem[];
  favoriteMoment: string | null;
  favoriteCharacter: FavoriteCharacter | null;
  favoriteCharacterOther: string | null;
  discoveryChannels: DiscoveryChannel[];
  venueRating: VenueRating | null;
  scheduleOk: boolean | null;
  schedulePreference: string | null;
  npsScore: number | null;
  improvementComment: string | null;
  returnLikelihood: number | null;
  wantsNewsletter: boolean | null;
}

// Lista completa (CRM): cada fila es una persona que llenó la encuesta,
// con sus datos de contacto y todas sus respuestas individuales.
export const getSurveyResponses = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }): Promise<SurveyResponseRow[]> => {
    if (!checkAdminPassword(data.password)) {
      throw new Error("UNAUTHORIZED");
    }
    await ensureSurveySchema();
    const sql = getSql();
    const rows = (await sql`
      select * from survey_responses where event_slug = ${EVENT_SLUG} order by created_at desc
    `) as any[];

    return rows.map((r) => ({
      id: String(r.id),
      createdAt: r.created_at,
      fullName: r.full_name,
      phone: r.phone,
      email: r.email,
      functionTime: r.function_time,
      ageRange: r.age_range,
      companion: r.companion,
      overallRating: r.overall_rating,
      ratingActuacion: r.rating_actuacion,
      ratingDireccion: r.rating_direccion,
      ratingMusica: r.rating_musica,
      ratingCoreografia: r.rating_coreografia,
      ratingVestuario: r.rating_vestuario,
      ratingIluminacion: r.rating_iluminacion,
      likedMost: r.liked_most ?? [],
      favoriteMoment: r.favorite_moment,
      favoriteCharacter: r.favorite_character,
      favoriteCharacterOther: r.favorite_character_other,
      discoveryChannels: discoveryChannelsOf(r) as DiscoveryChannel[],
      venueRating: r.venue_rating,
      scheduleOk: r.schedule_ok,
      schedulePreference: r.schedule_preference,
      npsScore: r.nps_score,
      improvementComment: r.improvement_comment,
      returnLikelihood: r.return_likelihood,
      wantsNewsletter: r.wants_newsletter,
    }));
  });
