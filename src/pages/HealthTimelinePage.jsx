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
  Activity, 
  Sparkles, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Stethoscope
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const HealthTimelinePage = () => {
  const navigate = useNavigate();
  const { reports, userProfile } = useHealthData();
  const [timeRange, setTimeRange] = useState('6M'); // '1M' | '3M' | '6M' | '1Y'
  const [selectedMetric, setSelectedMetric] = useState('Hemoglobin');

  const hemoglobinData = [
    { date: 'Jan 2026', value: 12.4, target: 12.0 },
    { date: 'Mar 2026', value: 12.8, target: 12.0 },
    { date: 'May 2026', value: 13.2, target: 12.0 },
    { date: 'Jul 2026', value: 13.6, target: 12.0 },
    { date: 'Aug 2026', value: 13.8, target: 12.0 },
  ];

  const glucoseData = [
    { date: 'Jan 2026', value: 112, target: 99 },
    { date: 'Mar 2026', value: 108, target: 99 },
    { date: 'May 2026', value: 102, target: 99 },
    { date: 'Jul 2026', value: 98, target: 99 },
    { date: 'Aug 2026', value: 95, target: 99 },
  ];

  const bpData = [
    { date: 'Jan 2026', value: 128, target: 120 },
    { date: 'Mar 2026', value: 125, target: 120 },
    { date: 'May 2026', value: 122, target: 120 },
    { date: 'Jul 2026', value: 120, target: 120 },
    { date: 'Aug 2026', value: 118, target: 120 },
  ];

  const activeChartData = selectedMetric === 'Glucose' ? glucoseData : selectedMetric === 'BP' ? bpData : hemoglobinData;

  const milestones = [
    {
      date: 'Aug 11, 2026',
      badge: 'Report Upload',
      title: 'Complete Blood Count (CBC) Report Analyzed',
      desc: 'Haemoglobin measured at 13.8 g/dL (Normal). Neutrophils at 74.8% and RDW CV at 15.1% flagged for routine physician checkup.',
      type: 'report'
    },
    {
      date: 'Jul 15, 2026',
      badge: 'Medication Logged',
      title: 'Medication Adjusted: Iron & Multivitamin',
      desc: 'Care physician confirmed optimal iron absorption and stabilized hemoglobin progression.',
      type: 'medication'
    },
    {
      date: 'May 20, 2026',
      badge: 'Dietary Milestone',
      title: 'Began Iron-Rich Dietary Plan',
      desc: 'Incorporated spinach, lentils, and Vitamin C dietary supplementation for red cell indices.',
      type: 'diet'
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-xs text-[#0D9488] font-bold uppercase tracking-wider">Longitudinal Analytics</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
            Health Trends & Analytics
          </h1>
          <p className="text-xs font-normal text-slate-500">
            Monitor your long-term biomarker progressions and clinical milestone history over time
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          {['1M', '3M', '6M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* AI Trend Insight Banner matching Figma */}
      <Card className="p-5 bg-gradient-to-r from-[#0F172A] to-slate-800 text-white rounded-2xl shadow-md space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#0D9488]" /> AI Health Trend Insight
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          Your <strong>Hemoglobin (Hb)</strong> levels have stabilized at <strong>13.8 g/dL</strong> over the past 6 months (+1.4 g/dL gain since Jan 2026). Continue your current management and dietary plan.
        </p>
      </Card>

      {/* Main Interactive Chart & Quick Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart Canvas (8 columns) */}
        <Card className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-[#0D9488]" />
                {selectedMetric} Progression
              </h3>
              <p className="text-xs text-slate-500 font-medium">Standard Clinical Reference Interval: 12.0 - 15.0 g/dL</p>
            </div>

            {/* Metric Toggle Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedMetric('Hemoglobin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedMetric === 'Hemoglobin' ? 'bg-teal-50 text-[#0D9488] border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Hb
              </button>
              <button
                onClick={() => setSelectedMetric('Glucose')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedMetric === 'Glucose' ? 'bg-teal-50 text-[#0D9488] border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Glucose
              </button>
              <button
                onClick={() => setSelectedMetric('BP')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedMetric === 'BP' ? 'bg-teal-50 text-[#0D9488] border border-teal-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                BP
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
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
                <ReferenceLine y={selectedMetric === 'Glucose' ? 99 : 12.0} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target Baseline', fill: '#059669', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </Card>

        {/* Side Vitals Progression Cards matching Figma (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Hemoglobin Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Hemoglobin (Hb)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Normal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-extrabold text-[#0F172A]">
                13.8 <span className="text-xs font-normal text-slate-500">g/dL</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-4 h-4" /> +1.4 g/dL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Since Jan 12, 2026</p>
          </Card>

          {/* Fasting Glucose Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Fasting Glucose</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-extrabold text-[#0F172A]">
                95 <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowDownRight className="w-4 h-4" /> -17 mg/dL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Target: &lt; 100 mg/dL</p>
          </Card>

          {/* Blood Pressure Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Blood Pressure</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-extrabold text-[#0F172A]">
                118/78 <span className="text-xs font-normal text-slate-500">mmHg</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-4 h-4" /> Stable
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Systolic & Diastolic Baseline</p>
          </Card>

        </div>

      </div>

      {/* Historical Milestones & Interventions Timeline Feed matching Figma */}
      <Card className="p-7 space-y-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0F172A]">Historical Milestones & Clinical Interventions</h3>
            <p className="text-xs font-normal text-slate-500">Chronological record of lab tests, physician notes, and dietary adjustments</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            className="rounded-xl border-slate-200 text-xs font-semibold"
            onClick={() => navigate('/app/analysis')}
          >
            View Full Analysis
          </Button>
        </div>

        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#0F172A] font-bold">
                  {m.badge}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">{m.date}</span>
              </div>
              <h4 className="text-sm font-extrabold text-[#0F172A]">{m.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{m.desc}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
