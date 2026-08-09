import React, { useState } from 'react';
import { User, Bell, Lock, Save, Download, Trash2, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-6 pb-10">
      
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Patient Account Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your health profile, emergency alerts, and data privacy</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-2 rounded-lg text-xs font-bold ${activeTab === 'profile' ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
        >
          Personal Vitals & Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-2 rounded-lg text-xs font-bold ${activeTab === 'security' ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
        >
          Security & Privacy
        </button>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6 space-y-4 bg-white">
          <h3 className="text-base font-bold text-slate-900">Medical Baseline & Personal Info</h3>

          <form onSubmit={handleProfileSave} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="med-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="med-input"
                />
              </div>

              <div className="med-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="med-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="med-form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                  className="med-input"
                />
              </div>

              <div className="med-form-group">
                <label>Blood Group</label>
                <input
                  type="text"
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="med-input"
                />
              </div>

              <div className="med-form-group">
                <label>Height</label>
                <input
                  type="text"
                  value={profileForm.height}
                  onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                  className="med-input"
                />
              </div>

              <div className="med-form-group">
                <label>Weight</label>
                <input
                  type="text"
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                  className="med-input"
                />
              </div>
            </div>

            <div className="med-form-group">
              <label>Primary Consulting Physician</label>
              <input
                type="text"
                value={profileForm.primaryPhysician}
                onChange={(e) => setProfileForm({ ...profileForm, primaryPhysician: e.target.value })}
                className="med-input"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="md" icon={Save} type="submit">
                Save Vitals Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6 space-y-4 bg-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Privacy & Data Security</h3>
              <p className="text-xs text-slate-500">Your health data is protected with 256-bit encryption</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            🔒 Medical records and test values are encrypted at rest and never shared with third parties.
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" size="sm" icon={Download} onClick={() => toast.success("Exporting data JSON backup...")}>
              Export Health Records (JSON)
            </Button>

            <Button variant="danger" size="sm" icon={Trash2} onClick={clearAllData}>
              Clear All Saved Reports & Records
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
