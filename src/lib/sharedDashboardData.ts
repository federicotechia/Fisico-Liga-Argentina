import { PlayerSummary, SeasonCompetition, Session } from '../types/catapult';
import { DashboardData, DEFAULT_SEASON } from './localDashboardData';
import { supabase } from './supabaseClient';

const WORKSPACE_ID = 'cad-norte';

export interface SharedDashboardSnapshot {
  authorized: boolean;
  revision: number;
  data: DashboardData;
}

export const loadSharedDashboardData = async (email: string): Promise<SharedDashboardSnapshot> => {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.');

  const membership = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', WORKSPACE_ID)
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (membership.error) throw membership.error;

  if (!membership.data) {
    return {
      authorized: false,
      revision: 0,
      data: { seasons: [DEFAULT_SEASON], roster: [], sessions: [] },
    };
  }

  const [syncState, seasonsResult, playersResult, sessionsResult] = await Promise.all([
    supabase.from('workspace_sync_state').select('revision').eq('workspace_id', WORKSPACE_ID).single(),
    supabase.from('workspace_seasons').select('id, season, competition').eq('workspace_id', WORKSPACE_ID),
    supabase.from('workspace_players').select('data').eq('workspace_id', WORKSPACE_ID),
    supabase.from('workspace_sessions').select('data').eq('workspace_id', WORKSPACE_ID),
  ]);

  const firstError = syncState.error || seasonsResult.error || playersResult.error || sessionsResult.error;
  if (firstError) throw firstError;

  const seasons = (seasonsResult.data || []).map(row => ({
    id: row.id,
    season: row.season,
    competition: row.competition,
  } satisfies SeasonCompetition));
  const roster = (playersResult.data || []).map(row => row.data as PlayerSummary);
  const sessions = (sessionsResult.data || []).map(row => row.data as Session);

  return {
    authorized: true,
    revision: Number(syncState.data.revision),
    data: {
      seasons: seasons.length ? seasons : [DEFAULT_SEASON],
      roster,
      sessions,
    },
  };
};

export const saveSharedDashboardData = async (
  data: DashboardData,
  expectedRevision: number
): Promise<number> => {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.');

  const result = await supabase.rpc('save_workspace_snapshot', {
    p_seasons: data.seasons,
    p_players: data.roster,
    p_sessions: data.sessions,
    p_expected_revision: expectedRevision,
  });
  if (result.error) throw result.error;

  const revision = Number(result.data);
  if (!Number.isFinite(revision)) throw new Error('Supabase no devolvió una revisión válida.');
  return revision;
};
