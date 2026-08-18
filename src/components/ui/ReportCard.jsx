import React from 'react';
import { FileText, ArrowRight, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const ReportCard = ({ report, title, date, doctorName, labName, status, statusType, onViewDetails }) => {
  const navigate = useNavigate();
  const { language, setActiveReportId } = useHealthData();
  const t = (key) => getTranslation(language, key);

  // Support both structured prop passing AND report object prop passing (0% Hardcoded Dummy Names!)
  const rTitle = title || report?.title || report?.file_name || report?.fileName || 'Medical Report';
  const rDate = date || report?.date || report?.report_date || report?.uploadedAt || 'Recent';
  const rDoctor = doctorName || report?.doctorName || report?.doctor_name || '';
  const rLab = labName || report?.labName || report?.lab_name || '';
  const rStatus = status || report?.status || report?.status_flag || 'Optimal';
  const rStatusType = statusType || report?.statusType || (rStatus === 'Normal' || rStatus === 'Optimal' ? 'normal' : 'warning');
  const reportId = report?.id || report?._id;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails();
    } else if (reportId) {
      if (typeof setActiveReportId === 'function') {
        setActiveReportId(reportId);
      }
      navigate('/app/analysis');
    }
  };

  const getTranslatedStatus = () => {
    if (!rStatus) return t('normal');
    if (/normal|optimal/i.test(rStatus)) return t('normal');
    if (/attention|elevated/i.test(rStatus)) return t('attention');
    if (/critical/i.test(rStatus)) return t('critical');
    if (/high/i.test(rStatus)) return t('high');
    if (/low/i.test(rStatus)) return t('low');
    return rStatus;
  };

  return (
    <div className="med-card card-hover-lift space-y-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold shrink-0 border border-teal-200">
            <FileText className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#0F172A]">{rTitle}</h4>
            {rLab ? (
              <p className="text-xs text-slate-500 font-medium">{rLab}</p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">Uploaded Medical Document</p>
            )}
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] shrink-0 ${
          rStatusType === 'warning'
            ? 'bg-amber-100 text-amber-800'
            : rStatusType === 'critical'
            ? 'bg-rose-100 text-rose-800'
            : 'bg-emerald-100 text-emerald-800'
        }`}>
          {getTranslatedStatus()}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {rDate}
          </span>
          {rDoctor && (
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" /> {rDoctor}
            </span>
          )}
        </div>

        <button
          onClick={handleCardClick}
          className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{t('viewAnalysis')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
