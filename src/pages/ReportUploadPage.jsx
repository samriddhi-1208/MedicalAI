import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  File, 
  Info,
  AlertTriangle,
  Pill,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { analyzeUploadedDocument } from '../utils/reportParser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const ReportUploadPage = () => {
  const navigate = useNavigate();
  const { addReport, addMedicine, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [processingStatus, setProcessingStatus] = useState('');
  const [extractionError, setExtractionError] = useState(null);

  // Verification Modal State for Extracted Medications
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingMedications, setPendingMedications] = useState([]);
  const [editingMedIndex, setEditingMedIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({
    medicineName: '',
    dose: '1 tablet',
    frequency: 'Once daily',
    timing: '08:00 AM',
    mealRelation: 'After meal',
    mealType: 'Lunch',
    delayMinutes: '30',
    duration: '5 days'
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload PDF, JPG, or PNG.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }
    setSelectedFile(file);
    setActiveStep(1);
    setExtractionError(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setExtractionError(null);
    setActiveStep(2);
    setProcessingStatus("Step 2/5: Reading document stream & OCR text...");

    try {
      setTimeout(() => { setActiveStep(3); setProcessingStatus("Step 3/5: Extracting lab test results & vitals..."); }, 500);
      setTimeout(() => { setActiveStep(4); setProcessingStatus("Step 4/5: Running AI diagnostic summary analysis..."); }, 1000);

      let parsedData = {};
      try {
        parsedData = await analyzeUploadedDocument(selectedFile);
      } catch (clientErr) {
        console.warn("[UPLOAD] Client PDF parsing fallback to server:", clientErr);
        parsedData = {
          title: selectedFile.name.replace(/\.[^/.]+$/, ""),
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
          fileType: selectedFile.type || 'PDF',
          labResults: [],
          biomarkers: [],
          extractedMedications: []
        };
      }

      setActiveStep(5);
      setProcessingStatus("Step 5/5: Document parsed successfully!");

      const savedReport = await addReport(parsedData, selectedFile);

      if (savedReport && savedReport.isDuplicate) {
        toast.info("This report has already been uploaded. Viewing existing stored record.");
        setUploading(false);
        navigate('/app/analysis');
        return;
      }

      // Merge extracted medications from client parsing AND server parsing
      const extractedMeds = [
        ...(Array.isArray(savedReport?.extractedMedications) ? savedReport.extractedMedications : []),
        ...(Array.isArray(parsedData?.extractedMedications) ? parsedData.extractedMedications : [])
      ];

      // Deduplicate extracted medications by name
      const uniqueMeds = [];
      const seenMedNames = new Set();
      extractedMeds.forEach(m => {
        const name = m.medicineName || m.name;
        if (name && !seenMedNames.has(name.toLowerCase())) {
          seenMedNames.add(name.toLowerCase());
          uniqueMeds.push(m);
        }
      });

      if (uniqueMeds.length > 0) {
        setPendingMedications(uniqueMeds);
        setIsVerificationModalOpen(true);
        setUploading(false);
      } else {
        toast.success("✓ Report analyzed successfully. View diagnostic findings.");
        navigate('/app/analysis');
      }
    } catch (err) {
      console.error("[UPLOAD ERROR]", err);
      setUploading(false);
      setExtractionError(err.message || "Failed to extract data from document. Please ensure file is a clear lab report.");
      toast.error("Document parsing failed.");
    }
  };

  const handleRemovePendingMed = (index) => {
    setPendingMedications(prev => prev.filter((_, idx) => idx !== index));
    toast.success("Medication removed from verification list.");
  };

  const handleOpenEditMed = (med, index) => {
    setEditingMedIndex(index);
    setEditFormData({
      medicineName: med.medicineName || '',
      dose: med.dose || '1 tablet',
      frequency: med.frequency || 'Once daily',
      timing: med.timing || med.scheduled_time || '08:00 AM',
      mealRelation: med.mealRelation || 'After meal',
      mealType: med.mealType || 'Lunch',
      delayMinutes: String(med.delayMinutes || 30),
      duration: med.duration || '5 days'
    });
  };

  const handleSaveMedEdit = (e) => {
    e.preventDefault();
    if (editingMedIndex === null) return;

    setPendingMedications(prev => prev.map((m, idx) => {
      if (idx === editingMedIndex) {
        return {
          ...m,
          medicineName: editFormData.medicineName,
          dose: editFormData.dose,
          frequency: editFormData.frequency,
          timing: editFormData.timing,
          scheduled_time: editFormData.timing,
          mealRelation: editFormData.mealRelation,
          mealType: editFormData.mealType,
          delayMinutes: Number(editFormData.delayMinutes),
          duration: editFormData.duration,
          hasExactTime: true
        };
      }
      return m;
    }));

    setEditingMedIndex(null);
    toast.success("Medication details updated.");
  };

  const handleConfirmAllReminders = async () => {
    if (pendingMedications.length === 0) {
      setIsVerificationModalOpen(false);
      navigate('/app/analysis');
      return;
    }

    for (const med of pendingMedications) {
      const scheduledTime = med.timing || med.scheduled_time || (med.mealRelation === 'After meal' ? '01:30 PM' : '08:00 AM');
      const durDays = parseInt(med.duration || med.durationDays || 5) || 5;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + durDays);

      await addMedicine({
        name: med.medicineName,
        dose: med.dose,
        dosage: med.dose,
        frequency: med.frequency,
        scheduled_time: scheduledTime,
        time: scheduledTime,
        mealRelation: med.mealRelation,
        mealType: med.mealType,
        delayMinutes: med.delayMinutes || 30,
        duration_days: durDays,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        purpose: "Prescribed Medication",
        source_title: selectedFile ? selectedFile.name : 'Uploaded Report',
        instructions: med.specialInstructions || `Extracted from uploaded report`
      });
    }

    setIsVerificationModalOpen(false);
    toast.success(`✓ Created ${pendingMedications.length} medicine reminder(s)!`);
    navigate('/app/dashboard');
  };

  const steps = [
    { num: 1, label: "Upload File" },
    { num: 2, label: "Read Text" },
    { num: 3, label: "Extract Data" },
    { num: 4, label: "AI Analysis" },
    { num: 5, label: "Complete" }
  ];

  return (
    <div className="space-y-5 pb-12 font-sans antialiased max-w-4xl mx-auto w-full min-w-0">
      
      {/* Upload Header */}
      <div className="border-b border-slate-200/90 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
          <span className="text-xs text-[#0D9488] font-extrabold uppercase tracking-wider">{t('dynamicDocAnalyzer')}</span>
        </div>
        <h1 className="text-xl sm:text-2.5xl font-black text-[#0F172A] tracking-tight mt-0.5">
          {t('uploadMedicalReport')}
        </h1>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          {t('uploadSubtitle')}
        </p>
      </div>

      {/* REQUIREMENT 5: DESKTOP VS MOBILE STEPPER */}
      {/* Desktop Stepper */}
      <div className="hidden md:block p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          {steps.map((s) => {
            const isCompleted = activeStep > s.num;
            const isCurrent = activeStep === s.num;

            return (
              <div key={s.num} className="flex-1 flex flex-col items-center relative text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                    ? 'bg-[#0F172A] text-white ring-4 ring-slate-200' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${
                  isCurrent ? 'text-[#0F172A]' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Compact Progress Stepper */}
      <div className="md:hidden p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
          <span>Step {activeStep} of 5</span>
          <span className="text-[#0D9488] font-bold">{steps[activeStep - 1]?.label}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
          <div 
            className="bg-[#0D9488] h-2 rounded-full transition-all duration-300"
            style={{ width: `${activeStep * 20}%` }}
          />
        </div>
      </div>

      {/* REQUIREMENT 6: MOBILE COMPACT UPLOAD CARD */}
      <Card className="p-5 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-5 text-center w-full min-w-0">
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-6 sm:p-10 rounded-2xl border-2 border-dashed transition-all ${
            dragActive
              ? 'border-[#0D9488] bg-slate-50 scale-[1.01]'
              : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mx-auto shadow-md mb-3 sm:mb-4">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#0D9488]" />
          </div>

          <p className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
            <span className="hidden sm:inline">{t('dragDropText')}</span>
            <span className="sm:hidden">Tap below to select a medical report</span>
          </p>

          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">
            PDF, JPG, JPEG or PNG • Max 15 MB
          </p>

          <div className="mt-4 sm:mt-6">
            <label className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center justify-center gap-2 transition-colors shadow-2xs">
              <File className="w-4 h-4 text-[#0D9488]" />
              <span>Browse Files</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* REQUIREMENT 7: SELECTED FILE CARD WITH FILENAME WRAP FIX */}
        {selectedFile && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left w-full min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className="w-6 h-6 text-[#0D9488] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-black text-xs sm:text-sm text-[#0F172A] break-all line-clamp-2">
                  {selectedFile.name}
                </p>
                <p className="text-slate-500 font-medium text-[11px]">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.includes('pdf') ? 'PDF' : 'IMAGE'}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={uploading}
              onClick={handleUploadAndAnalyze}
              className="bg-[#0F172A] hover:bg-[#1E293B] py-3 px-6 text-xs font-bold rounded-xl cursor-pointer w-full sm:w-auto min-h-[48px] shrink-0"
            >
              {uploading ? 'Processing Document...' : 'Upload & Analyze'}
            </Button>
          </div>
        )}

        {/* Upload & Extraction Progress Stepper Status */}
        {uploading && (
          <div className="space-y-2 text-xs text-left p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between font-bold text-[#0F172A]">
              <span>{processingStatus}</span>
              <span>{activeStep * 20}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0D9488] h-2 rounded-full transition-all duration-300"
                style={{ width: `${activeStep * 20}%` }}
              />
            </div>
          </div>
        )}

        {/* Extraction Error */}
        {extractionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
            <span>{extractionError}</span>
          </div>
        )}

      </Card>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Notice</span>
        </div>
        <p className="font-normal text-amber-800 leading-relaxed">
          {t('mandatoryDisclaimer')}
        </p>
      </div>

      {/* REQUIREMENTS 9, 10, 11: MEDICATION VERIFICATION RESPONSIVE MODAL */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Medication Instructions Found in Report"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center gap-3">
            <Pill className="w-6 h-6 text-[#0D9488] shrink-0" />
            <div>
              <p className="font-black text-sm">Verify Extracted Medications</p>
              <p className="text-[11px] text-slate-600 font-normal">
                Review dosages and reminder times before saving to your schedule.
              </p>
            </div>
          </div>

          {/* Medication Cards List - Stacked 1 Column on Mobile */}
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {pendingMedications.map((med, idx) => (
              <Card key={med.id || idx} className="p-4 border border-slate-200 bg-white space-y-2.5 rounded-xl shadow-2xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm text-[#0F172A] flex items-center gap-1.5">
                      💊 {med.medicineName}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">{med.dose} • {med.quantity}</p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditMed(med, idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 min-h-[36px]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#0D9488]" /> Edit
                    </button>
                    <button
                      onClick={() => handleRemovePendingMed(idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 min-h-[36px]"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" /> Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px]">
                  <p><span className="text-slate-500">Frequency:</span> <strong className="text-[#0F172A] font-bold">{med.frequency}</strong></p>
                  <p><span className="text-slate-500">Meal Relation:</span> <strong className="text-slate-800 font-semibold">{med.mealRelation} ({med.mealType})</strong></p>
                  <p><span className="text-slate-500">Duration:</span> <strong className="text-slate-800 font-semibold">{med.duration}</strong></p>
                  <p><span className="text-slate-500">Scheduled Time:</span> <strong className="text-[#0D9488] font-bold">{med.timing || med.scheduled_time || '08:00 AM'}</strong></p>
                </div>
              </Card>
            ))}
          </div>

          {/* Edit Individual Medication Form */}
          {editingMedIndex !== null && (
            <form onSubmit={handleSaveMedEdit} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h5 className="font-extrabold text-xs text-[#0F172A]">Edit {editFormData.medicineName} Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editFormData.medicineName}
                  onChange={(e) => setEditFormData({ ...editFormData, medicineName: e.target.value })}
                  placeholder="Medicine Name"
                  className="med-input text-xs"
                />
                <input
                  type="text"
                  value={editFormData.dose}
                  onChange={(e) => setEditFormData({ ...editFormData, dose: e.target.value })}
                  placeholder="Dose (e.g. 500 mg)"
                  className="med-input text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editFormData.timing}
                  onChange={(e) => setEditFormData({ ...editFormData, timing: e.target.value })}
                  placeholder="Reminder Time (e.g. 08:00 AM)"
                  className="med-input text-xs"
                />
                <select
                  value={editFormData.mealRelation}
                  onChange={(e) => setEditFormData({ ...editFormData, mealRelation: e.target.value })}
                  className="med-input text-xs"
                >
                  <option value="After meal">After meal</option>
                  <option value="Before meal">Before meal</option>
                  <option value="With meal">With meal</option>
                  <option value="No meal relation">No meal relation</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="secondary" type="button" onClick={() => setEditingMedIndex(null)}>Cancel</Button>
                <Button size="sm" variant="primary" type="submit" className="bg-[#0F172A]">Save Edit</Button>
              </div>
            </form>
          )}

          {/* Touch Friendly Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" onClick={() => navigate('/app/analysis')} className="w-full sm:w-auto min-h-[44px]">
              Skip & View Analysis
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={handleConfirmAllReminders}
              className="bg-[#0F172A] hover:bg-[#1E293B] py-3 px-6 font-extrabold text-xs cursor-pointer shadow-2xs w-full sm:w-auto min-h-[48px]"
            >
              Confirm & Set Reminders
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
