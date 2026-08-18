import React from 'react';
import { FileText, ArrowRight, Calendar, User } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

import { formatReportTitle } from '../../utils/formatters';

export const ReportCard = ({ title, report, date, doctorName, labName, status, statusType, onViewDetails }) => {
  const { language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const cleanTitle = formatReportTitle(report || { title });

  const getTranslatedStatus = () => {
    if (!status) return t('normal');
    if (/normal/i.test(status)) return t('normal');
    if (/attention|elevated/i.test(status)) return t('attention');
    if (/critical/i.test(status)) return t('critical');
    if (/high/i.test(status)) return t('high');
    if (/low/i.test(status)) return t('low');
    return status;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center font-semibold shrink-0 border border-slate-200">
            <FileText className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F172A]">{cleanTitle}</h4>
            <p className="text-xs text-slate-500 font-normal">{labName || 'Diagnostic Pathology Center'}</p>
          </div>
        </div>

        <span className={`med-badge ${
          statusType === 'warning'
            ? 'med-badge-warning'
            : statusType === 'critical'
            ? 'med-badge-critical'
            : 'med-badge-normal'
        }`}>
          {getTranslatedStatus()}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {date}
          </span>
          {doctorName && (
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" /> {doctorName}
            </span>
          )}
        </div>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-xs font-bold text-[#1A4B84] hover:text-[#2D90A6] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('viewAnalysis')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
