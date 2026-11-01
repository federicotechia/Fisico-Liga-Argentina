import React, { useState } from 'react';
import { BasketballPosition, PlayerSummary, SeasonCompetition } from '../types/catapult';
import { X, UserPlus } from 'lucide-react';

interface AddPlayerModalProps {
  isOpen: boolean;
  season: SeasonCompetition;
  onClose: () => void;
  onAdd: (player: PlayerSummary) => void;
}

const POSITIONS: BasketballPosition[] = ['Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'];

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, season, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<BasketballPosition>('Escolta');
  const [jerseyNumber, setJerseyNumber] = useState(0);
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(190);
  const [weightKg, setWeightKg] = useState(85);
  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    onAdd({
      id: `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      seasonId: season.id,
      name: cleanName,
      position,
      jerseyNumber,
      age,
      heightCm,
      weightKg,
      avatarColor: 'from-blue-500 to-indigo-600',
      observations: observations.trim(),
    });
    setName('');
    setObservations('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-blue-800 bg-[#081836] shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-900 bg-[#040e21] p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-white"><UserPlus className="h-5 w-5 text-sky-400" />Agregar jugador</h2>
            <p className="mt-1 text-xs text-blue-200">{season.season} · {season.competition}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl bg-blue-950 p-2 text-blue-200 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block text-xs font-bold text-blue-300">Nombre completo
            <input autoFocus required value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white outline-none focus:border-blue-500" />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="text-xs font-bold text-blue-300">Posición
              <select value={position} onChange={event => setPosition(event.target.value as BasketballPosition)} className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white">
                {POSITIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-blue-300">Nº camiseta
              <input type="number" min="0" max="99" value={jerseyNumber} onChange={event => setJerseyNumber(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white" />
            </label>
            <label className="text-xs font-bold text-blue-300">Edad
              <input type="number" min="0" max="100" value={age} onChange={event => setAge(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white" />
            </label>
            <label className="text-xs font-bold text-blue-300">Altura (cm)
              <input type="number" min="100" max="250" value={heightCm} onChange={event => setHeightCm(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white" />
            </label>
            <label className="text-xs font-bold text-blue-300">Peso (kg)
              <input type="number" min="30" max="250" value={weightKg} onChange={event => setWeightKg(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white" />
            </label>
          </div>
          <label className="block text-xs font-bold text-blue-300">Observaciones
            <textarea rows={3} value={observations} onChange={event => setObservations(event.target.value)} className="mt-1 w-full resize-y rounded-xl border border-blue-900 bg-[#040e21] px-3 py-2 text-white" placeholder="Rol, disponibilidad u otras notas del cuerpo técnico" />
          </label>
          <div className="flex justify-end gap-2 border-t border-blue-900 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-blue-800 bg-blue-950 px-4 py-2 text-xs font-bold text-blue-100">Cancelar</button>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500">Guardar jugador</button>
          </div>
        </form>
      </div>
    </div>
  );
};
