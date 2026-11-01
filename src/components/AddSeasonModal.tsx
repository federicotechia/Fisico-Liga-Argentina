import React, { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { SeasonCompetition } from '../types/catapult';

interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (season: SeasonCompetition) => void;
}

export const AddSeasonModal: React.FC<AddSeasonModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [seasonName, setSeasonName] = useState('2027-2028');
  const [competition, setCompetition] = useState('La Liga Argentina');

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const season = seasonName.trim();
    const league = competition.trim();
    if (!season || !league) return;
    onAdd({
      id: `season-${season.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      season,
      competition: league,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-blue-800 bg-[#081836] shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-900 bg-[#040e21] p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><CalendarPlus className="h-5 w-5 text-sky-400" />Nueva temporada</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl bg-blue-950 p-2 text-blue-200 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block text-xs font-bold text-blue-300">Temporada
            <input required value={seasonName} onChange={event => setSeasonName(event.target.value)} placeholder="2027-2028" className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white outline-none focus:border-blue-500" />
          </label>
          <label className="block text-xs font-bold text-blue-300">Competencia
            <input required value={competition} onChange={event => setCompetition(event.target.value)} placeholder="La Liga Argentina, Liga Federal..." className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white outline-none focus:border-blue-500" />
          </label>
          <p className="rounded-xl border border-blue-900 bg-[#040e21] p-3 text-xs text-blue-200">La temporada nueva empieza con un plantel vacío. Los jugadores y sesiones anteriores conservan su temporada.</p>
          <div className="flex justify-end gap-2 border-t border-blue-900 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-blue-800 bg-blue-950 px-4 py-2 text-xs font-bold text-blue-100">Cancelar</button>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500">Crear temporada</button>
          </div>
        </form>
      </div>
    </div>
  );
};
