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
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const { reports, userProfile, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

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
            <h2 className="text-xl font-extrabold text-[#1A4B84]">{t('noUploadedReports')}</h2>
            <p className="text-xs text-slate-500 font-normal">
              {t('uploadSubtitle')}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#1A4B84] hover:bg-[#143A66] py-3 px-8 text-xs font-bold rounded-xl cursor-pointer"
            >
              {t('uploadMedicalReport')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const biomarkers = Array.isArray(latestReport.biomarkers) ? latestReport.biomarkers : [];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
            <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">{t('statusReportParsed')}</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
            {t('aiDiagnosticAnalysis')}
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {t('reportId')}: <strong className="text-slate-800">{latestReport.reportId || latestReport.id}</strong> • {t('uploaded')}: {latestReport.uploadedAt}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setViewOriginalModal(true)}
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
          >
            {t('viewOriginalText')}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => toast.success("Exporting report analysis as PDF...")}
            className="bg-[#1A4B84] hover:bg-[#143A66] py-2 px-4 text-xs font-bold rounded-xl cursor-pointer"
          >
            {t('exportPDF')}
          </Button>
        </div>
      </div>

      {/* AI Clinical Summary Banner */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2D90A6]" />
            <h2 className="text-base font-extrabold text-[#1A4B84]">{t('aiClinicalSummary')}</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#EBF6F8] text-[#2D90A6] font-bold text-xs border border-[#2D90A6]/30">
            {t('extractedFromDoc')}
          </span>
        </div>

        <p className="text-xs text-slate-700 font-normal leading-relaxed">
          {latestReport.aiSummary}
        </p>
      </Card>

      {/* Extracted Biomarker Findings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1A4B84]">{t('individualBiomarkerFindings')}</h3>
          <span className="text-xs font-semibold text-slate-500">
            {biomarkers.length} {biomarkers.length === 1 ? t('parameterParsed') : t('parametersParsed')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {biomarkers.map((bm, idx) => {
            const isNormal = bm.statusType === 'normal' || bm.status === 'Normal';
            const isExpanded = expandedSources[idx];

            return (
              <Card key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A4B84]">{bm.name}</h4>
                    <p className="text-slate-500 font-medium mt-0.5">Category: {bm.category || 'General Diagnostic'}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-extrabold text-xs shrink-0 flex items-center gap-1 ${
                    isNormal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    <span>{bm.statusSymbol || (isNormal ? '✓' : '▲')}</span>
                    <span>{bm.status}</span>
                  </span>
                </div>

                <div className="flex items-baseline justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">Measured Value</span>
                    <span className="text-lg font-black text-[#1A4B84]">
                      {bm.value} <span className="text-xs font-bold text-slate-600">{bm.unit}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">Reference Range</span>
                    <span className="text-xs font-bold text-slate-700">{bm.refRange || 'N/A'}</span>
                  </div>
                </div>

                {/* Single-line Isolated Source Snippet Accordion */}
                <div className="border-t border-slate-100 pt-2">
                  <button
                    onClick={() => toggleSource(idx)}
                    className="text-[11px] font-bold text-[#2D90A6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? t('hideSource') : t('viewSource')}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700 animate-in fade-in duration-150">
                      <span className="text-[10px] font-bold text-slate-500 block font-sans mb-1">{t('sourceFromReport')}:</span>
                      "{bm.sourceText || `${bm.name} ${bm.value} ${bm.unit} ${bm.refRange}`}"
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* View Original Report Text Modal */}
      <Modal
        isOpen={viewOriginalModal}
        onClose={() => setViewOriginalModal(false)}
        title="Original Extracted Report Text"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-500 font-normal">
            Below is the full OCR text extracted from your uploaded medical document file ({latestReport.fileName}):
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {latestReport.extractedText || "No raw text available."}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewOriginalModal(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
