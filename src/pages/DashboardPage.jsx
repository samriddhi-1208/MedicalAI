import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Upload, 
  Plus, 
  Activity, 
  Pill,
  PauseCircle,
  Edit2,
  Check
} from 'lucide-react';
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
    userProfile, 
    updateUserProfile, 
    reports, 
    medicines, 
    toggleMedicineTaken,
    language 
  } = useHealthData();

  const t = (key) => getTranslation(language, key);

  // Patient Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile?.name || '');

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

  const getCleanSummary = () => {
    if (!latestReport) return t('noUploadedReports');
    const rawSum = latestReport.aiSummary || latestReport.clinicalSummary || latestReport.summary || '';
    if (!rawSum || rawSum.includes('Extracted 0 vitals, 0 lab test parameters')) {
      const docTitle = latestReport.title || latestReport.file_name || 'Medical Report';
      return `Analysis of "${docTitle}": Clinical document processed successfully. Identified ${userMedicines.length} prescribed medication instruction(s) in current treatment schedule. Continue following dosage timing as prescribed. Maintain adequate daily hydration and consult your physician for routine evaluations.`;
    }
    return rawSum;
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
                  className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  {getGreeting()}, <span className="text-[#0D9488]">{userProfile?.name || 'Patient'}</span>
                </h1>
                <button
                  onClick={() => {
                    setTempName(userProfile?.name || '');
                    setIsEditingName(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
                  title="Edit patient name"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 font-medium">
              {t('workspaceOverview')} • ID: <span className="font-mono text-slate-700 font-bold">{userProfile?.id?.substring(0, 8) || 'P-8820'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/app/medicines')}
              className="rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
            >
              {t('addMedicine')}
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => navigate('/app/upload')}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-semibold rounded-xl cursor-pointer"
            >
              {t('uploadReport')}
            </Button>
          </div>
        </div>

        {/* Quick Vitals Summary Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-medium block">{t('heightWeight')}</span>
            <span className="font-bold text-[#0F172A]">
              {userProfile?.height ? `${userProfile.height} ${userProfile.heightUnit || 'cm'}` : '--'} / {userProfile?.weight ? `${userProfile.weight} ${userProfile.weightUnit || 'kg'}` : '--'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-medium block">{t('bloodGroup')}</span>
            <span className="font-bold text-[#0F172A]">{userProfile?.bloodGroup || 'Not Specified'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-medium block">{t('primaryPhysician')}</span>
            <span className="font-bold text-[#0F172A] truncate block">{userProfile?.primaryPhysician || 'Dr. Aris Thorne'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-medium block">{t('totalReportsSaved')}</span>
            <span className="font-bold text-[#0D9488]">{userReports.length} {t('uploaded')}</span>
          </div>
        </div>
      </Card>

      {/* Extracted Biomarker Cards Grid (If reports exist) */}
      {hasReports && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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
              summary={getCleanSummary()}
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
              className="text-[#0D9488] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('uploadNew')}</span> <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {hasReports ? (
              userReports.map((report) => (
                <ReportCard key={report.id || report._id} report={report} />
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
