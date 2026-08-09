import React, { useState } from 'react';
import { User, Bell, Lock, Save, Download, Trash2, ShieldCheck, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SettingsPage = () => {
  const { userProfile, updateUserProfile, clearAllData } = useHealthData();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState(userProfile);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile(profileForm);
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      
      <div>
        <h2 className="text-2xl font-bold text-[#11476C]">Patient Account Settings</h2>
        <p className="text-xs font-medium text-[#64748B] mt-0.5">Manage your personal vitals, health baseline, and data privacy</p>
      </div>

      <div className="flex gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'profile' ? 'bg-[#11476C] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
          }`}
        >
          Personal Vitals & Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'security' ? 'bg-[#11476C] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
          }`}
        >
          Security & Privacy
        </button>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-7 space-y-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#77CAF3]" />
            <h3 className="text-base font-bold text-[#11476C]">Medical Baseline & Personal Vitals</h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="med-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profileForm.birthDate || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={profileForm.age || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Height (cm)</label>
                <input
                  type="text"
                  value={profileForm.height || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                  placeholder="e.g. 165 cm"
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={profileForm.weight || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                  placeholder="e.g. 58 kg"
                  className="med-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Blood Group</label>
                <select
                  value={profileForm.bloodGroup || 'O+'}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="med-input text-xs"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Primary Consulting Physician</label>
                <input
                  type="text"
                  value={profileForm.primaryPhysician || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, primaryPhysician: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar, MD"
                  className="med-input text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="md" icon={Save} type="submit" className="bg-[#11476C] hover:bg-[#0d3856] rounded-xl text-xs font-semibold py-2.5 px-5">
                Save Vitals Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-7 space-y-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
            <div>
              <h3 className="text-base font-bold text-[#11476C]">Privacy & Data Security</h3>
              <p className="text-xs font-medium text-[#64748B]">Your health data is protected with 256-bit encryption</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-xs font-medium text-[#166534]">
            🔒 Medical records and test values are encrypted at rest and never shared with third parties.
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" size="sm" icon={Download} className="rounded-xl border-[#E2E8F0] text-xs font-semibold" onClick={() => toast.success("Exporting health records JSON backup...")}>
              Export Health Records (JSON)
            </Button>

            <Button variant="danger" size="sm" icon={Trash2} className="rounded-xl bg-[#EF4444] text-xs font-semibold" onClick={clearAllData}>
              Clear All Saved Reports & Records
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
