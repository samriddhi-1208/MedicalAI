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

  // Duplicate Warning Modal State
  const [duplicateReport, setDuplicateReport] = useState(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

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
    setProcessingStatus("Step 2/5: Checking SHA-256 duplicate status & reading file stream...");

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

      if (savedReport && (savedReport.isDuplicate || savedReport.duplicate)) {
        setDuplicateReport(savedReport);
        setIsDuplicateModalOpen(true);
        setUploading(false);
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
    try {
      for (const med of pendingMedications) {
        await addMedicine({
          name: med.medicineName || med.name,
          dose: med.dose || '1 tablet',
          dosage: med.dose || '1 tablet',
          frequency: med.frequency || 'Once daily',
          scheduled_time: med.timing || med.scheduled_time || '08:00 AM',
          time: med.timing || med.scheduled_time || '08:00 AM',
          timeSlot: 'Morning',
          meal_relation: med.mealRelation || 'After meal',
          meal_type: med.mealType || 'Lunch',
          delay_minutes: Number(med.delayMinutes || 30),
          duration_days: parseInt(med.duration || 5),
          source_title: selectedFile?.name ? `Report: ${selectedFile.name}` : 'Uploaded Lab Report',
          purpose: 'Prescribed Medication'
        });
      }

      setIsVerificationModalOpen(false);
      toast.success("✓ All verified medication reminders saved!");
      navigate('/app/analysis');
    } catch (err) {
      console.error(err);
      toast.error("Failed to save medication reminders.");
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-[#0F172A] max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-xs text-[#0D9488] font-bold uppercase tracking-wider">AI Medical Intelligence</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight">
            {t('uploadMedicalReport')}
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {t('uploadSubtitle')}
          </p>
        </div>
      </div>

      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        
        {/* Dropzone Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragActive 
              ? 'border-[#0D9488] bg-[#F0FDF4]' 
              : selectedFile 
              ? 'border-emerald-300 bg-emerald-50/50' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
              selectedFile ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {selectedFile ? (
                <FileText className="w-7 h-7 text-emerald-700" />
              ) : (
                <Upload className="w-7 h-7 text-[#0D9488]" />
              )}
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-[#0F172A]">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 font-medium">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for cryptographic hash check & AI parsing
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0F172A]">
                  Drag and drop your medical report here, or <span className="text-[#0D9488] underline">browse files</span>
                </p>
                <p className="text-xs text-slate-500 font-normal">
                  Supports PDF, PNG, JPG (Max 15MB). Instant SHA-256 duplicate detection.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Stepper Progress */}
        <div className="space-y-4">
          <Button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || uploading}
            className="w-full py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{processingStatus}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span>Upload & Run AI Diagnostic Analysis</span>
              </>
            )}
          </Button>

          {/* Stepper Progress Bar */}
          {uploading && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Parsing Progress</span>
                <span className="text-[#0D9488]">{activeStep * 20}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-[#0D9488] transition-all duration-300 rounded-full"
                  style={{ width: `${activeStep * 20}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-normal text-center pt-1">{processingStatus}</p>
            </div>
          )}
        </div>

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

      {/* DUPLICATE REPORT WARNING MODAL */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="⚠ Report Already Uploaded"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#0F172A]">This medical report already exists</h4>
              <p className="text-slate-600">
                This medical report has already been uploaded and processed for your account.
              </p>
              {duplicateReport && (
                <div className="pt-2 text-[11px] text-slate-500 font-medium space-y-0.5">
                  <div>Document Title: <strong className="text-slate-800">{duplicateReport.title || selectedFile?.name}</strong></div>
                  {duplicateReport.date && <div>Uploaded Date: <strong className="text-slate-800">{duplicateReport.date}</strong></div>}
                </div>
              )}
            </div>
          </div>

          <p className="text-slate-600 font-normal">
            You can view the existing diagnostic analysis directly without processing the document again.
          </p>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                setSelectedFile(null);
                setActiveStep(1);
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                navigate('/app/analysis');
              }}
              className="px-5 py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-[#0D9488]" />
              <span>View Existing Report</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MEDICATION VERIFICATION RESPONSIVE MODAL */}
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

          {/* Medication Cards List */}
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
