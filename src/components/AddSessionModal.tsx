import React, { useState } from 'react';
import { X, Plus, Trash2, Check, ArrowRight } from 'lucide-react';
import { BasketballPosition, PlayerSessionRecord, PlayerSummary, Session, SessionType } from '../types/catapult';
import { CADNorteLogo } from './CADNorteLogo';

const SESSION_TYPES: SessionType[] = [
  '5v5 Competitivo',
  'Entrenamiento Táctico',
  'Partido Liga',
  'Físico / Potencia',
  'Tiro / Regenerativo',
];

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
  const [types, setTypes] = useState<SessionType[]>(['5v5 Competitivo']);
  const [typeError, setTypeError] = useState('');
  const [typeDurations, setTypeDurations] = useState<Partial<Record<SessionType, number>>>({
    '5v5 Competitivo': 75,
  });
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
  const totalDurationMinutes = types.reduce((total, sessionType) => total + (typeDurations[sessionType] ?? 0), 0);

  if (!isOpen) return null;

  const updateRecord = (index: number, field: keyof PlayerSessionRecord, value: any) => {
    setRecords(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const toggleSessionType = (sessionType: SessionType) => {
    setTypes(current => current.includes(sessionType)
      ? current.filter(type => type !== sessionType)
      : [...current, sessionType]
    );
    setTypeDurations(current => current[sessionType] === undefined
      ? { ...current, [sessionType]: 0 }
      : current
    );
    setTypeError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (types.length === 0) {
      setTypeError('Seleccioná al menos un tipo de sesión.');
      return;
    }
    const typeWithoutDuration = types.find(sessionType => (typeDurations[sessionType] ?? 0) <= 0);
    if (typeWithoutDuration) {
      setTypeError(`Indicá los minutos de ${typeWithoutDuration}.`);
      return;
    }
    const newSession: Session = {
      id: `sesion-${sessionNumber}-${Date.now().toString(36)}`,
      sessionNumber,
      date,
      title,
      type: types,
      typeDurations,
      durationMinutes: totalDurationMinutes,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 bg-[#040e21] p-4 rounded-2xl border border-blue-900/80">
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
            <div className="sm:col-span-2 xl:col-span-2">
              <fieldset>
                <legend className="text-xs font-bold text-blue-300 mb-2">Tipo de sesión <span className="font-medium text-blue-300/70">(podés combinar)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {SESSION_TYPES.map(sessionType => {
                    const isSelected = types.includes(sessionType);
                    return (
                      <label
                        key={sessionType}
                        className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-600/25 text-sky-100'
                            : 'border-blue-900 bg-[#081836] text-blue-200 hover:border-blue-700 hover:bg-blue-950'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSessionType(sessionType)}
                          className="accent-blue-500"
                        />
                        {sessionType}
                      </label>
                    );
                  })}
                </div>
                {types.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {types.map(sessionType => (
                      <label key={sessionType} className="flex items-center justify-between gap-3 rounded-lg border border-blue-900/80 bg-[#081836] px-2.5 py-2 text-[11px] text-blue-100">
                        <span>{sessionType}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={240}
                            value={typeDurations[sessionType] ?? 0}
                            onChange={e => {
                              setTypeDurations(current => ({ ...current, [sessionType]: Number(e.target.value) }));
                              setTypeError('');
                            }}
                            aria-label={`Minutos de ${sessionType}`}
                            className="w-16 rounded-lg border border-blue-800 bg-[#040e21] px-2 py-1 text-right text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                          />
                          <span>min</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {typeError && <p role="alert" className="mt-1.5 text-[11px] text-rose-300">{typeError}</p>}
              </fieldset>
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300 block mb-1">Duración total</label>
              <output aria-live="polite" className="flex min-h-8 items-center rounded-xl border border-blue-800 bg-[#081836] px-3 py-1.5 text-sm font-black text-white">
                {totalDurationMinutes} min
              </output>
              <p className="mt-1 text-[10px] text-blue-300/70">Suma de los minutos por tipo</p>
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
