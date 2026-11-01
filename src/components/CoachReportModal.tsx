import React from 'react';
import { 
  X, 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Activity, 
  Clock, 
  Flame,
  MapPin
} from 'lucide-react';
import { CalculatedPlayerMetrics, Session } from '../types/catapult';
import { getPositionColor } from '../utils/sportsScience';
import { CADNorteLogo } from './CADNorteLogo';

interface CoachReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  calculatedMetrics: CalculatedPlayerMetrics[];
}

export const CoachReportModal: React.FC<CoachReportModalProps> = ({
  isOpen,
  onClose,
  session,
  calculatedMetrics,
}) => {
  if (!isOpen) return null;

  const greenPlayers = calculatedMetrics.filter(m => m.riskLevel === 'green');
  const yellowPlayers = calculatedMetrics.filter(m => m.riskLevel === 'yellow');
  const redPlayers = calculatedMetrics.filter(m => m.riskLevel === 'red');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        
        {/* Header with CAD Norte crest */}
        <div className="p-5 border-b border-blue-900/80 flex items-center justify-between bg-[#040e21] sticky top-0 z-10 print:static print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <CADNorteLogo size={46} className="print:invert" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white print:text-black">
                  Club Atlético Deportivo Norte - Informe Técnico
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-black print:border print:border-black print:text-black">
                  La Liga Argentina
                </span>
              </div>
              <p className="text-xs text-blue-200/80 print:text-gray-600 font-medium">
                Depto. de Preparación Física &amp; Rendimiento Catapult • D.T. Fernando Cupulutti &amp; Staff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-300 hover:text-white bg-blue-950 hover:bg-blue-900 rounded-xl transition-colors border border-blue-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-6 print:p-0 print:space-y-4">
          
          {/* Session Banner */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 flex flex-wrap items-center justify-between gap-4 print:bg-gray-100 print:border-black">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider print:text-black">
                {session.title} • {session.type} • Estadio Jorge Ferrero (Armstrong)
              </span>
              <h3 className="text-base font-black text-white print:text-black">
                Reporte de Carga Mecánica &amp; Estado Fisiológico del Plantel
              </h3>
              <p className="text-xs text-blue-200/80 print:text-gray-700">
                Fecha de medición: {session.date} | Dispositivos telemétricos: Catapult OpenField / Vector S7
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-300 block print:text-black font-semibold">Disponibilidad Plantel:</span>
              <strong className="text-xl text-emerald-400 font-black print:text-black">
                {greenPlayers.length} / {calculatedMetrics.length} Aptos 100%
              </strong>
            </div>
          </div>

          {/* RED LIST: High Alert */}
          {redPlayers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400 print:text-red-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Atletas en Alerta Roja - Carga Restringida Obligatoria ({redPlayers.length})
                </h3>
              </div>
              <div className="space-y-2">
                {redPlayers.map(m => (
                  <div key={m.player.id} className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 print:bg-red-50 print:border-red-400">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-white text-sm print:text-black">#{m.player.jerseyNumber} {m.player.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPositionColor(m.player.position)} print:border-black print:text-black`}>
                          {m.player.position}
                        </span>
                        <span className="text-xs font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 print:text-red-800">
                          ACWR {m.acwr}
                        </span>
                      </div>
                      <div className="text-xs text-blue-100 font-medium print:text-gray-800">
                        PL: <strong>{m.record.totPL}</strong> | Saltos: <strong>{m.record.totJumps}</strong> | Dist: <strong>{m.record.totDistM}m</strong>
                      </div>
                    </div>
                    <p className="text-xs text-rose-200 mt-2 font-medium print:text-red-950">
                      ⚠️ {m.alerts[0] || 'Carga crítica acumulada.'}
                    </p>
                    <div className="mt-2 text-xs bg-[#040e21] p-2.5 rounded-xl border border-blue-900/60 text-blue-100 print:bg-white print:border-black print:text-black">
                      <strong>Prescripción física para el DT:</strong> {m.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YELLOW LIST: Caution */}
          {yellowPlayers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 print:text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Atletas en Observación / Carga Regulada ({yellowPlayers.length})
                </h3>
              </div>
              <div className="space-y-2">
                {yellowPlayers.map(m => (
                  <div key={m.player.id} className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 print:bg-amber-50 print:border-amber-400">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-xs sm:text-sm print:text-black">#{m.player.jerseyNumber} {m.player.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPositionColor(m.player.position)} print:border-black print:text-black`}>
                          {m.player.position}
                        </span>
                      </div>
                      <span className="text-xs text-amber-300 font-black print:text-amber-900">ACWR: {m.acwr}</span>
                    </div>
                    <p className="text-xs text-blue-100 mt-1.5 print:text-black">
                      <strong>Recomendación:</strong> {m.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GREEN LIST: 100% Available */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 print:text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                Atletas Disponibles al 100% para Carga Completa ({greenPlayers.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {greenPlayers.map(m => (
                <div key={m.player.id} className="bg-[#040e21] p-3 rounded-xl border border-blue-900/60 print:bg-white print:border-black">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs print:text-black">#{m.player.jerseyNumber} {m.player.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold print:text-green-700">Óptimo</span>
                  </div>
                  <div className="text-[11px] text-blue-200/70 mt-1 print:text-gray-700">
                    PL: {m.record.totPL} • Saltos: {m.record.totJumps} • ACWR: {m.acwr}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/80 bg-[#040e21] flex items-center justify-between print:hidden">
          <span className="text-xs text-blue-300/80">
            Firma: Preparador Físico • Club Atlético Deportivo Norte (Armstrong, Santa Fe)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar Reporte
          </button>
        </div>

      </div>
    </div>
  );
};
