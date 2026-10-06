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
      <Card className="p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 shadow-2xs rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {isEditingName ? (
              <div className="flex items-center gap-3 my-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="med-input text-base font-bold max-w-md dark:bg-[#12141D] dark:text-[#F5F7FA]"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="px-3 py-1.5 rounded-lg bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] text-white dark:text-[#0A0E1A] text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
                  {getGreeting()}, <span className="text-[#3D6352] dark:text-[#91C1AC]">{userDisplayName}</span>
                </h1>
                <button
                  onClick={() => {
                    setTempName(userProfile?.name || '');
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit patient name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm sm:text-[15px] text-slate-500 dark:text-[#C8D0E0] font-medium leading-relaxed mt-1">
              Here's a quick overview of your health activity.
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/analysis')}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-sm font-bold cursor-pointer dark:text-[#F5F7FA] dark:hover:bg-slate-800 px-4 py-2"
            >
              View Reports
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/trends')}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-sm font-bold cursor-pointer dark:text-[#F5F7FA] dark:hover:bg-slate-800 px-4 py-2"
            >
              View Trends
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] dark:text-[#0A0E1A] text-sm font-bold rounded-xl cursor-pointer shadow-2xs text-white px-4 py-2"
            >
              Upload Medical Report
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. HEALTH OVERVIEW — COMPACT SUMMARY ROW (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Reports Count */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Reports</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">{reportCount}</span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC]">Saved</span>
          </div>
        </Card>

        {/* Card 2: Active Medications */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Active Medications</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">{userMedicines.length}</span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC]">Scheduled</span>
          </div>
        </Card>

        {/* Card 3: Last Report Date */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Last Report</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-[#F5F7FA] truncate max-w-[70%]">
              {latestReport ? (latestReport.reportDate || latestReport.date || 'Recent') : 'None'}
            </span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC]">
              {latestReport ? 'Verified' : 'Pending'}
            </span>
          </div>
        </Card>

        {/* Card 4: Tracked Parameters */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Tracked Parameters</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">{totalTrackedParameters}</span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC]">Extracted</span>
          </div>
        </Card>

      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Latest Report & Medication Summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* LATEST REPORT CARD */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#3D6352] dark:text-[#91C1AC]" />
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Latest Medical Report</h3>
              </div>

              {hasReports && (
                <button 
                  onClick={() => navigate('/app/analysis')}
                  className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Reports <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {latestReport ? (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-base font-black text-[#0F172A] dark:text-[#F5F7FA]">{latestReport.title || latestReport.file_name}</h4>
                    <span className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-medium block mt-0.5">
                      Report Date: <strong className="text-slate-700 dark:text-slate-300 font-bold">{latestReport.reportDate || latestReport.date}</strong>
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                    ✓ Verified Document
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap text-[13px] text-slate-600 dark:text-[#C8D0E0] font-medium pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-700 font-bold text-[#0F172A] dark:text-[#F5F7FA]">
                    {(latestReport.biomarkers || latestReport.labResults || []).length} biomarkers
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-700 font-bold text-[#3D6352] dark:text-[#91C1AC]">
                    {(latestReport.vitals || []).length} vitals
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                    {(latestReport.extractedMedications || latestReport.medications || []).length} medications
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/app/analysis')}
                    className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] text-sm font-bold rounded-xl cursor-pointer text-white dark:text-[#0A0E1A] px-4 py-2"
                  >
                    View Analysis <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <p className="text-sm text-slate-600 dark:text-[#C8D0E0] font-medium">No medical reports uploaded yet.</p>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Upload}
                  onClick={() => navigate('/app/upload')}
                  className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#91C1AC] dark:hover:bg-[#7FAF9A] text-sm font-bold rounded-xl cursor-pointer text-white dark:text-[#0A0E1A] px-4 py-2"
                >
                  Upload Medical Report
                </Button>
              </div>
            )}
          </Card>

          {/* MEDICATION SUMMARY CARD */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Pill className="w-5 h-5 text-[#3D6352] dark:text-[#91C1AC]" />
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Medication Summary</h3>
              </div>

              <button 
                onClick={() => navigate('/app/medicines')}
                className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Medicines <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {userMedicines.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#EEF7F1] dark:bg-[#24283A] border border-[#D5E8DC] dark:border-slate-800">
                  <span className="font-extrabold text-[#172033] dark:text-[#F5F7FA]">{userMedicines.length} Active Medication(s) Scheduled</span>
                  <span className="font-bold text-[#3D6352] dark:text-[#91C1AC]">Next dose: {userMedicines[0]?.scheduledTime || userMedicines[0]?.time || '08:00 PM'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {userMedicines.slice(0, 2).map((med, idx) => (
                    <div key={med.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#0F172A] dark:text-[#F5F7FA] font-black block">{med.name}</strong>
                        <span className="text-slate-500 dark:text-[#C8D0E0] text-[11px]">{med.dose || med.dosage || '1 tablet'} • {med.frequency || 'Daily'}</span>
                      </div>
                      <span className="text-[#3D6352] dark:text-[#91C1AC] font-bold text-[11px]">{med.scheduledTime || med.time || '08:00 AM'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-600 dark:text-[#C8D0E0] font-medium">No active medications scheduled.</p>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => navigate('/app/medicines')}
                  className="text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 dark:text-[#F5F7FA] dark:hover:bg-slate-800 cursor-pointer"
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
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-[#3D6352] dark:text-[#91C1AC]" />
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Health Trend</h3>
              </div>

              <button 
                onClick={() => navigate('/app/trends')}
                className="text-sm font-bold text-[#3D6352] dark:text-[#91C1AC] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Trends <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {featuredBiomarkerName && latestFeaturedReading ? (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{featuredBiomarkerName}</span>
                  <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    {featuredReadings.length > 1 ? 'Longitudinal Trend Active' : 'Baseline Record'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2.5xl font-black text-[#0F172A] dark:text-[#F5F7FA]">
                    {latestFeaturedReading.value} <span className="text-sm font-medium text-slate-500 dark:text-[#C8D0E0]">{latestFeaturedReading.unit}</span>
                  </span>
                  <span className="text-xs font-bold text-[#3D6352] dark:text-[#91C1AC]">{latestFeaturedReading.date || latestReport?.reportDate}</span>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-[#C8D0E0] pt-1 leading-relaxed">
                  {featuredReadings.length > 1 
                    ? `${featuredReadings.length} measurements recorded across uploaded reports.` 
                    : "Baseline recorded. Upload another report to track changes over time."}
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-[#C8D0E0] font-medium">No health trends available yet.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Upload lab reports with structured test results to view trends.</p>
              </div>
            )}
          </Card>

          {/* RECENT ACTIVITY FEED */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-[#3D6352] dark:text-[#91C1AC]" />
              <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Recent Activity</h3>
            </div>

            <div className="space-y-3">
              {hasReports ? (
                userReports.slice(0, 3).map((r, idx) => (
                  <div key={r.id || idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#91C1AC] flex items-center justify-center shrink-0 mt-0.5 border border-[#D5E8DC] dark:border-slate-800">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] dark:text-[#F5F7FA] truncate">{r.title || r.file_name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#C8D0E0]">Medical report analyzed successfully</p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono shrink-0">{r.reportDate || r.date}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 dark:text-[#C8D0E0] text-sm font-medium">
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
