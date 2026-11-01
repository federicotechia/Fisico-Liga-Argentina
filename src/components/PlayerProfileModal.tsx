import React from 'react';
import { 
  X, 
  Flame, 
  Activity, 
  ArrowUpRight, 
  HeartHandshake, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  TrendingUp,
  User,
  Scale
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { CalculatedPlayerMetrics, Session } from '../types/catapult';
import { getPositionColor, getRiskBadge } from '../utils/sportsScience';
import { CADNorteLogo } from './CADNorteLogo';

interface PlayerProfileModalProps {
  metrics: CalculatedPlayerMetrics | null;
  allSessions: Session[];
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  metrics,
  allSessions,
  onClose,
}) => {
  if (!metrics) return null;

  const { player, record, riskLevel, acwr, fatigueScore, plPerMin, distPerMin, jumpsPerMin, alerts, recommendation } = metrics;
  const badge = getRiskBadge(riskLevel);

  const sortedSessions = [...allSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const historyData = sortedSessions.map(s => {
    const rec = s.records.find(r => r.playerId === player.id || r.playerName.toLowerCase() === player.name.toLowerCase());
    return {
      session: s.title.replace('SESIÓN ', 'S-'),
      date: s.date.slice(5),
      totPL: rec ? rec.totPL : 0,
      totJumps: rec ? rec.totJumps : 0,
      totDistM: rec ? rec.totDistM : 0,
      minutes: rec ? rec.minutesPlayed : 0,
    };
  }).filter(h => h.totPL > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-blue-900/80 flex items-start justify-between bg-[#040e21] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center font-black text-white text-xl shadow-lg border border-blue-400/50">
              #{player.jerseyNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{player.name}</h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPositionColor(player.position)}`}>
                  {player.position}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5 font-medium">
                Club Atlético Deportivo Norte • {player.age} años • {player.heightCm} cm • {player.weightKg} kg • Historial: {player.injuryHistory || 'Sin novedades médicas'}
              </p>
              {player.observations && <p className="text-xs text-sky-200/80 mt-1">Observaciones: {player.observations}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white bg-blue-950/80 hover:bg-blue-900 rounded-xl transition-colors border border-blue-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Top Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#040e21] p-3.5 rounded-2xl border border-blue-900/80">
              <span className="text-[11px] text-blue-300 block font-bold uppercase">PlayerLoad™</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white">{record.totPL}</span>
                <span className="text-xs text-sky-400 font-bold">{plPerMin} /min</span>
              </div>
              <span className="text-[10px] text-blue-300/60 block mt-1">Z-Score: {metrics.zScorePL > 0 ? `+${metrics.zScorePL}σ` : `${metrics.zScorePL}σ`}</span>
            </div>

            <div className="bg-[#040e21] p-3.5 rounded-2xl border border-blue-900/80">
              <span className="text-[11px] text-blue-300 block font-bold uppercase">Saltos (Tot Jump #)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-black ${record.totJumps >= 120 ? 'text-rose-400' : 'text-white'}`}>
                  {record.totJumps}
                </span>
                <span className="text-xs text-emerald-400 font-bold">{jumpsPerMin} /min</span>
              </div>
              <span className="text-[10px] text-blue-300/60 block mt-1">Impacto articular de aterrizaje</span>
            </div>

            <div className="bg-[#040e21] p-3.5 rounded-2xl border border-blue-900/80">
              <span className="text-[11px] text-blue-300 block font-bold uppercase">Distancia Recorrida</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white">{record.totDistM}</span>
                <span className="text-xs text-sky-400 font-bold">m</span>
              </div>
              <span className="text-[10px] text-blue-300/60 block mt-1">{distPerMin} m/min de intensidad</span>
            </div>

            <div className="bg-[#040e21] p-3.5 rounded-2xl border border-blue-900/80">
              <span className="text-[11px] text-blue-300 block font-bold uppercase">BMP Basketball Load</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-indigo-300">{record.bmpBasketballLoad}</span>
                <span className="text-xs text-indigo-400 font-bold">{metrics.bmpRatio}%</span>
              </div>
              <span className="text-[10px] text-blue-300/60 block mt-1">Perfil de aceleraciones y saltos</span>
            </div>
          </div>

          {/* ACWR & Fatigue Analysis Box */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center justify-center p-4 bg-[#081836] rounded-2xl border border-blue-900/80 min-w-[200px] text-center shadow-md">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Ratio ACWR (7:28)</span>
              <div className="my-2">
                <span className={`text-4xl font-black tracking-tight ${
                  acwr >= 1.5 ? 'text-rose-400' :
                  acwr >= 1.3 ? 'text-amber-400' :
                  acwr < 0.8 ? 'text-sky-400' :
                  'text-emerald-400'
                }`}>
                  {acwr}
                </span>
              </div>
              <div className="w-full bg-[#040e21] h-2.5 rounded-full overflow-hidden flex mb-2 border border-blue-950">
                <div className="w-[30%] bg-blue-500/80" title="Bajo (<0.8)"></div>
                <div className="w-[45%] bg-emerald-500" title="Óptimo (0.8 - 1.3)"></div>
                <div className="w-[15%] bg-amber-500" title="Precaución (1.3 - 1.5)"></div>
                <div className="w-[10%] bg-rose-500" title="Peligro (>1.5)"></div>
              </div>
              <span className="text-[10px] text-blue-300/70 font-medium">
                Zona segura: 0.80 - 1.30
              </span>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Índice de Fatiga</span>
                <span className="text-xs font-black text-sky-400">{fatigueScore} / 100</span>
              </div>
              <div className="w-full bg-[#081836] h-2 rounded-full overflow-hidden border border-blue-950">
                <div 
                  className={`h-full rounded-full ${
                    fatigueScore >= 65 ? 'bg-rose-500' : fatigueScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fatigueScore}%` }}
                ></div>
              </div>

              <div className="mt-3 space-y-1.5">
                {alerts.length > 0 ? (
                  alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sin banderas rojas de fatiga registradas para este atleta en CAD Norte.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Longitudinal Trend Chart */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Evolución Longitudinal de Carga en Últimas Sesiones</span>
            </h3>
            <p className="text-[11px] text-blue-200/70 mb-3">
              Permite identificar picos agudos de PlayerLoad y acumulación de saltos para regular el microciclo.
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
                  <XAxis dataKey="session" tick={{ fill: '#93c5fd', fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#93c5fd', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#10b981', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#071326', borderColor: '#1e3a8a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="totPL" name="PlayerLoad" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="totJumps" name="Saltos (Tot Jump #)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coach Tactical Action Plan */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Prescripción del Preparador Físico de CAD Norte
              </h3>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed bg-[#081836] p-3.5 rounded-xl border border-blue-900/60">
              {recommendation}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-blue-900/80 bg-[#040e21] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
