import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  HeartPulse,
  Upload
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HealthTimelinePage = () => {
  const navigate = useNavigate();
  const { userProfile, reports, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [timeFilter, setTimeFilter] = useState('ALL'); // 1M | 3M | 6M | 1Y | ALL
  const [selectedMetric, setSelectedMetric] = useState('Hemoglobin (Hb)');

  const userReports = Array.isArray(reports) ? reports : [];
  const hasReports = userReports.length > 0;

  // Extract all unique biomarker names across user's uploaded reports
  const availableMetrics = [];
  const metricHistoryMap = {};

  // Process reports in chronological order (oldest to newest) for chart plotting
  const chronReports = [...userReports].reverse();

  chronReports.forEach(r => {
    const reportDate = r.date || r.report_date || 'Date N/A';
    const biomarkers = Array.isArray(r.biomarkers) ? r.biomarkers : [];

    biomarkers.forEach(bm => {
      const name = bm.name;
      const val = typeof bm.value === 'number' ? bm.value : parseFloat(bm.value);
      if (!isNaN(val)) {
        if (!availableMetrics.includes(name)) {
          availableMetrics.push(name);
        }
        if (!metricHistoryMap[name]) {
          metricHistoryMap[name] = [];
        }
        metricHistoryMap[name].push({
          date: reportDate,
          value: val,
          unit: bm.unit || '',
          refRange: bm.refRange || bm.reference_range || '',
          reportTitle: r.title || 'Lab Report'
        });
      }
    });
  });

  const activeMetricName = availableMetrics.includes(selectedMetric) ? selectedMetric : (availableMetrics[0] || 'Hemoglobin (Hb)');
  const activeChartData = metricHistoryMap[activeMetricName] || [];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
            <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">Longitudinal Analytics</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
            {t('healthTrends')}
          </h1>
          <p className="text-xs font-normal text-slate-500">
            Monitor your long-term biomarker progressions extracted from your uploaded medical reports
          </p>
        </div>

        {/* Time Filters: 1M | 3M | 6M | 1Y | ALL */}
        {hasReports && (
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeFilter === filter
                    ? 'bg-[#1A4B84] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* REQUIREMENT 1: EMPTY STATE FOR NEW USERS */}
      {!hasReports && (
        <Card className="p-8 sm:p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5 max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF6F8] text-[#2D90A6] flex items-center justify-center mx-auto border border-[#2D90A6]/30">
            <TrendingUp className="w-8 h-8 text-[#2D90A6]" />
          </div>
          
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A4B84] tracking-tight">
              No Medical History Trends Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              Upload your medical reports to analyze your historical biomarker progressions over time.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#1A4B84] hover:bg-[#143A66] py-3.5 px-8 text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              {t('uploadMedicalReport')}
            </Button>
          </div>
        </Card>
      )}

      {/* RETURNING USER HEALTH TRENDS ANALYTICS */}
      {hasReports && (
        <div className="space-y-6">
          
          {/* AI Insight Card */}
          <Card className="p-5 bg-gradient-to-r from-[#1A4B84] to-[#143A66] text-white rounded-2xl shadow-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D90A6] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#2D90A6]" /> AI Longitudinal Analysis
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              Based on your <strong>{userReports.length} uploaded medical report(s)</strong>, tracking <strong>{availableMetrics.length} biomarker parameter(s)</strong>.
            </p>
          </Card>

          {/* Main Interactive Chart & Metric Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Chart Canvas (8 columns) */}
            <Card className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A4B84] flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-[#2D90A6]" />
                    {activeMetricName} Progression
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeChartData.length} recorded data point(s) from uploaded reports
                  </p>
                </div>

                {/* Available Biomarker Toggle Pills */}
                {availableMetrics.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {availableMetrics.map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMetric(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          activeMetricName === m ? 'bg-[#2D90A6] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-72 w-full pt-2">
                {activeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2D90A6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2D90A6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1A4B84', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#2D90A6' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#2D90A6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                    No historical progression recorded for {activeMetricName}.
                  </div>
                )}
              </div>
            </Card>

            {/* Side Parameter Cards (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              {availableMetrics.slice(0, 3).map((mName) => {
                const data = metricHistoryMap[mName] || [];
                const latest = data[data.length - 1];
                const prev = data.length > 1 ? data[data.length - 2] : null;

                return (
                  <Card key={mName} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[#1A4B84]">
                      <span>{mName}</span>
                      <span className="med-badge med-badge-normal">
                        ✓ Recorded
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2.5xl font-extrabold text-[#1A4B84]">
                        {latest ? latest.value : 'N/A'} <span className="text-xs font-normal text-slate-500">{latest?.unit}</span>
                      </span>
                      {prev && (
                        <span className="text-xs font-bold text-slate-600">
                          Prev: {prev.value} {prev.unit}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Source: {latest?.reportTitle} ({latest?.date})</p>
                  </Card>
                );
              })}
            </div>

          </div>

          {/* Historical Reports Timeline Feed */}
          <Card className="p-6 sm:p-7 space-y-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#1A4B84]">{t('recentMedicalReports')}</h3>
                <p className="text-xs font-normal text-slate-500">Chronological history of your uploaded medical documents</p>
              </div>
            </div>

            <div className="space-y-3">
              {userReports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex justify-between items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EBF6F8] text-[#2D90A6] font-bold">
                        {r.file_type || 'PDF'}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{r.date || r.report_date}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#1A4B84]">{r.title}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {(r.biomarkers || []).length} extracted biomarker parameter(s)
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/app/analysis')}
                    className="text-xs font-semibold rounded-xl border-slate-200"
                  >
                    View Results
                  </Button>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
