import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Siren, 
  Pill, 
  FileText,
  Plus,
  Sparkles,
  FolderOpen,
  Volume2,
  Share2,
  Edit2,
  CheckCircle2,
  Mic,
  MicOff,
  FileCheck,
  ShieldAlert,
  HeartPulse,
  Activity,
  MapPin,
  Calendar,
  User,
  Ruler,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatDisplayName } from '../utils/formatters';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    updateUserProfile,
    reports, 
    medicines, 
    toggleMedicineTaken, 
    language
  } = useHealthData();

  const displayName = formatDisplayName(userProfile?.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'HI') {
      if (hour < 12) return "शुभ प्रभात";
      if (hour < 17) return "शुभ दोपहर";
      return "शुभ संध्या";
    }
    if (language === 'GU') {
      if (hour < 12) return "સુપ્રભાત";
      if (hour < 17) return "શુભ બપોર";
      return "શુભ સંધ્યા";
    }
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const saveName = () => {
    if (tempName.trim()) {
      updateUserProfile({ name: tempName.trim() });
      toast.success("Patient name updated!");
    }
    setIsEditingName(false);
  };

  const latestReport = (Array.isArray(reports) && reports.length > 0) ? reports[0] : null;
  const extractedBiomarkers = Array.isArray(latestReport?.biomarkers) ? latestReport.biomarkers : [];
  const pendingMeds = (Array.isArray(medicines) ? medicines : []).filter(m => !m.taken);
  const nextMed = pendingMeds[0] || (Array.isArray(medicines) ? medicines[0] : null);

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Patient Hero Header Banner matching Figma */}
      <Card className="p-7 bg-white border border-slate-200 shadow-md shadow-slate-200/40 rounded-2xl space-y-6">
        
        {/* Title / Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {isEditingName ? (
              <div className="flex items-center gap-3 my-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="med-input text-lg font-bold max-w-md"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2.5xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
                  {getGreeting()}, {displayName}
                </h1>
                <button
                  onClick={() => {
                    setTempName(displayName);
                    setIsEditingName(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                  title="Edit Patient Name"
                >
                  <Edit2 className="w-3 h-3 text-[#0D9488]" /> Edit Name
                </button>
              </div>
            )}
            <p className="text-xs font-normal text-slate-500">Here is your health summary and clinical status for today.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Account Active
            </span>
          </div>
        </div>

        {/* Quick Action Button Cards Grid matching Mobile/Desktop Figma */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          
          <button
            onClick={() => navigate('/app/upload')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center mx-auto shadow-2xs">
              <Upload className="w-4.5 h-4.5 text-[#0D9488]" />
            </div>
            <span className="block text-xs font-bold text-[#0F172A]">Upload Report</span>
          </button>

          <button
            onClick={() => navigate('/app/hospitals')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center mx-auto shadow-2xs">
              <Building2 className="w-4.5 h-4.5 text-[#0D9488]" />
            </div>
            <span className="block text-xs font-bold text-[#0F172A]">Find Hospital</span>
          </button>

          <button
            onClick={() => navigate('/app/medicines')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center mx-auto shadow-2xs">
              <Pill className="w-4.5 h-4.5 text-[#0D9488]" />
            </div>
            <span className="block text-xs font-bold text-[#0F172A]">Medicine</span>
          </button>

        </div>

        {/* Next Dose Banner matching Figma */}
        {nextMed && (
          <div className="p-4 rounded-xl bg-[#0F172A] text-white flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider block">Next Dose</span>
                <span className="text-sm font-extrabold text-white block">{nextMed.name} ({nextMed.dosage}) at {nextMed.time}</span>
              </div>
            </div>

            <button
              onClick={() => toggleMedicineTaken(nextMed.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                nextMed.taken ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-[#0F172A] hover:bg-slate-100'
              }`}
            >
              {nextMed.taken ? 'Logged ✓' : 'Take Now'}
            </button>
          </div>
        )}

      </Card>

      {/* Health at a Glance Vital Cards matching Figma */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Health at a Glance</h2>
          <Link to="/app/trends" className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1">
            <span>View All Trends</span> <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Blood Pressure Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Blood Pressure</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2.5xl font-extrabold text-[#0F172A]">
                118/78 <span className="text-xs font-normal text-slate-500">mmHg</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Standard Resting Bounds</p>
          </Card>

          {/* Glucose Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Fasting Glucose</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Normal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2.5xl font-extrabold text-[#0F172A]">
                95 <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Ref Range: 70 - 100 mg/dL</p>
          </Card>

          {/* Hemoglobin Card */}
          <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Hemoglobin (Hb)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Normal
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2.5xl font-extrabold text-[#0F172A]">
                13.8 <span className="text-xs font-normal text-slate-500">g/dL</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Ref Range: 12.0 - 15.0 g/dL</p>
          </Card>

        </div>
      </div>

      {/* Recent Reports Card matching Figma */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Recent Reports</h3>
            <p className="text-xs font-medium text-slate-500">Latest parsed medical lab documentation</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            onClick={() => navigate('/app/upload')}
          >
            Upload New
          </Button>
        </div>

        {latestReport ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0F172A]">
                  <FileText className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#0F172A]">{latestReport.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">Analyzed {latestReport.date}</p>
                </div>
              </div>
              <Badge variant={latestReport.statusType}>{latestReport.status}</Badge>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              {latestReport.aiSummary || 'All key markers (CBC, Red Cell Indices, Leukocytes) are within healthy bounds. Keep up the good work.'}
            </p>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => navigate('/app/analysis')}
                className="text-xs font-bold text-[#0F172A] hover:text-[#0D9488] flex items-center gap-1 cursor-pointer"
              >
                <span>View Full AI Analysis</span> <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium text-center py-4">No reports uploaded yet.</p>
        )}
      </Card>

    </div>
  );
};
