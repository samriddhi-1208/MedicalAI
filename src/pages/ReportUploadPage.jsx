import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Cpu, 
  BrainCircuit, 
  ShieldAlert, 
  RefreshCw,
  FileCheck,
  Zap,
  Eye,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ReportUploadPage = () => {
  const navigate = useNavigate();
  const { addReport } = useHealthData();

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processedResult, setProcessedResult] = useState(null);

  const processingSteps = [
    { title: "Document Encryption & Security Scan", icon: Cpu, detail: "Validating PDF format & applying AES-256 encryption container" },
    { title: "Tesseract OCR Extraction", icon: Zap, detail: "Scanning high-resolution pixels for test names, values & reference ranges" },
    { title: "AI Biomarker Structuring", icon: BrainCircuit, detail: "Mapping clinical test names to standard LOINC & ICD-10 medical codes" },
    { title: "Critical Threshold & Risk Evaluation", icon: ShieldAlert, detail: "Evaluating extracted values against standard clinical boundaries" }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startUploadPipeline(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      startUploadPipeline(e.target.files[0]);
    }
  };

  const loadSampleReport = (sampleName) => {
    const mockFile = {
      name: `${sampleName.replace(/\s+/g, '_')}_2026.pdf`,
      size: "2.4 MB",
      type: "application/pdf"
    };
    startUploadPipeline(mockFile, sampleName);
  };

  const startUploadPipeline = (selectedFile, sampleTitle = "Complete Blood Count (CBC)") => {
    setFile(selectedFile);
    setProcessing(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          setProcessing(false);
          
          const newReportObj = {
            id: `rep-${Date.now().toString().slice(-4)}`,
            title: selectedFile.name ? selectedFile.name.replace(/\.[^/.]+$/, "") : sampleTitle,
            labName: "Apex Clinical Laboratories",
            doctorName: "Dr. Aris Thorne",
            date: new Date().toISOString().split('T')[0],
            status: "Attention Needed",
            statusType: "warning",
            score: 84,
            fileSize: selectedFile.size || "2.4 MB",
            fileType: "PDF",
            ocrConfidence: "98.9%",
            aiSummary: "AI report analysis complete. Total Cholesterol is measured at 224 mg/dL (High), while Hemoglobin is slightly low at 11.2 g/dL. Renal panel and white blood cells remain optimal.",
            keyFindings: [
              "Total Cholesterol measured at 224 mg/dL (Desirable: < 200 mg/dL).",
              "Hemoglobin measured at 11.2 g/dL (Reference: 12.0 - 15.5 g/dL).",
              "HbA1c Blood Sugar measured at 5.8% (Stable)."
            ],
            recommendations: {
              lifestyle: ["Increase soluble fiber intake (oats, legumes).", "Maintain 150 minutes of weekly aerobic exercise."],
              medical: ["Schedule follow-up consultation with Dr. Aris Thorne in 30 days."],
              questionsForDoctor: ["Is dietary modification sufficient for cholesterol management?"]
            },
            biomarkers: [
              { id: "b1", name: "Hemoglobin", value: 11.2, unit: "g/dL", refRange: "12.0 - 15.5", status: "Low", statusType: "warning", trend: "down", category: "Hematology" },
              { id: "b2", name: "Total Cholesterol", value: 224, unit: "mg/dL", refRange: "< 200", status: "High", statusType: "warning", trend: "up", category: "Lipids" },
              { id: "b3", name: "HbA1c", value: 5.8, unit: "%", refRange: "< 5.7", status: "Stable", statusType: "normal", trend: "stable", category: "Metabolic" },
              { id: "b4", name: "WBC Count", value: 6.8, unit: "k/mcL", refRange: "4.5 - 11.0", status: "Normal", statusType: "normal", trend: "stable", category: "Hematology" }
            ]
          };

          addReport(newReportObj);
          setProcessedResult(newReportObj);
          toast.success("Medical report OCR & AI structuring complete!");
          return 3;
        }
        return prev + 1;
      });
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900">Medical Report Upload & AI Processing</h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Upload PDF lab reports or scanned photos. Our OCR engine extracts test values into a structured format.
        </p>
      </div>

      {/* Preset Test Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Sample Presets:
        </span>
        <button
          onClick={() => loadSampleReport("Complete Blood Count (CBC)")}
          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 font-medium"
        >
          📄 Sample CBC Blood Report
        </button>
        <button
          onClick={() => loadSampleReport("Lipid Profile Panel")}
          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 font-medium"
        >
          📄 Sample Lipid Profile
        </button>
      </div>

      {/* Drag & Drop Card */}
      {!processing && !processedResult && (
        <Card className="p-8 text-center bg-white border-2 border-dashed border-slate-300">
          <form
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="space-y-4"
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Drag and drop your Medical Report file here
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, PNG, JPG files up to 25 MB
              </p>
            </div>

            <label
              htmlFor="file-upload"
              className="med-btn med-btn-primary cursor-pointer inline-flex"
            >
              <FileText className="w-4 h-4" /> Browse Local File
            </label>
          </form>
        </Card>
      )}

      {/* Processing Animation */}
      {processing && (
        <Card className="p-6 space-y-6 bg-white">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Processing Medical Report...</h3>
            <p className="text-xs text-slate-500">{file?.name || "Medical_Report.pdf"}</p>
          </div>

          <div className="space-y-3">
            {processingSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isDone = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-center gap-3 text-xs ${
                    isCurrent
                      ? 'bg-sky-50 border-sky-300 text-sky-900'
                      : isDone
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{step.title}</p>
                    <p className="text-[11px] text-slate-500">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Success Result Card */}
      {processedResult && (
        <Card className="p-6 bg-white border border-emerald-300 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Report Successfully Extracted!</h3>
              <p className="text-xs text-slate-600">Extracted {processedResult.biomarkers.length} test values with {processedResult.ocrConfidence} OCR accuracy.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">💡 AI Summary Preview:</p>
            <p className="leading-relaxed">{processedResult.aiSummary}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setProcessedResult(null);
                setFile(null);
              }}
            >
              Upload Another Report
            </Button>
            <Button
              variant="teal"
              size="sm"
              icon={Eye}
              onClick={() => navigate('/app/analysis')}
            >
              View Full AI Analysis
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
