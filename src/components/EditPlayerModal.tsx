import React, { useEffect, useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { PlayerSummary, BasketballPosition } from '../types/catapult';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerSummary;
  onSave: (updatedPlayer: PlayerSummary) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  onClose,
  player,
  onSave,
}) => {
  const [formData, setFormData] = useState<PlayerSummary>({ ...player });

  useEffect(() => {
    setFormData({ ...player });
  }, [player, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-blue-900/80 bg-[#040e21] flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            Editar Atleta
          </h2>
          <button onClick={onClose} className="p-1.5 text-blue-300 hover:text-white rounded-xl bg-blue-900/40">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-blue-300 block mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Posición</label>
              <select
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value as BasketballPosition })}
                className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Base">Base</option>
                <option value="Escolta">Escolta</option>
                <option value="Alero">Alero</option>
                <option value="Ala-Pivot">Ala-Pivot</option>
                <option value="Pivot">Pivot</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Nº Camiseta</label>
              <input
                type="number"
                required
                value={formData.jerseyNumber}
                onChange={e => setFormData({ ...formData, jerseyNumber: Number(e.target.value) })}
                className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Edad</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Altura (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                required
                value={formData.heightCm}
                onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Peso (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                required
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-blue-300 block mb-1">Historial / antecedentes</label>
            <input
              type="text"
              value={formData.injuryHistory || ''}
              onChange={e => setFormData({ ...formData, injuryHistory: e.target.value })}
              placeholder="Lesiones, antecedentes o aclaraciones médicas..."
              className="w-full bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-blue-300 block mb-1">Observaciones</label>
            <textarea
              value={formData.observations || ''}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              rows={4}
              placeholder="Rol, características, disponibilidad u otras notas del cuerpo técnico..."
              className="w-full resize-y bg-[#040e21] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
