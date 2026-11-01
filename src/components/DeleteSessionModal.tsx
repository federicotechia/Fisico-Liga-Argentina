import React from 'react';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { Session } from '../types/catapult';

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onConfirmDelete: (sessionId: string) => void;
  totalSessions: number;
}

export const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onConfirmDelete,
  totalSessions,
}) => {
  if (!isOpen || !session) return null;

  const isOnlySession = totalSessions <= 1;

  const handleConfirm = () => {
    if (isOnlySession) return;
    onConfirmDelete(session.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/80 flex items-center justify-between bg-[#040e21]">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Eliminar Sesión</h2>
              <p className="text-[11px] text-blue-200/70">Gestión de base de datos de CAD Norte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white bg-blue-950 hover:bg-blue-900 rounded-xl transition-colors border border-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isOnlySession ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>No es posible eliminar la única sesión</span>
              </div>
              <p className="text-blue-100 text-[11px]">
                El sistema necesita al menos una sesión para poder calcular métricas y visualizar el rendimiento del plantel. Sube o crea otra sesión antes de borrar esta.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-blue-100 leading-relaxed">
                ¿Estás seguro de que deseas eliminar permanentemente la sesión <strong className="text-white font-bold">{session.title}</strong>?
              </p>

              <div className="bg-[#040e21] p-3.5 rounded-2xl border border-blue-900/80 text-xs text-blue-200/90 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span className="text-blue-400">Fecha:</span>
                  <strong className="text-white">{session.date}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Tipo:</span>
                  <strong className="text-white">{session.type}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Duración:</span>
                  <strong className="text-white">{session.durationMinutes} min</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Atletas medidos:</span>
                  <strong className="text-white">{session.records.length} jugadores</strong>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  Los cálculos de carga crónica (ACWR) y tendencias se recalcularán automáticamente excluyendo esta medición.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/80 bg-[#040e21] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-blue-200 rounded-xl text-xs font-bold transition-colors border border-blue-800"
          >
            Cancelar
          </button>
          {!isOnlySession && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Sesión</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
