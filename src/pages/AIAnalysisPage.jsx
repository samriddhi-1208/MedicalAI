import React, { useState } from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Download, 
  Share2, 
  Printer, 
  TrendingDown,
  TrendingUp,
  History,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AIAnalysisPage = () => {
  const { activeReport, reports, setActiveReportId } = useHealthData();
  const [activeTab, setActiveTab] = useState('lifestyle');
  const [historyOpen, setHistoryOpen] = useState(false);

  const report = activeReport || reports[0];

  if (!report) {
    return (
      <Card className="p-8 text-center bg-white space-y-4">
        <h3 className="text-lg font-bold text-slate-900">No Reports Available</h3>
        <p className="text-xs text-slate-500">Upload a report first to view AI diagnostics.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={report.statusType}>{report.status}</Badge>
            <span className="text-xs text-slate-500">OCR Accuracy: {report.ocrConfidence}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{report.title}</h2>
          <p className="text-xs text-slate-500">
            Lab: <strong className="text-slate-800">{report.labName}</strong> • Doctor: <strong className="text-slate-800">{report.doctorName}</strong> • Date: {report.date}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="med-btn med-btn-secondary text-xs"
          >
            <History className="w-4 h-4 text-sky-600" /> Past Reports ({reports.length})
          </button>
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button variant="primary" size="sm" icon={Download} onClick={() => toast.success("Downloading PDF...")}>Download PDF</Button>
        </div>
      </div>

      {/* History Drawer Selector */}
      {historyOpen && (
        <Card className="p-4 bg-slate-50 border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-700">Select Past Report to View:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveReportId(r.id);
                  setHistoryOpen(false);
                }}
                className={`p-3 rounded-lg border text-left text-xs ${
                  r.id === report.id
                    ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <p className="truncate font-bold">{r.title}</p>
                <p className="text-[11px] text-slate-500">{r.date} • {r.labName}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* AI Summary Card */}
      <Card className="p-6 bg-sky-50/50 border-sky-200 space-y-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">AI Plain-Language Summary</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
          {report.aiSummary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {report.keyFindings.map((finding, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{finding}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Extracted Biomarker Table */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Structured Biomarker Panel</h3>
          <Badge variant="normal">{report.biomarkers.length} Test Markers</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="med-table">
            <thead>
              <tr>
                <th>Biomarker</th>
                <th>Category</th>
                <th>Measured Value</th>
                <th>Reference Range</th>
                <th>Status</th>
                <th className="text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {report.biomarkers.map((bm) => (
                <tr key={bm.id}>
                  <td className="font-bold text-slate-900">{bm.name}</td>
                  <td className="text-slate-500 text-xs">{bm.category}</td>
                  <td className="font-mono font-bold text-slate-900">
                    {bm.value} <span className="text-[11px] font-normal text-slate-500">{bm.unit}</span>
                  </td>
                  <td className="text-slate-600 font-mono text-xs">{bm.refRange} {bm.unit}</td>
                  <td>
                    <Badge variant={bm.statusType}>{bm.status}</Badge>
                  </td>
                  <td className="text-right">
                    {bm.trend === 'up' ? (
                      <span className="text-amber-600 font-semibold inline-flex items-center gap-0.5 text-xs">
                        <TrendingUp className="w-3.5 h-3.5" /> High
                      </span>
                    ) : bm.trend === 'down' ? (
                      <span className="text-sky-600 font-semibold inline-flex items-center gap-0.5 text-xs">
                        <TrendingDown className="w-3.5 h-3.5" /> Low
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs font-semibold">Stable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">AI Clinical Recommendations</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('lifestyle')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'lifestyle' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Dietary & Lifestyle
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'medical' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Clinical Follow-Up
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {activeTab === 'lifestyle' && report.recommendations.lifestyle.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <Utensils className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}

          {activeTab === 'medical' && report.recommendations.medical.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
