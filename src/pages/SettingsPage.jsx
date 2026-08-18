import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Siren, 
  Check, 
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Modal } from '../components/ui/Modal';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { userProfile, language, setAppLanguage, logout } = useHealthData();
  const t = (key) => getTranslation(language, key);

  // Preference Toggles State
  const [notifications, setNotifications] = useState({
    medReminders: true,
    healthAlerts: true,
    reportAnalysis: true,
    emergencyNotifs: true
  });

  const [privacy, setPrivacy] = useState({
    locationAccess: true,
    twoFactor: false
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const toggleNotif = (key) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Notification setting updated");
      return next;
    });
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Privacy setting updated");
      return next;
    });
  };

  const handleDeleteAccount = () => {
    setDeleteModalOpen(false);
    toast.error("Account data session cleared.");
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-[#0F172A] max-w-4xl mx-auto w-full min-w-0">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">
          Application Settings
        </h1>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Manage your account preferences, notification alerts, language choices, and privacy controls.
        </p>
      </div>

      <div className="space-y-5">
        
        {/* Section 1: Account Overview */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-[#0D9488]" /> Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Signed In User</span>
              <strong className="text-[#0F172A] font-bold text-sm">{userProfile?.name || 'Patient'}</strong>
            </div>

            <div>
              <span className="text-slate-500 block font-medium">Registered Email</span>
              <strong className="text-slate-800 font-semibold">{userProfile?.email || 'patient@medguardian.ai'}</strong>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/app/profile')}
              className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Edit Health Profile
            </button>
          </div>
        </div>

        {/* Section 2: Language Preferences */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-[#0D9488]" /> Language Selection
          </h2>

          <p className="text-xs text-slate-600 font-normal">
            Choose your preferred language for the MedGuardian interface and report output text:
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <button
              onClick={() => { setAppLanguage('EN'); toast.success("Language set to English"); }}
              className={`px-4 py-2 rounded-md font-semibold cursor-pointer border ${
                language === 'EN'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              English (EN)
            </button>

            <button
              onClick={() => { setAppLanguage('HI'); toast.success("भाषा: हिंदी (Hindi)"); }}
              className={`px-4 py-2 rounded-md font-semibold cursor-pointer border ${
                language === 'HI'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              हिंदी (Hindi)
            </button>

            <button
              onClick={() => { setAppLanguage('GU'); toast.success("ભાષા: ગુજરાતી (Gujarati)"); }}
              className={`px-4 py-2 rounded-md font-semibold cursor-pointer border ${
                language === 'GU'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ગુજરાતી (Gujarati)
            </button>
          </div>
        </div>

        {/* Section 3: Notification Alerts */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bell className="w-4 h-4 text-[#0D9488]" /> Medication Reminders & Notification Alerts
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A] block">Medication Due Reminders</span>
                <span className="text-slate-500">Receive timely browser notifications when scheduled doses are due.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.medReminders}
                onChange={() => toggleNotif('medReminders')}
                className="w-4 h-4 text-[#0F172A] rounded border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A] block">Critical Lab Alert Notifications</span>
                <span className="text-slate-500">Get flagged alerts when uploaded lab reports contain out-of-range parameters.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.healthAlerts}
                onChange={() => toggleNotif('healthAlerts')}
                className="w-4 h-4 text-[#0F172A] rounded border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A] block">Emergency SOS Contacts Alerting</span>
                <span className="text-slate-500">Allow 1-click dispatch to alert your registered emergency contacts with GPS location.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.emergencyNotifs}
                onChange={() => toggleNotif('emergencyNotifs')}
                className="w-4 h-4 text-[#0F172A] rounded border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Privacy & Security */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-2">
            <Lock className="w-4 h-4 text-[#0D9488]" /> Privacy & Security Controls
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A] block">Browser Location Access</span>
                <span className="text-slate-500">Allow browser GPS access to locate nearby emergency hospitals.</span>
              </div>
              <input
                type="checkbox"
                checked={privacy.locationAccess}
                onChange={() => togglePrivacy('locationAccess')}
                className="w-4 h-4 text-[#0F172A] rounded border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Account Danger Zone */}
        <div className="bg-white border border-red-200 rounded-lg p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-red-900 flex items-center gap-2 border-b border-red-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Danger Zone
          </h2>

          <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
            <div>
              <span className="font-bold text-red-900 block">Sign Out & Clear Session</span>
              <span className="text-slate-500">End your current session on this device.</span>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer"
            >
              Sign Out Session
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 font-normal">
            Are you sure you want to sign out of your MedGuardian account session?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
