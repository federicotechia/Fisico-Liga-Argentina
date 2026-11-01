import { INITIAL_ROSTER, INITIAL_SESSIONS } from '../data/initialSessions';
import { PlayerSummary, SeasonCompetition, Session } from '../types/catapult';

export const DEFAULT_SEASON: SeasonCompetition = {
  id: 'season-2026-2027-la-liga-argentina',
  season: '2026-2027',
  competition: 'La Liga Argentina',
};

export interface DashboardData {
  seasons: SeasonCompetition[];
  roster: PlayerSummary[];
  sessions: Session[];
}

export const LOCAL_STORAGE_KEYS = {
  sessions: 'catapult_basketball_sessions_v1',
  roster: 'catapult_basketball_roster_v1',
  seasons: 'catapult_basketball_seasons_v1',
  activeSeason: 'catapult_basketball_active_season_v1',
} as const;

const parseArray = <T,>(key: string): T[] | null => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as T[] : null;
  } catch (error) {
    console.error(`No se pudieron leer los datos locales (${key})`, error);
    return null;
  }
};

export const readLocalDashboardData = (): DashboardData => {
  const seasons = parseArray<SeasonCompetition>(LOCAL_STORAGE_KEYS.seasons);
  const roster = parseArray<PlayerSummary>(LOCAL_STORAGE_KEYS.roster);
  const sessions = parseArray<Session>(LOCAL_STORAGE_KEYS.sessions);

  return {
    seasons: seasons?.length ? seasons : [DEFAULT_SEASON],
    roster: (roster ?? INITIAL_ROSTER).map(player => ({ ...player, seasonId: player.seasonId || DEFAULT_SEASON.id })),
    sessions: (sessions ?? INITIAL_SESSIONS).map(session => ({ ...session, seasonId: session.seasonId || DEFAULT_SEASON.id })),
  };
};

export const hasSavedLocalDashboardData = (): boolean =>
  Boolean(localStorage.getItem(LOCAL_STORAGE_KEYS.sessions) || localStorage.getItem(LOCAL_STORAGE_KEYS.roster));
