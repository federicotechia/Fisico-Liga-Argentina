import React from 'react';
import { 
  X, 
  HelpCircle, 
  Activity, 
  Flame, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Award,
  MapPin
} from 'lucide-react';
import { CADNorteLogo } from './CADNorteLogo';

interface CatapultGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatapultGuideModal: React.FC<CatapultGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/80 flex items-center justify-between bg-[#040e21] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <CADNorteLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Guía Científica: Catapult &amp; Deportivo Norte</h2>
                <span className="text-[10px] bg-blue-900/60 text-sky-300 px-2 py-0.5 rounded-full border border-blue-700/60 font-bold">
                  OpenField™ Manual
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Fundamentos telemétricos, control de fatiga y prevención de lesiones en La Liga Argentina.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white bg-blue-950 hover:bg-blue-900 rounded-xl transition-colors border border-blue-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-blue-100 leading-relaxed">
          
          {/* About Catapult & CAD Norte */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="w-4 h-4 text-sky-400" />
              <span>Tecnología Catapult en el Club Atlético Deportivo Norte</span>
            </div>
            <p className="text-blue-200/90">
              Catapult (fundada en Melbourne, Australia, en 2006) es la tecnología líder mundial en seguimiento y monitoreo biomecánico para básquetbol profesional. En Deportivo Norte, los sensores Vector S7 / T7 miden en tiempo real aceleraciones en 3 ejes a 100 Hz, volumen de saltos y carga metabólica en el Estadio Jorge Ferrero.
            </p>
          </div>

          {/* Metric 1: PlayerLoad */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
              <Flame className="w-4 h-4 text-sky-400" />
              <span>PlayerLoad™ (PL) y PlayerLoad por Minuto (PL/min)</span>
            </div>
            <p className="text-blue-200/90">
              Es la <strong>fórmula de carga externa acumulada</strong> de Catapult. En la cancha de 28x15m, la distancia no refleja la dureza del básquet; el PlayerLoad mide el esfuerzo de cada frenada brusca, choque con pantallas, aceleración y salto.
            </p>
            <div className="bg-[#081836] p-2.5 rounded-xl border border-blue-900 text-[11px] font-mono text-sky-300">
              Fórmula: PL = √ [ ((ay,t - ay,t-1)² + (ax,t - ax,t-1)² + (az,t - az,t-1)²) / 100 ]
            </div>
          </div>

          {/* Metric 2: Jumps and BMP */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>Volumen de Saltos (Tot Jump #) y Fatiga Patelar</span>
            </div>
            <p className="text-blue-200/90">
              Los saltos reiterados generan estrés excéntrico sobre el tendón rotuliano y el tríceps sural. Jugadores con más de 120 saltos en una práctica (como Contrera o Scachi) deben tener ejercicios de salto limitados en la sesión siguiente para evitar picos de inflamación.
            </p>
          </div>

          {/* ACWR Science */}
          <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Ratio ACWR (Acute:Chronic Workload Ratio)</span>
            </div>
            <p className="text-blue-200/90">
              Desarrollado por el Dr. Tim Gabbett. Compara la fatiga de los últimos 7 días contra la base física de 28 días:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-[#081836] p-2.5 rounded-xl border border-blue-600/40 text-center">
                <span className="font-bold text-sky-400">&lt; 0.80</span>
                <span className="block text-[10px] text-blue-300/70">Infraentrenamiento</span>
              </div>
              <div className="bg-[#081836] p-2.5 rounded-xl border border-emerald-500/40 text-center">
                <span className="font-bold text-emerald-400">0.80 - 1.30</span>
                <span className="block text-[10px] text-blue-300/70">Sweet Spot (Óptimo)</span>
              </div>
              <div className="bg-[#081836] p-2.5 rounded-xl border border-amber-500/40 text-center">
                <span className="font-bold text-amber-400">1.30 - 1.50</span>
                <span className="block text-[10px] text-blue-300/70">Precaución / Fatiga</span>
              </div>
              <div className="bg-[#081836] p-2.5 rounded-xl border border-rose-500/40 text-center">
                <span className="font-bold text-rose-400">&gt; 1.50</span>
                <span className="block text-[10px] text-blue-300/70">Peligro de Lesión</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/80 bg-[#040e21] flex justify-between items-center">
          <a
            href="https://cadnorte.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:text-white flex items-center gap-1 font-bold"
          >
            <span>Sitio Oficial CAD Norte</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
