import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Siren, 
  Pill, 
  FileText,
  Plus,
  Sparkles,
  Edit2,
  Building2,
  TrendingUp,
  Activity,
  HeartPulse,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { HealthMetricCard } from '../components/ui/HealthMetricCard';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { MedicationCard } from '../components/ui/MedicationCard';
import { ReportCard } from '../components/ui/ReportCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatDisplayName } from '../utils/formatters';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    updateUserProfile,
    reports, 
    medicines, 
    toggleMedicineTaken
  } = useHealthData();

  const displayName = formatDisplayName(userProfile?.name || 'Sarah');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
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

  const pendingMeds = (Array.isArray(medicines) ? medicines : []).filter(m => !m.taken);
  const nextMed = pendingMeds[0] || {
    id: 'm-default',
    name: 'Lisinopril',
    dosage: '10mg',
    instructions: 'After food',
    time: '2:00 PM',
    dateLabel: 'Today, 2:00 PM',
    taken: false
  };

  const recentReportsList = (Array.isArray(reports) && reports.length > 0) ? reports : [];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Patient Hero Executive Banner */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-5">
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
                  className="px-4 py-2 rounded-xl bg-[#1A4B84] text-white text-xs font-semibold hover:bg-[#143A66] cursor-pointer"
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
                <h1 className="text-2.5xl sm:text-3xl font-extrabold text-[#1A4B84] tracking-tight leading-snug">
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
                  <Edit2 className="w-3 h-3 text-[#2D90A6]" /> Edit Name
                </button>
              </div>
            )}
            <p className="text-xs sm:text-sm font-normal text-slate-500">
              Here is your health overview for today.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D90A6] bg-[#EBF6F8] px-3.5 py-1.5 rounded-full border border-[#2D90A6]/30">
              <ShieldCheck className="w-4 h-4 text-[#2D90A6]" /> MedGuardian Active
            </span>
          </div>
        </div>

        {/* Quick Action Button Cards Grid for Mobile & Desktop */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          
          <button
            onClick={() => navigate('/app/upload')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1A4B84] text-white flex items-center justify-center mx-auto shadow-2xs">
              <Upload className="w-4.5 h-4.5 text-[#2D90A6]" />
            </div>
            <span className="block text-xs font-bold text-[#1A4B84]">Upload Report</span>
          </button>

          <button
            onClick={() => navigate('/app/hospitals')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1A4B84] text-white flex items-center justify-center mx-auto shadow-2xs">
              <Building2 className="w-4.5 h-4.5 text-[#2D90A6]" />
            </div>
            <span className="block text-xs font-bold text-[#1A4B84]">Find Hospital</span>
          </button>

          <button
            onClick={() => navigate('/app/medicines')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-center space-y-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1A4B84] text-white flex items-center justify-center mx-auto shadow-2xs">
              <Pill className="w-4.5 h-4.5 text-[#2D90A6]" />
            </div>
            <span className="block text-xs font-bold text-[#1A4B84]">Medicine</span>
          </button>

        </div>
      </Card>

      {/* Primary Health Metric Cards: BP, Glucose, HbA1c */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#1A4B84]">Health Metrics</h2>
          <button 
            onClick={() => navigate('/app/trends')}
            className="text-xs font-bold text-[#2D90A6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Trends</span> <TrendingUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HealthMetricCard 
            name="Blood Pressure"
            value="120/80"
            unit="mmHg"
            status="Normal"
            statusType="normal"
            statusSymbol="✓"
            refRange="Systolic <120 / Diastolic <80"
            trend="stable"
          />

          <HealthMetricCard 
            name="Glucose"
            value="95"
            unit="mg/dL"
            status="Normal"
            statusType="normal"
            statusSymbol="✓"
            refRange="70 - 99 mg/dL"
            trend="down"
          />

          <HealthMetricCard 
            name="HbA1c"
            value="5.8"
            unit="%"
            status="Elevated"
            statusType="warning"
            statusSymbol="▲"
            refRange="< 5.7 %"
            trend="up"
          />
        </div>
      </div>

      {/* Main Grid: AI Insights + Next Dose Banner + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 columns: AI Insights & Next Dose */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Insights Card */}
          <AIInsightCard 
            title="AI Insights"
            summary="Your recent glucose levels are stable. However, your HbA1c shows a slight upward trend over the last 6 months (5.8%). Consider reviewing your current diet plan with your healthcare provider."
            severity="warning"
            onViewDetails={() => navigate('/app/trends')}
          />

          {/* Next Dose Banner */}
          <MedicationCard 
            name={nextMed.name}
            dosage={nextMed.dosage}
            instructions={nextMed.instructions}
            time={nextMed.time}
            dateLabel={nextMed.dateLabel || "Today, 2:00 PM"}
            taken={nextMed.taken}
            onToggleTaken={() => toggleMedicineTaken(nextMed.id)}
          />

        </div>

        {/* Right 5 columns: Recent Medical Reports */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1A4B84]">Recent Medical Reports</h3>
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

          <div className="space-y-3">
            {recentReportsList.length === 0 ? (
              <Card className="p-6 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-normal">
                  No uploaded medical reports yet. Click "Upload New" to analyze your first lab document.
                </p>
              </Card>
            ) : (
              recentReportsList.map((rep) => (
                <ReportCard 
                  key={rep.id || rep.reportId}
                  title={rep.fileName || rep.title}
                  date={rep.uploadedAt || rep.date}
                  doctorName={rep.doctorName || 'Prescribing Physician'}
                  labName={rep.labName || 'Uploaded Lab Document'}
                  status={rep.status || 'Normal'}
                  statusType={rep.statusType || 'normal'}
                  onViewDetails={() => navigate('/app/analysis')}
                />
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
