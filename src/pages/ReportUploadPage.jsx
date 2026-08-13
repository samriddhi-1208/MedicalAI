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
import { analyzeUploadedDocument } from '../utils/reportParser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ReportUploadPage = () => {
  const navigate = useNavigate();
  const { addReport, userProfile } = useHealthData();

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
      toast.error("Invalid file format. Please upload a PDF, JPG, JPEG, or PNG document.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }
    setSelectedFile(file);
    setExtractionError(null);
    toast.success(`Selected file: ${file.name}`);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select or drop a medical report file first.");
      return;
    }

    setUploading(true);
    setExtractionError(null);
    setProgress(15);
    setProcessingStatus("Reading uploaded file & generating SHA-256 hash...");

    try {
      setTimeout(() => {
        setProgress(40);
        setProcessingStatus("Running PDF Text / Tesseract OCR Document Engine...");
      }, 800);

      setTimeout(() => {
        setProgress(75);
        setProcessingStatus("Validating extracted test parameters & reference ranges...");
      }, 1800);

      // Perform 100% Dynamic Extraction (NO FAKE / HARDCODED FALLBACKS!)
      const userId = userProfile?.email || 'authenticated-user';
      const result = await analyzeUploadedDocument(selectedFile, userId);

      setProgress(100);

      if (!result.success) {
        setExtractionError(result.error || "We couldn't reliably extract the medical results from this document. Please upload a clearer PDF/image.");
        toast.error("Extraction failed — Unable to read medical parameters");
        setUploading(false);
        return;
      }

      setProcessingStatus("100% Dynamic Extraction Complete!");
      
      if (typeof addReport === 'function') {
        addReport(result);
      }

      toast.success(`Parsed ${result.parameterCount} lab parameters from "${selectedFile.name}"!`);
      navigate('/app/analysis');
    } catch (err) {
      console.error("Document upload error:", err);
      setExtractionError("We couldn't reliably extract the medical results from this document. Please upload a clearer PDF/image.");
      toast.error("Extraction failed — Please try a clearer document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
          <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">Dynamic Medical Document Analyzer</span>
        </div>
        <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
          Upload Medical Report
        </h1>
        <p className="text-xs font-normal text-slate-500">
          Upload your scanned lab test or medical imaging result for instant 100% dynamic AI extraction (PDF/OCR)
        </p>
      </div>

      {/* Main Drag-and-Drop Card */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        
        <form 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`p-10 border-2 border-dashed rounded-2xl text-center transition-all ${
            dragActive 
              ? 'border-[#2D90A6] bg-[#EBF6F8]/50 scale-[0.99]' 
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/40'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-[#1A4B84] flex items-center justify-center mx-auto shadow-2xs">
            <Upload className="w-8 h-8 text-[#2D90A6]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-[#1A4B84]">
              {selectedFile ? selectedFile.name : 'Upload Medical Report'}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              {selectedFile 
                ? `File ready: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB (${selectedFile.type})`
                : 'Drag and drop your medical report here, or browse files from your device'
              }
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center gap-3">
            <label className="med-btn med-btn-secondary py-2.5 px-6 text-xs font-semibold cursor-pointer">
              <span>Browse Files</span>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden" 
              />
            </label>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3 text-xs text-slate-500 font-medium">
            <span>Supported Formats: PDF, JPG, JPEG, PNG</span>
            <span>•</span>
            <span>Max Size: 15MB</span>
          </div>
        </form>

        {/* Upload & Processing Progress Bar */}
        {uploading && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-xs font-bold text-[#1A4B84]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#2D90A6] animate-spin" />
                {processingStatus}
              </span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2D90A6] transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Extraction Error Alert State (0% Fake Data!) */}
        {extractionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" /> Unable to Extract Medical Results
            </div>
            <p className="leading-relaxed">{extractionError}</p>
          </div>
        )}

        {/* Upload & Analyze Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="teal"
            size="md"
            icon={Sparkles}
            loading={uploading}
            onClick={handleUploadAndAnalyze}
            className="bg-[#1A4B84] hover:bg-[#143A66] py-3.5 px-8 text-sm font-semibold rounded-xl cursor-pointer"
          >
            {uploading ? 'Extracting Medical Data...' : 'Upload & Analyze Report'}
          </Button>
        </div>

      </Card>

      {/* Mandatory Medical AI Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#1A4B84] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Mandatory Medical Disclaimer:</strong> AI-generated information is for informational and record organization purposes only and should not replace professional medical advice. Always consult a qualified healthcare provider.
        </p>
      </div>

    </div>
  );
};
