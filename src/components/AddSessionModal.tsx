import React, { useState } from 'react';
import { X, Plus, Trash2, Check, ArrowRight } from 'lucide-react';
import { BasketballPosition, PlayerSessionRecord, PlayerSummary, Session, SessionType } from '../types/catapult';
import { CADNorteLogo } from './CADNorteLogo';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (session: Session) => void;
  roster: PlayerSummary[];
  nextSessionNumber: number;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
  roster,
  nextSessionNumber,
}) => {
  const [title, setTitle] = useState(`SESIÓN ${nextSessionNumber}`);
  const [sessionNumber, setSessionNumber] = useState(nextSessionNumber);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<SessionType>('5v5 Competitivo');
  const [durationMinutes, setDurationMinutes] = useState(75);
  const [notes, setNotes] = useState('Práctica en Estadio Jorge Ferrero - CAD Norte');

  const [records, setRecords] = useState<PlayerSessionRecord[]>(
    roster.map(p => ({
      playerId: p.id,
      playerName: p.name,
      position: p.position,
      jerseyNumber: p.jerseyNumber,
      minutesPlayed: 70,
      totDistM: 1950,
      totPL: 260,
      totJumps: 95,
      bmpBasketballLoad: 230,
      rpe: 7,
      notes: '',
    }))
  );

  if (!isOpen) return null;

  const updateRecord = (index: number, field: keyof PlayerSessionRecord, value: any) => {
    setRecords(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: Session = {
      id: `sesion-${sessionNumber}-${Date.now().toString(36)}`,
      sessionNumber,
      date,
      title,
      type,
      durationMinutes,
      notes: notes || `Sesión ingresada por el preparador físico de CAD Norte`,
      googleSheetTab: `Sesión ${sessionNumber}`,
      records,
    };

    onAddSession(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/80 flex items-center justify-between bg-[#040e21] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <CADNorteLogo size={42} />
            <div>
              <h2 className="text-lg font-black text-white">Registrar Nueva Sesión • Deportivo Norte</h2>
              <p className="text-xs text-blue-200/80">
                Ingreso directo de métricas Catapult OpenField para la planilla de La Liga Argentina.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Metadata Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#040e21] p-4 rounded-2xl border border-blue-900/80">
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Nombre / Título</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Tipo de Sesión</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as SessionType)}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="5v5 Competitivo">5v5 Competitivo</option>
                <option value="Entrenamiento Táctico">Entrenamiento Táctico</option>
                <option value="Partido Liga">Partido Liga</option>
                <option value="Físico / Potencia">Físico / Potencia</option>
                <option value="Tiro / Regenerativo">Tiro / Regenerativo</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Duración (min)</label>
              <input
                type="number"
                required
                min={10}
                max={240}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table of records */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Planilla de Atletas (CAD Norte - Catapult OpenField)
              </h3>
              <span className="text-[11px] text-blue-300/70 font-semibold">
                {records.length} Atletas registrados
              </span>
            </div>

            <div className="overflow-x-auto border border-blue-900/80 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#040e21] text-blue-300 uppercase text-[10px] border-b border-blue-900/80 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Atleta</th>
                    <th className="py-2.5 px-2 text-right">Min</th>
                    <th className="py-2.5 px-2 text-right">Tot Dist (m)</th>
                    <th className="py-2.5 px-2 text-right">Tot PL</th>
                    <th className="py-2.5 px-2 text-right">Tot Jump #</th>
                    <th className="py-2.5 px-2 text-right">BMP Tot Load</th>
                    <th className="py-2.5 px-2 text-right">RPE (1-10)</th>
                    <th className="py-2.5 px-3">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-950 bg-[#081836]">
                  {records.map((rec, idx) => (
                    <tr key={rec.playerId} className="hover:bg-blue-900/30">
                      <td className="py-2 px-3 font-bold text-white text-xs whitespace-nowrap">
                        {rec.playerName}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={rec.minutesPlayed}
                          onChange={e => updateRecord(idx, 'minutesPlayed', Number(e.target.value))}
                          className="w-14 bg-[#040e21] border border-blue-900 rounded-lg px-1.5 py-1 text-right text-xs text-white"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={rec.totDistM}
                          onChange={e => updateRecord(idx, 'totDistM', Number(e.target.value))}
                          className="w-20 bg-[#040e21] border border-blue-900 rounded-lg px-1.5 py-1 text-right text-xs text-white"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={rec.totPL}
                          onChange={e => updateRecord(idx, 'totPL', Number(e.target.value))}
                          className="w-16 bg-[#040e21] border border-blue-900 rounded-lg px-1.5 py-1 text-right text-xs font-bold text-sky-400"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={rec.totJumps}
                          onChange={e => updateRecord(idx, 'totJumps', Number(e.target.value))}
                          className="w-16 bg-[#040e21] border border-blue-900 rounded-lg px-1.5 py-1 text-right text-xs font-bold text-emerald-400"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={rec.bmpBasketballLoad}
                          onChange={e => updateRecord(idx, 'bmpBasketballLoad', Number(e.target.value))}
                          className="w-16 bg-[#040e21] border border-blue-900 rounded-lg px-1.5 py-1 text-right text-xs font-bold text-indigo-300"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={rec.rpe || ''}
                          onChange={e => updateRecord(idx, 'rpe', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="1-10"
                          className="w-12 bg-[#040e21] border border-blue-900 rounded-lg px-1 py-1 text-right text-xs text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={rec.notes || ''}
                          onChange={e => updateRecord(idx, 'notes', e.target.value)}
                          placeholder="Nota física..."
                          className="w-full min-w-[120px] bg-[#040e21] border border-blue-900 rounded-lg px-2 py-1 text-xs text-blue-100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-blue-200 rounded-xl text-xs font-bold transition-colors border border-blue-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Base de Datos CAD Norte</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
