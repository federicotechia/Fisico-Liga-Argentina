import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { PlayerSummary } from '../types/catapult';

interface DeletePlayerModalProps {
  player: PlayerSummary | null;
  onClose: () => void;
  onConfirmDelete: (player: PlayerSummary) => void;
}

export const DeletePlayerModal: React.FC<DeletePlayerModalProps> = ({ player, onClose, onConfirmDelete }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-rose-700/70 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-rose-900/70 bg-[#040e21] flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Eliminar jugador
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1.5 text-blue-300 hover:text-white rounded-xl bg-blue-900/40">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-white">
            ¿Querés eliminar a <strong>{player.name}</strong> del plantel?
          </p>
          <p className="text-xs text-rose-200/80 bg-rose-950/40 border border-rose-800/50 rounded-xl p-3">
            También se quitarán sus registros de todas las sesiones. Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-blue-100 rounded-xl text-xs font-bold">
              Cancelar
            </button>
            <button type="button" onClick={() => onConfirmDelete(player)} className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Eliminar jugador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
