import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  LineChart,
  Line,
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  Cell,
  ReferenceLine, 
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
  Minus,
  BarChart3,
  LineChart as LineChartIcon,
  ShieldCheck,
  AlertTriangle
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

// ROBUST CLINICAL REFERENCE RANGE PARSER
function parseReferenceRange(refRangeStr, defaultValue, biomarkerName) {
  let min = null;
  let max = null;

  if (refRangeStr && typeof refRangeStr === 'string' && refRangeStr.toLowerCase() !== 'standard') {
    // Patterns like "12.0 - 16.0", "70-99", "13.5 – 17.5", "12 to 16"
    const rangeMatch = refRangeStr.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/i);
    if (rangeMatch) {
      min = parseFloat(rangeMatch[1]);
      max = parseFloat(rangeMatch[2]);
    } else {
      // Pattern like "< 200" or "<= 200"
      const lessMatch = refRangeStr.match(/(?:<|<=)\s*(\d+(?:\.\d+)?)/);
      if (lessMatch) {
        min = 0;
        max = parseFloat(lessMatch[1]);
      } else {
        // Pattern like "> 60" or ">= 60"
        const greaterMatch = refRangeStr.match(/(?:>|>=)\s*(\d+(?:\.\d+)?)/);
        if (greaterMatch) {
          min = parseFloat(greaterMatch[1]);
          max = defaultValue ? Math.max(min * 1.5, defaultValue * 1.2) : min * 1.5;
        }
      }
    }
  }

  // Clinical defaults if missing or non-numeric
  if (min === null || max === null || isNaN(min) || isNaN(max)) {
    const bLower = (biomarkerName || '').toLowerCase();
    if (bLower.includes('hemoglobin') || bLower.includes('hb')) { min = 12.0; max = 16.5; }
    else if (bLower.includes('glucose') || bLower.includes('sugar')) { min = 70; max = 100; }
    else if (bLower.includes('wbc')) { min = 4000; max = 11000; }
    else if (bLower.includes('rbc')) { min = 4.2; max = 5.9; }
    else if (bLower.includes('platelet')) { min = 150000; max = 450000; }
    else if (bLower.includes('creatinine')) { min = 0.7; max = 1.3; }
    else if (bLower.includes('tsh')) { min = 0.4; max = 4.2; }
    else if (bLower.includes('cholesterol') && !bLower.includes('hdl') && !bLower.includes('ldl')) { min = 125; max = 200; }
    else if (bLower.includes('ldl')) { min = 50; max = 100; }
    else if (bLower.includes('hdl')) { min = 40; max = 60; }
    else if (bLower.includes('alt') || bLower.includes('sgpt')) { min = 7; max = 56; }
    else if (bLower.includes('ast') || bLower.includes('sgot')) { min = 10; max = 40; }
    else if (bLower.includes('spo2')) { min = 95; max = 100; }
    else if (bLower.includes('blood pressure') || bLower.includes('bp')) { min = 90; max = 120; }
    else if (typeof defaultValue === 'number' && !isNaN(defaultValue) && defaultValue > 0) {
      min = Math.round(defaultValue * 0.8 * 10) / 10;
      max = Math.round(defaultValue * 1.2 * 10) / 10;
    } else {
      min = 0;
      max = 100;
    }
  }

  return { min, max };
}

export const HealthTimelinePage = () => {
  const navigate = useNavigate();
  const { reports, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [selectedMetric, setSelectedMetric] = useState(null);
  const [chartViewMode, setChartViewMode] = useState('auto'); // 'auto', 'longitudinal', 'benchmark'
  const [detailModalMetric, setDetailModalMetric] = useState(null);

  const userReports = Array.isArray(reports) ? reports : [];
  const reportCount = userReports.length;
  const hasReports = reportCount > 0;

  // Aggregate and normalize all biomarkers across user's uploaded reports
  const biomarkerMap = {};
  
  // Sort reports chronologically by ACTUAL REPORT DATE (reportDate / date)
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

  // SEPARATE BIOMARKERS FROM VITAL SIGNS
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

  // Reference range & clinical thresholds for active metric
  const { min: activeRefMin, max: activeRefMax } = parseReferenceRange(
    latestDataPoint?.refRange, 
    latestDataPoint?.numValue, 
    activeMetricName
  );

  // Status calculation for active metric
  let activeStatusType = 'normal'; // 'low', 'normal', 'high'
  if (latestDataPoint?.numValue !== null && activeRefMin !== null && activeRefMax !== null) {
    if (latestDataPoint.numValue < activeRefMin) activeStatusType = 'low';
    else if (latestDataPoint.numValue > activeRefMax) activeStatusType = 'high';
    else activeStatusType = 'normal';
  }

  // Calculate percentage position on visual spectrum gauge
  let spectrumPercent = 50;
  if (latestDataPoint?.numValue !== null && activeRefMin !== null && activeRefMax !== null && activeRefMax > activeRefMin) {
    const val = latestDataPoint.numValue;
    if (val <= activeRefMin) {
      const ratio = Math.max(0, val / activeRefMin);
      spectrumPercent = Math.max(8, Math.min(22, ratio * 22));
    } else if (val >= activeRefMax) {
      const ratio = Math.min(2, (val - activeRefMax) / (activeRefMax * 0.5));
      spectrumPercent = Math.min(94, 75 + ratio * 19);
    } else {
      const ratio = (val - activeRefMin) / (activeRefMax - activeRefMin);
      spectrumPercent = 25 + ratio * 50;
    }
  }

  // Clinical Benchmark Bar Chart Data (3 comparison bars: Lower Bound, Your Result, Upper Bound)
  const benchmarkChartData = [
    { label: 'Normal Min', value: activeRefMin, type: 'min' },
    { label: 'Your Result', value: latestDataPoint?.numValue ?? 0, type: 'patient' },
    { label: 'Normal Max', value: activeRefMax, type: 'max' }
  ];

  // Calculate change between latest and previous numeric values
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

  // Multi-biomarker overview summary stats
  let totalOptimalCount = 0;
  let totalAttentionCount = 0;
  discoveredBiomarkerNames.forEach(name => {
    const items = biomarkerMap[name] || [];
    const latest = items[items.length - 1];
    const { min, max } = parseReferenceRange(latest?.refRange, latest?.numValue, name);
    let status = 'normal';
    if (latest?.numValue !== null && min !== null && max !== null) {
      if (latest.numValue < min) status = 'low';
      else if (latest.numValue > max) status = 'high';
    }
    if (status === 'normal') totalOptimalCount++;
    else totalAttentionCount++;
  });

  // Detail Modal Data
  const modalDataPoints = detailModalMetric ? (biomarkerMap[detailModalMetric] || []) : [];
  const modalLatest = modalDataPoints.length > 0 ? modalDataPoints[modalDataPoints.length - 1] : null;
  const { min: modalRefMin, max: modalRefMax } = parseReferenceRange(
    modalLatest?.refRange,
    modalLatest?.numValue,
    detailModalMetric
  );

  const shouldShowLongitudinal = activeChartData.length > 1 && (chartViewMode === 'longitudinal' || chartViewMode === 'auto');

  return (
    <div className="space-y-8 pb-12 font-sans antialiased max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#54816C] dark:bg-[#91C1AC] animate-pulse" />
            <span className="text-xs sm:text-[13px] text-[#3D6352] dark:text-[#91C1AC] font-black uppercase tracking-[0.04em]">{t('longitudinalAnalytics')}</span>
          </div>
          <h1 className="text-2.5xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight mt-1">
            {t('healthTrends')}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-[#C8D0E0] mt-1.5">
            {t('trackBiomarkerProgressions')}
          </p>
        </div>

        {hasReports && (
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => navigate('/app/upload')}
            className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] text-sm font-bold rounded-xl cursor-pointer shadow-2xs self-start sm:self-auto text-white dark:text-[#0A0E1A]"
          >
            {t('uploadAnotherReport')}
          </Button>
        )}
      </div>

      {/* EMPTY STATE (0 REPORTS OR 0 EXTRACTED PARAMETERS) */}
      {(!hasReports || totalParametersCount === 0) && (
        <Card className="p-8 sm:p-12 text-center bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-5 max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#91C1AC] flex items-center justify-center mx-auto border border-[#D5E8DC] dark:border-slate-800">
            <TrendingUp className="w-8 h-8 text-[#3D6352] dark:text-[#91C1AC]" />
          </div>
          
          <div className="space-y-2.5 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
              No health trends available yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-normal leading-[1.6]">
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
              className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] text-white dark:text-[#0A0E1A] py-3.5 px-8 text-sm font-bold rounded-xl cursor-pointer shadow-2xs"
            >
              {t('uploadMedicalReport')}
            </Button>
          </div>
        </Card>
      )}

      {/* VALID BIOMARKERS POPULATED SECTION */}
      {hasReports && totalParametersCount > 0 && (
        <div className="space-y-8">
          
          {/* Top Health Trend Summary */}
          <Card className="p-5 sm:p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-black text-[#D5E8DC] uppercase tracking-[0.04em]">
                <Sparkles className="w-4.5 h-4.5 text-[#D5E8DC]" /> Health Trend &amp; Visual Analytics Summary
              </div>
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                {reportCount} Uploaded ({reportsWithMeasurableDataCount} with Data)
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[13px] sm:text-sm font-bold text-slate-300 uppercase tracking-[0.04em] block">Lab Biomarkers</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{totalLabBiomarkers} Tracked</span>
              </div>
              <div>
                <span className="text-[13px] sm:text-sm font-bold text-slate-300 uppercase tracking-[0.04em] block">Optimal / In Range</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center gap-1.5 mt-1">
                  {totalOptimalCount} <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </span>
              </div>
              <div>
                <span className="text-[13px] sm:text-sm font-bold text-slate-300 uppercase tracking-[0.04em] block">Attention Needed</span>
                <span className={`text-2xl sm:text-3xl font-black flex items-center gap-1.5 mt-1 ${totalAttentionCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {totalAttentionCount} {totalAttentionCount > 0 && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                </span>
              </div>
              <div>
                <span className="text-[13px] sm:text-sm font-bold text-slate-300 uppercase tracking-[0.04em] block">Monitoring Mode</span>
                <span className={`text-xl sm:text-2xl font-black flex items-center gap-1 mt-1 ${isLongitudinalActive ? 'text-emerald-400' : 'text-[#D5E8DC]'}`}>
                  {isLongitudinalActive ? 'Longitudinal Trend' : 'Clinical Benchmark'} 
                  <Activity className="w-5 h-5 ml-1" />
                </span>
              </div>
            </div>
          </Card>

          {/* Main Chart Canvas & Dynamic Biomarker Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart Area (8 columns) */}
            <Card className="lg:col-span-8 p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4 lg:sticky lg:top-20 lg:self-start">
              
              {/* Header Title & Dynamic Biomarker Selection Pill Strip */}
              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-2.5">
                      <TrendingUp className="w-5.5 h-5.5 text-[#3D6352] dark:text-[#91C1AC]" />
                      {activeMetricName} Visualization
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-1.5">
                      {activeChartData.length} data point(s) recorded across uploaded reports
                    </p>
                  </div>

                  {/* View Mode Switcher / Badge */}
                  <div className="flex items-center gap-2">
                    {activeChartData.length > 1 ? (
                      <div className="flex items-center bg-slate-100 dark:bg-[#25293C] p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setChartViewMode('longitudinal')}
                          className={`px-2.5 py-1 text-[13px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                            shouldShowLongitudinal
                              ? 'bg-white dark:bg-[#1C1F2E] text-[#0F172A] dark:text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <LineChartIcon className="w-3.5 h-3.5" /> Trend Curve
                        </button>
                        <button
                          onClick={() => setChartViewMode('benchmark')}
                          className={`px-2.5 py-1 text-[13px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                            !shouldShowLongitudinal
                              ? 'bg-white dark:bg-[#1C1F2E] text-[#0F172A] dark:text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <LineChartIcon className="w-3.5 h-3.5" /> Benchmark
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#91C1AC] text-[13px] font-bold border border-[#D5E8DC] dark:border-slate-800 flex items-center gap-1">
                        <LineChartIcon className="w-3.5 h-3.5" /> Clinical Reference Line Plot
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Biomarker Selector Pill Strip */}
                {discoveredBiomarkerNames.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                    {discoveredBiomarkerNames.map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMetric(m)}
                        className={`px-3 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all cursor-pointer ${
                          activeMetricName === m 
                            ? 'bg-[#54816C] dark:bg-[#91C1AC] text-white dark:text-[#0A0E1A] shadow-xs' 
                            : 'bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2e334a] border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart Canvas Area */}
              <div className="min-h-[290px] w-full pt-2">
                {shouldShowLongitudinal ? (
                  // MULTI-REPORT LONGITUDINAL LINE CHART
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={activeChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-[#0F172A] text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                                  <p className="font-extrabold text-[#2DD4BF]">{activeMetricName}</p>
                                  <p className="text-base font-black">{d.value} {d.unit}</p>
                                  <p className="text-[11px] text-slate-300 font-medium">Date: {d.date}</p>
                                  <p className="text-[10px] text-slate-400">Source: {d.reportTitle}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {activeRefMin !== null && (
                          <ReferenceLine 
                            y={activeRefMin} 
                            stroke="#3B82F6" 
                            strokeDasharray="4 4" 
                            label={{ value: `Min: ${activeRefMin}`, fill: '#3B82F6', fontSize: 10, position: 'insideBottomLeft' }} 
                          />
                        )}
                        {activeRefMax !== null && (
                          <ReferenceLine 
                            y={activeRefMax} 
                            stroke="#F59E0B" 
                            strokeDasharray="4 4" 
                            label={{ value: `Max: ${activeRefMax}`, fill: '#F59E0B', fontSize: 10, position: 'insideTopLeft' }} 
                          />
                        )}
                        <Line 
                          type="monotone" 
                          dataKey="numValue" 
                          stroke="#3D6352" 
                          strokeWidth={3} 
                          dot={{ r: 5, fill: '#3D6352', stroke: '#ffffff', strokeWidth: 2 }} 
                          activeDot={{ r: 7 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Latest vs Previous Comparison Bar */}
                    {latestDataPoint && (
                      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200/80 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Latest</span>
                          <strong className="text-[#0F172A] dark:text-[#F5F7FA] font-black text-sm">{latestDataPoint.value} {latestDataPoint.unit}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Previous</span>
                          <strong className="text-slate-700 dark:text-slate-300 font-bold text-sm">{previousDataPoint ? `${previousDataPoint.value} ${previousDataPoint.unit}` : 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Change</span>
                          <strong className={`font-black text-sm flex items-center gap-1 ${isPositiveChange ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {changeText}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // SINGLE REPORT & BENCHMARK GRAPHICAL LINE PLOT + SPECTRUM GAUGE
                  <div className="space-y-5">
                    
                    {/* Clinical Benchmark Line Plot */}
                    <div className="bg-slate-50/60 dark:bg-[#161926] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <LineChartIcon className="w-4 h-4 text-[#3D6352] dark:text-[#91C1AC]" />
                          Clinical Reference Line Plot
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          Unit: {latestDataPoint?.unit || 'Standard'}
                        </span>
                      </div>

                      <ResponsiveContainer width="100%" height={215}>
                        <LineChart data={benchmarkChartData} margin={{ top: 25, right: 30, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, Math.ceil(Math.max(activeRefMax, latestDataPoint?.numValue || 0) * 1.25)]} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const item = payload[0].payload;
                                return (
                                  <div className="bg-[#0F172A] text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                                    <p className="font-extrabold text-[#C9CEE3]">{item.label}</p>
                                    <p className="text-base font-black">{item.value} {latestDataPoint?.unit}</p>
                                    {item.type === 'patient' ? (
                                      <p className="text-[11px] text-emerald-400 font-medium">Your Measured Reading ({latestDataPoint?.date})</p>
                                    ) : (
                                      <p className="text-[10px] text-slate-400">Clinical Reference Limit</p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {activeRefMin !== null && (
                            <ReferenceLine 
                              y={activeRefMin} 
                              stroke="#3B82F6" 
                              strokeDasharray="4 4" 
                              label={{ value: `Min: ${activeRefMin}`, fill: '#60A5FA', fontSize: 10, position: 'insideBottomLeft' }} 
                            />
                          )}
                          {activeRefMax !== null && (
                            <ReferenceLine 
                              y={activeRefMax} 
                              stroke="#F59E0B" 
                              strokeDasharray="4 4" 
                              label={{ value: `Max: ${activeRefMax}`, fill: '#FBBF24', fontSize: 10, position: 'insideTopLeft' }} 
                            />
                          )}
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3D6352" 
                            strokeWidth={3} 
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              if (!cx || !cy) return null;
                              const isPatient = payload.type === 'patient';
                              const fill = isPatient
                                ? (activeStatusType === 'normal' ? '#3D6352' : activeStatusType === 'high' ? '#F59E0B' : '#3B82F6')
                                : '#94A3B8';
                              return (
                                <g key={`dot-${payload.label}`}>
                                  {isPatient && (
                                    <circle cx={cx} cy={cy} r={12} fill={fill} opacity={0.25} />
                                  )}
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={isPatient ? 7 : 5} 
                                    fill={fill} 
                                    stroke="#ffffff" 
                                    strokeWidth={2} 
                                  />
                                </g>
                              );
                            }}
                            activeDot={{ r: 9 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Interactive Clinical Range Spectrum Gauge */}
                    <div className="p-4 rounded-2xl bg-[#EEF7F1]/50 dark:bg-[#24283A]/40 border border-[#D5E8DC] dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
                        <div className="flex items-center gap-1.5 text-[#172033] dark:text-[#F5F7FA]">
                          <Activity className="w-4 h-4 text-[#3D6352] dark:text-[#91C1AC]" />
                          <span>Clinical Range Visual Spectrum Gauge</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          activeStatusType === 'low'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                            : activeStatusType === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        }`}>
                          {activeStatusType === 'low' ? 'Sub-optimal (< Min)' : activeStatusType === 'high' ? 'Elevated (> Max)' : '✓ In Target Range (Optimal)'}
                        </span>
                      </div>

                      {/* Visual Spectrum Bar with Marker */}
                      <div className="relative pt-6 pb-2">
                        {/* Pointer Pin */}
                        <div 
                          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
                          style={{ left: `${spectrumPercent}%` }}
                        >
                          <span className="px-2 py-0.5 rounded-md bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-[10px] font-black shadow-md whitespace-nowrap">
                            {latestDataPoint?.value} {latestDataPoint?.unit}
                          </span>
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#0F172A] dark:border-t-white" />
                        </div>

                        {/* 3-Zone Spectrum Bar */}
                        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner border border-slate-300 dark:border-slate-700">
                          <div className="w-1/4 bg-blue-400 dark:bg-blue-600" title={`Low (< ${activeRefMin})`} />
                          <div className="w-2/4 bg-emerald-500 dark:bg-emerald-500" title={`Normal (${activeRefMin} - ${activeRefMax})`} />
                          <div className="w-1/4 bg-amber-400 dark:bg-amber-600" title={`High (> ${activeRefMax})`} />
                        </div>

                        {/* Labels under the bar */}
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 px-1">
                          <span>Low (&lt; {activeRefMin})</span>
                          <span className="text-emerald-700 dark:text-emerald-300">Optimal Range ({activeRefMin} – {activeRefMax})</span>
                          <span>High (&gt; {activeRefMax})</span>
                        </div>
                      </div>

                      {/* Measurement Context Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white dark:bg-[#1C1F2E] border border-[#D5E8DC] dark:border-slate-800 shadow-2xs text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Measured Result</span>
                          <strong className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">
                            {latestDataPoint ? latestDataPoint.value : 'N/A'} <span className="text-xs font-bold text-slate-500">{latestDataPoint?.unit}</span>
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Reference Target</span>
                          <strong className="text-slate-700 dark:text-slate-300 font-bold text-xs">{latestDataPoint?.refRange || `${activeRefMin} – ${activeRefMax}`}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Report Date</span>
                          <strong className="text-[#3D6352] dark:text-[#91C1AC] font-bold text-xs">{latestDataPoint?.date}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                        <span>💡 Baseline recorded — upload another report containing <strong>{activeMetricName}</strong> to establish a longitudinal trend curve.</span>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Upload}
                          onClick={() => navigate('/app/upload')}
                          className="bg-white dark:bg-[#25293C] hover:bg-slate-50 dark:hover:bg-[#2e334a] text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                        >
                          Upload Next Report
                        </Button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </Card>

            {/* TREND CARDS GRID (4 columns) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Biomarker Highlights ({discoveredBiomarkerNames.length})</h4>
                <span className="text-[10px] text-slate-400 font-semibold">Click to graph</span>
              </div>
              
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
                {discoveredBiomarkerNames.map((mName) => {
                  const data = biomarkerMap[mName] || [];
                  const latest = data[data.length - 1];
                  const prev = data.length > 1 ? data[data.length - 2] : null;
                  const { min, max } = parseReferenceRange(latest?.refRange, latest?.numValue, mName);

                  let isNormal = true;
                  if (latest?.numValue !== null && min !== null && max !== null) {
                    if (latest.numValue < min || latest.numValue > max) isNormal = false;
                  }

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
                      className={`p-4 bg-white dark:bg-[#1C1F2E] border rounded-2xl shadow-2xs space-y-2 cursor-pointer transition-all hover:border-[#54816C] ${
                        activeMetricName === mName 
                          ? 'border-[#54816C] dark:border-[#91C1AC] ring-1 ring-[#54816C] dark:ring-[#91C1AC] bg-slate-50/50 dark:bg-[#25293C]/50' 
                          : 'border-slate-200/90 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[13px] font-bold text-[#0F172A] dark:text-[#F5F7FA]">
                        <span className="truncate max-w-[150px]">{mName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isNormal ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {cardDiff}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
                          {latest ? latest.value : 'N/A'} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{latest?.unit}</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{latest?.date}</span>
                      </div>

                      {/* Mini Reference Meter Bar */}
                      {latest?.numValue !== null && min !== null && max !== null && (
                        <div className="pt-1">
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full ${isNormal ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ 
                                width: `${Math.min(100, Math.max(10, ((latest.numValue - min) / (max - min || 1)) * 100))}%` 
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                            <span>Ref: {min}</span>
                            <span>{max}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* REPORT HISTORY FEED WITH DISTINCT EXTRACTION STATUS */}
      {hasReports && (
        <Card className="p-6 sm:p-7 space-y-5 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-[#F5F7FA]">{t('recentMedicalReports')}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-[#C8D0E0] mt-0.5">Chronological list of uploaded medical reports and extracted parameters</p>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#91C1AC] font-black text-xs border border-[#D5E8DC] dark:border-slate-800">
              {chronReports.length} {chronReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </div>

          <div className="space-y-3.5">
            {chronReports.map((r) => {
              const bCount = (r.biomarkers || r.labResults || []).length;
              const vCount = (r.vitals || []).length;
              const mCount = (r.extractedMedications || r.medications || []).length;
              const totalExtracted = bCount + vCount + mCount;
              const isExtractionSuccess = totalExtracted > 0;

              // Format raw file name (remove file extensions and snake_case underscores)
              const cleanReportTitle = (r.title || r.file_name || 'Medical Report')
                .replace(/\.[^/.]+$/, '')
                .replace(/[-_]+/g, ' ')
                .trim();

              // Clean MIME type format into friendly badge
              const rawType = (r.file_type || 'PDF').toLowerCase();
              const cleanFileType = rawType.includes('pdf')
                ? 'PDF'
                : (rawType.includes('image') || rawType.includes('png') || rawType.includes('jpg') || rawType.includes('jpeg'))
                ? 'IMAGE'
                : (r.file_type || 'DOC').toUpperCase();

              const reportDate = r.reportDate || r.date || r.report_date || 'Recent';

              return (
                <div 
                  key={r.id || r._id} 
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#161926] border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#54816C]/40 dark:hover:border-[#91C1AC]/40 hover:shadow-xs"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF7F1] dark:bg-[#24283A] border border-[#D5E8DC] dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                      <FileText className="w-5 h-5 text-[#3D6352] dark:text-[#91C1AC]" />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
                          {cleanReportTitle}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] tracking-wider uppercase">
                          {cleanFileType}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#C8D0E0] font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{reportDate}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isExtractionSuccess 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                        }`}>
                          {isExtractionSuccess ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Medical Extraction Completed
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Medical Extraction Incomplete
                            </>
                          )}
                        </span>
                      </div>

                      {/* Extracted Parameter Metric Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {isExtractionSuccess ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2333] border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                              <Activity className="w-3.5 h-3.5 text-blue-500" />
                              <span>{bCount} {bCount === 1 ? 'biomarker' : 'biomarkers'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2333] border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                              <HeartPulse className="w-3.5 h-3.5 text-teal-500" />
                              <span>{vCount} {vCount === 1 ? 'vital' : 'vitals'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2333] border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                              <span className="text-xs">💊</span>
                              <span>{mCount} {mCount === 1 ? 'medication' : 'medications'}</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                            0 parameters extracted • Document stored in history
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/app/analysis')}
                    className="group px-4 py-2 bg-white dark:bg-[#25293C] hover:bg-slate-100 dark:hover:bg-[#2e334a] text-xs sm:text-sm font-bold text-slate-800 dark:text-[#F5F7FA] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
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
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Latest Value</span>
              <strong className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">
                {modalLatest ? modalLatest.value : 'N/A'} {modalLatest?.unit}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Reference Range</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold text-xs">{modalLatest?.refRange || `${modalRefMin} - ${modalRefMax}`}</strong>
            </div>
          </div>

          {/* Modal Mini Chart */}
          {modalDataPoints.length > 1 ? (
            <div className="p-3 bg-white dark:bg-[#1C1F2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">Historical Progression Line Plot</span>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={modalDataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="numValue" stroke="#3D6352" strokeWidth={2.5} dot={{ r: 4, fill: '#3D6352' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-[#1C1F2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">Clinical Reference Line Plot</span>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart 
                  data={[
                    { label: 'Min', value: modalRefMin },
                    { label: 'You', value: modalLatest?.numValue ?? 0 },
                    { label: 'Max', value: modalRefMax }
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Line type="monotone" dataKey="value" stroke="#3D6352" strokeWidth={2.5} dot={{ r: 5, fill: '#3D6352' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Historical Readings Log ({modalDataPoints.length})</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {modalDataPoints.map((dp, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{dp.value} {dp.unit}</strong>
                    <span className="text-slate-400 text-[10px] block">{dp.reportTitle}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{dp.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};
