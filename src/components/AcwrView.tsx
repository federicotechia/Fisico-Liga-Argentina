import React from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  TrendingUp, 
  Zap,
  MapPin
} from 'lucide-react';
import { CalculatedPlayerMetrics, Session } from '../types/catapult';
import { getRiskBadge } from '../utils/sportsScience';
import { CADNorteLogo } from './CADNorteLogo';

interface AcwrViewProps {
  calculatedMetrics: CalculatedPlayerMetrics[];
  sessions: Session[];
  onSelectPlayer: (playerId: string) => void;
}

export const AcwrView: React.FC<AcwrViewProps> = ({
  calculatedMetrics,
  sessions,
  onSelectPlayer,
}) => {
  const scatterData = calculatedMetrics.map(m => ({
    name: m.player.name,
    playerId: m.player.id,
    chronicLoad: m.chronicLoad28d,
    acuteLoad: m.acuteLoad7d,
    acwr: m.acwr,
    risk: m.riskLevel,
    totPL: m.record.totPL,
    position: m.player.position,
  }));

  const maxLoad = Math.max(...scatterData.map(d => Math.max(d.chronicLoad, d.acuteLoad)), 350) + 50;

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#071733] via-[#09224b] to-[#071733] border border-blue-900/80 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <CADNorteLogo size={180} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white border border-blue-400/40 shadow-sm">
                CAD Norte Sports Science
              </span>
              <span className="text-xs text-blue-200/80">Modelo Tim Gabbett / Catapult</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Matriz ACWR del Plantel (Carga Aguda : Carga Crónica)
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-3xl leading-relaxed">
              Monitoreo del ratio agudo/crónico para la plantilla de La Liga Argentina. Mantener a los jugadores en la <strong>zona óptima (0.80 - 1.30)</strong> minimiza el riesgo de lesiones musculares y tendinopatías en semanas con múltiples partidos.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#051124] p-2.5 rounded-2xl border border-blue-900/80 text-xs shrink-0 shadow-lg">
            <div className="flex flex-col items-center px-3 py-1 border-r border-blue-900">
              <span className="text-[10px] text-blue-300 font-bold uppercase">Sweet Spot</span>
              <span className="text-emerald-400 font-black">0.8 - 1.3</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1 border-r border-blue-900">
              <span className="text-[10px] text-blue-300 font-bold uppercase">Precaución</span>
              <span className="text-amber-400 font-black">1.3 - 1.5</span>
            </div>
            <div className="flex flex-col items-center px-3 py-1">
              <span className="text-[10px] text-blue-300 font-bold uppercase">Peligro</span>
              <span className="text-rose-400 font-black">&gt; 1.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scatter Matrix */}
      <div className="bg-[#081836] border border-blue-900/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <span>Mapa de Dispersión: Carga Aguda vs Carga Crónica</span>
            </h2>
            <p className="text-xs text-blue-200/70">
              Cada punto representa un atleta de Deportivo Norte. Haz clic en cualquier jugador para abrir su ficha completa.
            </p>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="chronicLoad" 
                name="Carga Crónica (28 días)" 
                domain={[100, maxLoad]}
                tick={{ fill: '#93c5fd', fontSize: 11 }}
                label={{ value: 'Carga Crónica (28 días - Fitness acumulado en CAD Norte)', position: 'insideBottom', offset: -10, fill: '#93c5fd', fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="acuteLoad" 
                name="Carga Aguda (7 días)" 
                domain={[100, maxLoad]}
                tick={{ fill: '#93c5fd', fontSize: 11 }}
                label={{ value: 'Carga Aguda (7 días - Fatiga reciente)', angle: -90, position: 'insideLeft', offset: 0, fill: '#93c5fd', fontSize: 11 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#040e21] border border-blue-800 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="font-black text-white text-sm">{data.name}</p>
                        <p className="text-blue-200">Posición: <strong className="text-white">{data.position}</strong></p>
                        <p className="text-blue-200">ACWR: <strong className="text-sky-400">{data.acwr}</strong></p>
                        <p className="text-blue-200">Carga Aguda (7d): <strong className="text-white">{data.acuteLoad} PL</strong></p>
                        <p className="text-blue-200">Carga Crónica (28d): <strong className="text-white">{data.chronicLoad} PL</strong></p>
                        <p className="text-blue-200">Sesión Actual: <strong className="text-white">{data.totPL} PL</strong></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                name="Atletas" 
                data={scatterData} 
                onClick={(e: any) => onSelectPlayer(e.playerId)}
                cursor="pointer"
              >
                {scatterData.map((entry, index) => {
                  let fillColor = '#10b981';
                  if (entry.risk === 'yellow') fillColor = '#f59e0b';
                  if (entry.risk === 'red') fillColor = '#f43f5e';
                  return <Cell key={`cell-${index}`} fill={fillColor} stroke="#ffffff" strokeWidth={1.5} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-blue-900/60 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Zona Óptima (ACWR 0.80 - 1.30)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Alerta Fatiga (ACWR 1.30 - 1.50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Riesgo Crítico de Lesión (ACWR &gt; 1.50 o picos &gt; 1.5σ)</span>
          </div>
        </div>
      </div>

      {/* Athlete ACWR Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {calculatedMetrics.map(m => {
          const badge = getRiskBadge(m.riskLevel);
          return (
            <div 
              key={m.player.id}
              onClick={() => onSelectPlayer(m.player.id)}
              className="bg-[#081836] border border-blue-900/70 hover:border-blue-500 rounded-2xl p-4 shadow-lg cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white hover:text-sky-300 transition-colors">
                    {m.player.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                    {badge.short}
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between my-2">
                  <span className="text-xs text-blue-300">Ratio ACWR:</span>
                  <span className={`text-2xl font-black ${
                    m.acwr >= 1.5 ? 'text-rose-400' :
                    m.acwr >= 1.3 ? 'text-amber-400' :
                    m.acwr < 0.8 ? 'text-sky-400' :
                    'text-emerald-400'
                  }`}>
                    {m.acwr}
                  </span>
                </div>

                {/* Bar gauge */}
                <div className="w-full bg-[#040e21] h-2 rounded-full overflow-hidden flex mb-3 border border-blue-950">
                  <div 
                    className={`h-full ${
                      m.riskLevel === 'red' ? 'bg-rose-500' : m.riskLevel === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (m.acwr / 1.8) * 100)}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-blue-200/80 space-y-1">
                  <div className="flex justify-between">
                    <span>Carga Aguda (7d):</span>
                    <strong className="text-white">{m.acuteLoad7d} PL</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Carga Crónica (28d):</span>
                    <strong className="text-white">{m.chronicLoad28d} PL</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Saltos en sesión:</span>
                    <strong className="text-white">{m.record.totJumps}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blue-900/60 text-[10px] text-blue-200/70 line-clamp-1">
                {m.recommendation}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
