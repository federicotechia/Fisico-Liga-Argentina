/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_ROSTER, INITIAL_SESSIONS } from './data/initialSessions';
import { CalculatedPlayerMetrics, PlayerSummary, Session } from './types/catapult';
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



const STORAGE_KEY = 'catapult_basketball_sessions_v1';
const ROSTER_STORAGE_KEY = 'catapult_basketball_roster_v1';

export default function App() {
  // Load sessions from localStorage or default to initial authentic history
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved sessions', e);
    }
    return INITIAL_SESSIONS;
  });

  const [roster, setRoster] = useState<PlayerSummary[]>(() => {
    try {
      const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved roster', e);
    }
    return INITIAL_ROSTER;
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


  const filteredSessions = useMemo(() => {
    if (analysisScope === 'global') return sessions;
    return sessions.filter(s => s.date >= dateRange.start && s.date <= dateRange.end);
  }, [sessions, dateRange, analysisScope]);

  const handleUpdatePlayer = (updatedPlayer: PlayerSummary) => {
    const previousPlayer = roster.find(p => p.id === updatedPlayer.id);
    setRoster(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    setSessions(prev => prev.map(s => ({
      ...s,
      records: s.records.map(r => 
        r.playerId === updatedPlayer.id || (previousPlayer && r.playerName.trim().toLowerCase() === previousPlayer.name.trim().toLowerCase())
          ? { ...r, playerName: updatedPlayer.name, position: updatedPlayer.position, jerseyNumber: updatedPlayer.jerseyNumber } 
          : r
      )
    })));
  };

  const handleDeletePlayer = (player: PlayerSummary) => {
    setRoster(prev => prev.filter(p => p.id !== player.id));
    setSessions(prev => prev.map(session => ({
      ...session,
      records: session.records.filter(record =>
        record.playerId !== player.id && record.playerName.trim().toLowerCase() !== player.name.trim().toLowerCase()
      ),
    })));
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

  // Current session object
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || sessions[sessions.length - 1] || INITIAL_SESSIONS[4];
  }, [sessions, selectedSessionId]);

  // Calculate high performance sports science metrics for the current session
  const calculatedMetrics: CalculatedPlayerMetrics[] = useMemo(() => {
    if (!currentSession) return [];

    return currentSession.records.map(record => {
      // Find matching player or build dynamic summary
      let player = roster.find(p => p.id === record.playerId || p.name.toLowerCase() === record.playerName.toLowerCase());
      if (!player) {
        player = {
          id: record.playerId,
          name: record.playerName,
          position: record.position || 'Escolta',
          jerseyNumber: record.jerseyNumber || 0,
          heightCm: 194,
          weightKg: 90,
          age: 26,
          avatarColor: 'from-orange-500 to-amber-600',
        };
      }

      return calculatePlayerMetrics(player, record, sessions, currentSession.id);
    });
  }, [currentSession, roster, sessions]);

  // Selected player for profile modal
  const selectedPlayerMetrics = useMemo(() => {
    if (!selectedPlayerId) return null;
    return calculatedMetrics.find(m => m.player.id === selectedPlayerId) || null;
  }, [selectedPlayerId, calculatedMetrics]);

  // Handler to add newly synced/created session
  const handleAddSession = (newSession: Session) => {
    setSessions(prev => {
      // Replace if existing with same id or title, otherwise append
      const existsIndex = prev.findIndex(s => s.id === newSession.id || s.title.toLowerCase() === newSession.title.toLowerCase());
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newSession;
        return copy;
      }
      return [...prev, newSession];
    });

    // Also update roster with any new athletes present in the session
    newSession.records.forEach(rec => {
      setRoster(prevRoster => {
        const exists = prevRoster.some(p => p.id === rec.playerId || p.name.toLowerCase() === rec.playerName.toLowerCase());
        if (!exists) {
          return [
            ...prevRoster,
            {
              id: rec.playerId,
              name: rec.playerName,
              position: rec.position || 'Escolta',
              jerseyNumber: rec.jerseyNumber || (prevRoster.length + 1),
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

    setSelectedSessionId(newSession.id);
  };

  // Handler to delete a session
  const handleDeleteSession = (sessionIdToDelete: string) => {
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionIdToDelete);
      if (selectedSessionId === sessionIdToDelete && remaining.length > 0) {
        setSelectedSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  return (
    <div className="min-h-screen bg-[#051124] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* Top Bar Navigation */}
      <Navbar
        sessions={sessions}
        selectedSessionId={currentSession.id}
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
          <SessionOverview
            session={currentSession}
            calculatedMetrics={calculatedMetrics}
            onSelectPlayer={setSelectedPlayerId}
            onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
          />
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
            roster={roster}
            calculatedMetrics={calculatedMetrics}
            sessions={filteredSessions}
            onSelectPlayer={setSelectedPlayerId}
            onEditPlayer={(player) => { setPlayerToEdit(player); setIsEditModalOpen(true); }}
            onDeletePlayer={setPlayerToDelete}
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
            <span>La Liga Argentina</span>
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
        existingSessionsCount={sessions.length}
      />

      <AddSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSession={handleAddSession}
        roster={roster}
        nextSessionNumber={sessions.length + 35}
      />

      <CoachReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        session={currentSession}
        calculatedMetrics={calculatedMetrics}
      />

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

      <DeleteSessionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        session={currentSession}
        onConfirmDelete={handleDeleteSession}
        totalSessions={sessions.length}
      />


    </div>
  );
}
