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
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { analyzeUploadedDocument } from '../utils/reportParser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ReportUploadPage = () => {
  const navigate = useNavigate();
  const { addReport, userProfile, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [extractionError, setExtractionError] = useState(null);

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
      setTimeout(() => { setProgress(45); setProcessingStatus("Extracting raw biomarkers & values (100% Dynamic Engine)..."); }, 600);
      setTimeout(() => { setProgress(75); setProcessingStatus("Segmenting lab test rows & clinical reference ranges..."); }, 1200);

      // Perform 100% dynamic parsing on uploaded file
      const parsedData = await analyzeUploadedDocument(selectedFile);
      setProgress(100);

      // Add parsed report to context
      addReport(parsedData);

      toast.success("✓ Medical document analyzed successfully!");
      navigate('/app/analysis');
    } catch (err) {
      console.error(err);
      setUploading(false);
      setExtractionError("Failed to extract data from document. Please ensure file is a clear lab report.");
      toast.error("Document parsing failed.");
    }
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

    </div>
  );
};
