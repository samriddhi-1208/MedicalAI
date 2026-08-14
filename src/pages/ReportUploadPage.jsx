import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  File, 
  RefreshCw,
  ArrowRight,
  Info,
  AlertTriangle,
  Pill,
  Clock,
  Edit2,
  Trash2
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
  const { addReport, addMedicine, medicines, userProfile, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setExtractionError(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(15);
    setProcessingStatus("Reading document stream...");

    try {
      setTimeout(() => { setProgress(45); setProcessingStatus("Extracting raw biomarkers & medication instructions..."); }, 400);
      setTimeout(() => { setProgress(75); setProcessingStatus("Segmenting lab test rows & clinical reference ranges..."); }, 800);

      // Perform 100% dynamic parsing on uploaded file
      const parsedData = await analyzeUploadedDocument(selectedFile);
      setProgress(100);

      // Save report permanently to MongoDB & LocalStorage for future sessions
      const savedReport = await addReport(parsedData, selectedFile);

      const extractedMeds = Array.isArray(parsedData.extractedMedications) ? parsedData.extractedMedications : [];

      if (extractedMeds.length > 0) {
        setPendingMedications(extractedMeds);
        setIsVerificationModalOpen(true);
        setUploading(false);
      } else {
        toast.success("✓ Report analyzed successfully. No medication instructions were found in this report.");
        navigate('/app/analysis');
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
      setExtractionError("Failed to extract data from document. Please ensure file is a clear lab report.");
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
        instructions: med.specialInstructions || `Extracted from uploaded report`
      });
    }

    setIsVerificationModalOpen(false);
    toast.success(`✓ Created ${pendingMedications.length} medicine reminder(s)!`);
    navigate('/app/dashboard');
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Upload Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
          <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">{t('dynamicDocAnalyzer')}</span>
        </div>
        <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
          {t('uploadMedicalReport')}
        </h1>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          {t('uploadSubtitle')}
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6 text-center">
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-10 rounded-2xl border-2 border-dashed transition-all ${
            dragActive
              ? 'border-[#2D90A6] bg-[#EBF6F8]/60 scale-[1.01]'
              : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1A4B84] text-white flex items-center justify-center mx-auto shadow-md mb-4">
            <Upload className="w-8 h-8 text-[#2D90A6]" />
          </div>

          <p className="text-sm font-extrabold text-[#1A4B84]">
            {t('dragDropText')}
          </p>

          <p className="text-xs text-slate-400 font-medium mt-1">
            {t('supportedFormats')} • {t('maxSize')}
          </p>

          <div className="mt-6">
            <label className="px-6 py-3 rounded-xl bg-[#1A4B84] hover:bg-[#143A66] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2 transition-colors shadow-2xs">
              <File className="w-4 h-4 text-[#2D90A6]" />
              <span>{t('browseFiles')}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-left animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#2D90A6]" />
              <div>
                <p className="font-extrabold text-sm text-[#1A4B84] truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-slate-500 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={uploading}
              onClick={handleUploadAndAnalyze}
              className="bg-[#1A4B84] hover:bg-[#143A66] py-2.5 px-6 text-xs font-bold rounded-xl cursor-pointer"
            >
              {uploading ? t('extractingData') : t('uploadAndAnalyze')}
            </Button>
          </div>
        )}

        {/* Upload & Extraction Progress */}
        {uploading && (
          <div className="space-y-2 text-xs text-left p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between font-bold text-[#1A4B84]">
              <span>{processingStatus}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#2D90A6] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
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

      {/* REQUIREMENT 4 & 5: EXTRACTED MEDICATION VERIFICATION SCREEN */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Medication Instructions Found in Report"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-[#EBF6F8] border border-[#2D90A6]/30 text-[#1A4B84] flex items-center gap-3">
            <Pill className="w-6 h-6 text-[#2D90A6] shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Verify Extracted Medication Instructions</p>
              <p className="text-[11px] text-slate-600 font-normal">
                We detected {pendingMedications.length} prescription instruction(s) in your document. Review dosage and reminder times before creating reminders.
              </p>
            </div>
          </div>

          {/* Medication Cards List */}
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {pendingMedications.map((med, idx) => (
              <Card key={med.id || idx} className="p-4 border border-slate-200 bg-white space-y-2.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A4B84] flex items-center gap-1.5">
                      💊 {med.medicineName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{med.dose} • {med.quantity}</p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditMed(med, idx)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-[#2D90A6]" /> Edit
                    </button>
                    <button
                      onClick={() => handleRemovePendingMed(idx)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3 text-[#DC2626]" /> Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px]">
                  <p><span className="text-slate-500">Frequency:</span> <strong className="text-[#1A4B84] font-bold">{med.frequency}</strong></p>
                  <p><span className="text-slate-500">Meal Relation:</span> <strong className="text-slate-800 font-semibold">{med.mealRelation} ({med.mealType})</strong></p>
                  <p><span className="text-slate-500">Duration:</span> <strong className="text-slate-800 font-semibold">{med.duration}</strong></p>
                  <p><span className="text-slate-500">Scheduled Time:</span> <strong className="text-[#2D90A6] font-bold">{med.timing || med.scheduled_time || '08:00 AM'}</strong></p>
                </div>

                {/* REQUIREMENT 3 & 6: Missing exact time prompt */}
                {!med.hasExactTime && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center justify-between">
                    <span>Exact time not in report. Select reminder time:</span>
                    <input
                      type="text"
                      value={med.timing || med.scheduled_time || '08:00 AM'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPendingMedications(prev => prev.map((m, i) => i === idx ? { ...m, timing: val, scheduled_time: val, hasExactTime: true } : m));
                      }}
                      className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold text-slate-800 w-24 text-center"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Edit Individual Medication Form inside Verification Modal */}
          {editingMedIndex !== null && (
            <form onSubmit={handleSaveMedEdit} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h5 className="font-extrabold text-xs text-[#1A4B84]">Edit {editFormData.medicineName} Details</h5>
              <div className="grid grid-cols-2 gap-2">
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
              <div className="grid grid-cols-2 gap-2">
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
                <Button size="sm" variant="primary" type="submit" className="bg-[#1A4B84]">Save Edit</Button>
              </div>
            </form>
          )}

          {/* Confirmation Action Button */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" onClick={() => navigate('/app/analysis')}>
              Skip & View Analysis
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={handleConfirmAllReminders}
              className="bg-[#1A4B84] hover:bg-[#143A66] py-2.5 px-6 font-bold text-xs cursor-pointer shadow-xs"
            >
              Confirm & Set Reminders
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
