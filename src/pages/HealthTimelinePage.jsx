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
  HeartPulse
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HealthTimelinePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useHealthData();
  const [timeFilter, setTimeFilter] = useState('6M'); // 1M | 3M | 6M | 1Y | ALL
  const [selectedMetric, setSelectedMetric] = useState('HbA1c'); // HbA1c | Glucose | BP

  const hba1cData = [
    { date: 'Jan 2026', value: 5.4, target: 5.7 },
    { date: 'Mar 2026', value: 5.5, target: 5.7 },
    { date: 'May 2026', value: 5.6, target: 5.7 },
    { date: 'Jul 2026', value: 5.7, target: 5.7 },
    { date: 'Aug 2026', value: 5.8, target: 5.7 },
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

  const activeChartData = selectedMetric === 'Glucose' ? glucoseData : selectedMetric === 'BP' ? bpData : hba1cData;

  const milestones = [
    {
      date: 'Oct 12, 2023',
      category: 'Medication Change',
      title: 'Started Metformin 500mg',
      desc: 'Prescribed low-dose metformin to stabilize glycemic variation.'
    },
    {
      date: 'Jan 05, 2024',
      category: 'Dietary Milestone',
      title: 'Started Mediterranean Diet',
      desc: 'Adopted antioxidant-rich dietary plan with low glycemic load.'
    },
    {
      date: 'Mar 22, 2024',
      category: 'Lab Result',
      title: 'HbA1c Dropped Below 6.0%',
      desc: 'Demonstrated positive progress towards target glycemic baseline.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
            <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">Longitudinal Analytics</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
            Health Trends & Analytics
          </h1>
          <p className="text-xs font-normal text-slate-500">
            Monitor your long-term biomarker progressions and historical clinical milestones over time
          </p>
        </div>

        {/* Time Filters: 1M | 3M | 6M | 1Y | ALL */}
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
      </div>

      {/* AI Insight Card */}
      <Card className="p-5 bg-gradient-to-r from-[#1A4B84] to-[#143A66] text-white rounded-2xl shadow-md space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2D90A6] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#2D90A6]" /> AI Biomarker Insight
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          Your <strong>HbA1c</strong> has shown a slight upward progression over the last 6 months (<strong>5.8%</strong>). Fasting Glucose remains optimal at 95 mg/dL. Consider reviewing your diet plan with your physician.
        </p>
      </Card>

      {/* Main Interactive Chart & Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart Canvas (8 columns) */}
        <Card className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#1A4B84] flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-[#2D90A6]" />
                {selectedMetric} Progression
              </h3>
              <p className="text-xs text-slate-500 font-medium">Standard Clinical Reference Threshold: {selectedMetric === 'HbA1c' ? '< 5.7 %' : '< 100 mg/dL'}</p>
            </div>

            {/* Metric Toggle Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedMetric('HbA1c')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedMetric === 'HbA1c' ? 'bg-[#2D90A6] text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                HbA1c
              </button>
              <button
                onClick={() => setSelectedMetric('Glucose')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedMetric === 'Glucose' ? 'bg-[#2D90A6] text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Glucose
              </button>
              <button
                onClick={() => setSelectedMetric('BP')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedMetric === 'BP' ? 'bg-[#2D90A6] text-white' : 'text-slate-600 hover:bg-slate-50'
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
                <ReferenceLine y={selectedMetric === 'HbA1c' ? 5.7 : 99} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target Reference', fill: '#059669', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="#2D90A6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Side Vitals Progression Cards (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1A4B84]">
              <span>HbA1c</span>
              <span className="med-badge med-badge-warning">
                ▲ Elevated
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-extrabold text-[#1A4B84]">
                5.8 <span className="text-xs font-normal text-slate-500">%</span>
              </span>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-4 h-4" /> +0.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">6 Month Change</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1A4B84]">
              <span>Fasting Glucose</span>
              <span className="med-badge med-badge-normal">
                ✓ Normal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-extrabold text-[#1A4B84]">
                95 <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowDownRight className="w-4 h-4" /> -17 mg/dL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Ref Target: &lt; 100 mg/dL</p>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1A4B84]">
              <span>Blood Pressure</span>
              <span className="med-badge med-badge-normal">
                ✓ Normal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-extrabold text-[#1A4B84]">
                120/80 <span className="text-xs font-normal text-slate-500">mmHg</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-4 h-4" /> Stable
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Systolic & Diastolic Baseline</p>
          </Card>

        </div>

      </div>

      {/* Historical Milestones Timeline Feed */}
      <Card className="p-6 sm:p-7 space-y-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#1A4B84]">Historical Milestones</h3>
            <p className="text-xs font-normal text-slate-500">Chronological timeline of prescription changes, dietary milestones, and lab milestones</p>
          </div>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-[#1A4B84] font-bold">
                  {m.category}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">{m.date}</span>
              </div>
              <h4 className="text-sm font-extrabold text-[#1A4B84]">{m.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{m.desc}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
