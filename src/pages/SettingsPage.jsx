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
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useHealthData();
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'notifications' | 'appearance' | 'privacy' | 'ai' | 'data' | 'help' | 'about'

  // Application Preference Toggles State
  const [notifications, setNotifications] = useState({
    medReminders: true,
    healthAlerts: true,
    reportAnalysis: true,
    emergencyNotifs: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light', // 'light' | 'dark' | 'system'
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
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'ai', label: 'AI Preferences', icon: Sparkles },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-6xl mx-auto">
      
      {/* Settings Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1A4B84] animate-pulse" />
          <span className="text-xs text-[#1A4B84] font-bold uppercase tracking-wider">Application Configuration</span>
        </div>
        <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight mt-0.5">
          Settings
        </h1>
        <p className="text-xs text-slate-500 font-normal">
          Manage your MedGuardian AI preferences, notifications, privacy, and account security
        </p>
      </div>

      {/* Desktop Layout (>= 768px): SaaS Dashboard with Left Nav Sub-tabs */}
      <div className="hidden md:grid grid-cols-12 gap-6">
        
        {/* Secondary Navigation Sidebar (4 cols) */}
        <div className="col-span-4 space-y-1">
          <Card className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#1A4B84] text-white shadow-2xs' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D90A6]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </Card>
        </div>

        {/* Settings Content Active Tab (8 cols) */}
        <div className="col-span-8">
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">Account Settings</h3>
                  <p className="text-xs text-slate-500 font-normal">Manage your account authentication and personal health identity</p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/app/profile"
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#1A4B84] bg-slate-50/60 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1A4B84] text-white flex items-center justify-center font-bold">
                        <User className="w-5 h-5 text-[#2D90A6]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#1A4B84] group-hover:text-[#2D90A6]">Personal & Health Profile</h4>
                        <p className="text-xs text-slate-500 font-medium">Manage your clinical baseline, physical stats, and emergency details</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1A4B84]" />
                  </Link>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Email & Phone</h4>
                      <p className="text-xs text-slate-500 font-medium">{userProfile?.email || 'sarah@example.com'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold border-slate-200 cursor-pointer"
                      onClick={() => toast.success("Email & phone management opened")}
                    >
                      Update
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Change Password</h4>
                      <p className="text-xs text-slate-500 font-medium">Update your account authentication password</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Lock}
                      className="rounded-xl text-xs font-semibold border-slate-200 cursor-pointer"
                      onClick={() => toast.success("Password update link sent to your email")}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">Notifications Preferences</h3>
                  <p className="text-xs text-slate-500 font-normal">Configure medication reminders and clinical alert notifications</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Medication Reminders</h4>
                      <p className="text-slate-500 font-normal">Receive push reminders for upcoming medication doses</p>
                    </div>
                    <button
                      onClick={() => toggleNotif('medReminders')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        notifications.medReminders ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications.medReminders ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Health Alerts</h4>
                      <p className="text-slate-500 font-normal">Get notified when significant health trends or lab values change</p>
                    </div>
                    <button
                      onClick={() => toggleNotif('healthAlerts')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        notifications.healthAlerts ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications.healthAlerts ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Report Analysis</h4>
                      <p className="text-slate-500 font-normal">Notify me when AI medical report analysis is completed</p>
                    </div>
                    <button
                      onClick={() => toggleNotif('reportAnalysis')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        notifications.reportAnalysis ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications.reportAnalysis ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-900">Emergency Notifications</h4>
                      <p className="text-rose-700 font-medium">Critical safety and 108 emergency notification channel</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#DC2626] text-white font-extrabold text-xs">
                      ALWAYS ON
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">Appearance Settings</h3>
                  <p className="text-xs text-slate-500 font-normal">Customize visual themes and density across MedGuardian AI</p>
                </div>

                <div className="space-y-4 text-xs">
                  <label className="block font-extrabold text-sm text-[#1A4B84]">Application Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setAppearance(prev => ({ ...prev, theme: t }))}
                        className={`p-4 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                          appearance.theme === t
                            ? 'border-[#1A4B84] bg-slate-100 text-[#1A4B84]'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 pt-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Compact Mode</h4>
                      <p className="text-slate-500 font-normal">Reduce card padding and spacing throughout the application</p>
                    </div>
                    <button
                      onClick={() => setAppearance(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        appearance.compactMode ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        appearance.compactMode ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">Privacy & Security</h3>
                  <p className="text-xs text-slate-500 font-normal">Manage location permissions, session security, and data privacy</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Browser Location Access</h4>
                      <p className="text-slate-500 font-normal">Used for finding nearby hospitals and emergency location sharing</p>
                    </div>
                    <button
                      onClick={() => togglePrivacy('locationAccess')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        privacy.locationAccess ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        privacy.locationAccess ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Two-Factor Authentication (2FA)</h4>
                      <p className="text-slate-500 font-normal">Add an extra layer of security to your clinical account</p>
                    </div>
                    <button
                      onClick={() => togglePrivacy('twoFactor')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        privacy.twoFactor ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        privacy.twoFactor ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">AI Preferences</h3>
                  <p className="text-xs text-slate-500 font-normal">Configure MedGuardian AI parsing depth and clinical explanations</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Show AI Health Insights</h4>
                      <p className="text-slate-500 font-normal">Display personalized plain-language health insights on dashboard</p>
                    </div>
                    <button
                      onClick={() => toggleAi('showInsights')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        aiPreferences.showInsights ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        aiPreferences.showInsights ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1A4B84]">Explain Medical Terms</h4>
                      <p className="text-slate-500 font-normal">Provide simpler explanations for complex clinical terms</p>
                    </div>
                    <button
                      onClick={() => toggleAi('explainTerms')}
                      className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        aiPreferences.explainTerms ? 'bg-[#1A4B84]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        aiPreferences.explainTerms ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">Data Management</h3>
                  <p className="text-xs text-slate-500 font-normal">Download your health records or manage account deletion</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => toast.success("Preparing your complete health data package for download...")}
                    className="w-full p-4 rounded-xl border border-slate-200 hover:border-[#1A4B84] bg-slate-50/60 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-[#2D90A6]" />
                      <div className="text-left">
                        <h4 className="font-extrabold text-sm text-[#1A4B84]">Download My Data</h4>
                        <p className="text-xs text-slate-500 font-medium">Export all structured health metrics and report JSONs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-[#DC2626]" />
                      <div className="text-left">
                        <h4 className="font-extrabold text-sm text-rose-900">Delete Account</h4>
                        <p className="text-xs text-rose-700 font-medium">Permanently delete your MedGuardian AI account and health data</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Help & About Tabs */}
            {(activeTab === 'help' || activeTab === 'about') && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A4B84]">{activeTab === 'help' ? 'Help & Support' : 'About MedGuardian AI'}</h3>
                  <p className="text-xs text-slate-500 font-normal">Version 1.0.0 • Clinical AI Healthcare Engine</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <p><strong>MedGuardian AI Version 1.0.0</strong></p>
                  <p className="text-slate-500">Designed and built with modern clinical UX standards.</p>
                  <div className="pt-2 flex gap-4 text-[#2D90A6] font-bold">
                    <a href="#privacy" className="hover:underline">Privacy Policy</a>
                    <a href="#terms" className="hover:underline">Terms of Service</a>
                    <a href="#disclaimer" className="hover:underline">Medical Disclaimer</a>
                  </div>
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">ACCOUNT</span>
          <Card className="p-2 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <Link
              to="/app/profile"
              className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 text-xs font-extrabold text-[#1A4B84]"
            >
              <span className="flex items-center gap-3">
                <User className="w-4.5 h-4.5 text-[#2D90A6]" /> Personal & Health Profile
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </Card>
        </div>

        {/* PREFERENCES */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">PREFERENCES</span>
          <Card className="p-2 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('notifications')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 text-xs font-extrabold text-[#1A4B84] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4.5 h-4.5 text-[#2D90A6]" /> Notifications
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 text-xs font-extrabold text-[#1A4B84] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sun className="w-4.5 h-4.5 text-[#2D90A6]" /> Appearance
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 text-xs font-extrabold text-[#1A4B84] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4.5 h-4.5 text-[#2D90A6]" /> AI Preferences
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </Card>
        </div>

        {/* PRIVACY & SECURITY */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">PRIVACY & SECURITY</span>
          <Card className="p-2 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('privacy')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 text-xs font-extrabold text-[#1A4B84] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <ShieldCheck className="w-4.5 h-4.5 text-[#2D90A6]" /> Location & Privacy
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 text-xs font-extrabold text-[#1A4B84] cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Database className="w-4.5 h-4.5 text-[#2D90A6]" /> Data Management
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </Card>
        </div>

      </div>

      {/* Account Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account?"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-rose-900">
            <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
            <p className="font-bold">This action is permanent and cannot be undone.</p>
            <p className="text-xs text-rose-700 font-normal">All your stored medical reports, structured vitals, and emergency profiles will be permanently erased.</p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="sos"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(false);
                toast.error("Account deletion requested.");
              }}
              className="rounded-xl text-xs font-extrabold bg-[#DC2626] cursor-pointer"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
