import React from 'react';
import { Pill, Clock, CheckCircle2 } from 'lucide-react';

export const MedicationCard = ({ name, dosage, instructions, time, dateLabel, taken, onToggleTaken }) => {
  return (
    <div className={`med-card space-y-3.5 transition-all ${
      taken ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2D90A6] uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#2D90A6]" /> Next Dose
        </div>

        <span className="text-xs font-semibold text-slate-500 font-mono">
          {dateLabel || time}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A4B84] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Pill className="w-5 h-5 text-[#2D90A6]" />
          </div>
          <div>
            <h4 className={`text-base font-extrabold ${taken ? 'line-through text-slate-500' : 'text-[#1A4B84]'}`}>
              {name}
            </h4>
            <p className="text-xs font-medium text-slate-500">{dosage} • {instructions}</p>
          </div>
        </div>

        <button
          onClick={onToggleTaken}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            taken
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-[#1A4B84] text-white hover:bg-[#143A66]'
          }`}
        >
          {taken ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Logged ✓
            </>
          ) : (
            'Mark as Taken'
          )}
        </button>
      </div>
    </div>
  );
};
