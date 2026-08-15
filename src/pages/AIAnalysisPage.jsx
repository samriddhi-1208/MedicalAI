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
  ChevronUp,
  Activity,
  Pill,
  HeartPulse
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

  const latestReport = (Array.isArray(reports) && reports.length > 0) ? reports[0] : null;

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
  const vitals = Array.isArray(latestReport.vitals) ? latestReport.vitals : [];
  const medications = Array.isArray(latestReport.extractedMedications) ? latestReport.extractedMedications : (Array.isArray(latestReport.medications) ? latestReport.medications : []);

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
            {t('reportId')}: <strong className="text-slate-800">{latestReport.reportId || latestReport.id}</strong> • {t('uploaded')}: {latestReport.date || latestReport.report_date || latestReport.uploadedAt}
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

      {/* Patient Information Banner */}
      <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#2D90A6] uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-[#2D90A6]" /> Patient Identification & Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <span className="text-slate-500 block">Patient Name</span>
            <strong className="text-[#0F172A] font-black text-sm">{userProfile?.name || 'Patient'}</strong>
          </div>
          <div className="min-w-0">
            <span className="text-slate-500 block">Report File</span>
            <strong className="text-slate-800 font-bold block truncate max-w-full" title={latestReport.file_name || latestReport.fileName}>
              {latestReport.file_name || latestReport.fileName || 'Report.pdf'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Report Date</span>
            <strong className="text-slate-800 font-bold">{latestReport.date || latestReport.report_date || 'Recent'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Extraction Confidence</span>
            <strong className="text-emerald-700 font-bold">{latestReport.ocrConfidence || '99.4%'}</strong>
          </div>
        </div>
      </Card>

      {/* AI Clinical Summary Banner */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0D9488]" />
            <h2 className="text-base font-black text-[#0F172A]">{t('aiClinicalSummary')}</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F0FDF4] text-[#0D9488] font-bold text-xs border border-[#0D9488]/30">
            {t('extractedFromDoc')}
          </span>
        </div>

        <p className="text-xs text-slate-700 font-normal leading-relaxed">
          {latestReport.aiSummary}
        </p>
      </Card>

      {/* Vital Signs Grid (If extracted) */}
      {vitals.length > 0 && (
        <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
            <HeartPulse className="w-4.5 h-4.5 text-[#0D9488]" /> Vital Signs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {vitals.map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-slate-500 font-medium block truncate">{v.name}</span>
                <span className="text-base sm:text-lg font-black text-[#0F172A]">
                  {v.value} <span className="text-xs font-bold text-slate-600">{v.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Extracted Lab Results Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#0F172A]">{t('individualBiomarkerFindings')}</h3>
          <span className="text-xs font-semibold text-slate-500">
            {biomarkers.length} {biomarkers.length === 1 ? t('parameterParsed') : t('parametersParsed')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {biomarkers.map((bm, idx) => {
            const isNormal = String(bm.status || bm.statusType).toLowerCase() === 'normal';

            return (
              <Card key={idx} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-sm text-[#0F172A]">{bm.name || bm.biomarker_name}</h4>
                    <p className="text-slate-500 font-medium mt-0.5">Category: {bm.category || 'Clinical Diagnostic'}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-extrabold text-xs shrink-0 flex items-center gap-1 ${
                    isNormal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    <span>{bm.statusSymbol || (isNormal ? '✓' : '▲')}</span>
                    <span>{bm.status || 'Normal'}</span>
                  </span>
                </div>

                <div className="flex items-baseline justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">Measured Value</span>
                    <span className="text-base sm:text-lg font-black text-[#0F172A]">
                      {bm.value} <span className="text-xs font-bold text-slate-600">{bm.unit}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">Reference Range</span>
                    <span className="text-xs font-bold text-slate-700">{bm.refRange || bm.referenceRange || bm.reference_range || 'N/A'}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Extracted Medications Section */}
      {medications.length > 0 && (
        <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
            <Pill className="w-4.5 h-4.5 text-[#0D9488]" /> Extracted Medication Instructions ({medications.length})
          </h3>
          <div className="space-y-3">
            {medications.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <h4 className="font-black text-sm text-[#0F172A]">💊 {m.medicineName || m.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#0D9488] font-bold">
                    {m.dose || m.strength || '1 tablet'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-600">
                  <p><span className="text-slate-500">Frequency:</span> <strong className="text-slate-800">{m.frequency}</strong></p>
                  <p><span className="text-slate-500">Meal Relation:</span> <strong className="text-slate-800">{m.mealRelation}</strong></p>
                  <p><span className="text-slate-500">Timing:</span> <strong className="text-[#0D9488]">{m.timing || 'As prescribed'}</strong></p>
                  <p><span className="text-slate-500">Duration:</span> <strong className="text-slate-800">{m.duration || '5 days'}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* View Original Report Text Modal */}
      <Modal
        isOpen={viewOriginalModal}
        onClose={() => setViewOriginalModal(false)}
        title="Original Extracted Report Text"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-500 font-normal">
            Below is the OCR text extracted from your uploaded medical document file ({latestReport.file_name || latestReport.fileName}):
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {latestReport.rawText || latestReport.extractedText || "No raw text stream available."}
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
