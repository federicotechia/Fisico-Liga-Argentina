import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Activity, 
  Flame, 
  ArrowUpRight, 
  Zap, 
  ShieldAlert,
  Trophy,
  Trash2
} from 'lucide-react';
import { BasketballPosition, CalculatedPlayerMetrics, PlayerSummary, Session } from '../types/catapult';
import { getPositionColor, getRiskBadge } from '../utils/sportsScience';
import { CADNorteLogo } from './CADNorteLogo';

interface RosterViewProps {
  roster: PlayerSummary[];
  calculatedMetrics: CalculatedPlayerMetrics[];
  sessions: Session[];
  onSelectPlayer: (playerId: string) => void;
  onEditPlayer: (player: PlayerSummary) => void;
  onDeletePlayer: (player: PlayerSummary) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  roster,
  calculatedMetrics,
  sessions,
  onSelectPlayer,
  onEditPlayer,
  onDeletePlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  const filteredRoster = roster.filter(player => {
    const matchesName = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPos = positionFilter === 'all' || player.position === positionFilter;
    return matchesName && matchesPos;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#071733] via-[#09224b] to-[#071733] border border-blue-900/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <CADNorteLogo size={180} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white border border-blue-400/40 shadow-sm">
              Plantel Profesional CAD Norte
            </span>
            <span className="text-xs text-blue-200/80">{roster.length} Jugadores Registrados · {sessions.length} sesiones analizadas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Perfiles Físicos &amp; Biometría de Atletas
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1">
            Monitoreo biométrico individual, historial de partidos en La Liga y promedios telemétricos Catapult.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar atleta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#040e21] border border-blue-900/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#040e21] p-1 rounded-xl border border-blue-900/80 text-xs">
            {(['all', 'Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'] as const).map(pos => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  positionFilter === pos ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'
                }`}
              >
                {pos === 'all' ? 'Todos' : pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredRoster.map(player => {
          const metric = calculatedMetrics.find(m => m.player.id === player.id);
          const badge = metric ? getRiskBadge(metric.riskLevel) : null;

          const playerRecords = sessions
            .flatMap(s => s.records)
            .filter(r => r.playerId === player.id || r.playerName.toLowerCase() === player.name.toLowerCase());

          const avgPL = playerRecords.length > 0
            ? Math.round(playerRecords.reduce((sum, r) => sum + r.totPL, 0) / playerRecords.length)
            : 0;
          const avgJumps = playerRecords.length > 0
            ? Math.round(playerRecords.reduce((sum, r) => sum + r.totJumps, 0) / playerRecords.length)
            : 0;
          const avgDist = playerRecords.length > 0
            ? Math.round(playerRecords.reduce((sum, r) => sum + r.totDistM, 0) / playerRecords.length)
            : 0;

          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className="bg-[#081836] border border-blue-900/70 hover:border-blue-500 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center font-black text-white text-lg shadow-md border border-blue-400/40">
                      #{player.jerseyNumber}
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm hover:text-sky-300 transition-colors">
                        {player.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </div>
                  </div>

                  {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${badge.bg}`}>
                      {badge.short}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-blue-200/80 bg-[#040e21] p-3 rounded-xl border border-blue-900/60 mb-3">
                  <div className="flex justify-between py-0.5">
                    <span>Edad &amp; Biometría:</span>
                    <strong className="text-white">{player.age}a • {player.heightCm}cm • {player.weightKg}kg</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Historial CAD Norte:</span>
                    <strong className="text-sky-300 truncate max-w-[140px]">{player.injuryHistory || 'Sin lesiones'}</strong>
                  </div>
                  {player.observations && <p className="pt-1 mt-1 border-t border-blue-900/60 text-blue-100/80 line-clamp-2">{player.observations}</p>}
                </div>

                {/* Career Averages */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#040e21] p-2 rounded-xl border border-blue-900/60">
                    <span className="text-[10px] text-blue-300 block font-semibold">Media PL</span>
                    <span className="font-black text-sky-400">{avgPL}</span>
                  </div>
                  <div className="bg-[#040e21] p-2 rounded-xl border border-blue-900/60">
                    <span className="text-[10px] text-blue-300 block font-semibold">Media Saltos</span>
                    <span className="font-black text-emerald-400">{avgJumps}</span>
                  </div>
                  <div className="bg-[#040e21] p-2 rounded-xl border border-blue-900/60">
                    <span className="text-[10px] text-blue-300 block font-semibold">Media Dist</span>
                    <span className="font-black text-sky-300">{avgDist}m</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs text-blue-300">
                <span className="text-[11px]">Sesión actual: <strong className="text-white">{metric?.record.totPL || 0} PL</strong></span>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onEditPlayer(player); }} className="text-amber-400 font-bold hover:text-white">Editar</button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDeletePlayer(player); }}
                    aria-label={`Eliminar a ${player.name}`}
                    title={`Eliminar a ${player.name}`}
                    className="text-rose-400 hover:text-white p-1 rounded-lg hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sky-400 font-bold flex items-center gap-0.5 text-xs cursor-pointer" onClick={() => onSelectPlayer(player.id)}>
                    Ver Ficha <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
