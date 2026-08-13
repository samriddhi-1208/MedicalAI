import React from 'react';
import { HeartPulse, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { getTranslation } from '../../utils/translations';

export const HealthMetricCard = ({ name, value, unit, status, statusType, statusSymbol, refRange, trend }) => {
  const { language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const isWarning = statusType === 'warning' || status === 'Elevated' || status === 'High';
  const isCritical = statusType === 'critical';

  const getIcon = () => {
    if (name.toLowerCase().includes('pressure')) return <HeartPulse className="w-5 h-5 text-[#1A4B84]" />;
    if (name.toLowerCase().includes('glucose')) return <Activity className="w-5 h-5 text-[#2D90A6]" />;
    return <TrendingUp className="w-5 h-5 text-[#2D90A6]" />;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getTranslatedStatus = () => {
    if (!status) return t('normal');
    if (/normal/i.test(status)) return t('normal');
    if (/high/i.test(status)) return t('high');
    if (/low/i.test(status)) return t('low');
    if (/attention|elevated/i.test(status)) return t('attention');
    if (/critical/i.test(status)) return t('critical');
    return status;
  };

  return (
    <div className="med-card card-hover-lift space-y-3">
      {/* Icon & Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            {getIcon()}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{name}</span>
        </div>

        {/* Accessible Badge with Symbol & Text */}
        <span className={`med-badge ${
          isCritical
            ? 'med-badge-critical'
            : isWarning
            ? 'med-badge-warning'
            : 'med-badge-normal'
        }`}>
          <span>{statusSymbol || (isWarning ? '▲' : '✓')}</span>
          <span>{getTranslatedStatus()}</span>
        </span>
      </div>

      {/* Main Value & Unit */}
      <div className="flex items-baseline justify-between pt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-[#1A4B84] tracking-tight">{value}</span>
          <span className="text-xs font-semibold text-slate-500">{unit}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold">
          {getTrendIcon()}
        </div>
      </div>

      {/* Reference Range */}
      {refRange && (
        <p className="text-[11px] text-slate-500 font-normal pt-1 border-t border-slate-100">
          {t('refRange')}: <span className="font-semibold text-slate-700">{refRange}</span>
        </p>
      )}
    </div>
  );
};
