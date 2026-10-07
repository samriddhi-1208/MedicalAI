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
  FileCheck,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { formatDisplayName } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    updateUserProfile, 
    reports, 
    medicines, 
    emergencyContacts,
    notifyEmergencyContact,
    notifyAllEmergencyContacts,
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

  // Emergency Contacts Notification State
  const [contactToNotify, setContactToNotify] = useState(null);
  const [showNotifyAllModal, setShowNotifyAllModal] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  const getContactPriorityBadge = (c) => {
    if (c.priority) return c.priority;
    if (c.contactType) return c.contactType;
    if (c.is_primary || c.isPrimary) return 'Primary Contact';
    const rel = (c.relation || '').trim();
    if (rel) {
      if (/family/i.test(rel)) return 'Family Contact';
      if (/neighbor/i.test(rel)) return 'Nearby Contact';
      if (/physician|doctor|hospital/i.test(rel)) return 'Medical Contact';
      if (/friend/i.test(rel)) return 'Friend Contact';
      return `${rel} Contact`;
    }
    return 'Emergency Contact';
  };

  const getAvailableCoords = () => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return resolve(null);
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
      );
    });
  };

  const handleConfirmNotifySingle = async () => {
    if (!contactToNotify) return;
    setIsNotifying(true);
    setNotificationStatus(null);
    try {
      const coords = await getAvailableCoords();
      const res = await notifyEmergencyContact(contactToNotify.id || contactToNotify._id, coords);
      if (res && res.success) {
        setNotificationStatus({
          type: 'success',
          message: 'Emergency contact notified successfully.'
        });
      } else {
        setNotificationStatus({
          type: 'error',
          message: res?.error || 'Unable to notify contact. Please try again or contact them directly.'
        });
      }
    } catch {
      setNotificationStatus({
        type: 'error',
        message: 'Unable to notify contact. Please try again or contact them directly.'
      });
    } finally {
      setIsNotifying(false);
      setContactToNotify(null);
    }
  };

  const handleConfirmNotifyAll = async () => {
    setIsNotifying(true);
    setNotificationStatus(null);
    try {
      const coords = await getAvailableCoords();
      const res = await notifyAllEmergencyContacts(coords);
      if (res && res.success) {
        if (res.partial) {
          setNotificationStatus({
            type: 'partial',
            message: res.message || 'Not all contacts were notified.'
          });
        } else {
          setNotificationStatus({
            type: 'success',
            message: 'All emergency contacts have been notified.'
          });
        }
      } else {
        setNotificationStatus({
          type: 'error',
          message: res?.error || 'Unable to notify contact. Please try again or contact them directly.'
        });
      }
    } catch {
      setNotificationStatus({
        type: 'error',
        message: 'Unable to notify contact. Please try again or contact them directly.'
      });
    } finally {
      setIsNotifying(false);
      setShowNotifyAllModal(false);
    }
  };

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
                  className="px-3 py-1.5 rounded-lg bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#6B9B85] dark:hover:bg-[#568570] text-white dark:text-[#0A0E1A] text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
                  {getGreeting()}, <span className="text-[#3D6352] dark:text-[#6B9B85]">{userDisplayName}</span>
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
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#6B9B85] dark:hover:bg-[#568570] dark:text-[#0A0E1A] text-sm font-bold rounded-xl cursor-pointer shadow-2xs text-white px-4 py-2"
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
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85]">Saved</span>
          </div>
        </Card>

        {/* Card 2: Active Medications */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Active Medications</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">{userMedicines.length}</span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85]">Scheduled</span>
          </div>
        </Card>

        {/* Card 3: Last Report Date */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Last Report</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-[#F5F7FA] truncate max-w-[70%]">
              {latestReport ? (latestReport.reportDate || latestReport.date || 'Recent') : 'None'}
            </span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85]">
              {latestReport ? 'Verified' : 'Pending'}
            </span>
          </div>
        </Card>

        {/* Card 4: Tracked Parameters */}
        <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[140px]">
          <span className="text-[13px] sm:text-sm font-extrabold text-slate-500 dark:text-[#C8D0E0] block uppercase tracking-[0.04em]">Tracked Parameters</span>
          <div className="flex items-baseline justify-between pt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">{totalTrackedParameters}</span>
            <span className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85]">Extracted</span>
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
                <FileText className="w-5 h-5 text-[#3D6352] dark:text-[#6B9B85]" />
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Latest Medical Report</h3>
              </div>

              {hasReports && (
                <button 
                  onClick={() => navigate('/app/analysis')}
                  className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85] hover:underline flex items-center gap-1 cursor-pointer"
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
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-700 font-bold text-[#3D6352] dark:text-[#6B9B85]">
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
                    className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#6B9B85] dark:hover:bg-[#568570] text-sm font-bold rounded-xl cursor-pointer text-white dark:text-[#0A0E1A] px-4 py-2"
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
                  className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#6B9B85] dark:hover:bg-[#568570] text-sm font-bold rounded-xl cursor-pointer text-white dark:text-[#0A0E1A] px-4 py-2"
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
                <Pill className="w-5 h-5 text-[#3D6352] dark:text-[#6B9B85]" />
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Medication Summary</h3>
              </div>

              <button 
                onClick={() => navigate('/app/medicines')}
                className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Medicines <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {userMedicines.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#EEF7F1] dark:bg-[#24283A] border border-[#D5E8DC] dark:border-slate-800">
                  <span className="font-extrabold text-[#172033] dark:text-[#F5F7FA]">{userMedicines.length} Active Medication(s) Scheduled</span>
                  <span className="font-bold text-[#3D6352] dark:text-[#6B9B85]">Next dose: {userMedicines[0]?.scheduledTime || userMedicines[0]?.time || '08:00 PM'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {userMedicines.slice(0, 2).map((med, idx) => (
                    <div key={med.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#0F172A] dark:text-[#F5F7FA] font-black block">{med.name}</strong>
                        <span className="text-slate-500 dark:text-[#C8D0E0] text-[11px]">{med.dose || med.dosage || '1 tablet'} • {med.frequency || 'Daily'}</span>
                      </div>
                      <span className="text-[#3D6352] dark:text-[#6B9B85] font-bold text-[11px]">{med.scheduledTime || med.time || '08:00 AM'}</span>
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

          {/* EMERGENCY CONTACTS CARD */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-[#3D6352] dark:text-[#6B9B85]" />
                  <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Emergency Contacts</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#C8D0E0] mt-0.5">
                  People who can help you during an emergency.
                </p>
              </div>

              {emergencyContacts && emergencyContacts.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNotifyAllModal(true)}
                  disabled={isNotifying}
                  className="text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 text-[#3D6352] dark:text-[#6B9B85] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  Notify All Emergency Contacts
                </Button>
              )}
            </div>

            {notificationStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 ${
                  notificationStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : notificationStatus.type === 'partial'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}
              >
                <span>{notificationStatus.message}</span>
                <button
                  type="button"
                  onClick={() => setNotificationStatus(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-black cursor-pointer px-1"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            )}

            {emergencyContacts && emergencyContacts.length > 0 ? (
              <div className="space-y-2.5">
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={contact.id || contact._id || idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-black text-[#0F172A] dark:text-[#F5F7FA] truncate">
                          {contact.name}
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#6B9B85] border border-[#D5E8DC] dark:border-slate-700">
                          {getContactPriorityBadge(contact)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#C8D0E0] flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{contact.relation || 'Emergency Contact'}</span>
                        <span>•</span>
                        <span className="font-mono">{contact.phone}</span>
                        {contact.email && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{contact.email}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setContactToNotify(contact)}
                      disabled={isNotifying}
                      className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#6B9B85] dark:hover:bg-[#568570] text-xs font-bold rounded-xl cursor-pointer text-white dark:text-[#0A0E1A] px-3.5 py-1.5 shrink-0 self-start sm:self-auto"
                    >
                      Notify
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-600 dark:text-[#C8D0E0] font-medium">No emergency contacts saved yet.</p>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => navigate('/app/emergency')}
                  className="text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 dark:text-[#F5F7FA] dark:hover:bg-slate-800 cursor-pointer"
                >
                  Add Emergency Contact
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
                <TrendingUp className="w-5 h-5 text-[#3D6352] dark:text-[#6B9B85]" />
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Health Trend</h3>
              </div>

              <button 
                onClick={() => navigate('/app/trends')}
                className="text-sm font-bold text-[#3D6352] dark:text-[#6B9B85] hover:underline flex items-center gap-1 cursor-pointer"
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
                  <span className="text-xs font-bold text-[#3D6352] dark:text-[#6B9B85]">{latestFeaturedReading.date || latestReport?.reportDate}</span>
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
              <Activity className="w-5 h-5 text-[#3D6352] dark:text-[#6B9B85]" />
              <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F5F7FA]">Recent Activity</h3>
            </div>

            <div className="space-y-3">
              {hasReports ? (
                userReports.slice(0, 3).map((r, idx) => (
                  <div key={r.id || idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF7F1] dark:bg-[#24283A] text-[#3D6352] dark:text-[#6B9B85] flex items-center justify-center shrink-0 mt-0.5 border border-[#D5E8DC] dark:border-slate-800">
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

      {/* CONFIRM NOTIFY SINGLE CONTACT MODAL */}
      <Modal
        isOpen={Boolean(contactToNotify)}
        onClose={() => !isNotifying && setContactToNotify(null)}
        title="Notify Emergency Contact"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-sm text-slate-700 dark:text-[#C8D0E0]">
            Are you sure you want to notify <strong>{contactToNotify?.name}</strong>?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Relationship:</span>
              <strong className="text-slate-800 dark:text-slate-200">{contactToNotify?.relation || 'Emergency Contact'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Priority / Type:</span>
              <strong className="text-[#3D6352] dark:text-[#6B9B85]">{contactToNotify ? getContactPriorityBadge(contactToNotify) : ''}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Phone:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono">{contactToNotify?.phone}</strong>
            </div>
            {contactToNotify?.email && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <strong className="text-slate-800 dark:text-slate-200">{contactToNotify.email}</strong>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContactToNotify(null)}
              disabled={isNotifying}
              className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmNotifySingle}
              disabled={isNotifying}
              className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#6B9B85] dark:hover:bg-[#568570] text-white dark:text-[#0A0E1A] rounded-xl text-xs font-bold cursor-pointer"
            >
              {isNotifying ? 'Notifying...' : 'Notify Contact'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM NOTIFY ALL CONTACTS MODAL */}
      <Modal
        isOpen={showNotifyAllModal}
        onClose={() => !isNotifying && setShowNotifyAllModal(false)}
        title="Notify All Emergency Contacts"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-sm text-slate-700 dark:text-[#C8D0E0]">
            Are you sure you want to notify all your emergency contacts?
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This will send an emergency alert notification to all {emergencyContacts?.length || 0} emergency contacts configured for your profile.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifyAllModal(false)}
              disabled={isNotifying}
              className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmNotifyAll}
              disabled={isNotifying}
              className="bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#6B9B85] dark:hover:bg-[#568570] text-white dark:text-[#0A0E1A] rounded-xl text-xs font-bold cursor-pointer"
            >
              {isNotifying ? 'Notifying All...' : 'Notify All'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
