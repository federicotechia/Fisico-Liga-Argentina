import React from 'react';
import { 
  Activity, 
  PlusCircle, 
  FileSpreadsheet, 
  FileText, 
  HelpCircle, 
  Calendar, 
  MapPin,
  ExternalLink,
  Share2,
  Check,
  Trash2,
  Users,
} from 'lucide-react';
import { SeasonCompetition, Session } from '../types/catapult';
import { CADNorteLogo } from './CADNorteLogo';
import { DateFilter } from './DateFilter';

interface NavbarProps {
  sessions: Session[];
  seasons: SeasonCompetition[];
  selectedSeasonId: string;
  onSelectSeason: (seasonId: string) => void;
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
  activeView: 'overview' | 'acwr' | 'roster';
  setActiveView: (view: 'overview' | 'acwr' | 'roster') => void;
  onOpenSyncModal: () => void;
  onOpenAddModal: () => void;
  onOpenReportModal: () => void;
  onOpenGuideModal: () => void;
  onOpenDeleteModal: () => void;
  canEdit?: boolean;
  canManageUsers?: boolean;
  onOpenMembers?: () => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  analysisScope: 'range' | 'global';
  onAnalysisScopeChange: (scope: 'range' | 'global') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sessions,
  seasons,
  selectedSeasonId,
  onSelectSeason,
  selectedSessionId,
  onSelectSession,
  activeView,
  setActiveView,
  onOpenSyncModal,
  onOpenAddModal,
  onOpenReportModal,
  onOpenGuideModal,
  onOpenDeleteModal,
  canEdit = true,
  canManageUsers = false,
  onOpenMembers,
  dateRange,
  onDateRangeChange,
  analysisScope,
  onAnalysisScopeChange,
}) => {
  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#071326] border-b border-blue-900/60 text-white shadow-2xl">
      
      {/* Top CAD Norte Institutional Bar (matches cadnorte.com.ar top strip) */}
      <div className="bg-[#040c1a] border-b border-blue-950/80 px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] text-blue-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            CLUB ATLÉTICO DEPORTIVO NORTE
          </span>
          <span className="hidden sm:inline text-blue-400/60">|</span>
          <span className="hidden sm:flex items-center gap-1 text-slate-300">
            <MapPin className="w-3 h-3 text-blue-400" />
            Fischer 856, Armstrong, Santa Fe
          </span>
          <span className="hidden md:inline text-blue-400/60">|</span>
          <span className="hidden md:inline text-sky-400 font-semibold">
            Estadio Jorge Ferrero • La Liga Argentina de Básquet
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs">
          <a
            href="https://cadnorte.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            <span>cadnorte.com.ar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-blue-400/60">|</span>
          <span className="text-[11px] text-slate-400">
            Depto. Preparación Física &amp; Catapult OpenField
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-18 gap-3 py-2">
          
          {/* Brand & CAD Norte Shield */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer">
              <CADNorteLogo size={46} className="filter drop-shadow-[0_2px_10px_rgba(29,78,216,0.5)] transition-transform group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg text-white font-sans uppercase">
                  DEPORTIVO NORTE
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-blue-600 text-white tracking-wider border border-blue-400/50 shadow-sm">
                  ARMSTRONG
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-blue-300 border border-blue-900 hidden lg:inline">
                  OPENFIELD™
                </span>
              </div>
              <p className="text-[11px] text-blue-300/80 font-medium">
                Monitoreo de Carga, Fatiga &amp; Prevención de Lesiones
              </p>
            </div>
          </div>

          {/* Session Selector & Date Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-blue-800/60 bg-[#091b38] px-3.5 py-2 shadow-inner">
              <span className="text-xs font-semibold text-blue-200">Temporada:</span>
              <select
                value={selectedSeasonId}
                onChange={event => onSelectSeason(event.target.value)}
                aria-label="Seleccionar temporada y competencia"
                className="max-w-[220px] bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {seasons.map(season => (
                  <option key={season.id} value={season.id} className="bg-[#071326] text-white">
                    {season.season} · {season.competition}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-[#091b38] px-3.5 py-2 rounded-xl border border-blue-800/60 shadow-inner">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-blue-200 hidden sm:inline">Sesión:</span>
              <select
                value={currentSession?.id || ''}
                onChange={(e) => onSelectSession(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-2"
                disabled={sessions.length === 0}
              >
                {sessions.length === 0 && <option value="" className="bg-[#071326] text-white">Sin sesiones</option>}
                {sessions.map((sess) => (
                  <option key={sess.id} value={sess.id} className="bg-[#071326] text-white">
                    {sess.title} ({sess.date}) - {Array.isArray(sess.type) ? sess.type.join(' + ') : sess.type}
                  </option>
                ))}
              </select>
              {canEdit && currentSession && <button
                onClick={onOpenDeleteModal}
                title={`Eliminar ${currentSession.title}`}
                className="p-1 text-blue-300/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>}
            </div>
            
            <DateFilter range={dateRange} onChange={onDateRangeChange} scope={analysisScope} onScopeChange={onAnalysisScopeChange} />
          </div>

          {/* Navigation Views */}
          <div className="hidden lg:flex items-center gap-1 bg-[#091b38]/80 p-1 rounded-xl border border-blue-900/80">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900/40'
              }`}
            >
              Sesión &amp; Semáforo
            </button>
            <button
              onClick={() => setActiveView('acwr')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'acwr'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900/40'
              }`}
            >
              ACWR &amp; Carga Crónica
            </button>
            <button
              onClick={() => setActiveView('roster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'roster'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900/40'
              }`}
            >
              Plantel ({currentSession?.records.length ?? 0})
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-blue-950/80 bg-[#040c1a] p-1.5 shadow-inner">
            {canEdit && <button
              onClick={onOpenSyncModal}
              title="Sincronizar pestañas de Google Sheets o importar OpenField"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1d39] hover:bg-[#12305b] text-sky-200 border border-blue-700/60 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>}

            {canEdit && <button
              onClick={onOpenAddModal}
              title="Registrar nueva sesión de entrenamiento o partido"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Nueva Sesión</span>
            </button>}

            {canManageUsers && <button
              onClick={onOpenMembers}
              title="Administrar usuarios y roles"
              aria-label="Administrar usuarios y roles"
              className="p-2 text-sky-200 hover:text-white bg-[#091b38] hover:bg-blue-900/50 rounded-xl border border-blue-800/80 transition-colors"
            >
              <Users className="w-4 h-4" />
            </button>}

            <button
              onClick={handleCopyLink}
              title="Copiar enlace para compartir con el Cuerpo Técnico"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#102850] hover:bg-[#1a3a70] text-blue-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-700/60 shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden xl:inline">Compartir</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenReportModal}
              title="Informe para el Cuerpo Técnico / Head Coach"
              className="p-2 text-blue-200 hover:text-white bg-[#091b38] hover:bg-blue-900/50 rounded-xl border border-blue-800/80 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenGuideModal}
              title="Métricas Catapult y Guía ACWR"
              className="p-2 text-blue-300 hover:text-white bg-[#091b38] hover:bg-blue-900/50 rounded-xl border border-blue-800/80 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation View Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-blue-950 text-xs">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-1 px-2 rounded-lg font-bold ${
              activeView === 'overview' ? 'text-sky-400 bg-blue-900/30' : 'text-blue-300/80'
            }`}
          >
            Sesión &amp; Semáforo
          </button>
          <button
            onClick={() => setActiveView('acwr')}
            className={`py-1 px-2 rounded-lg font-bold ${
              activeView === 'acwr' ? 'text-sky-400 bg-blue-900/30' : 'text-blue-300/80'
            }`}
          >
            ACWR &amp; Carga
          </button>
          <button
            onClick={() => setActiveView('roster')}
            className={`py-1 px-2 rounded-lg font-bold ${
              activeView === 'roster' ? 'text-sky-400 bg-blue-900/30' : 'text-blue-300/80'
            }`}
          >
            Plantel ({currentSession?.records.length ?? 0})
          </button>
        </div>
      </div>
    </header>
  );
};
