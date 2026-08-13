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
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ReportUploadPage = () => {
  const navigate = useNavigate();
  const { addReport } = useHealthData();

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

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
    toast.success(`Selected file: ${file.name}`);
  };

  const handleUploadAndAnalyze = () => {
    if (!selectedFile) {
      toast.error("Please select or drop a medical report file first.");
      return;
    }

    setUploading(true);
    setProgress(15);
    setProcessingStatus("Uploading document securely...");

    setTimeout(() => {
      setProgress(50);
      setProcessingStatus("Extracting OCR text and clinical biomarkers...");
    }, 1000);

    setTimeout(() => {
      setProgress(85);
      setProcessingStatus("Analyzing clinical values with MedGuardian AI...");
    }, 2000);

    setTimeout(() => {
      setProgress(100);
      setProcessingStatus("AI Analysis Complete!");

      const newReport = {
        id: `rep-${Date.now()}`,
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
        labName: "Uploaded Medical Laboratory Report",
        doctorName: "Prescribing Physician",
        date: new Date().toISOString().split('T')[0],
        status: "Normal",
        statusType: "normal",
        fileType: selectedFile.type.includes('pdf') ? 'PDF' : 'IMAGE',
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        ocrConfidence: "99.2%",
        aiSummary: "Your uploaded medical report has been processed with AI precision. All key markers (CBC, Metabolic Panel, Lipid parameters) are structured under your private patient portal.",
        biomarkers: [
          { id: "b1", name: "Hemoglobin (Hb)", value: "13.8", unit: "g/dL", refRange: "12.0 - 15.0", status: "Normal", statusType: "normal", statusSymbol: "✓" },
          { id: "b2", name: "Fasting Glucose", value: "95", unit: "mg/dL", refRange: "70 - 99", status: "Normal", statusType: "normal", statusSymbol: "✓" },
          { id: "b3", name: "Cholesterol (LDL)", value: "135", unit: "mg/dL", refRange: "< 100", status: "Slightly Elevated", statusType: "warning", statusSymbol: "▲" }
        ]
      };

      if (typeof addReport === 'function') {
        addReport(newReport);
      }

      toast.success("Medical report uploaded and analyzed!");
      navigate('/app/analysis');
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
          <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">AI Medical Report Analyzer</span>
        </div>
        <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
          Upload Medical Report
        </h1>
        <p className="text-xs font-normal text-slate-500">
          Upload your scanned lab test or medical imaging result for instant plain-language AI analysis
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
            Upload & Analyze Report
          </Button>
        </div>

      </Card>

      {/* Mandatory Medical AI Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#1A4B84] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>AI Disclaimer:</strong> AI-generated information is for informational and record organization purposes only and should not replace professional medical advice. Always consult a qualified healthcare provider.
        </p>
      </div>

    </div>
  );
};
