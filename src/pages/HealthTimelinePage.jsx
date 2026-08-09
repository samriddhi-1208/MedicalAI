import React, { useState } from 'react';
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
import { TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const HealthTimelinePage = () => {
  const { biomarkerHistories } = useHealthData();
  const [selectedBiomarker, setSelectedBiomarker] = useState('Glucose');

  const historyData = biomarkerHistories[selectedBiomarker] || biomarkerHistories['Glucose'];

  const eventFeed = [
    { date: "July 28, 2026", title: "Complete Blood Count & Lipid Profile Analyzed", type: "report", desc: "Total Cholesterol measured at 224 mg/dL. Hemoglobin slightly low at 11.2 g/dL." },
    { date: "June 14, 2026", title: "Medication Adjustment: Metformin 500mg", type: "medicine", desc: "Consulting physician confirmed stable blood sugar tolerance." },
    { date: "May 12, 2026", title: "Thyroid Function Panel Result", type: "report", desc: "TSH level 2.1 mIU/L (Optimal endocrine baseline)." }
  ];

  return (
    <div className="space-y-6 pb-10">
      
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Biomarker Longitudinal Trends</h2>
        <p className="text-xs text-slate-500 mt-1">Track historical changes across medical reports to detect long-term patterns</p>
      </div>

      {/* Biomarker Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(biomarkerHistories).map((bmKey) => (
          <button
            key={bmKey}
            onClick={() => setSelectedBiomarker(bmKey)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              selectedBiomarker === bmKey
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> {bmKey}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{selectedBiomarker} Historical Progression</h3>
            <p className="text-xs text-slate-500">Target Clinical Reference Interval: &lt; 100</p>
          </div>
          <Badge variant="info">Historical Data Verified</Badge>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#0284c7' }}
              />
              <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Target Baseline', fill: '#16a34a', fontSize: 10 }} />
              <Area type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2.5} fill="#e0f2fe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-slate-700 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p>
            <strong>AI Trend Summary:</strong> Your {selectedBiomarker} levels have demonstrated a favorable downward trend over the past 5 months (-14 units).
          </p>
        </div>
      </Card>

      {/* Chronological Event Feed */}
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Medical Record Event Feed</h3>

        <div className="space-y-3">
          {eventFeed.map((event, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-sky-700">{event.type === 'report' ? '📄 Diagnostic Lab Report' : '💊 Medication Schedule'}</span>
                <span className="text-slate-500">{event.date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
              <p className="text-xs text-slate-600">{event.desc}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
