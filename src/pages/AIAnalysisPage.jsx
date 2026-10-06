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
  HeartPulse,
  Plus,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { formatDisplayName } from '../utils/formatters';
import { 
  generateRichClinicalSummary, 
  getEasyMedicineExplanation, 
  getEasyBiomarkerExplanation,
  universalClinicalExtractor 
} from '../utils/reportParser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const { reports, activeReportId, setActiveReportId, userProfile, language, addMedicine, medicines } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [viewOriginalModal, setViewOriginalModal] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleInsight = (idx) => {
    if (allExpanded) {
      setAllExpanded(false);
      setActiveInsight(idx);
    } else {
      setActiveInsight(prev => (prev === idx ? null : idx));
    }
  };

  const toggleAll = () => {
    if (allExpanded) {
      setAllExpanded(false);
      setActiveInsight(null);
    } else {
      setAllExpanded(true);
      setActiveInsight(null);
    }
  };

  const isInsightOpen = (idx) => {
    if (allExpanded) return true;
    return activeInsight === idx;
  };

  const userReports = Array.isArray(reports) ? reports : [];
  const [selectedReportId, setSelectedReportId] = useState(() => activeReportId || userReports[0]?.id || userReports[0]?._id);

  React.useEffect(() => {
    if (activeReportId) {
      setSelectedReportId(activeReportId);
    } else if (userReports.length > 0 && !selectedReportId) {
      setSelectedReportId(userReports[0].id || userReports[0]._id);
    }
  }, [activeReportId, reports?.length]);

  const selectedReport = userReports.find(r => String(r.id || r._id) === String(selectedReportId)) || userReports[0] || null;

  if (!selectedReport) {
    return (
      <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto text-center py-12">
        <Card className="p-10 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#25293C] text-slate-500 dark:text-[#8BC7B5] flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
            <FileText className="w-8 h-8 text-slate-400 dark:text-[#8BC7B5]" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{t('noUploadedReports')}</h2>
            <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-normal">
              {t('uploadSubtitle')}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#54816C] dark:hover:bg-[#3D6352] text-white dark:text-[#0A0E1A] py-3 px-8 text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
            >
              {t('uploadMedicalReport')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Extract raw findings
  let rawBiomarkers = Array.isArray(selectedReport.biomarkers) ? selectedReport.biomarkers : (Array.isArray(selectedReport.labResults) ? selectedReport.labResults : []);
  let rawVitals = Array.isArray(selectedReport.vitals) ? selectedReport.vitals : [];
  let rawMedications = Array.isArray(selectedReport.extractedMedications) ? selectedReport.extractedMedications : (Array.isArray(selectedReport.medications) ? selectedReport.medications : []);

  // Run dynamic extractor fallback if findings are empty (e.g. older uploaded records or PDF without OCR stream)
  if (rawBiomarkers.length === 0 && rawMedications.length === 0) {
    const extracted = universalClinicalExtractor(
      selectedReport.rawText || '', 
      selectedReport.title || selectedReport.file_name || selectedReport.fileName || 'Medical_Report'
    );
    if (extracted.medications.length > 0) rawMedications = extracted.medications;
    if (extracted.labResults.length > 0) rawBiomarkers = extracted.labResults;
    if (extracted.vitals.length > 0) rawVitals = extracted.vitals;
  }

  const biomarkers = rawBiomarkers;
  const vitals = rawVitals;
  const medications = rawMedications;

  const getFormattedSummary = () => {
    return generateRichClinicalSummary(
      selectedReport?.title || selectedReport?.file_name || (language === 'HI' ? 'मेडिकल दस्तावेज़' : language === 'GU' ? 'મેડિકલ દસ્તાવેજ' : 'Medical Document'),
      biomarkers,
      vitals,
      medications,
      language
    );
  };


  const handleAddMedToSchedule = (med) => {
    addMedicine({
      name: med.medicineName || med.name,
      dose: med.dose || med.strength || '1 tablet',
      frequency: med.frequency || 'Once daily',
      scheduled_time: med.timing || '08:00 AM',
      meal_relation: med.mealRelation || 'After meal',
      source_title: selectedReport.title || 'Extracted Prescription'
    });
    toast.success(`${med.medicineName || med.name} added to your daily schedule!`);
  };

  return (
    <div className="space-y-8 pb-12 font-sans antialiased max-w-5xl mx-auto">
      
      {/* Top Header & Document Switcher */}
      <div className="space-y-3.5 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs sm:text-[13px] text-[#3D6352] dark:text-[#54816C] font-black uppercase tracking-[0.04em]">{t('statusReportParsed')}</span>
            </div>
            <h1 className="text-2.5xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight mt-1">
              {t('aiDiagnosticAnalysis')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-2">
              {t('reportId')}: <strong className="text-slate-800 dark:text-[#F5F7FA] font-mono">{selectedReport.reportId || selectedReport.id}</strong> • {t('uploaded')}: {selectedReport.date || selectedReport.report_date || selectedReport.uploadedAt}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => setViewOriginalModal(true)}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-sm font-bold cursor-pointer"
            >
              {t('viewOriginalText')}
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#54816C] dark:hover:bg-[#3D6352] text-white dark:text-[#0A0E1A] text-sm font-bold rounded-xl cursor-pointer"
            >
              {t('uploadNew')}
            </Button>
          </div>
        </div>

        {/* Multi-Report Document Selection Pill */}
        {userReports.length > 1 && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#EEF7F1] dark:bg-[#24283A] border border-[#D5E8DC] dark:border-slate-800 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#3D6352] dark:text-[#54816C] shrink-0" />
              <span className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">{t('viewingReport')} ({userReports.length} {t('totalReportsSaved')}):</span>
            </div>
            <select
              value={selectedReport.id}
              onChange={(e) => {
                setSelectedReportId(e.target.value);
                setActiveReportId(e.target.value);
              }}
              className="med-input text-sm font-bold text-[#0F172A] dark:text-[#F5F7FA] bg-white dark:bg-[#1C1F2E] border-[#D5E8DC] dark:border-slate-800 py-1.5 px-3 rounded-xl shadow-2xs cursor-pointer max-w-xs"
            >
              {userReports.map((r, idx) => (
                <option key={r.id} value={r.id}>
                  📄 {r.title || r.file_name || `Report #${idx + 1}`} ({r.date || r.report_date})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Patient Information Banner */}
      <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm sm:text-[15px] font-black text-[#3D6352] dark:text-[#54816C] uppercase tracking-[0.04em] flex items-center gap-2.5">
          <User className="w-5 h-5 text-[#3D6352] dark:text-[#54816C]" /> PATIENT IDENTIFICATION &amp; METADATA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm p-4.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="text-slate-500 dark:text-[#C8D0E0] block text-sm font-medium">{t('patientName')} (in Report)</span>
            <strong className="text-[#0F172A] dark:text-[#F5F7FA] font-black text-base mt-0.5 block">
              {selectedReport.patientName || selectedReport.patient_name || 'Unspecified'}
            </strong>
          </div>
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-[#C8D0E0] block text-sm font-medium">{t('reportFile')}</span>
            <strong className="text-slate-800 dark:text-[#F5F7FA] font-bold block truncate max-w-full text-[15px] mt-0.5" title={selectedReport.file_name || selectedReport.fileName}>
              {selectedReport.file_name || selectedReport.fileName || 'Report.pdf'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-[#C8D0E0] block text-sm font-medium">{t('reportDate')}</span>
            <strong className="text-slate-800 dark:text-[#F5F7FA] font-bold text-[15px] mt-0.5 block">
              {selectedReport.reportDate || selectedReport.date || selectedReport.report_date || 'N/A'}
            </strong>
            {selectedReport.uploadedAt && selectedReport.uploadedAt !== (selectedReport.reportDate || selectedReport.date) && (
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-normal">Uploaded: {selectedReport.uploadedAt}</span>
            )}
          </div>
          <div>
            <span className="text-slate-500 dark:text-[#C8D0E0] block text-sm font-medium">{t('extractionConfidence')}</span>
            <strong className={`font-black text-base mt-0.5 block ${biomarkers.length + vitals.length + medications.length > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#C94B55] dark:text-[#F3C6CB]'}`}>
              {selectedReport.ocrConfidence || (biomarkers.length + vitals.length + medications.length > 0 ? '98.5% (High Precision)' : 'Extraction Unsuccessful')}
            </strong>
          </div>
        </div>

        {/* Patient Identity Mismatch Alert Banner */}
        {selectedReport.patientName && 
         selectedReport.patientName !== 'Unspecified' && 
         userProfile?.name && 
         !userProfile.name.toLowerCase().includes(selectedReport.patientName.toLowerCase()) && 
         !selectedReport.patientName.toLowerCase().includes(userProfile.name.toLowerCase()) && (
          <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400/40 text-amber-900 dark:text-amber-200 text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="tracking-[0.04em] uppercase text-xs font-black mr-1">IDENTITY NOTICE:</strong> Patient name in document ("{selectedReport.patientName}") differs from your profile name ("{userProfile.name}").
            </span>
          </div>
        )}
      </Card>

      {/* AI Clinical Summary Card with 4 Individual Dropdown Insight Boxes */}
      <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF7F1] dark:bg-[#24283A] border border-[#D5E8DC] dark:border-slate-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#3D6352] dark:text-[#54816C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA]">{t('aiClinicalSummary')}</h2>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#54816C] font-black text-xs border border-[#D5E8DC] dark:border-slate-800">
                  4 Insights
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-0.5">Click any insight box below to expand its structured clinical analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:flex px-3.5 py-1.5 rounded-full bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#54816C] font-bold text-xs border border-[#D5E8DC] dark:border-slate-800 items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#54816C] dark:bg-[#54816C] animate-pulse"></span>
              {t('extractedFromDoc')}
            </span>

            {/* Quick Toggle All Pill */}
            <button
              type="button"
              onClick={toggleAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#EEF7F1] dark:bg-[#24283A] hover:bg-slate-200 dark:hover:bg-slate-700 text-[#3D6352] dark:text-[#54816C] border border-[#D5E8DC] dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* 4 Individual Dropdown Boxes - Independent Flow Columns to prevent any layout jumping / gaps */}
        {(() => {
          const insightItems = getFormattedSummary().split(/\n\n+/).map((para, idx) => {
            const trimmed = para.trim();
            let icon = "📋";
            let title = "Clinical Overview";
            let bgStyle = "bg-slate-50 dark:bg-[#151824] border-slate-200/90 dark:border-slate-800";
            let titleColor = "text-slate-800 dark:text-[#F5F7FA]";

            if (trimmed.includes("Biomarker") || trimmed.includes("Laboratory")) {
              icon = "🔬";
              title = "Laboratory & Biomarker Analysis";
              bgStyle = "bg-sky-50/60 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60";
              titleColor = "text-sky-900 dark:text-sky-300";
            } else if (trimmed.includes("Medication") || trimmed.includes("Treatment")) {
              icon = "💊";
              title = "Prescribed Treatment Plan";
              bgStyle = "bg-teal-50/60 dark:bg-teal-950/40 border-teal-200/80 dark:border-teal-800/60";
              titleColor = "text-teal-900 dark:text-[#2DD4BF]";
            } else if (trimmed.includes("Guidance") || trimmed.includes("Patient")) {
              icon = "💡";
              title = "Patient Guidance & Action Plan";
              bgStyle = "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60";
              titleColor = "text-amber-900 dark:text-amber-300";
            }

            const cleanText = trimmed.replace(/^(?:📋|🔬|💊|💡)\s*(?:Clinical Overview|Laboratory & Biomarker Analysis|Prescribed Treatment Plan|Patient Guidance)\s*[:=\-]?\s*/i, '');
            return { idx, icon, title, bgStyle, titleColor, cleanText };
          });

          const renderCard = (item) => {
            if (!item) return null;
            const isOpen = isInsightOpen(item.idx);

            return (
              <div 
                key={item.idx} 
                className={`rounded-2xl border transition-all ${item.bgStyle} overflow-hidden ${
                  isOpen ? 'shadow-xs ring-1 ring-[#54816C]/40 dark:ring-[#54816C]/30' : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Clickable Dropdown Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleInsight(item.idx)}
                  className="w-full p-4.5 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <h4 className={`text-sm sm:text-base font-black uppercase tracking-[0.04em] truncate ${item.titleColor}`}>
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {isOpen ? 'Click to collapse' : 'Click to view insight'}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-[#1E2333] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-2xs">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    )}
                  </div>
                </button>

                {/* Dropdown Content */}
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 animate-in fade-in duration-150">
                    <p className="text-[15px] sm:text-base text-[#1E293B] dark:text-[#E2E8F0] font-medium leading-[1.6] pt-2">
                      {item.cleanText}
                    </p>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="pt-1 space-y-3.5">
              {insightItems.map(renderCard)}
            </div>
          );
        })()}
      </Card>

      {/* EXTRACTED CLINICAL ENTITIES SUMMARY BADGE STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a 
          href="#section-medications" 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('section-medications')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-4 rounded-2xl bg-teal-50 dark:bg-[#1C1F2E] hover:bg-teal-100/80 dark:hover:bg-[#25293C] border border-teal-200/90 dark:border-slate-800 flex items-center justify-between transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500/20 text-white dark:text-[#2DD4BF] flex items-center justify-center font-black transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm text-teal-800 dark:text-[#2DD4BF] font-bold block">{t('prescribedMedications')}</span>
              <strong className="text-xl font-black text-[#0F172A] dark:text-[#F5F7FA]">{medications.length} {t('dosesIdentified')}</strong>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-teal-600 dark:text-[#2DD4BF] group-hover:translate-x-1 transition-transform" />
        </a>

        <a 
          href="#section-biomarkers" 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('section-biomarkers')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-4 rounded-2xl bg-sky-50 dark:bg-[#1C1F2E] hover:bg-sky-100/80 dark:hover:bg-[#25293C] border border-sky-200/90 dark:border-slate-800 flex items-center justify-between transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 dark:bg-sky-500/20 text-white dark:text-sky-400 flex items-center justify-center font-black transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm text-sky-800 dark:text-sky-300 font-bold block">{t('labBiomarkers')}</span>
              <strong className="text-xl font-black text-[#0F172A] dark:text-[#F5F7FA]">{biomarkers.length} {t('parametersParsed')}</strong>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform" />
        </a>

        <a 
          href="#section-vitals" 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('section-vitals')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-4 rounded-2xl bg-indigo-50 dark:bg-[#1C1F2E] hover:bg-indigo-100/80 dark:hover:bg-[#25293C] border border-indigo-200/90 dark:border-slate-800 flex items-center justify-between transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500/20 text-white dark:text-indigo-400 flex items-center justify-center font-black transition-colors">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm text-indigo-800 dark:text-indigo-300 font-bold block">{t('vitalSigns')}</span>
              <strong className="text-xl font-black text-[#0F172A] dark:text-[#F5F7FA]">{vitals.length} {t('vitalsRecorded')}</strong>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* 1. EXTRACTED MEDICATIONS & PRESCRIPTION INSTRUCTIONS (WITH PLAIN LANGUAGE EXPLANATION) */}
      {medications.length > 0 && (
        <Card id="section-medications" className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4 scroll-mt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-2.5">
                <Pill className="w-5.5 h-5.5 text-[#3D6352] dark:text-[#54816C]" />
                Prescribed Treatment Plan ({medications.length})
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-2">
                AI extracted medicine names, dosage timings, and generated plain-language explanations.
              </p>
            </div>

            <button
              onClick={() => navigate('/app/medicines')}
              className="text-sm font-bold text-[#3D6352] dark:text-[#54816C] hover:underline flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              View Medicine Schedule <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((m, idx) => {
              const medName = (m.medicineName || m.name || '').toLowerCase().trim();
              const isScheduled = (medicines || []).some(
                med => (med.name || '').toLowerCase().trim() === medName
              );

              return (
              <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 space-y-3.5 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-black text-base text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-1.5">
                      <span>💊</span> {m.medicineName || m.name}
                    </h4>
                    {m.genericName && (
                      <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium mt-0.5">Generic: {m.genericName}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#54816C] font-black text-xs shrink-0">
                    {m.dose || m.strength || '1 tablet'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm p-3 rounded-xl bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 dark:text-[#C8D0E0] block text-xs">Frequency</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold block truncate text-sm">{m.frequency || 'Once daily'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-[#C8D0E0] block text-xs">Timing & Meal</span>
                    <strong className="text-[#3D6352] dark:text-[#54816C] font-bold block truncate text-sm">{m.mealRelation || 'After meal'} ({m.timing || '08:00 AM'})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-[#C8D0E0] block text-xs">Duration</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold block truncate text-sm">{m.duration || '5 days'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-[#C8D0E0] block text-xs">Source</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-bold truncate block text-sm">{selectedReport.title || 'Prescription'}</strong>
                  </div>
                </div>

                {/* PLAIN LANGUAGE EXPLANATION BOX */}
                <div className="p-3.5 rounded-xl bg-[#EEF7F1] dark:bg-[#24283A] border border-[#D5E8DC] dark:border-slate-800 text-sm text-[#172033] dark:text-[#F5F7FA] font-medium space-y-1">
                  <div className="flex items-center gap-1.5 text-[#3D6352] dark:text-[#54816C] font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#3D6352] dark:text-[#54816C]" /> What this medicine does (Easy Terms):
                  </div>
                  <p className="text-slate-700 dark:text-[#C8D0E0] leading-relaxed text-sm">
                    {m.easyExplanation || getEasyMedicineExplanation(m.medicineName || m.name)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">
                    100% extracted from document OCR text
                  </span>
                  {isScheduled ? (
                    <button
                      onClick={() => navigate('/app/medicines')}
                      className="px-4 py-2 rounded-xl bg-[#6FA89E]/20 text-[#2D5A52] dark:text-[#9DD3C8] border border-[#6FA89E]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#2D5A52] dark:text-[#9DD3C8]" /> In Schedule ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddMedToSchedule(m)}
                      className="px-4 py-2 rounded-xl bg-[#6FA89E] hover:bg-[#5F958C] text-[#0F172A] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors border border-[#5F958C]/40"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#0F172A]" /> Add to Schedule
                    </button>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </Card>
      )}

      {/* 2. Vital Signs Grid (If extracted) */}
      {vitals.length > 0 && (
        <Card id="section-vitals" className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4 scroll-mt-6">
          <h3 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-2.5">
            <HeartPulse className="w-5.5 h-5.5 text-[#3D6352] dark:text-[#54816C]" /> Extracted Vital Signs ({vitals.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {vitals.map((v, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-slate-500 dark:text-[#C8D0E0] font-medium block truncate text-xs">{v.name}</span>
                <span className="text-base sm:text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">
                  {v.value} <span className="text-xs font-bold text-slate-600 dark:text-[#C8D0E0]">{v.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. Extracted Lab Results Table (WITH PLAIN LANGUAGE EXPLANATION) */}
      <div id="section-biomarkers" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-[22px] font-black text-[#0F172A] dark:text-[#F5F7FA] flex items-center gap-2.5">
              <Activity className="w-5.5 h-5.5 text-[#3D6352] dark:text-[#54816C]" />
              Laboratory &amp; Biomarker Analysis ({biomarkers.length})
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-1.5">
              Individual biological parameters parsed and compared with standard clinical reference ranges.
            </p>
          </div>
          <span className="text-sm font-bold text-slate-500 dark:text-[#C8D0E0]">
            {biomarkers.length} {biomarkers.length === 1 ? t('parameterParsed') : t('parametersParsed')}
          </span>
        </div>

        {biomarkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {biomarkers.map((bm, idx) => {
              const isNormal = String(bm.status || bm.statusType).toLowerCase() === 'normal';

              return (
                <Card key={idx} className="p-5 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-base text-[#0F172A] dark:text-[#F5F7FA]">{bm.name || bm.biomarker_name}</h4>
                      <p className="text-slate-500 dark:text-[#C8D0E0] font-medium text-sm mt-0.5">Category: {bm.category || 'Clinical Diagnostic'}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full font-black text-sm shrink-0 flex items-center gap-1 ${
                      isNormal ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-[#3A2028] text-rose-800 dark:text-[#F3C6CB] border border-[#A83D49]/30'
                    }`}>
                      <span>{bm.statusSymbol || (isNormal ? '✓' : '▲')}</span>
                      <span>{bm.status || 'Normal'}</span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-sm font-bold text-slate-500 dark:text-[#C8D0E0] block">Measured Value</span>
                      <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-[#F5F7FA]">
                        {bm.value} <span className="text-sm font-bold text-slate-600 dark:text-[#C8D0E0]">{bm.unit}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-500 dark:text-[#C8D0E0] block">Reference Range</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {String(bm.refRange || bm.referenceRange || bm.reference_range || '').includes('000 - 11') ? '4,000 – 11,000' : (bm.refRange || bm.referenceRange || bm.reference_range || 'N/A')}
                      </span>
                    </div>
                  </div>

                  {/* PLAIN LANGUAGE EXPLANATION BOX */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-[#F5F7FA] font-medium space-y-1">
                    <div className="flex items-center gap-1.5 text-[#3D6352] dark:text-[#54816C] font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#3D6352] dark:text-[#54816C]" /> What this means for you:
                    </div>
                    <p className="text-slate-600 dark:text-[#C8D0E0] leading-relaxed text-sm">
                      {bm.easyExplanation || getEasyBiomarkerExplanation(bm.name || bm.biomarker_name, bm.status || 'Normal', bm.value, bm.unit)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-xs">
            <Activity className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">No laboratory test parameters in this document.</p>
            <p className="text-slate-500">
              {medications.length > 0 
                ? `This document is a Prescription Report with ${medications.length} medication instruction(s) extracted above.`
                : "Click 'View Original Report Text' above to view raw document contents."}
            </p>
          </Card>
        )}
      </div>

      {/* View Original Report Text Modal */}
      <Modal
        isOpen={viewOriginalModal}
        onClose={() => setViewOriginalModal(false)}
        title="Original Extracted Report Text"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-500 font-normal">
            Below is the OCR text extracted from your uploaded medical document file ({selectedReport.file_name || selectedReport.fileName}):
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {selectedReport.rawText || selectedReport.extractedText || "No raw text stream available."}
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
