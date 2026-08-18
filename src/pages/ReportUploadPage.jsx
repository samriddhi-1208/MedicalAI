import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
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
      toast.error("File size exceeds 15 MB limit.");
      return;
    }
    setSelectedFile(file);
    setExtractionError(null);
    toast.success(`Selected file: ${file.name}`);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a medical report document file first.");
      return;
    }

    setUploading(true);
    setExtractionError(null);
    setActiveStep(1);
    setProcessingStatus("Step 1/5: Uploading document stream...");

    try {
      setTimeout(() => { setActiveStep(2); setProcessingStatus("Step 2/5: Reading document text stream..."); }, 300);
      setTimeout(() => { setActiveStep(3); setProcessingStatus("Step 3/5: Extracting laboratory test results & vitals..."); }, 600);
      setTimeout(() => { setActiveStep(4); setProcessingStatus("Step 4/5: Running clinical summary analysis..."); }, 1000);

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

      const extractedMeds = [
        ...(Array.isArray(savedReport?.extractedMedications) ? savedReport.extractedMedications : []),
        ...(Array.isArray(parsedData?.extractedMedications) ? parsedData.extractedMedications : [])
      ];

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
        toast.success("✓ Report analyzed successfully.");
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
    toast.success(`✓ Created ${pendingMedications.length} medication reminder(s)!`);
    navigate('/app/dashboard');
  };

  const steps = [
    { num: 1, label: "Upload File" },
    { num: 2, label: "Read Text" },
    { num: 3, label: "Extract Data" },
    { num: 4, label: "Clinical Analysis" },
    { num: 5, label: "Complete" }
  ];

  return (
    <div className="space-y-5 pb-12 font-sans max-w-4xl mx-auto w-full min-w-0">
      
      {/* Upload Header */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">
          Upload Medical Report
        </h1>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Select or drag a PDF or image medical report to parse laboratory values and prescription instructions.
        </p>
      </div>

      {/* Stepper */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
          <span>Step {activeStep} of 5</span>
          <span className="text-[#0D9488] font-semibold">{steps[activeStep - 1]?.label}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-[#0F172A] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${activeStep * 20}%` }}
          />
        </div>
      </div>

      {/* Upload Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-5 text-center w-full min-w-0">
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-8 rounded-lg border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-[#0D9488] bg-slate-50'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-[#0F172A] text-white flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-[#0D9488]" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#0F172A]">
            <span>Drag & drop your medical report here or browse files below</span>
          </p>

          <p className="text-xs text-slate-500 font-normal mt-1">
            Supported formats: PDF, JPG, JPEG, PNG • Maximum size: 15 MB
          </p>

          <div className="mt-4">
            <label className="px-4 py-2 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-2 transition-colors">
              <File className="w-4 h-4 text-[#0D9488]" />
              <span>Browse Files</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs text-left">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-[#0D9488] shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-[#0F172A] truncate">{selectedFile.name}</p>
                <p className="text-slate-500">{((selectedFile.size) / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-slate-400 hover:text-red-600 font-semibold cursor-pointer text-xs shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Action Button */}
        <div className="pt-2">
          <button
            disabled={!selectedFile || uploading}
            onClick={handleUploadAndAnalyze}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Document...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-[#0D9488]" />
                <span>Analyze Medical Report</span>
              </>
            )}
          </button>
        </div>

        {/* Status Indicator */}
        {uploading && (
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium space-y-1 text-left">
            <p className="font-semibold text-[#0F172A]">{processingStatus}</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#0D9488] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${activeStep * 20}%` }}
              />
            </div>
          </div>
        )}

        {/* Extraction Error State */}
        {extractionError && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-900 font-normal flex items-center gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Document parsing failed</p>
              <p>{extractionError}</p>
            </div>
          </div>
        )}

      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-amber-950">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Notice</span>
        </div>
        <p className="font-normal text-amber-900 leading-relaxed">
          {t('mandatoryDisclaimer')}
        </p>
      </div>

      {/* Medication Verification Modal */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          navigate('/app/analysis');
        }}
        title="Detected Prescription Medications"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 font-normal">
            The parser identified {pendingMedications.length} medication instruction(s) in this document. Verify details before creating daily reminders:
          </p>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {pendingMedications.map((med, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-sm">💊 {med.medicineName || med.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditMed(med, idx)}
                      className="px-2 py-1 rounded bg-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemovePendingMed(idx)}
                      className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold text-[11px] hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <p>Dose: <strong className="text-slate-800">{med.dose}</strong></p>
                  <p>Frequency: <strong className="text-slate-800">{med.frequency}</strong></p>
                  <p>Meal: <strong className="text-slate-800">{med.mealRelation}</strong></p>
                  <p>Duration: <strong className="text-slate-800">{med.duration}</strong></p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                setIsVerificationModalOpen(false);
                navigate('/app/analysis');
              }}
              className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
            >
              Skip Reminders
            </button>

            <button
              onClick={handleConfirmAllReminders}
              className="px-5 py-2 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#0D9488]" /> Create {pendingMedications.length} Reminders
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
