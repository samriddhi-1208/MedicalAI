import React from 'react';
import { FileText, ArrowRight, Calendar, User } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const ReportCard = ({ title, date, doctorName, labName, status, statusType, onViewDetails }) => {
  const { language } = useHealthData();
  const t = (key) => getTranslation(language, key);

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
    <div className="med-card card-hover-lift space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EBF6F8] text-[#2D90A6] flex items-center justify-center font-bold shrink-0 border border-[#2D90A6]/30">
            <FileText className="w-5 h-5 text-[#2D90A6]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-[#1A4B84]">{title}</h4>
            <p className="text-xs text-slate-500 font-medium">{labName || 'Diagnostic Laboratory'}</p>
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
