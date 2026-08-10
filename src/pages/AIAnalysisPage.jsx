import React, { useState } from 'react';
import { 
  FileText, 
  BrainCircuit, 
  Download, 
  Printer, 
  TrendingDown,
  TrendingUp,
  History,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Utensils,
  Sparkles,
  HelpCircle,
  Activity,
  Filter,
  ShieldCheck,
  ChevronRight
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
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'warning' | 'normal'

  const report = activeReport || reports[0];

  if (!report) {
    return (
      <Card className="p-10 text-center bg-white space-y-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#F0F9FF] text-[#11476C] flex items-center justify-center mx-auto border border-[#77CAF3]/40">
          <BrainCircuit className="w-7 h-7 text-[#11476C]" />
        </div>
        <h3 className="text-xl font-bold text-[#11476C]">No Diagnostic Reports Available</h3>
        <p className="text-xs font-medium text-[#64748B]">Please upload a lab report to view AI biomarker explanations.</p>
      </Card>
    );
  }

  // Filter biomarkers based on status mode
  const filteredBiomarkers = (report.biomarkers || []).filter(bm => {
    if (filterMode === 'warning') return bm.statusType === 'warning' || bm.status === 'High' || bm.status === 'Low' || bm.status === 'Borderline';
    if (filterMode === 'normal') return bm.statusType === 'normal' || bm.status === 'Normal' || bm.status === 'Optimal';
    return true;
  });

  const warningCount = (report.biomarkers || []).filter(bm => bm.statusType === 'warning' || bm.status === 'High' || bm.status === 'Low' || bm.status === 'Borderline').length;

  return (
    <div className="space-y-7 pb-12 font-sans">
      
      {/* Top Header Card */}
      <Card className="p-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-md shadow-slate-200/40 space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold border border-[#FDE68A] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {report.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0F9FF] text-[#11476C] text-xs font-semibold border border-[#77CAF3]/30">
                OCR Accuracy: {report.ocrConfidence}
              </span>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0]">
                AI Score: {report.score}/100
              </span>
            </div>

            <h1 className="text-2.5xl sm:text-3xl font-bold text-[#11476C] tracking-tight leading-snug">
              {report.title}
            </h1>

            <p className="text-xs font-medium text-[#64748B] flex items-center gap-3 flex-wrap">
              <span>Lab: <strong className="text-[#0F172A]">{report.labName}</strong></span>
              <span>•</span>
              <span>Physician: <strong className="text-[#0F172A]">{report.doctorName}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-[#0F172A]">{report.date}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="px-4 py-2.5 rounded-xl bg-[#F0F9FF] text-[#11476C] border border-[#77CAF3]/40 text-xs font-bold hover:bg-[#E0F2FE] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-[#11476C]" />
              <span>Past Reports ({reports.length})</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              className="rounded-xl border-[#E2E8F0] text-xs font-semibold"
              onClick={() => window.print()}
            >
              Print Report
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Download}
              className="rounded-xl bg-[#11476C] hover:bg-[#0d3856] text-xs font-semibold shadow-md shadow-[#11476C]/15"
              onClick={() => toast.success("Exporting structured report PDF...")}
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* History Selector Drawer */}
        {historyOpen && (
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3 pt-3">
            <p className="text-xs font-bold text-[#11476C] uppercase tracking-wider">Select Past Medical Report:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveReportId(r.id);
                    setHistoryOpen(false);
                    toast.success(`Loaded report: ${r.title}`);
                  }}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    r.id === report.id
                      ? 'bg-[#F0F9FF] border-[#77CAF3] text-[#11476C] font-bold shadow-xs'
                      : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <p className="truncate font-bold text-[#11476C]">{r.title}</p>
                  <p className="text-[11px] font-medium text-[#64748B] mt-0.5">{r.date} • {r.labName}</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </Card>

      {/* AI Plain-Language Explanation Card */}
      <Card className="p-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-md shadow-slate-200/30 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] text-[#11476C] flex items-center justify-center border border-[#77CAF3]/40">
              <BrainCircuit className="w-5 h-5 text-[#11476C]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#11476C]">AI Clinical Summary & Plain-Language Explanation</h2>
              <p className="text-xs font-medium text-[#64748B]">Synthesized from extracted lab parameters using MedGuardian AI</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F0F9FF] text-[#11476C] text-xs font-bold border border-[#77CAF3]/30 hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#77CAF3]" /> Plain Language
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#F0F9FF]/70 border border-[#77CAF3]/30 text-sm font-medium text-[#0F172A] leading-relaxed shadow-2xs">
          {report.aiSummary}
        </div>

        {/* Structured Findings Grid */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-bold text-[#11476C] uppercase tracking-wider">Key Clinical Observations:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.keyFindings.map((finding, idx) => {
              const isWarning = finding.toLowerCase().includes('cholesterol') || finding.toLowerCase().includes('low') || finding.toLowerCase().includes('high');
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex items-start gap-3 transition-all ${
                    isWarning 
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]' 
                      : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                  }`}
                >
                  {isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  )}
                  <span>{finding}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Structured Biomarker Matrix Table with Range Progress Bar */}
      <Card className="p-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-md shadow-slate-200/30 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#11476C]">Structured Biomarker Panel</h2>
            <p className="text-xs font-medium text-[#64748B]">Extracted blood parameter metrics with clinical reference bounds</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#11476C] text-white shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              All Markers ({report.biomarkers.length})
            </button>

            <button
              onClick={() => setFilterMode('warning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'warning'
                  ? 'bg-[#D97706] text-white shadow-2xs'
                  : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] hover:bg-[#FDE68A]'
              }`}
            >
              Attention Needed ({warningCount})
            </button>

            <button
              onClick={() => setFilterMode('normal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'normal'
                  ? 'bg-[#16A34A] text-white shadow-2xs'
                  : 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] hover:bg-[#BBF7D0]'
              }`}
            >
              Normal ({report.biomarkers.length - warningCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="med-table">
            <thead>
              <tr>
                <th className="rounded-l-xl">Biomarker</th>
                <th>Category</th>
                <th>Measured Value</th>
                <th>Reference Bounds</th>
                <th>Status Indicator</th>
                <th className="rounded-r-xl text-right">Trend Direction</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiomarkers.map((bm) => {
                const isHigh = bm.status === 'High' || bm.trend === 'up';
                const isLow = bm.status === 'Low' || bm.status === 'Borderline' || bm.trend === 'down';
                const isNormal = bm.status === 'Normal' || bm.status === 'Optimal';

                return (
                  <tr key={bm.id} className="hover:bg-[#F8FAFC] transition-colors">
                    
                    <td className="font-bold text-[#11476C] text-sm">
                      {bm.name}
                    </td>

                    <td>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-xs font-semibold">
                        {bm.category}
                      </span>
                    </td>

                    <td className="font-mono font-bold text-[#0F172A] text-sm">
                      {bm.value} <span className="text-xs font-medium text-[#64748B]">{bm.unit}</span>
                    </td>

                    <td className="text-[#64748B] font-mono text-xs font-medium">
                      {bm.refRange} {bm.unit}
                    </td>

                    <td>
                      {isHigh && (
                        <span className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-bold border border-[#FCA5A5] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> High
                        </span>
                      )}
                      {isLow && !isHigh && (
                        <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold border border-[#FDE68A] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {bm.status}
                        </span>
                      )}
                      {isNormal && (
                        <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold border border-[#BBF7D0] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {bm.status}
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      {bm.trend === 'up' ? (
                        <span className="text-[#D97706] font-bold inline-flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-[#D97706]" /> High
                        </span>
                      ) : bm.trend === 'down' ? (
                        <span className="text-[#11476C] font-bold inline-flex items-center gap-1 text-xs">
                          <TrendingDown className="w-3.5 h-3.5 text-[#77CAF3]" /> Low
                        </span>
                      ) : (
                        <span className="text-[#16A34A] text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Stable
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Clinical Recommendations Cards */}
      <Card className="p-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-md shadow-slate-200/30 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#11476C]">AI Actionable Clinical Recommendations</h2>
            <p className="text-xs font-medium text-[#64748B]">Personalized advice based on your extracted lab parameters</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('lifestyle')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lifestyle' 
                  ? 'bg-[#11476C] text-white shadow-2xs' 
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              🥗 Dietary & Lifestyle
            </button>

            <button
              onClick={() => setActiveTab('medical')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'medical' 
                  ? 'bg-[#11476C] text-white shadow-2xs' 
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              🩺 Clinical Follow-Up
            </button>

            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'doctor' 
                  ? 'bg-[#11476C] text-white shadow-2xs' 
                  : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              💬 Questions for Doctor
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {activeTab === 'lifestyle' && report.recommendations.lifestyle.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F0F9FF]/80 border border-[#77CAF3]/30 text-xs font-semibold text-[#11476C] flex items-start gap-3 shadow-2xs">
              <Utensils className="w-4.5 h-4.5 text-[#11476C] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}

          {activeTab === 'medical' && report.recommendations.medical.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-semibold text-[#166534] flex items-start gap-3 shadow-2xs">
              <Stethoscope className="w-4.5 h-4.5 text-[#16A34A] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}

          {activeTab === 'doctor' && (report.recommendations.questionsForDoctor || [
            "Should I consider low-dose iron supplementation for mild anemia?",
            "Is statin therapy warranted for LDL levels, or can we attempt lifestyle modification for 60 days?"
          ]).map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs font-semibold text-[#B45309] flex items-start gap-3 shadow-2xs">
              <HelpCircle className="w-4.5 h-4.5 text-[#D97706] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

      </Card>

    </div>
  );
};
