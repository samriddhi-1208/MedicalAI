import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AIInsightCard = ({ title, summary, severity, onViewDetails }) => {
  return (
    <div className="med-card bg-gradient-to-r from-[#1A4B84] to-[#143A66] text-white space-y-4 shadow-md rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-4.5 h-4.5 text-[#2D90A6]" />
          </div>
          <h3 className="text-base font-extrabold text-white">{title || "AI Insights"}</h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-[#2D90A6]/30 text-[#CCFBF1] text-xs font-bold border border-[#2D90A6]/40 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Plain Language Summary
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
        {summary}
      </p>

      <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-slate-300 font-medium text-[11px]">
          AI-generated information for record organization. Always consult a qualified medical provider.
        </span>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="px-3.5 py-1.5 rounded-xl bg-white text-[#1A4B84] font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
