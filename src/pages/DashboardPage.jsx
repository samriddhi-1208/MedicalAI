import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Building2, 
  Pill, 
  ShieldCheck, 
  TrendingUp, 
  Edit2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  PauseCircle,
  Activity,
  Siren,
  Sparkles,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HealthMetricCard } from '../components/ui/HealthMetricCard';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { ReportCard } from '../components/ui/ReportCard';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    language, 
    userProfile, 
    updateUserProfile, 
    reports, 
    medicines,
    toggleMedicineTaken,
    loadingData,
    apiError
  } = useHealthData();

  const t = (key) => getTranslation(language, key);

  const displayName = userProfile?.name || 'Patient';
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);

  // User-specific reports array (0% Fake/Fallback Data!)
  const userReports = Array.isArray(reports) ? reports : [];
  const hasReports = userReports.length > 0;
  const latestReport = hasReports ? userReports[0] : null;
  const extractedBiomarkers = Array.isArray(latestReport?.biomarkers) ? latestReport.biomarkers : (Array.isArray(latestReport?.labResults) ? latestReport.labResults : []);

  // User-specific medicines array (0% Fake/Fallback Data!)
  const userMedicines = Array.isArray(medicines) ? medicines : [];

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
      toast.success(language === 'HI' ? "नाम अद्यतन किया गया!" : language === 'GU' ? "નામ અપડેટ થયું!" : "Patient name updated!");
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-7xl mx-auto">
      
      {/* Patient Greeting & Header Bar */}
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
                  className="px-3.5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] cursor-pointer"
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-2.5xl font-black text-[#0F172A] tracking-tight leading-snug">
                  {getGreeting()}, {displayName}
                </h1>
                <button
                  onClick={() => {
                    setTempName(displayName);
                    setIsEditingName(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                  title="Edit Patient Name"
                >
                  <Edit2 className="w-3 h-3 text-[#0D9488]" /> {t('editName')}
                </button>
              </div>
            )}
            <p className="text-xs font-medium text-slate-500">
              Here's your health overview for today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" /> {t('medguardianActive')}
            </span>
          </div>
        </div>

        {/* QUICK ACTIONS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          
          <button
            onClick={() => navigate('/app/upload')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left space-y-1 cursor-pointer transition-all hover:scale-[1.01] min-h-[60px] w-full min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] sm:text-xs font-extrabold text-[#0F172A] truncate">Upload Report</span>
                <span className="block text-[10px] font-medium text-slate-500 truncate">Analyze report</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/app/hospitals')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left space-y-1 cursor-pointer transition-all hover:scale-[1.01] min-h-[60px] w-full min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] sm:text-xs font-extrabold text-[#0F172A] truncate">Find Hospital</span>
                <span className="block text-[10px] font-medium text-slate-500 truncate">Nearby care</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/app/medicines')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left space-y-1 cursor-pointer transition-all hover:scale-[1.01] min-h-[60px] w-full min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] sm:text-xs font-extrabold text-[#0F172A] truncate">Medicines</span>
                <span className="block text-[10px] font-medium text-slate-500 truncate">Today's schedule</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/app/sos')}
            className="p-3 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/90 text-left space-y-1 cursor-pointer transition-all hover:scale-[1.01] min-h-[60px] w-full min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                <Siren className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] sm:text-xs font-extrabold text-rose-900 truncate">Emergency SOS</span>
                <span className="block text-[10px] font-medium text-rose-700 truncate">Urgent assist</span>
              </div>
            </div>
          </button>

        </div>
      </Card>

      {/* Loading State */}
      {loadingData && (
        <Card className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
          <div className="w-8 h-8 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#0F172A]">{t('loadingMedicalData')}</p>
        </Card>
      )}

      {/* API Error State */}
      {apiError && !loadingData && (
        <Card className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2 text-rose-900 text-xs">
          <AlertTriangle className="w-6 h-6 text-[#DC2626] mx-auto" />
          <p className="font-bold">{t('unableToLoadMedicalData')}</p>
        </Card>
      )}

      {/* 8. EMPTY DASHBOARD STATE FOR NEW USER (0 REPORTS) */}
      {!hasReports && !loadingData && (
        <Card className="p-8 sm:p-10 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4 max-w-2xl mx-auto my-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#0D9488] flex items-center justify-center mx-auto border border-slate-200">
            <FileText className="w-7 h-7 text-[#0D9488]" />
          </div>
          
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              Your health dashboard is ready.
            </h2>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Upload your first medical report to see personalized health metrics here.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#0F172A] hover:bg-[#1E293B] py-3 px-8 text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
            >
              Upload Medical Report
            </Button>
          </div>
        </Card>
      )}

      {/* 7. HEALTH METRICS SECTION (EXTRACTED PARAMETERS SHOWN FOR RETURNING USERS) */}
      {hasReports && !loadingData && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">Health Metrics</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Based on your most recent uploaded report ({latestReport?.title || latestReport?.fileName || 'Medical Report'} — <span className="font-bold text-slate-800">{latestReport?.date || latestReport?.report_date || 'Recent'}</span>)
              </p>
            </div>

            <button 
              onClick={() => navigate('/app/analysis')}
              className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{t('viewAllTrends')}</span> <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extractedBiomarkers.length > 0 ? (
              extractedBiomarkers.map((bm, index) => {
                const statusVal = bm.status || bm.status_flag || 'Normal';
                const isWarning = String(statusVal).toLowerCase().includes('high') || String(statusVal).toLowerCase().includes('low') || String(statusVal).toLowerCase().includes('warning') || String(statusVal).toLowerCase().includes('borderline');
                
                return (
                  <HealthMetricCard 
                    key={bm.id || index}
                    name={bm.name || bm.testName || bm.biomarker_name}
                    value={bm.value}
                    unit={bm.unit}
                    status={statusVal}
                    statusType={isWarning ? 'warning' : 'normal'}
                    statusSymbol={String(statusVal).toLowerCase().includes('high') ? '▲' : String(statusVal).toLowerCase().includes('low') ? '▼' : '✓'}
                    refRange={bm.refRange || bm.referenceRange || bm.reference_range || 'Standard'}
                    trend="stable"
                  />
                );
              })
            ) : (
              <div className="col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 font-medium text-center">
                Report parsed successfully. View full diagnostic analysis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: AI Insights + Today's Medicines Widget + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 columns: AI Insights & Today's Medicines */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Insights Card */}
          {hasReports ? (
            <AIInsightCard 
              title={t('aiInsights')}
              summary={latestReport?.aiSummary || latestReport?.clinicalSummary || t('noUploadedReports')}
              severity={extractedBiomarkers.some(b => String(b.status).toLowerCase().includes('high') || String(b.status).toLowerCase().includes('low')) ? "warning" : "normal"}
              onViewDetails={() => navigate('/app/analysis')}
            />
          ) : null}

          {/* TODAY'S MEDICINES DASHBOARD WIDGET */}
          <Card className="p-5 space-y-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Pill className="w-4.5 h-4.5 text-[#0D9488]" />
                {t('todaysMedicines')}
              </h3>

              <button
                onClick={() => navigate('/app/medicines')}
                className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {t('addMedicine')}
              </button>
            </div>

            {userMedicines.length > 0 ? (
              <div className="space-y-3">
                {userMedicines.map((med) => (
                  <div key={med.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0F172A] font-bold shrink-0">
                        <Clock className="w-4 h-4 text-[#0D9488]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-[#0F172A] text-sm">{med.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">({med.dose || med.dosage})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          🕒 {med.scheduledTime || med.time} • {med.mealRelation} ({med.mealType})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {med.isPaused ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 inline-flex items-center gap-1">
                          <PauseCircle className="w-3 h-3 text-amber-600" /> Paused
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleMedicineTaken(med.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                            med.taken 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                          }`}
                        >
                          {med.taken ? t('logged') : t('markAsTaken')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                <Pill className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">{t('noMedicineRemindersYet')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate('/app/medicines')}
                  className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {t('addMedicine')}
                </Button>
              </div>
            )}
          </Card>

        </div>

        {/* Right 5 columns: Recent Medical Reports */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0F172A]">{t('recentMedicalReports')}</h3>
            <button 
              onClick={() => navigate('/app/upload')}
              className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('uploadNew')}</span> <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {hasReports ? (
              userReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <Card className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-500 text-xs space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-normal text-slate-600">{t('noUploadedReports')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => navigate('/app/upload')}
                  className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {t('uploadReport')}
                </Button>
              </Card>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
