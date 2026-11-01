import React from 'react';
import { Calendar } from 'lucide-react';

interface DateFilterProps {
  range: { start: string; end: string };
  onChange: (range: { start: string; end: string }) => void;
  scope: 'range' | 'global';
  onScopeChange: (scope: 'range' | 'global') => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ range, onChange, scope, onScopeChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#051124] px-3 py-1.5 rounded-xl border border-blue-900/60 shadow-inner">
      <div className="flex items-center gap-1" role="group" aria-label="Alcance del análisis">
        {(['range', 'global'] as const).map(option => (
          <button
            key={option}
            type="button"
            onClick={() => onScopeChange(option)}
            aria-pressed={scope === option}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${scope === option ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'}`}
          >
            {option === 'range' ? 'Rango' : 'Global'}
          </button>
        ))}
      </div>
      {scope === 'range' && <>
        <Calendar className="w-3.5 h-3.5 text-blue-400" />
        <input
          aria-label="Fecha desde"
          type="date"
          value={range.start}
          onChange={(e) => onChange({ ...range, start: e.target.value })}
          className="bg-transparent text-[11px] text-white focus:outline-none"
        />
        <span className="text-blue-500 font-black">-</span>
        <input
          aria-label="Fecha hasta"
          type="date"
          value={range.end}
          onChange={(e) => onChange({ ...range, end: e.target.value })}
          className="bg-transparent text-[11px] text-white focus:outline-none"
        />
      </>}
    </div>
  );
};
