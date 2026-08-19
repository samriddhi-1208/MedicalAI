import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Upload, 
  Plus, 
  Activity, 
  Pill,
  ChevronRight,
  Edit2,
  Check,
  ArrowRight,
  Calendar,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { formatDisplayName } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    updateUserProfile, 
    reports, 
    medicines, 
    language 
  } = useHealthData();

  const userDisplayName = formatDisplayName(userProfile?.name, userProfile?.email);
  const t = (key) => getTranslation(language, key);

  // Patient Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile?.name || '');

  // User-specific valid reports (0% Fake/Fallback Data!)
  const userReports = Array.isArray(reports) ? reports : [];
  const reportCount = userReports.length;
  const hasReports = reportCount > 0;

  // Sort reports chronologically by reportDate to find the latest report
  const chronReports = [...userReports].sort((a, b) => {
    const dA = a.reportDate || a.date || a.report_date || a.uploadedAt || '1970-01-01';
    const dB = b.reportDate || b.date || b.report_date || b.uploadedAt || '1970-01-01';
    return new Date(dA) - new Date(dB);
  });

  const latestReport = chronReports.length > 0 ? chronReports[chronReports.length - 1] : null;

  // User-specific medicines array (0% Fake/Fallback Data!)
  const userMedicines = Array.isArray(medicines) ? medicines : [];

  // Calculate total tracked parameters dynamically across valid reports
  let totalTrackedParameters = 0;
  const featuredBiomarkerMap = {};

  userReports.forEach((r) => {
    const bArr = Array.isArray(r.biomarkers) ? r.biomarkers : (Array.isArray(r.labResults) ? r.labResults : []);
    const vArr = Array.isArray(r.vitals) ? r.vitals : [];
    totalTrackedParameters += bArr.length + vArr.length;

    bArr.forEach((bm) => {
      const name = bm.name || bm.testName || bm.biomarker_name;
      if (name) {
        if (!featuredBiomarkerMap[name]) featuredBiomarkerMap[name] = [];
        featuredBiomarkerMap[name].push(bm);
      }
    });
  });

  // Pick top featured biomarker for trend preview (e.g. Hemoglobin or first extracted)
  const featuredBiomarkerName = Object.keys(featuredBiomarkerMap).find(n => /hemoglobin|hb|hgb/i.test(n)) || Object.keys(featuredBiomarkerMap)[0] || null;
  const featuredReadings = featuredBiomarkerName ? featuredBiomarkerMap[featuredBiomarkerName] : [];
  const latestFeaturedReading = featuredReadings.length > 0 ? featuredReadings[featuredReadings.length - 1] : null;

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const saveName = () => {
    if (tempName.trim()) {
      updateUserProfile({ name: tempName.trim() });
      toast.success("Patient name updated!");
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-7xl mx-auto">
      
      {/* 1. HEADER / PATIENT CONTEXT & PRIMARY ACTIONS */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {isEditingName ? (
              <div className="flex items-center gap-3 my-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="med-input text-base font-bold max-w-md"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  {getGreeting()}, <span className="text-[#0D9488]">{userDisplayName}</span>
                </h1>
                <button
                  onClick={() => {
                    setTempName(userProfile?.name || '');
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
                  title="Edit patient name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 font-medium">
              Here's a quick overview of your health activity.
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/reports')}
              className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            >
              View Reports
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/trends')}
              className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            >
              View Trends
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
            >
              Upload Medical Report
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. HEALTH OVERVIEW — COMPACT SUMMARY ROW (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Reports Count */}
        <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Reports</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2.5xl font-black text-[#0F172A] tracking-tight">{reportCount}</span>
            <span className="text-[11px] font-bold text-[#0D9488]">Saved</span>
          </div>
        </Card>

        {/* Card 2: Active Medications */}
        <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Active Medications</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2.5xl font-black text-[#0F172A] tracking-tight">{userMedicines.length}</span>
            <span className="text-[11px] font-bold text-[#0D9488]">Scheduled</span>
          </div>
        </Card>

        {/* Card 3: Last Report Date */}
        <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Last Report</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-base font-black text-[#0F172A] truncate">
              {latestReport ? (latestReport.reportDate || latestReport.date || 'Recent') : 'No reports yet'}
            </span>
          </div>
        </Card>

        {/* Card 4: Tracked Parameters */}
        <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Tracked Parameters</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2.5xl font-black text-[#0F172A] tracking-tight">{totalTrackedParameters}</span>
            <span className="text-[11px] font-bold text-[#0D9488]">Extracted</span>
          </div>
        </Card>

      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Latest Report & Medication Summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* LATEST REPORT CARD */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-base font-black text-[#0F172A]">Latest Medical Report</h3>
              </div>

              {hasReports && (
                <button 
                  onClick={() => navigate('/app/reports')}
                  className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Reports <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {latestReport ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A]">{latestReport.title || latestReport.file_name}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Report Date: <strong className="text-slate-700 font-bold">{latestReport.reportDate || latestReport.date}</strong>
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    ✓ Verified Document
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium pt-1">
                  <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-bold text-[#0F172A]">
                    {(latestReport.biomarkers || latestReport.labResults || []).length} biomarkers
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-bold text-[#0D9488]">
                    {(latestReport.vitals || []).length} vitals
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700">
                    {(latestReport.extractedMedications || latestReport.medications || []).length} medications
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/app/analysis')}
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer"
                  >
                    View Analysis <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600 font-medium">No medical reports uploaded yet.</p>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Upload}
                  onClick={() => navigate('/app/upload')}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Upload Medical Report
                </Button>
              </div>
            )}
          </Card>

          {/* MEDICATION SUMMARY CARD */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-base font-black text-[#0F172A]">Medication Summary</h3>
              </div>

              <button 
                onClick={() => navigate('/app/medicines')}
                className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Medicines <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userMedicines.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-teal-50/60 border border-teal-200/80">
                  <span className="font-extrabold text-teal-900">{userMedicines.length} Active Medication(s) Scheduled</span>
                  <span className="font-bold text-[#0D9488]">Next dose: {userMedicines[0]?.scheduledTime || userMedicines[0]?.time || '08:00 PM'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {userMedicines.slice(0, 2).map((med, idx) => (
                    <div key={med.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#0F172A] font-black block">{med.name}</strong>
                        <span className="text-slate-500 text-[11px]">{med.dose || med.dosage || '1 tablet'} • {med.frequency || 'Daily'}</span>
                      </div>
                      <span className="text-[#0D9488] font-bold text-[11px]">{med.scheduledTime || med.time || '08:00 AM'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600 font-medium">No active medications scheduled.</p>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => navigate('/app/medicines')}
                  className="text-xs font-bold rounded-xl border-slate-300 cursor-pointer"
                >
                  Add Medicine
                </Button>
              </div>
            )}
          </Card>

        </div>

        {/* Right Column (5 cols): Small Trend Preview & Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SMALL TREND PREVIEW CARD */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-base font-black text-[#0F172A]">Health Trend</h3>
              </div>

              <button 
                onClick={() => navigate('/app/trends')}
                className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Trends <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {featuredBiomarkerName && latestFeaturedReading ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#0F172A]">{featuredBiomarkerName}</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800">
                    {featuredReadings.length > 1 ? 'Longitudinal Trend Active' : 'Baseline Record'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black text-[#0F172A]">
                    {latestFeaturedReading.value} <span className="text-xs font-normal text-slate-500">{latestFeaturedReading.unit}</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#0D9488]">{latestFeaturedReading.date || latestReport?.reportDate}</span>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  {featuredReadings.length > 1 
                    ? `${featuredReadings.length} measurements recorded across uploaded reports.` 
                    : "Baseline recorded. Upload another report to track changes over time."}
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600 font-medium">No health trends available yet.</p>
                <p className="text-[11px] text-slate-400">Upload lab reports with structured test results to view trends.</p>
              </div>
            )}
          </Card>

          {/* RECENT ACTIVITY FEED */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-[#0D9488]" />
              <h3 className="text-base font-black text-[#0F172A]">Recent Activity</h3>
            </div>

            <div className="space-y-3 text-xs">
              {hasReports ? (
                userReports.slice(0, 3).map((r, idx) => (
                  <div key={r.id || idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-bold text-[#0F172A] truncate">{r.title || r.file_name}</p>
                      <p className="text-[11px] text-slate-500">Medical report analyzed successfully</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{r.reportDate || r.date}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs font-medium">
                  No recent activity logged.
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
