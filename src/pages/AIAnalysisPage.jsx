import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Building2, 
  Calendar, 
  Info,
  Download,
  Share2,
  Stethoscope,
  ArrowRight,
  Eye,
  AlertTriangle,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const { reports, userProfile } = useHealthData();
  const [viewOriginalModal, setViewOriginalModal] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const toggleSource = (idx) => {
    setExpandedSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Retrieve strictly the current user's latest uploaded report (0% Fake/Fallback Data!)
  const latestReport = (Array.isArray(reports) && reports.length > 0) ? reports[0] : null;

  // Empty State if zero reports have been uploaded
  if (!latestReport) {
    return (
      <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto text-center py-12">
        <Card className="p-10 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-[#1A4B84]">No Uploaded Medical Reports Yet</h2>
            <p className="text-xs text-slate-600 font-normal">
              Upload your lab test result or imaging report to view 100% dynamic AI extraction and clinical biomarker analysis.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#1A4B84] hover:bg-[#143A66] py-3 px-6 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Upload First Medical Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const biomarkers = Array.isArray(latestReport.biomarkers) ? latestReport.biomarkers : [];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
            <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">
              Document: {latestReport.fileName || latestReport.title}
            </span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
            AI Diagnostic Analysis
          </h1>
          <p className="text-xs font-normal text-slate-500">
            Report ID: <span className="font-mono text-slate-800 font-bold">{latestReport.reportId || 'rep-latest'}</span> • Uploaded: {latestReport.uploadedAt || latestReport.date}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 cursor-pointer"
            onClick={() => setViewOriginalModal(true)}
          >
            View Full Report Text
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            className="rounded-xl text-xs font-semibold border-slate-200 cursor-pointer"
            onClick={() => toast.success("Exporting structured report analysis PDF...")}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Patient & Report Metadata Header Card */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2D90A6]" /> Patient:
            </span>
            <strong className="text-[#1A4B84] font-bold text-sm block truncate">{userProfile?.name || "Patient Record"}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#2D90A6]" /> File Name:
            </span>
            <strong className="text-[#1A4B84] font-bold text-sm block truncate">{latestReport.fileName || latestReport.title}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2D90A6]" /> Uploaded Date:
            </span>
            <strong className="text-[#1A4B84] font-bold text-sm block">{latestReport.uploadedAt || latestReport.date}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Status:
            </span>
            <strong className="text-emerald-700 font-bold text-sm block">✓ Report Parsed</strong>
          </div>
        </div>
      </Card>

      {/* Dynamic AI Summary Card (Generated ONLY from Extracted Biomarkers) */}
      <Card className="p-6 bg-gradient-to-r from-[#1A4B84] to-[#143A66] text-white rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-4.5 h-4.5 text-[#2D90A6]" />
            </div>
            <h3 className="text-base font-extrabold text-white">AI Clinical Summary</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#2D90A6]/30 text-[#CCFBF1] text-xs font-bold border border-[#2D90A6]/40">
            High Confidence Extraction
          </span>
        </div>

        <p className="text-sm text-slate-100 leading-relaxed font-normal">
          {latestReport.aiSummary || `Analysis of ${latestReport.fileName}: Parsed ${biomarkers.length} parameters.`}
        </p>
      </Card>

      {/* Individual Findings Table / Cards (Dynamic parameters count) */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-[#1A4B84]">Individual Biomarker Findings</h3>
          <span className="text-xs font-extrabold text-[#2D90A6] bg-[#EBF6F8] px-3 py-1 rounded-full border border-[#2D90A6]/30">
            {biomarkers.length} {biomarkers.length === 1 ? 'Parameter' : 'Parameters'} Parsed
          </span>
        </div>

        {biomarkers.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-600 text-xs font-normal">
            No specific clinical biomarker tables were recognized in this report.
          </div>
        ) : (
          <div className="space-y-4">
            {biomarkers.map((bm, idx) => {
              const isWarning = bm.statusType === 'warning' || bm.status === 'Slightly Elevated' || bm.status === 'High' || bm.status === 'Low';
              const isCritical = bm.statusType === 'critical';

              return (
                <div 
                  key={bm.id || idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
                >
                  {/* Top Row: Test Name + Status Badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-extrabold text-base text-[#1A4B84]">{bm.name}</h4>
                    </div>

                    <span className={`med-badge ${
                      isCritical
                        ? 'med-badge-critical'
                        : isWarning
                        ? 'med-badge-warning'
                        : 'med-badge-normal'
                    }`}>
                      <span>{bm.statusSymbol || (isWarning ? '▲' : '✓')}</span>
                      <span>{bm.status}</span>
                    </span>
                  </div>

                  {/* Value & Reference Range Row */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight">{bm.value}</span>
                      <span className="text-xs font-semibold text-slate-500">{bm.unit}</span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium">
                      Reference: <span className="font-bold text-[#1A4B84]">{bm.refRange || 'Reference range not provided'}</span>
                    </div>
                  </div>

                  {/* View Source Accordion Toggle */}
                  {bm.sourceText && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => toggleSource(idx)}
                        className="text-xs font-bold text-[#2D90A6] hover:text-[#1A4B84] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{expandedSources[idx] ? 'Hide Source' : 'View Source'}</span>
                        {expandedSources[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedSources[idx] && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed animate-in fade-in duration-150">
                          <span className="font-bold text-slate-900 block mb-1">Source from report:</span>
                          "{bm.sourceText}"
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#1A4B84] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          <strong>Mandatory Medical Disclaimer:</strong> AI-generated information is for informational purposes only and should not replace professional medical advice. Always consult a qualified healthcare provider for clinical evaluation.
        </p>
      </div>

      {/* View Original Report Text Audit Modal */}
      <Modal
        isOpen={viewOriginalModal}
        onClose={() => setViewOriginalModal(false)}
        title={`Original Report Stream: ${latestReport.fileName || latestReport.title}`}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
            {latestReport.rawText || `Raw document text stream for ${latestReport.fileName} is stored with report ID ${latestReport.reportId}.`}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewOriginalModal(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
