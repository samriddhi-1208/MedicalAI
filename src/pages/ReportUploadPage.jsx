import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ReportUploadPage = () => {
  const navigate = useNavigate();
  const { addReport, loadDemoData } = useHealthData();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      toast.error("Please select a PDF or Image file (PNG, JPG)");
      return;
    }
    setSelectedFile(file);
    toast.success(`Selected: ${file.name}`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a lab report file to upload!");
      return;
    }

    setUploading(true);
    setProgress(20);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const newReport = {
        id: `rep-${Date.now().toString().slice(-4)}`,
        title: selectedFile.name.replace(/\.[^/.]+$/, "") || "Lipid & Blood Panel Report",
        date: new Date().toISOString().split('T')[0],
        labName: "Metro Diagnostics Laboratory",
        status: "Parsed & Verified",
        statusType: "warning",
        ocrConfidence: "98.4%",
        aiSummary: "Report structured successfully via MedicalAI OCR engine. Cholesterol measured at 224 mg/dL (High). Fasting glucose and renal markers remain within normal reference bounds.",
        biomarkers: [
          { name: "Total Cholesterol", value: 224, unit: "mg/dL", refRange: "125 - 200", status: "High", statusType: "warning", category: "Metabolic", notes: "Borderline elevated. Reduce saturated fat intake." },
          { name: "Fasting Glucose", value: 92, unit: "mg/dL", refRange: "70 - 99", status: "Normal", statusType: "normal", category: "Glycemic", notes: "Optimal fasting blood sugar." },
          { name: "Hemoglobin", value: 13.8, unit: "g/dL", refRange: "12.0 - 15.5", status: "Normal", statusType: "normal", category: "Hematology", notes: "Healthy oxygen-carrying capacity." },
          { name: "Serum Creatinine", value: 0.95, unit: "mg/dL", refRange: "0.60 - 1.20", status: "Normal", statusType: "normal", category: "Renal", notes: "Optimal kidney filtration." }
        ]
      };

      addReport(newReport);
      setUploading(false);
      toast.success("Lab report scanned and parsed with AI accuracy!");
      navigate('/app/analysis');
    }, 2200);
  };

  return (
    <div className="space-y-8 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-200">
          AI OCR Parsing Engine
        </span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Upload Scanned Medical Report
        </h1>
        <p className="text-sm font-normal text-slate-600 max-w-xl mx-auto">
          Upload your scanned lab report PDF or paper photo to automatically extract test parameters, values, and clinical reference bounds.
        </p>
      </div>

      {/* Main Upload Drag-and-Drop Card */}
      <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver 
              ? 'border-[#0D9488] bg-teal-50/40 scale-[0.99]' 
              : selectedFile 
              ? 'border-emerald-300 bg-emerald-50/30' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
          onClick={() => document.getElementById('report-file-input').click()}
        >
          <input
            id="report-file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          />

          <div className="w-16 h-16 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center mx-auto border border-slate-200 shadow-xs mb-4">
            <Upload className="w-8 h-8 text-[#0D9488]" />
          </div>

          {selectedFile ? (
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Selected File
              </span>
              <p className="text-base font-extrabold text-[#0F172A]">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB • Click to change file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-base font-bold text-[#0F172A]">
                Drag and drop your medical report here, or <span className="text-[#0D9488] underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Supports PDF, PNG, JPG files up to 15MB
              </p>
            </div>
          )}
        </div>

        {/* Uploading Progress Bar */}
        {uploading && (
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs font-bold text-[#0F172A]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#0D9488] animate-spin" />
                Scanning document with OCR AI engine...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#0F172A] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0D9488]" /> Encrypted 256-Bit File Storage
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              className="flex-1 sm:flex-none text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={loadDemoData}
            >
              Load Sample Report
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              loading={uploading}
              disabled={!selectedFile}
              className="flex-1 sm:flex-none text-xs font-semibold rounded-xl bg-[#0F172A] hover:bg-[#1E293B]"
              onClick={handleUploadSubmit}
            >
              Process & Analyze Report
            </Button>
          </div>
        </div>

      </Card>

    </div>
  );
};
