import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ChevronRight, 
  Flame, 
  Gauge, 
  HeartHandshake, 
  Info, 
  ShieldAlert, 
  Zap, 
  Search,
  Filter,
  MapPin,
  Trophy,
  Trash2
} from 'lucide-react';
import { CalculatedPlayerMetrics, Session } from '../types/catapult';
import { getPositionColor, getRiskBadge } from '../utils/sportsScience';
import { CADNorteLogo } from './CADNorteLogo';

interface SessionOverviewProps {
  session: Session;
  calculatedMetrics: CalculatedPlayerMetrics[];
  onSelectPlayer: (playerId: string) => void;
  onOpenDeleteModal?: () => void;
}

export const SessionOverview: React.FC<SessionOverviewProps> = ({
  session,
  calculatedMetrics,
  onSelectPlayer,
  onOpenDeleteModal,
}) => {
  const sessionTypes = Array.isArray(session.type) ? session.type : [session.type];
  const typeDurationSummary = sessionTypes
    .map(sessionType => {
      const minutes = session.typeDurations?.[sessionType];
      return minutes ? `${sessionType}: ${minutes} min` : null;
    })
    .filter((entry): entry is string => entry !== null)
    .join(' · ');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeChartMetric, setActiveChartMetric] = useState<'totPL' | 'totDistM' | 'totJumps' | 'bmpBasketballLoad'>('totPL');

  // Aggregated team numbers
  const totalDist = calculatedMetrics.reduce((sum, m) => sum + m.record.totDistM, 0);
  const avgDist = Math.round(totalDist / (calculatedMetrics.length || 1));
  const totalPL = calculatedMetrics.reduce((sum, m) => sum + m.record.totPL, 0);
  const avgPL = Math.round(totalPL / (calculatedMetrics.length || 1));
  const totalJumps = calculatedMetrics.reduce((sum, m) => sum + m.record.totJumps, 0);
  const avgJumps = Math.round(totalJumps / (calculatedMetrics.length || 1));
  const totalBMP = calculatedMetrics.reduce((sum, m) => sum + m.record.bmpBasketballLoad, 0);

  const redRiskCount = calculatedMetrics.filter(m => m.riskLevel === 'red').length;
  const yellowRiskCount = calculatedMetrics.filter(m => m.riskLevel === 'yellow').length;

  // Filtered rows
  const filteredMetrics = calculatedMetrics.filter(m => {
    const matchesPos = positionFilter === 'all' || m.player.position === positionFilter;
    const matchesSearch = m.player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPos && matchesSearch;
  });

  // Chart data
  const chartData = calculatedMetrics.map(m => ({
    name: m.player.name.split(' ')[0],
    fullName: m.player.name,
    totPL: m.record.totPL,
    totDistM: m.record.totDistM,
    totJumps: m.record.totJumps,
    bmpBasketballLoad: m.record.bmpBasketballLoad,
    plPerMin: m.plPerMin,
    risk: m.riskLevel,
  }));

  const getMetricTitle = () => {
    switch (activeChartMetric) {
      case 'totPL': return 'Total PlayerLoad™ (Carga Triaxial Catapult)';
      case 'totDistM': return 'Distancia Total Recorrida (Metros)';
      case 'totJumps': return 'Volumen Total de Saltos (Tot Jump #)';
      case 'bmpBasketballLoad': return 'Basketball Movement Profile Load (BMP)';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CAD Norte Hero Banner & Session Info */}
      <div className="bg-gradient-to-r from-[#071733] via-[#09224b] to-[#071733] border border-blue-900/80 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative subtle shield watermark */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <CADNorteLogo size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white border border-blue-400/40 shadow-sm">
                {session.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0f2d60] text-sky-200 border border-blue-800">
                {sessionTypes.join(' + ')}
              </span>
              <span className="text-xs text-blue-200/90 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-sky-400" />
                Estadio Jorge Ferrero (Armstrong)
              </span>
              <span className="text-xs text-blue-300/80">
                • Fecha: <strong className="text-white">{session.date}</strong>
              </span>
              <span className="text-xs text-blue-300/80">
                • Duración total: <strong className="text-white">{session.durationMinutes} min</strong>
                {typeDurationSummary && <span className="ml-2 text-[11px] text-blue-200/70">({typeDurationSummary})</span>}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Club Atlético Deportivo Norte</span>
              <span className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-400/30">
                La Liga Argentina
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-3xl leading-relaxed">
              {session.notes || 'Informe telemétrico de sensores inerciales Catapult Vector con foco en control de fatiga y prevención de lesiones.'}
            </p>
          </div>

          {/* Quick Risk Indicator Box & Session Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-[#051124]/90 px-4 py-3 rounded-2xl border border-blue-900/80 shadow-lg">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Estado Plantel</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    {redRiskCount} Alerta Roja
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {yellowRiskCount} Precaución
                  </span>
                </div>
              </div>
            </div>

            {onOpenDeleteModal && (
              <button
                onClick={onOpenDeleteModal}
                title="Eliminar esta sesión de la base de datos"
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white border border-rose-800/60 rounded-2xl text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Eliminar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (CAD Norte Blue Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total PlayerLoad */}
        <div className="bg-[#081836] border border-blue-900/60 rounded-2xl p-4 shadow-lg hover:border-blue-600/60 transition-all">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">PlayerLoad™ CAD Norte</span>
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30">
              <Flame className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalPL.toLocaleString()}</span>
            <span className="text-xs font-bold text-sky-400">Tot PL</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-200/80 flex items-center justify-between border-t border-blue-950 pt-2 font-medium">
            <span>Media atleta: <strong className="text-white">{avgPL}</strong></span>
            <span className="text-sky-400 font-bold">Carga Triaxial</span>
          </div>
        </div>

        {/* Total Distance */}
        <div className="bg-[#081836] border border-blue-900/60 rounded-2xl p-4 shadow-lg hover:border-blue-600/60 transition-all">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Distancia Total</span>
            <div className="p-2 rounded-xl bg-sky-600/30 text-sky-300 border border-sky-500/30">
              <Zap className="w-4 h-4 text-sky-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{(totalDist / 1000).toFixed(2)}</span>
            <span className="text-xs font-bold text-sky-400">km</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-200/80 flex items-center justify-between border-t border-blue-950 pt-2 font-medium">
            <span>Media atleta: <strong className="text-white">{avgDist} m</strong></span>
            <span className="text-sky-400 font-bold">{totalDist.toLocaleString()} m</span>
          </div>
        </div>

        {/* Total Jumps */}
        <div className="bg-[#081836] border border-blue-900/60 rounded-2xl p-4 shadow-lg hover:border-blue-600/60 transition-all">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Saltos Totales</span>
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalJumps.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400">saltos</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-200/80 flex items-center justify-between border-t border-blue-950 pt-2 font-medium">
            <span>Media atleta: <strong className="text-white">{avgJumps}</strong></span>
            <span className="text-emerald-400 font-bold">Estrés articular</span>
          </div>
        </div>

        {/* BMP Basketball Load */}
        <div className="bg-[#081836] border border-blue-900/60 rounded-2xl p-4 shadow-lg hover:border-blue-600/60 transition-all">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">BMP Basketball Load</span>
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              <Gauge className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalBMP.toLocaleString()}</span>
            <span className="text-xs font-bold text-indigo-300">BMP Tot</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-200/80 flex items-center justify-between border-t border-blue-950 pt-2 font-medium">
            <span>Especificidad: <strong className="text-white">{((totalBMP / (totalPL || 1)) * 100).toFixed(0)}%</strong></span>
            <span className="text-indigo-400 font-bold">Movimiento Liga</span>
          </div>
        </div>

      </div>

      {/* Critical Coach Alerts Card */}
      {(redRiskCount > 0 || yellowRiskCount > 0) && (
        <div className="bg-[#081836] border-l-4 border-l-rose-500 border border-blue-900/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              Alertas Prioritarias de Fatiga y Prevención para el Preparador Físico
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calculatedMetrics
              .filter(m => m.riskLevel !== 'green' || m.record.totJumps > 120 || m.record.totPL > 290)
              .map(m => (
                <div 
                  key={m.player.id}
                  onClick={() => onSelectPlayer(m.player.id)}
                  className="bg-[#040e21] p-3.5 rounded-xl border border-blue-900/60 hover:border-blue-500/70 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white hover:text-sky-400 transition-colors">
                          {m.player.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPositionColor(m.player.position)}`}>
                          {m.player.position}
                        </span>
                      </div>
                      <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                        {m.alerts[0] || 'Patrón de alta demanda física que requiere dosificación.'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border shrink-0 ${getRiskBadge(m.riskLevel).bg}`}>
                      {getRiskBadge(m.riskLevel).short}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-950 flex items-center justify-between text-[11px] text-blue-200/70 font-medium">
                    <span>PL: <strong className="text-white">{m.record.totPL}</strong> | Saltos: <strong className="text-white">{m.record.totJumps}</strong></span>
                    <span className="text-sky-400 hover:underline flex items-center gap-0.5 font-bold">
                      Ver ficha <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recharts Bar Chart in CAD Norte Blue Palette */}
      <div className="bg-[#081836] border border-blue-900/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Comparativa del Plantel CAD Norte</span>
              <span className="text-xs font-normal text-blue-300/80">({getMetricTitle()})</span>
            </h2>
            <p className="text-xs text-blue-200/70">
              Datos registrados por dispositivos Catapult OpenField para la {session.title}.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap gap-1 bg-[#040e21] p-1 rounded-xl border border-blue-900/80 text-xs">
            <button
              onClick={() => setActiveChartMetric('totPL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeChartMetric === 'totPL' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:text-white'
              }`}
            >
              PlayerLoad
            </button>
            <button
              onClick={() => setActiveChartMetric('totDistM')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeChartMetric === 'totDistM' ? 'bg-sky-600 text-white shadow-sm' : 'text-blue-300 hover:text-white'
              }`}
            >
              Distancia (m)
            </button>
            <button
              onClick={() => setActiveChartMetric('totJumps')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeChartMetric === 'totJumps' ? 'bg-emerald-600 text-white shadow-sm' : 'text-blue-300 hover:text-white'
              }`}
            >
              Saltos
            </button>
            <button
              onClick={() => setActiveChartMetric('bmpBasketballLoad')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeChartMetric === 'bmpBasketballLoad' ? 'bg-indigo-600 text-white shadow-sm' : 'text-blue-300 hover:text-white'
              }`}
            >
              BMP Load
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" opacity={0.3} />
              <XAxis 
                dataKey="fullName" 
                tick={{ fill: '#93c5fd', fontSize: 11 }} 
                angle={-20} 
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: '#93c5fd', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#040e21', 
                  borderColor: '#1e3a8a', 
                  borderRadius: '0.75rem', 
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(val: any) => [val, getMetricTitle()]}
              />
              <Bar dataKey={activeChartMetric} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => {
                  let fillColor = '#2563eb'; // CAD Norte Royal Blue
                  if (activeChartMetric === 'totDistM') fillColor = '#0284c7';
                  if (activeChartMetric === 'totJumps') fillColor = '#059669';
                  if (activeChartMetric === 'bmpBasketballLoad') fillColor = '#4f46e5';
                  
                  if (entry.risk === 'red') fillColor = '#f43f5e';
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Athlete Data & Fatigue Traffic Light Table */}
      <div className="bg-[#081836] border border-blue-900/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-blue-900/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Semáforo de Carga y Prevención de Lesiones</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/60 text-sky-200 font-bold border border-blue-700/50">
                {filteredMetrics.length} Jugadores
              </span>
            </h2>
            <p className="text-xs text-blue-200/70">
              Correlación telemétrica Catapult OpenField, saltos acumulados y recomendación física.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#040e21] border border-blue-900/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Position filter */}
            <div className="flex items-center gap-1 bg-[#040e21] p-1 rounded-xl border border-blue-900/80 text-xs">
              <Filter className="w-3.5 h-3.5 text-blue-400 ml-1" />
              {(['all', 'Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'] as const).map((pos) => (
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

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#040e21]/90 text-blue-300 font-bold border-b border-blue-900/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Atleta</th>
                <th className="py-3 px-3">Posición</th>
                <th className="py-3 px-3 text-right">Tot Dist (m)</th>
                <th className="py-3 px-3 text-right">Tot PL</th>
                <th className="py-3 px-3 text-right">PL / Min</th>
                <th className="py-3 px-3 text-right">Tot Jump #</th>
                <th className="py-3 px-3 text-right">BMP Tot Load</th>
                <th className="py-3 px-3 text-center">ACWR (7:28)</th>
                <th className="py-3 px-3 text-center">Semáforo</th>
                <th className="py-3 px-4">Acción / Recomendación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950">
              {filteredMetrics.map((m) => {
                const badge = getRiskBadge(m.riskLevel);
                const isJumpSpike = m.record.totJumps >= 120;
                const isPLSpike = m.record.totPL >= 290;

                return (
                  <tr 
                    key={m.player.id}
                    onClick={() => onSelectPlayer(m.player.id)}
                    className="hover:bg-blue-900/20 cursor-pointer transition-colors"
                  >
                    {/* Player Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center font-black text-white text-xs shrink-0 border border-blue-400/40 shadow-sm">
                          #{m.player.jerseyNumber}
                        </div>
                        <div>
                          <div className="font-black text-white text-xs sm:text-sm hover:text-sky-300 transition-colors">
                            {m.player.name}
                          </div>
                          <div className="text-[10px] text-blue-200/70">
                            {m.record.minutesPlayed} min de juego/práctica
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPositionColor(m.player.position)}`}>
                        {m.player.position}
                      </span>
                    </td>

                    {/* Tot Dist (m) */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-100">
                      {m.record.totDistM.toLocaleString()} m
                    </td>

                    {/* Tot PL */}
                    <td className="py-3 px-3 text-right font-black text-white">
                      <span className={isPLSpike ? 'text-amber-300' : 'text-sky-300'}>
                        {m.record.totPL}
                      </span>
                    </td>

                    {/* PL / min */}
                    <td className="py-3 px-3 text-right text-blue-100">
                      <span className="font-bold">{m.plPerMin}</span>
                      <span className="text-[10px] text-blue-300/60 ml-0.5">/min</span>
                    </td>

                    {/* Tot Jump # */}
                    <td className="py-3 px-3 text-right">
                      <span className={`font-black ${isJumpSpike ? 'text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-lg' : 'text-slate-100'}`}>
                        {m.record.totJumps}
                      </span>
                    </td>

                    {/* BMP Tot Basketball Load */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-indigo-300">{m.record.bmpBasketballLoad}</span>
                      <span className="text-[10px] text-blue-300/60 block">{m.bmpRatio}% PL</span>
                    </td>

                    {/* ACWR */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                          m.acwr >= 1.5 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          m.acwr >= 1.3 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          m.acwr < 0.8 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {m.acwr}
                        </span>
                        <span className="text-[9px] text-blue-300/60 mt-0.5 font-medium">
                          {m.acwr >= 1.5 ? 'Peligro' : m.acwr >= 1.3 ? 'Precaución' : m.acwr < 0.8 ? 'Bajo' : 'Óptimo'}
                        </span>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.badge}`}></span>
                        {badge.short}
                      </span>
                    </td>

                    {/* Recommendation / Action */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-blue-100/90 line-clamp-2 leading-relaxed">
                        {m.recommendation}
                      </p>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
