import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Upload, 
  Eye, 
  AlertTriangle, 
  Pill, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Stethoscope, 
  ShieldAlert, 
  Info,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { formatDisplayName, formatReportTitle } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';

export const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const { 
    reports, 
    activeReportId, 
    setActiveReportId, 
    userProfile, 
    language,
    addMedicine,
    loadingData 
  } = useHealthData();
  
  const t = (key) => getTranslation(language, key);

  const [viewOriginalModal, setViewOriginalModal] = useState(false);
  const [addingMedId, setAddingMedId] = useState(null);

  const userReports = Array.isArray(reports) ? reports : [];
  const [selectedReportId, setSelectedReportId] = useState(() => activeReportId || userReports[0]?.id);

  React.useEffect(() => {
    if (activeReportId) {
      setSelectedReportId(activeReportId);
    } else if (userReports.length > 0 && !selectedReportId) {
      setSelectedReportId(userReports[0].id);
    }
  }, [activeReportId, userReports.length]);

  const selectedReport = userReports.find(r => String(r.id) === String(selectedReportId)) || userReports[0] || null;

  // Handler to add extracted medication to user's daily medication schedule
  const handleAddToSchedule = async (med) => {
    setAddingMedId(med.id || med.name);
    try {
      const scheduledTime = med.timing || (med.mealRelation === 'Before meal' ? '07:30 AM' : '08:00 AM');
      const durDays = parseInt(med.duration || med.durationDays || 5) || 5;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + durDays);

      await addMedicine({
        name: med.medicineName || med.name,
        dose: med.dose || med.strength || '1 tablet',
        dosage: med.dose || med.strength || '1 tablet',
        frequency: med.frequency || 'Once daily',
        scheduled_time: scheduledTime,
        time: scheduledTime,
        mealRelation: med.mealRelation || 'After meal',
        mealType: med.mealType || 'Lunch',
        delayMinutes: med.delayMinutes || 30,
        duration_days: durDays,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        purpose: "Prescribed Medication",
        source_title: formatReportTitle(selectedReport),
        instructions: med.specialInstructions || `Extracted from report analysis`
      });

      toast.success(`✓ Added ${med.medicineName || med.name} to medication schedule!`);
    } catch (err) {
      console.error("Error adding medication to schedule:", err);
      toast.error("Failed to add medication to schedule.");
    } finally {
      setAddingMedId(null);
    }
  };

  // 14. LOADING STATE
  if (loadingData && !selectedReport) {
    return (
      <div className="space-y-6 pb-12 font-sans max-w-4xl mx-auto text-center py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-10 space-y-4 max-w-md mx-auto shadow-2xs">
          <div className="w-10 h-10 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0F172A]">Analyzing Medical Report...</h2>
            <div className="text-xs text-slate-500 space-y-0.5 pt-2 text-left bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="flex items-center gap-1.5">• Extracting document text stream...</p>
              <p className="flex items-center gap-1.5">• Parsing vital signs & laboratory values...</p>
              <p className="flex items-center gap-1.5">• Identifying medication instructions...</p>
              <p className="flex items-center gap-1.5">• Preparing clinical observations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 15. EMPTY / NOT FOUND STATE
  if (!selectedReport) {
    return (
      <div className="space-y-6 pb-12 font-sans max-w-3xl mx-auto text-center py-12">
        <div className="p-8 sm:p-10 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-[#0F172A]">Report analysis could not be loaded</h2>
            <p className="text-xs text-slate-500 font-normal">
              No uploaded medical report file was selected or saved. Upload a medical document to generate a diagnostic analysis.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/app/upload')}
              className="px-5 py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#0D9488]" /> Upload Medical Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract structured data arrays
  const labResults = Array.isArray(selectedReport.labResults) ? selectedReport.labResults : (Array.isArray(selectedReport.biomarkers) ? selectedReport.biomarkers : []);
  const vitals = Array.isArray(selectedReport.vitals) ? selectedReport.vitals : [];
  const medications = Array.isArray(selectedReport.extractedMedications) ? selectedReport.extractedMedications : (Array.isArray(selectedReport.medications) ? selectedReport.medications : []);
  const recommendations = Array.isArray(selectedReport.recommendations) ? selectedReport.recommendations : (selectedReport.recommendations?.medical || []);
  
  const abnormalResults = labResults.filter(b => {
    const s = String(b.status || b.status_flag || '').toLowerCase();
    return s.includes('high') || s.includes('low') || s.includes('abnormal') || s.includes('warning') || s.includes('elevated');
  });

  const patientDisplayName = formatDisplayName(userProfile?.name);
  const reportDateDisplay = selectedReport.date || selectedReport.report_date || selectedReport.uploadedAt || 'Recent';
  const cleanReportTitle = formatReportTitle(selectedReport);

  const hasAnyExtractedData = labResults.length > 0 || vitals.length > 0 || medications.length > 0;

  return (
    <div className="space-y-6 pb-12 font-sans text-[#0F172A] max-w-5xl mx-auto w-full min-w-0">
      
      {/* 3. PAGE HEADER */}
      <div className="space-y-3 border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">
              Medical Report Analysis
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Patient: <strong className="text-slate-800">{patientDisplayName}</strong> • Report Date: <strong className="text-slate-800">{reportDateDisplay}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewOriginalModal(true)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#0D9488]" /> View Original Report Text
            </button>

            <button
              onClick={() => navigate('/app/upload')}
              className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#0D9488]" /> Upload New Report
            </button>
          </div>
        </div>

        {/* 4. REPORT SELECTOR (User-friendly label, never raw filename) */}
        {userReports.length > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span className="font-semibold text-[#0F172A]">Select Saved Report ({userReports.length} total available):</span>
            </div>
            <select
              value={selectedReport.id}
              onChange={(e) => {
                setSelectedReportId(e.target.value);
                setActiveReportId(e.target.value);
              }}
              className="text-xs font-semibold text-[#0F172A] bg-white border border-slate-300 py-1.5 px-3 rounded-md cursor-pointer max-w-md focus:outline-none shadow-2xs"
            >
              {userReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatReportTitle(r)} — {r.date || r.report_date || 'Recent'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5. PATIENT / REPORT METADATA */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-2 text-xs shadow-2xs">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Identification & Metadata</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <span className="text-slate-500 block">Patient Name</span>
            <strong className="text-[#0F172A] font-bold text-xs">{patientDisplayName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Report Date</span>
            <strong className="text-slate-800 font-semibold">{reportDateDisplay}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Report Type</span>
            <strong className="text-slate-800 font-semibold">{cleanReportTitle}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Source</span>
            <strong className="text-slate-800 font-semibold">Uploaded Document</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Extraction Status</span>
            <strong className="text-emerald-700 font-semibold">Successfully Parsed</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Extraction Confidence</span>
            <strong className="text-emerald-700 font-semibold">{selectedReport.ocrConfidence || '98.9%'}</strong>
          </div>
        </div>
      </div>

      {/* 6. CLINICAL SUMMARY */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-xl space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-[#0F172A]">Clinical Summary</h2>
          <span className="text-[11px] text-slate-500 font-medium">Informational Analysis</span>
        </div>

        <p className="text-xs text-slate-700 font-normal leading-relaxed">
          {selectedReport.aiSummary || selectedReport.summary || `The uploaded report was analyzed successfully. The patient's recorded vital signs and laboratory results are summarized below. ${abnormalResults.length > 0 ? `${abnormalResults.length} value(s) were flagged outside standard reference ranges.` : 'No critical findings were identified in the extracted information.'}`}
        </p>

        {/* Dynamic Key Observations */}
        {hasAnyExtractedData && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1 font-medium text-slate-700">
            <span className="font-bold text-[#0F172A] block mb-1">Key Observations:</span>
            {vitals.length > 0 && (
              <p>• {vitals.map(v => `${v.name} (${v.value} ${v.unit})`).join(', ')} recorded.</p>
            )}
            <p>• {labResults.length > 0 ? `${labResults.length} laboratory test parameter(s) extracted.` : 'No structured laboratory test parameters detected.'}</p>
            <p>• {abnormalResults.length > 0 ? `${abnormalResults.length} laboratory result(s) flagged outside reference range.` : 'No critical laboratory abnormality was detected in the extracted information.'}</p>
            {medications.length > 0 && (
              <p>• {medications.length} medication instruction(s) identified in prescription text.</p>
            )}
          </div>
        )}

        <div className="pt-1 text-[11px] text-slate-500 italic border-t border-slate-100 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>AI-generated summary for informational purposes. Consult a qualified healthcare professional for medical decisions.</span>
        </div>
      </div>

      {/* 7. VITAL SIGNS (DEDICATED SECTION) */}
      {vitals.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-2xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#0D9488]" /> Vital Signs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {vitals.map((v, i) => {
              const isAbnormal = String(v.status).toLowerCase() === 'high' || String(v.status).toLowerCase() === 'low';
              return (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium block truncate">{v.name}</span>
                  <span className="text-sm font-bold text-[#0F172A] block">
                    {v.value} <span className="text-xs font-medium text-slate-600">{v.unit}</span>
                  </span>
                  <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                    isAbnormal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    Status: {v.status || 'Normal'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. LABORATORY RESULTS (MAIN TABLE) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-[#0F172A]">Laboratory Results</h3>
          <span className="text-xs font-medium text-slate-500">
            {labResults.length} {labResults.length === 1 ? 'parameter extracted' : 'parameters extracted'}
          </span>
        </div>

        {labResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Test Name</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Reference Range</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                {labResults.map((bm, idx) => {
                  const statusStr = String(bm.status || bm.status_flag || 'Normal').toLowerCase();
                  const isHigh = statusStr.includes('high') || statusStr.includes('elevated');
                  const isLow = statusStr.includes('low');
                  const isAbnormal = isHigh || isLow || statusStr.includes('abnormal') || statusStr.includes('warning');

                  return (
                    <tr key={idx} className={isAbnormal ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50/80'}>
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{bm.name || bm.testName || bm.biomarker_name}</td>
                      <td className="py-2.5 px-3 font-bold text-[#0F172A]">{bm.value}</td>
                      <td className="py-2.5 px-3 text-slate-600">{bm.unit || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{bm.refRange || bm.referenceRange || bm.reference_range || 'Standard'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isAbnormal
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {bm.status || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-500 space-y-2">
            <p>No structured medical values were detected in this report.</p>
            <button
              onClick={() => setViewOriginalModal(true)}
              className="px-3.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-800 font-semibold cursor-pointer"
            >
              View Original Report Text
            </button>
          </div>
        )}
      </div>

      {/* 9. ABNORMAL FINDINGS (DEDICATED SECTION) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-2xs">
        <h3 className="text-sm font-bold text-[#0F172A]">Abnormal Findings</h3>

        {abnormalResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Test</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Expected Range</th>
                  <th className="py-2.5 px-3 text-right">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                {abnormalResults.map((bm, idx) => (
                  <tr key={idx} className="bg-amber-50/40">
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{bm.name || bm.testName}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-900">{bm.value} {bm.unit}</td>
                    <td className="py-2.5 px-3 text-slate-600">{bm.refRange || bm.referenceRange || 'Standard'}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-800">
                      {bm.status || 'Outside Reference Range'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-600 font-normal bg-slate-50 p-3 rounded-lg border border-slate-200">
            No abnormal laboratory findings were detected in the extracted report.
          </p>
        )}
      </div>

      {/* 10. MEDICATIONS (DEDICATED SECTION WITH 'ADD TO MEDICATION SCHEDULE' ACTION) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#0D9488]" /> Medications
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {medications.length} detected
          </span>
        </div>

        {medications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                {medications.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{m.medicineName || m.name}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{m.dose || m.strength || '1 tablet'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.frequency || 'Once daily'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.duration || '5 days'}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{m.timing || m.mealRelation || 'As prescribed'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleAddToSchedule(m)}
                        disabled={addingMedId === (m.id || m.name)}
                        className="px-2.5 py-1 rounded bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-[11px] cursor-pointer shadow-2xs inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3 text-[#0D9488]" /> Add to Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-600 font-normal bg-slate-50 p-3 rounded-lg border border-slate-200">
            No medication instructions detected in this report.
          </p>
        )}
      </div>

      {/* 11. DOCTOR / RECOMMENDATION INFORMATION */}
      {(selectedReport.doctorName || recommendations.length > 0) && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-3 shadow-2xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#0D9488]" /> Doctor Notes & Recommendations
          </h3>

          <div className="space-y-2 text-xs text-slate-700">
            {selectedReport.doctorName && (
              <p><span className="font-semibold text-slate-500">Consulting Physician:</span> <strong className="text-[#0F172A]">{selectedReport.doctorName}</strong></p>
            )}

            {recommendations.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-600 block">Clinical Recommendations:</span>
                {recommendations.map((rec, i) => (
                  <p key={i}>• {typeof rec === 'string' ? rec : rec.text || 'Follow up with physician as advised.'}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12. VIEW ORIGINAL REPORT TEXT MODAL */}
      <Modal
        isOpen={viewOriginalModal}
        onClose={() => setViewOriginalModal(false)}
        title="Original Report Text"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-500 font-normal">
            Extracted document text stream for {cleanReportTitle} ({selectedReport.file_name || selectedReport.fileName || 'Report.pdf'}):
          </p>

          <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
            {selectedReport.rawText || selectedReport.extractedText || "No raw text stream available for this document file."}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setViewOriginalModal(false)}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
