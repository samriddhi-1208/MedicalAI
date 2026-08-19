import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
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
  Upload,
  Info,
  Clock,
  ChevronRight,
  Minus
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { universalClinicalExtractor } from '../utils/reportParser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

// BIOMARKER ALIAS NORMALIZATION ENGINE
function normalizeBiomarkerName(rawName) {
  if (!rawName) return 'Clinical Parameter';
  const clean = rawName.trim();
  const lower = clean.toLowerCase();

  if (/(?:hemoglobin|haemoglobin|^hb$|^hgb$|glycated)/i.test(lower)) {
    if (lower.includes('hba1c') || lower.includes('glycated')) return 'HbA1c';
    return 'Hemoglobin';
  }
  if (/(?:glucose|blood sugar|fasting sugar|sugar)/i.test(lower)) {
    return 'Fasting Glucose';
  }
  if (/(?:wbc|white blood|leucocyte|tlc)/i.test(lower)) {
    return 'WBC Count';
  }
  if (/(?:rbc|red blood|erythrocyte)/i.test(lower)) {
    return 'RBC Count';
  }
  if (/(?:platelet|plt)/i.test(lower)) {
    return 'Platelets';
  }
  if (/(?:creatinine)/i.test(lower)) {
    return 'Serum Creatinine';
  }
  if (/(?:tsh|thyroid)/i.test(lower)) {
    return 'TSH';
  }
  if (/(?:cholesterol)/i.test(lower)) {
    return lower.includes('hdl') ? 'HDL Cholesterol' : lower.includes('ldl') ? 'LDL Cholesterol' : 'Total Cholesterol';
  }
  if (/(?:alt|sgpt)/i.test(lower)) {
    return 'ALT (SGPT)';
  }
  if (/(?:ast|sgot)/i.test(lower)) {
    return 'AST (SGOT)';
  }
  if (/(?:temperature|temp)/i.test(lower)) {
    return 'Temperature';
  }
  if (/(?:blood pressure|bp)/i.test(lower)) {
    return 'Blood Pressure';
  }
  if (/(?:spo2|oxygen)/i.test(lower)) {
    return 'SpO2';
  }

  return clean;
}

export const HealthTimelinePage = () => {
  const navigate = useNavigate();
  const { reports, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [selectedMetric, setSelectedMetric] = useState(null);
  const [detailModalMetric, setDetailModalMetric] = useState(null);

  const userReports = Array.isArray(reports) ? reports : [];
  const reportCount = userReports.length;
  const hasReports = reportCount > 0;

  // Aggregate and normalize all biomarkers across user's uploaded reports
  const biomarkerMap = {};
  
  // Sort reports chronologically by ACTUAL REPORT DATE (reportDate / date), not upload date or MongoDB insertion order
  const chronReports = [...userReports].sort((a, b) => {
    const dA = a.reportDate || a.date || a.report_date || a.uploadedAt || '1970-01-01';
    const dB = b.reportDate || b.date || b.report_date || b.uploadedAt || '1970-01-01';
    const tA = new Date(dA).getTime();
    const tB = new Date(dB).getTime();
    if (!isNaN(tA) && !isNaN(tB)) return tA - tB;
    return 0;
  });

  // Count reports that actually contain extracted medical parameters
  let reportsWithMeasurableDataCount = 0;

  chronReports.forEach((r, reportIdx) => {
    const reportDate = r.reportDate || r.date || r.report_date || r.uploadedAt || `Report #${reportIdx + 1}`;
    const reportTitle = r.title || r.file_name || r.fileName || `Lab Report #${reportIdx + 1}`;

    const candidateSources = [
      r.biomarkers,
      r.labResults,
      r.vitals,
      r.values,
      r.extractedBiomarkers,
      r.results,
      r.findings,
      r.parsedData?.biomarkers,
      r.extractedData?.biomarkers
    ];

    const rawItems = [];
    candidateSources.forEach(src => {
      if (Array.isArray(src)) {
        rawItems.push(...src);
      } else if (typeof src === 'string') {
        try {
          const parsed = JSON.parse(src);
          if (Array.isArray(parsed)) rawItems.push(...parsed);
          else if (typeof parsed === 'object' && parsed !== null) {
            Object.entries(parsed).forEach(([k, v]) => {
              rawItems.push({ name: k, value: typeof v === 'object' ? v.value : v, unit: typeof v === 'object' ? v.unit : '' });
            });
          }
        } catch (e) {}
      } else if (typeof src === 'object' && src !== null) {
        Object.entries(src).forEach(([k, v]) => {
          rawItems.push({ name: k, value: typeof v === 'object' ? v.value : v, unit: typeof v === 'object' ? v.unit : '' });
        });
      }
    });

    // Fallback: If report biomarkers array is empty but rawText exists, extract biomarkers on the fly
    if (rawItems.length === 0 && (r.rawText || r.raw_text)) {
      const textToExtract = r.rawText || r.raw_text;
      const extracted = universalClinicalExtractor(textToExtract, reportTitle);
      if (Array.isArray(extracted.labResults)) rawItems.push(...extracted.labResults);
      if (Array.isArray(extracted.vitals)) rawItems.push(...extracted.vitals);
    }

    if (rawItems.length > 0) {
      reportsWithMeasurableDataCount++;
    }

    const seenInReport = new Set();

    rawItems.forEach(bm => {
      if (!bm) return;
      let rawName = null;
      let rawVal = null;
      let rawUnit = '';
      let rawRef = '';
      let rawStatus = 'Normal';

      if (typeof bm === 'string') {
        const parts = bm.split(':');
        if (parts.length >= 2) {
          rawName = parts[0].trim();
          rawVal = parts.slice(1).join(':').trim();
        }
      } else if (typeof bm === 'object') {
        rawName = bm.name || bm.biomarker_name || bm.testName || bm.test_name || bm.parameter || bm.test || bm.label || bm.key || bm.title;
        rawVal = bm.value ?? bm.result ?? bm.val ?? bm.numValue;
        rawUnit = bm.unit || bm.units || '';
        rawRef = bm.refRange || bm.referenceRange || bm.reference_range || bm.ref_range || '';
        rawStatus = bm.status || bm.status_flag || bm.statusType || 'Normal';

        if (!rawName) {
          const keys = Object.keys(bm);
          if (keys.length === 1) {
            rawName = keys[0];
            rawVal = bm[keys[0]];
          }
        }
      }

      if (!rawName) return;

      const normName = normalizeBiomarkerName(rawName);
      if (seenInReport.has(normName)) return;
      seenInReport.add(normName);

      let numVal = null;
      if (typeof rawVal === 'number' && !isNaN(rawVal)) {
        numVal = rawVal;
      } else if (rawVal !== null && rawVal !== undefined) {
        const strVal = String(rawVal).replace(/,/g, '');
        const match = strVal.match(/([<>]?\s*\d+(?:\.\d+)?)/);
        if (match) {
          numVal = parseFloat(match[1]);
        }
      }

      if (!biomarkerMap[normName]) {
        biomarkerMap[normName] = [];
      }

      biomarkerMap[normName].push({
        date: reportDate,
        value: rawVal ?? 'Normal',
        numValue: numVal,
        unit: rawUnit,
        refRange: rawRef || 'Standard',
        status: rawStatus,
        reportTitle
      });
    });
  });

  // SEPARATE BIOMARKERS FROM VITAL SIGNS ACCORDING TO EXTRACTION SCHEMA
  const labBiomarkersMap = {};
  const vitalsMap = {};

  Object.entries(biomarkerMap).forEach(([name, data]) => {
    if (['Blood Pressure', 'Heart Rate', 'SpO2', 'Temperature', 'BP'].includes(name)) {
      vitalsMap[name] = data;
    } else {
      labBiomarkersMap[name] = data;
    }
  });

  const discoveredBiomarkerNames = Object.keys(biomarkerMap);
  const labNames = Object.keys(labBiomarkersMap);
  const vitalNames = Object.keys(vitalsMap);

  const totalLabBiomarkers = labNames.length;
  const totalVitalSigns = vitalNames.length;
  const totalParametersCount = totalLabBiomarkers + totalVitalSigns;

  const maxDataPointsAcrossAllMetrics = Math.max(0, ...Object.values(biomarkerMap).map(arr => arr.length));
  const isLongitudinalActive = maxDataPointsAcrossAllMetrics >= 2;

  const activeMetricName = selectedMetric && discoveredBiomarkerNames.includes(selectedMetric)
    ? selectedMetric
    : (discoveredBiomarkerNames[0] || null);

  const activeChartData = activeMetricName ? (biomarkerMap[activeMetricName] || []) : [];
  const latestDataPoint = activeChartData.length > 0 ? activeChartData[activeChartData.length - 1] : null;
  const previousDataPoint = activeChartData.length > 1 ? activeChartData[activeChartData.length - 2] : null;

  // Calculate change between latest and previous numeric values (ONLY if 2+ data points exist)
  let changeText = 'Baseline';
  let isPositiveChange = true;
  if (activeChartData.length >= 2 && latestDataPoint && previousDataPoint && latestDataPoint.numValue !== null && previousDataPoint.numValue !== null) {
    const diff = latestDataPoint.numValue - previousDataPoint.numValue;
    if (diff > 0) {
      changeText = `+${diff.toFixed(1)} ${latestDataPoint.unit}`;
      isPositiveChange = true;
    } else if (diff < 0) {
      changeText = `${diff.toFixed(1)} ${latestDataPoint.unit}`;
      isPositiveChange = false;
    } else {
      changeText = 'Stable';
    }
  }

  // Detail Modal Data
  const modalDataPoints = detailModalMetric ? (biomarkerMap[detailModalMetric] || []) : [];
  const modalLatest = modalDataPoints.length > 0 ? modalDataPoints[modalDataPoints.length - 1] : null;
  const modalPrev = modalDataPoints.length > 1 ? modalDataPoints[modalDataPoints.length - 2] : null;

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-xs text-[#0D9488] font-extrabold uppercase tracking-wider">{t('longitudinalAnalytics')}</span>
          </div>
          <h1 className="text-2.5xl font-black text-[#0F172A] tracking-tight mt-0.5">
            {t('healthTrends')}
          </h1>
          <p className="text-xs font-normal text-slate-500">
            {t('trackBiomarkerProgressions')}
          </p>
        </div>

        {hasReports && (
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => navigate('/app/upload')}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            {t('uploadAnotherReport')}
          </Button>
        )}
      </div>

      {/* EMPTY STATE (0 REPORTS OR 0 EXTRACTED PARAMETERS) */}
      {(!hasReports || totalParametersCount === 0) && (
        <Card className="p-8 sm:p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-5 max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-[#0D9488] flex items-center justify-center mx-auto border border-slate-200">
            <TrendingUp className="w-8 h-8 text-[#0D9488]" />
          </div>
          
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              No health trends available yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              {hasReports 
                ? "Your uploaded medical reports do not contain measurable health parameters. Please upload a lab report with structured test results to track trends."
                : "Upload medical reports containing laboratory results to start tracking your health trends over time."}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#0F172A] hover:bg-[#1E293B] py-3.5 px-8 text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
            >
              {t('uploadMedicalReport')}
            </Button>
          </div>
        </Card>
      )}

      {/* VALID BIOMARKERS POPULATED SECTION */}
      {hasReports && totalParametersCount > 0 && (
        <div className="space-y-6">
          
          {/* Top Health Trend Summary */}
          <Card className="p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#0D9488]" /> Health Trend Summary
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                {reportCount} Uploaded ({reportsWithMeasurableDataCount} with Data)
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Lab Biomarkers</span>
                <span className="text-2xl font-black text-white">{totalLabBiomarkers} Tracked</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Vital Signs</span>
                <span className="text-2xl font-black text-white">{totalVitalSigns} Tracked</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Latest Medical Report</span>
                <span className="text-2xl font-black text-white">
                  {chronReports[chronReports.length - 1]?.reportDate || chronReports[chronReports.length - 1]?.date || 'Recent'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Longitudinal Status</span>
                <span className={`text-xl font-black flex items-center gap-1 ${isLongitudinalActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isLongitudinalActive ? 'Active Monitoring' : 'Baseline Established'} 
                  <Activity className="w-5 h-5" />
                </span>
              </div>
            </div>
          </Card>

          {/* Main Chart Canvas & Dynamic Biomarker Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart Area (8 columns) */}
            <Card className="lg:col-span-8 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
              {/* Header Title & Dynamic Biomarker Selection Pill Strip */}
              <div className="space-y-3 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                      {activeMetricName} Progression
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {activeChartData.length} data point(s) recorded across uploaded reports
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    {activeChartData.length > 1 ? 'Longitudinal Trend Active' : 'Baseline Record'}
                  </span>
                </div>

                {/* Dynamic Biomarker Selector Pill Strip */}
                {discoveredBiomarkerNames.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                    {discoveredBiomarkerNames.map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMetric(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          activeMetricName === m 
                            ? 'bg-[#0F172A] text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Longitudinal Chart Area */}
              <div className="min-h-[280px] w-full pt-2">
                {activeChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={activeChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#0D9488' }}
                      />
                      <Area type="monotone" dataKey="numValue" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-teal-900 font-bold">
                        <Info className="w-5 h-5 text-[#0D9488]" />
                        <span>Baseline Measurement Recorded for {activeMetricName}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                        {latestDataPoint?.status || 'Normal'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-teal-200/60 shadow-2xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Measured Value</span>
                        <strong className="text-xl font-black text-[#0F172A]">
                          {latestDataPoint ? latestDataPoint.value : 'N/A'} <span className="text-xs font-bold text-slate-600">{latestDataPoint?.unit}</span>
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Reference Range</span>
                        <strong className="text-slate-700 font-bold text-xs">{latestDataPoint?.refRange || 'Standard'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Report Date</span>
                        <strong className="text-[#0D9488] font-bold text-xs">{latestDataPoint?.date}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <span>💡 Baseline recorded — upload another report containing <strong>{activeMetricName}</strong> to establish a longitudinal trend.</span>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Upload}
                        onClick={() => navigate('/app/upload')}
                        className="bg-white hover:bg-slate-50 text-xs font-bold rounded-xl border-slate-300 cursor-pointer shrink-0"
                      >
                        Upload Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Latest vs Previous Comparison Bar (Only if 2+ points exist) */}
              {activeChartData.length >= 2 && latestDataPoint && (
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Latest</span>
                    <strong className="text-[#0F172A] font-black text-sm">{latestDataPoint.value} {latestDataPoint.unit}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Previous</span>
                    <strong className="text-slate-700 font-bold text-sm">{previousDataPoint ? `${previousDataPoint.value} ${previousDataPoint.unit}` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Change</span>
                    <strong className={`font-black text-sm flex items-center gap-1 ${isPositiveChange ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {changeText}
                    </strong>
                  </div>
                </div>
              )}
            </Card>

            {/* TREND CARDS GRID (4 columns) */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Biomarker Highlights</h4>
              
              {discoveredBiomarkerNames.map((mName) => {
                const data = biomarkerMap[mName] || [];
                const latest = data[data.length - 1];
                const prev = data.length > 1 ? data[data.length - 2] : null;

                let cardDiff = 'Baseline';
                if (data.length >= 2 && latest && prev && latest.numValue !== null && prev.numValue !== null) {
                  const d = latest.numValue - prev.numValue;
                  if (d > 0) cardDiff = `↑ +${d.toFixed(1)}`;
                  else if (d < 0) cardDiff = `↓ ${d.toFixed(1)}`;
                  else cardDiff = 'Stable';
                }

                return (
                  <Card 
                    key={mName} 
                    onClick={() => {
                      setSelectedMetric(mName);
                      setDetailModalMetric(mName);
                    }}
                    className={`p-4 bg-white border rounded-2xl shadow-2xs space-y-2 cursor-pointer transition-all hover:border-[#0D9488] ${
                      activeMetricName === mName ? 'border-[#0D9488] bg-slate-50/50' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
                      <span className="truncate max-w-[150px]">{mName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {cardDiff}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                        {latest ? latest.value : 'N/A'} <span className="text-xs font-normal text-slate-500">{latest?.unit}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{latest?.date}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* REPORT HISTORY FEED WITH DISTINCT EXTRACTION STATUS */}
      {hasReports && (
        <Card className="p-6 sm:p-7 space-y-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0F172A]">{t('recentMedicalReports')}</h3>
              <p className="text-xs font-normal text-slate-500">Chronological list of uploaded medical reports and extracted parameters</p>
            </div>
          </div>

          <div className="space-y-3">
            {chronReports.map((r) => {
              const bCount = (r.biomarkers || r.labResults || []).length;
              const vCount = (r.vitals || []).length;
              const mCount = (r.extractedMedications || r.medications || []).length;
              const totalExtracted = bCount + vCount + mCount;
              const isExtractionSuccess = totalExtracted > 0;

              return (
                <div key={r.id || r._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-extrabold text-[10px]">
                        {r.file_type || 'PDF'}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{r.reportDate || r.date || r.report_date}</span>
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                        isExtractionSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isExtractionSuccess ? 'Medical Extraction Completed ✓' : 'Uploaded • Medical Extraction Unsuccessful'}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#0F172A]">{r.title || r.file_name}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {isExtractionSuccess ? (
                        <>
                          <strong className="text-[#0F172A] font-extrabold">{bCount} biomarkers</strong> • <strong className="text-[#0F172A] font-extrabold">{vCount} vitals</strong> • <strong className="text-[#0D9488] font-extrabold">{mCount} medications</strong> extracted
                        </>
                      ) : (
                        "0 biomarkers extracted • Document stored in history"
                      )}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/app/analysis')}
                    className="text-xs font-bold rounded-xl border-slate-200 cursor-pointer shrink-0"
                  >
                    View Report
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TREND DETAIL MODAL */}
      <Modal
        isOpen={Boolean(detailModalMetric)}
        onClose={() => setDetailModalMetric(null)}
        title={`${detailModalMetric || 'Biomarker'} — Detailed Analysis & History`}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block text-[11px]">Latest Value</span>
              <strong className="text-lg font-black text-[#0F172A]">
                {modalLatest ? modalLatest.value : 'N/A'} {modalLatest?.unit}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Reference Range</span>
              <strong className="text-slate-800 font-bold text-xs">{modalLatest?.refRange || 'Standard'}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800">Historical Readings Log ({modalDataPoints.length})</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {modalDataPoints.map((dp, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-800 font-bold">{dp.value} {dp.unit}</strong>
                    <span className="text-slate-400 text-[10px] block">{dp.reportTitle}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{dp.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};
