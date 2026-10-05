import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  HelpCircle, 
  Info,
  ChevronRight,
  Lock,
  Compass,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { userProfile, language, setLanguage } = useHealthData();
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'notifications' | 'appearance' | 'privacy' | 'ai' | 'data' | 'help' | 'about'

  const t = (key) => getTranslation(language, key);

  // Application Preference Toggles State
  const [notifications, setNotifications] = useState({
    medReminders: true,
    healthAlerts: true,
    reportAnalysis: true,
    emergencyNotifs: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false
  });

  const [privacy, setPrivacy] = useState({
    locationAccess: true,
    twoFactor: false,
    aiDataShare: true
  });

  const [aiPreferences, setAiPreferences] = useState({
    showInsights: true,
    explainTerms: true,
    trendNotifs: true
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const toggleNotif = (key) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Notification preferences updated");
      return next;
    });
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Privacy preference updated");
      return next;
    });
  };

  const toggleAi = (key) => {
    setAiPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("AI preferences updated");
      return next;
    });
  };

  const navItems = [
    { id: 'account', label: t('account'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'appearance', label: t('appearance'), icon: Sun },
    { id: 'privacy', label: t('privacySecurity'), icon: ShieldCheck },
    { id: 'ai', label: t('aiPreferences'), icon: Sparkles },
    { id: 'data', label: t('dataManagement'), icon: Database },
    { id: 'help', label: t('helpSupport'), icon: HelpCircle },
    { id: 'about', label: t('about'), icon: Info }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans antialiased max-w-6xl mx-auto">
      
      {/* Settings Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#66729F] dark:bg-[#7C87B8] animate-pulse" />
          <span className="text-xs sm:text-[13px] text-[#66729F] dark:text-[#9DA8D0] font-black uppercase tracking-[0.04em]">
            {language === 'HI' ? 'एप्लिकेशन कॉन्फ़िगरेशन' : language === 'GU' ? 'એપ્લિકેશન કોન્ફિગરેશન' : 'APPLICATION CONFIGURATION'}
          </span>
        </div>
        <h1 className="text-2.5xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F5F7FA] tracking-tight mt-1">
          {t('applicationSettings')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-1.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Language Selector Banner */}
      <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EEF1FA] dark:bg-[#2C3146] text-[#66729F] dark:text-[#9DA8D0] flex items-center justify-center shrink-0">
            <Globe className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="font-black text-base text-[#0F172A] dark:text-[#F5F7FA]">{t('languageSelection')}</h4>
            <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-0.5">{t('selectAppLanguage')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setLanguage('EN');
              toast.success("Switched to English");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              language === 'EN'
                ? 'bg-[#66729F] dark:bg-[#7C87B8] text-white dark:text-[#172033] shadow-2xs'
                : 'bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('english')}
          </button>

          <button
            onClick={() => {
              setLanguage('HI');
              toast.success("भाषा बदलकर हिंदी की गई");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              language === 'HI'
                ? 'bg-[#66729F] dark:bg-[#7C87B8] text-white dark:text-[#172033] shadow-2xs'
                : 'bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('hindi')}
          </button>

          <button
            onClick={() => {
              setLanguage('GU');
              toast.success("ભાષા બદલીને ગુજરાતી કરવામાં આવી");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              language === 'GU'
                ? 'bg-[#66729F] dark:bg-[#7C87B8] text-white dark:text-[#172033] shadow-2xs'
                : 'bg-slate-100 dark:bg-[#25293C] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('gujarati')}
          </button>
        </div>
      </Card>

      {/* Desktop Layout (>= 768px): SaaS Dashboard with Left Nav Sub-tabs */}
      <div className="hidden md:grid grid-cols-12 gap-6">
        
        {/* Secondary Navigation Sidebar (4 cols) */}
        <div className="col-span-4 space-y-1">
          <Card className="p-3 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#66729F] dark:bg-[#7C87B8] text-white dark:text-[#172033] shadow-2xs' 
                      : 'text-slate-700 dark:text-[#C8D0E0] hover:bg-slate-100 dark:hover:bg-[#25293C]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-[#172033]' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-[#172033]' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </Card>
        </div>

        {/* Settings Content Active Tab (8 cols) */}
        <div className="col-span-8">
          <Card className="p-5 sm:p-6 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-6">
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <h3 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-[#F5F7FA]">{t('accountSettings')}</h3>
                  <p className="text-sm text-slate-500 dark:text-[#C8D0E0] font-medium mt-1">{t('manageAccountSubtitle')}</p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/app/profile"
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#66729F] bg-slate-50/60 dark:bg-[#151824] flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#66729F] dark:bg-[#7C87B8] text-white dark:text-[#172033] flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA] group-hover:text-[#66729F] dark:group-hover:text-[#9DA8D0]">{t('personalHealthProfile')}</h4>
                        <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">{t('personalHealthSubtitle')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#66729F]" />
                  </Link>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#151824] flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">{t('emailPhone')}</h4>
                      <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">{userProfile?.email || 'patient@example.com'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-[13px] font-semibold border-slate-200 dark:border-slate-700 cursor-pointer"
                      onClick={() => toast.success("Email & phone management opened")}
                    >
                      {t('update')}
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#151824] flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">{t('changePassword')}</h4>
                      <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">Update your account authentication password</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Lock}
                      className="rounded-xl text-[13px] font-semibold border-slate-200 dark:border-slate-700 cursor-pointer"
                      onClick={() => toast.success("Password update link sent to your email")}
                    >
                      {t('change')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{t('notifications')}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-normal">Configure medication reminders and clinical alert notifications</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">Medication Reminders</h4>
                      <p className="text-slate-500 dark:text-[#C8D0E0] font-normal text-xs">Receive push reminders for upcoming medication doses</p>
                    </div>
                    <button
                      onClick={() => toggleNotif('medReminders')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        notifications.medReminders ? 'bg-[#66729F] dark:bg-[#7C87B8]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications.medReminders ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FDF2F4] dark:bg-[#3A2028] border border-[#F0B8BF] dark:border-[#A83D49]">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#C94B55] dark:text-[#F3C6CB]">Emergency Notifications</h4>
                      <p className="text-[#A83D49] dark:text-[#F3C6CB]/80 font-medium text-xs">Critical safety and 108 emergency notification channel</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#C94B55] text-white font-extrabold text-[13px]">
                      ALWAYS ON
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{t('appearance')}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-normal">Customize visual themes and density across MedGuardian AI</p>
                </div>

                <div className="space-y-4 text-xs">
                  <label className="block font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">Application Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((th) => (
                      <button
                        key={th}
                        onClick={() => setAppearance(prev => ({ ...prev, theme: th }))}
                        className={`p-4 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer text-[13px] ${
                          appearance.theme === th
                            ? 'border-[#66729F] dark:border-[#7C87B8] bg-[#EEF1FA] dark:bg-[#25293C] text-[#66729F] dark:text-[#9DA8D0]'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C1F2E] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#25293C]'
                        }`}
                      >
                        {th}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{t('privacySecurity')}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-normal">Manage location permissions, session security, and data privacy</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">Browser Location Access</h4>
                      <p className="text-slate-500 dark:text-[#C8D0E0] font-normal text-xs">Used for finding nearby hospitals and emergency location sharing</p>
                    </div>
                    <button
                      onClick={() => togglePrivacy('locationAccess')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        privacy.locationAccess ? 'bg-[#66729F] dark:bg-[#7C87B8]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        privacy.locationAccess ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{t('aiPreferences')}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-normal">Configure MedGuardian AI parsing depth and clinical explanations</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">Show AI Health Insights</h4>
                      <p className="text-slate-500 dark:text-[#C8D0E0] font-normal text-xs">Display personalized plain-language health insights on dashboard</p>
                    </div>
                    <button
                      onClick={() => toggleAi('showInsights')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        aiPreferences.showInsights ? 'bg-[#66729F] dark:bg-[#7C87B8]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        aiPreferences.showInsights ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{t('dataManagement')}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-normal">Download your health records or manage account deletion</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => toast.success("Preparing your complete health data package for download...")}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#66729F] dark:hover:border-[#7C87B8] bg-slate-50/60 dark:bg-[#151824] flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-[#66729F] dark:text-[#9DA8D0]" />
                      <div className="text-left">
                        <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F5F7FA]">Download My Data</h4>
                        <p className="text-xs text-slate-500 dark:text-[#C8D0E0] font-medium">Export all structured health metrics and report JSONs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#66729F]" />
                  </button>
                </div>
              </div>
            )}

            {/* Help & About Tabs */}
            {(activeTab === 'help' || activeTab === 'about') && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">{activeTab === 'help' ? t('helpSupport') : t('about')}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-[#C8D0E0] font-normal">Version 1.0.0 • Clinical AI Healthcare Engine</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-slate-800 space-y-2 text-[13px] text-slate-700 dark:text-[#C8D0E0]">
                  <p><strong className="text-[#0F172A] dark:text-[#F5F7FA]">MedGuardian AI Version 1.0.0</strong></p>
                  <p className="text-slate-500 dark:text-[#C8D0E0]">Designed and built with modern clinical UX standards.</p>
                </div>
              </div>
            )}

          </Card>
        </div>

      </div>

      {/* Mobile Layout (< 768px): Native App Categorized List */}
      <div className="md:hidden space-y-6">
        
        {/* ACCOUNT */}
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">{t('account')}</span>
          <Card className="p-2 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
            <Link
              to="/app/profile"
              className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#25293C] text-[13px] font-extrabold text-[#0F172A] dark:text-[#F5F7FA]"
            >
              <span className="flex items-center gap-3">
                <User className="w-4.5 h-4.5 text-[#66729F] dark:text-[#9DA8D0]" /> {t('personalHealthProfile')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </Card>
        </div>

        {/* PREFERENCES */}
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">PREFERENCES</span>
          <Card className="p-2 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('notifications')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#25293C] text-[13px] font-extrabold text-[#0F172A] dark:text-[#F5F7FA] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4.5 h-4.5 text-[#66729F] dark:text-[#9DA8D0]" /> {t('notifications')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#25293C] text-[13px] font-extrabold text-[#0F172A] dark:text-[#F5F7FA] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sun className="w-4.5 h-4.5 text-[#66729F] dark:text-[#9DA8D0]" /> {t('appearance')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#25293C] text-[13px] font-extrabold text-[#0F172A] dark:text-[#F5F7FA] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4.5 h-4.5 text-[#66729F] dark:text-[#9DA8D0]" /> {t('aiPreferences')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </Card>
        </div>

        {/* PRIVACY & SECURITY */}
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">{t('privacySecurity')}</span>
          <Card className="p-2 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('privacy')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#25293C] text-[13px] font-extrabold text-[#0F172A] dark:text-[#F5F7FA] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <ShieldCheck className="w-4.5 h-4.5 text-[#66729F] dark:text-[#9DA8D0]" /> {t('privacySecurity')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#25293C] text-[13px] font-extrabold text-[#0F172A] dark:text-[#F5F7FA] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Database className="w-4.5 h-4.5 text-[#66729F] dark:text-[#9DA8D0]" /> {t('dataManagement')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </Card>
        </div>

      </div>

    </div>
  );
};
