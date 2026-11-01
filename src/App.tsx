/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_ROSTER, INITIAL_SESSIONS } from './data/initialSessions';
import { CalculatedPlayerMetrics, PlayerSummary, SeasonCompetition, Session } from './types/catapult';
import { calculatePlayerMetrics } from './utils/sportsScience';
import { Navbar } from './components/Navbar';
import { SessionOverview } from './components/SessionOverview';
import { AcwrView } from './components/AcwrView';
import { RosterView } from './components/RosterView';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AddSessionModal } from './components/AddSessionModal';
import { CoachReportModal } from './components/CoachReportModal';
import { CatapultGuideModal } from './components/CatapultGuideModal';
import { DeleteSessionModal } from './components/DeleteSessionModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { DeletePlayerModal } from './components/DeletePlayerModal';
import { AddPlayerModal } from './components/AddPlayerModal';
import { AddSeasonModal } from './components/AddSeasonModal';



const STORAGE_KEY = 'catapult_basketball_sessions_v1';
const ROSTER_STORAGE_KEY = 'catapult_basketball_roster_v1';
const SEASONS_STORAGE_KEY = 'catapult_basketball_seasons_v1';
const ACTIVE_SEASON_STORAGE_KEY = 'catapult_basketball_active_season_v1';
const DEFAULT_SEASON: SeasonCompetition = {
  id: 'season-2026-2027-la-liga-argentina',
  season: '2026-2027',
  competition: 'La Liga Argentina',
};

export default function App() {
  const [seasons, setSeasons] = useState<SeasonCompetition[]>(() => {
    try {
      const saved = localStorage.getItem(SEASONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved seasons', e);
    }
    return [DEFAULT_SEASON];
  });
  const [activeSeasonId, setActiveSeasonId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_SEASON_STORAGE_KEY) || DEFAULT_SEASON.id;
    } catch {
      return DEFAULT_SEASON.id;
    }
  });
  // Load sessions from localStorage or default to initial authentic history
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(session => ({ ...session, seasonId: session.seasonId || DEFAULT_SEASON.id }));
      }
    } catch (e) {
      console.error('Error loading saved sessions', e);
    }
    return INITIAL_SESSIONS.map(session => ({ ...session, seasonId: DEFAULT_SEASON.id }));
  });

  const [roster, setRoster] = useState<PlayerSummary[]>(() => {
    try {
      const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(player => ({ ...player, seasonId: player.seasonId || DEFAULT_SEASON.id }));
      }
    } catch (e) {
      console.error('Error loading saved roster', e);
    }
    return INITIAL_ROSTER.map(player => ({ ...player, seasonId: DEFAULT_SEASON.id }));
  });
  // Default to 'sesion-39' (the exact session from the user's uploaded PDF)
  const [selectedSessionId, setSelectedSessionId] = useState<string>('sesion-39');
  const [activeView, setActiveView] = useState<'overview' | 'acwr' | 'roster'>('overview');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-12-31' });
  const [analysisScope, setAnalysisScope] = useState<'range' | 'global'>('range');

  // Modals state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerToEdit, setPlayerToEdit] = useState<PlayerSummary | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<PlayerSummary | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isAddSeasonModalOpen, setIsAddSeasonModalOpen] = useState(false);

  const activeSeason = seasons.find(season => season.id === activeSeasonId) || seasons[0] || DEFAULT_SEASON;
  const seasonSessions = useMemo(
    () => sessions.filter(session => (session.seasonId || DEFAULT_SEASON.id) === activeSeason.id),
    [sessions, activeSeason.id]
  );
  const seasonRoster = useMemo(
    () => roster.filter(player => (player.seasonId || DEFAULT_SEASON.id) === activeSeason.id),
    [roster, activeSeason.id]
  );

  const filteredSessions = useMemo(() => {
    if (analysisScope === 'global') return seasonSessions;
    return seasonSessions.filter(s => s.date >= dateRange.start && s.date <= dateRange.end);
  }, [seasonSessions, dateRange, analysisScope]);

  const handleUpdatePlayer = (updatedPlayer: PlayerSummary) => {
    const playerSeasonId = updatedPlayer.seasonId || activeSeason.id;
    setRoster(prev => prev.map(player => player.id === updatedPlayer.id && (player.seasonId || DEFAULT_SEASON.id) === playerSeasonId
      ? { ...updatedPlayer, seasonId: playerSeasonId }
      : player));
  };

  const handleDeletePlayer = (player: PlayerSummary) => {
    const playerSeasonId = player.seasonId || DEFAULT_SEASON.id;
    setRoster(prev => prev.filter(p => p.id !== player.id || (p.seasonId || DEFAULT_SEASON.id) !== playerSeasonId));
    if (selectedPlayerId === player.id) setSelectedPlayerId(null);
    if (playerToEdit?.id === player.id) setIsEditModalOpen(false);
    setPlayerToDelete(null);
  };


  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving sessions', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
    } catch (e) {
      console.error('Error saving roster', e);
    }
  }, [roster]);

  useEffect(() => {
    try {
      localStorage.setItem(SEASONS_STORAGE_KEY, JSON.stringify(seasons));
      localStorage.setItem(ACTIVE_SEASON_STORAGE_KEY, activeSeason.id);
    } catch (e) {
      console.error('Error saving seasons', e);
    }
  }, [seasons, activeSeason.id]);

  // Current session object
  const currentSession = useMemo(() => {
    return seasonSessions.find(s => s.id === selectedSessionId) || seasonSessions[seasonSessions.length - 1] || null;
  }, [seasonSessions, selectedSessionId]);

  // Calculate high performance sports science metrics for the current session
  const calculatedMetrics: CalculatedPlayerMetrics[] = useMemo(() => {
    if (!currentSession) return [];

    return currentSession.records.map(record => {
      // Find matching player or build dynamic summary
      let player = seasonRoster.find(p => p.id === record.playerId || p.name.toLowerCase() === record.playerName.toLowerCase());
      if (!player) {
        player = {
          id: record.playerId,
          seasonId: activeSeason.id,
          name: record.playerName,
          position: record.position || 'Escolta',
          jerseyNumber: record.jerseyNumber || 0,
          heightCm: 194,
          weightKg: 90,
          age: 26,
          avatarColor: 'from-orange-500 to-amber-600',
        };
      }

      return calculatePlayerMetrics(player, record, seasonSessions, currentSession.id);
    });
  }, [currentSession, seasonRoster, seasonSessions, activeSeason.id]);

  // Selected player for profile modal
  const selectedPlayerMetrics = useMemo(() => {
    if (!selectedPlayerId) return null;
    return calculatedMetrics.find(m => m.player.id === selectedPlayerId) || null;
  }, [selectedPlayerId, calculatedMetrics]);

  // Handler to add newly synced/created session
  const handleAddSession = (newSession: Session) => {
    const sessionForSeason = { ...newSession, seasonId: activeSeason.id };
    setSessions(prev => {
      // Replace if existing with same id or title, otherwise append
      const existsIndex = prev.findIndex(s => s.id === sessionForSeason.id || (s.seasonId === activeSeason.id && s.title.toLowerCase() === sessionForSeason.title.toLowerCase()));
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = sessionForSeason;
        return copy;
      }
      return [...prev, sessionForSeason];
    });

    // Also update roster with any new athletes present in the session
    sessionForSeason.records.forEach(rec => {
      setRoster(prevRoster => {
        const exists = prevRoster.some(p => p.seasonId === activeSeason.id && (p.id === rec.playerId || p.name.toLowerCase() === rec.playerName.toLowerCase()));
        if (!exists) {
          return [
            ...prevRoster,
            {
              id: rec.playerId,
              seasonId: activeSeason.id,
              name: rec.playerName,
              position: rec.position || 'Escolta',
              jerseyNumber: rec.jerseyNumber || (prevRoster.filter(player => player.seasonId === activeSeason.id).length + 1),
              heightCm: 194,
              weightKg: 90,
              age: 25,
              avatarColor: 'from-blue-500 to-indigo-600',
            },
          ];
        }
        return prevRoster;
      });
    });

    setSelectedSessionId(sessionForSeason.id);
  };

  const handleAddPlayer = (player: PlayerSummary) => setRoster(prev => [...prev, player]);

  const handleAddSeason = (season: SeasonCompetition) => {
    setSeasons(prev => [...prev, season]);
    setActiveSeasonId(season.id);
    setSelectedSessionId('');
  };

  const handleSelectSeason = (seasonId: string) => {
    setActiveSeasonId(seasonId);
    const firstSession = sessions.find(session => (session.seasonId || DEFAULT_SEASON.id) === seasonId);
    setSelectedSessionId(firstSession?.id || '');
    setSelectedPlayerId(null);
  };

  // Handler to delete a session
  const handleDeleteSession = (sessionIdToDelete: string) => {
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionIdToDelete);
      if (selectedSessionId === sessionIdToDelete) {
        setSelectedSessionId(remaining.find(session => (session.seasonId || DEFAULT_SEASON.id) === activeSeason.id)?.id || '');
      }
      return remaining;
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#051124] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* Top Bar Navigation */}
      <Navbar
        sessions={seasonSessions}
        seasons={seasons}
        selectedSeasonId={activeSeason.id}
        onSelectSeason={handleSelectSeason}
        selectedSessionId={currentSession?.id || ''}
        onSelectSession={setSelectedSessionId}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        analysisScope={analysisScope}
        onAnalysisScopeChange={setAnalysisScope}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'overview' && (
          currentSession ? (
            <SessionOverview
              session={currentSession}
              calculatedMetrics={calculatedMetrics}
              onSelectPlayer={setSelectedPlayerId}
              onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
            />
          ) : (
            <div className="rounded-3xl border border-blue-900 bg-[#081836] p-10 text-center">
              <h1 className="text-2xl font-black text-white">{activeSeason.season} · {activeSeason.competition}</h1>
              <p className="mt-2 text-sm text-blue-200">Esta temporada todavía no tiene sesiones cargadas.</p>
              <button onClick={() => setIsAddModalOpen(true)} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-500">Cargar primera sesión</button>
            </div>
          )
        )}

        {activeView === 'acwr' && (
          <AcwrView
            calculatedMetrics={calculatedMetrics}
            sessions={filteredSessions}
            onSelectPlayer={setSelectedPlayerId}
          />
        )}

        {activeView === 'roster' && (
          <RosterView
            roster={seasonRoster}
            calculatedMetrics={calculatedMetrics}
            sessions={filteredSessions}
            onSelectPlayer={setSelectedPlayerId}
            onEditPlayer={(player) => { setPlayerToEdit(player); setIsEditModalOpen(true); }}
            onDeletePlayer={setPlayerToDelete}
            season={activeSeason}
            onAddPlayer={() => setIsAddPlayerModalOpen(true)}
            onAddSeason={() => setIsAddSeasonModalOpen(true)}
          />
        )}
      </main>

      {/* Footer styled as CAD Norte official web */}
      <footer className="bg-[#030a16] border-t border-blue-950 py-6 text-xs text-blue-300/60">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">CLUB ATLÉTICO DEPORTIVO NORTE</span>
            <span className="text-blue-600">•</span>
            <span className="text-blue-300">Armstrong, Santa Fe</span>
            <span className="text-blue-600">•</span>
            <span>{activeSeason.competition}</span>
          </div>
          <div className="flex items-center gap-4 text-blue-300/80">
            <span>Catapult OpenField™</span>
            <span>•</span>
            <span>ACWR 7:28 Gabbett</span>
            <span>•</span>
            <a
              href="https://cadnorte.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-white font-semibold transition-colors"
            >
              cadnorte.com.ar
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlayerProfileModal
        metrics={selectedPlayerMetrics}
        allSessions={filteredSessions}
        onClose={() => setSelectedPlayerId(null)}
      />

      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onAddSession={handleAddSession}
        existingSessionsCount={seasonSessions.length}
      />

      <AddSessionModal
        key={activeSeason.id}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSession={handleAddSession}
        roster={seasonRoster}
        nextSessionNumber={seasonSessions.length + 35}
      />

      {currentSession && <CoachReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        session={currentSession}
        calculatedMetrics={calculatedMetrics}
      />}

      <CatapultGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <EditPlayerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        player={playerToEdit || INITIAL_ROSTER[0]}
        onSave={handleUpdatePlayer}
      />

      <DeletePlayerModal
        player={playerToDelete}
        onClose={() => setPlayerToDelete(null)}
        onConfirmDelete={handleDeletePlayer}
      />

      <AddPlayerModal
        isOpen={isAddPlayerModalOpen}
        season={activeSeason}
        onClose={() => setIsAddPlayerModalOpen(false)}
        onAdd={handleAddPlayer}
      />

      <AddSeasonModal
        isOpen={isAddSeasonModalOpen}
        onClose={() => setIsAddSeasonModalOpen(false)}
        onAdd={handleAddSeason}
      />

      {currentSession && <DeleteSessionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        session={currentSession}
        onConfirmDelete={handleDeleteSession}
        totalSessions={seasonSessions.length}
      />}


    </div>
  );
}
