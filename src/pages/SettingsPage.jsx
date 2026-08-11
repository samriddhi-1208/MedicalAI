import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Save, 
  ShieldCheck, 
  HeartPulse, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  LogOut, 
  Trash2, 
  Activity,
  KeyRound,
  Laptop,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const API_BASE = 'http://localhost:5000/api';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, logout, clearAllData } = useHealthData();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Female',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    bloodGroup: 'Not Known',
    city: '',
    state: '',
    country: 'India',
    occupation: '',
    phone: '',
    primaryPhysician: ''
  });

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sync profile form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        dateOfBirth: userProfile.dateOfBirth || userProfile.birthDate || '',
        gender: userProfile.gender || 'Female',
        height: userProfile.height || '',
        heightUnit: userProfile.heightUnit || 'cm',
        weight: userProfile.weight || '',
        weightUnit: userProfile.weightUnit || 'kg',
        bloodGroup: userProfile.bloodGroup || 'Not Known',
        city: userProfile.city || '',
        state: userProfile.state || '',
        country: userProfile.country || 'India',
        occupation: userProfile.occupation || '',
        phone: userProfile.phone || '',
        primaryPhysician: userProfile.primaryPhysician || userProfile.physician || ''
      });
    }
  }, [userProfile]);

  // Calculate age automatically from Date of Birth
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDateObj = new Date(dob);
    if (isNaN(birthDateObj.getTime())) return '';
    const today = new Date();
    let ageYears = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      ageYears--;
    }
    return ageYears >= 0 ? ageYears : 0;
  };

  const calculatedAge = calculateAge(profileForm.dateOfBirth);

  // Calculate Profile Completion Percentage
  const getCompletionStats = () => {
    const fields = [
      profileForm.name,
      profileForm.dateOfBirth,
      profileForm.gender,
      profileForm.height,
      profileForm.city
    ];
    const optionalFields = [
      profileForm.weight,
      profileForm.bloodGroup !== 'Not Known' ? profileForm.bloodGroup : null,
      profileForm.state,
      profileForm.occupation,
      profileForm.phone,
      profileForm.primaryPhysician
    ];

    const filledRequired = fields.filter(f => f && String(f).trim() !== '').length;
    const filledOptional = optionalFields.filter(f => f && String(f).trim() !== '').length;

    const totalWeight = (filledRequired / fields.length) * 80 + (filledOptional / optionalFields.length) * 20;
    const percentage = Math.round(totalWeight);

    return {
      percentage,
      isComplete: filledRequired === fields.length && percentage >= 80
    };
  };

  const completion = getCompletionStats();

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    if (!profileForm.city.trim()) {
      toast.error("City cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        name: profileForm.name.trim(),
        date_of_birth: profileForm.dateOfBirth,
        dateOfBirth: profileForm.dateOfBirth,
        age: calculatedAge,
        gender: profileForm.gender,
        height: profileForm.height,
        heightUnit: profileForm.heightUnit,
        weight: profileForm.weight,
        weightUnit: profileForm.weightUnit,
        bloodGroup: profileForm.bloodGroup,
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        country: profileForm.country.trim(),
        occupation: profileForm.occupation.trim(),
        phone: profileForm.phone.trim(),
        primaryPhysician: profileForm.primaryPhysician.trim(),
        profileCompleted: true
      });

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Password Complexity Validation
  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("New password must satisfy all complexity criteria.");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('medguardian_token');
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update password");
      }

      toast.success("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight">
            Patient Account Settings
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Patient: <strong className="text-[#0F172A] font-bold">{userProfile?.name || 'Patient'}</strong> • Private Healthcare Record Baseline
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-right">
            <span className="block text-[11px] text-slate-500 font-semibold">Profile Status</span>
            <strong className={`text-xs font-bold ${completion.isComplete ? 'text-emerald-700' : 'text-[#0D9488]'}`}>
              {completion.isComplete ? 'Profile complete ✓' : `Profile ${completion.percentage}% complete`}
            </strong>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0D9488]">
            {completion.isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <span>{completion.percentage}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'profile' 
              ? 'bg-[#0F172A] text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Personal & Health Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'security' 
              ? 'bg-[#0F172A] text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Security & Privacy
        </button>
      </div>

      {/* TAB 1: Personal & Health Profile */}
      {activeTab === 'profile' && (
        <Card className="p-7 space-y-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold border border-slate-200">
              <HeartPulse className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">Personal & Health Profile</h3>
              <p className="text-xs text-slate-500 font-medium">Core clinical baseline used for AI diagnostic interpretation</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5 text-xs">
            
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Patient Name"
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="med-input text-xs"
                />
              </div>
            </div>

            {/* DOB & Read-Only Calculated Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Date of Birth <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Age (Years) • Auto-calculated</label>
                <input
                  type="text"
                  readOnly
                  value={calculatedAge !== '' ? `${calculatedAge} years` : 'Select Date of Birth'}
                  className="med-input text-xs bg-slate-100 cursor-not-allowed font-bold text-slate-800"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Gender <span className="text-rose-500">*</span></label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  className="med-input text-xs"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Height & Weight with Clear Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Height (cm) <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={profileForm.height}
                    onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                    placeholder="e.g. 175"
                    className="med-input text-xs w-full"
                  />
                  <select
                    value={profileForm.heightUnit}
                    onChange={(e) => setProfileForm({ ...profileForm, heightUnit: e.target.value })}
                    className="med-input text-xs shrink-0"
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Weight (kg) (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileForm.weight}
                    onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                    placeholder="e.g. 68"
                    className="med-input text-xs w-full"
                  />
                  <select
                    value={profileForm.weightUnit}
                    onChange={(e) => setProfileForm({ ...profileForm, weightUnit: e.target.value })}
                    className="med-input text-xs shrink-0"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Blood Group & Primary Physician */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Blood Group (Optional)</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="med-input text-xs"
                >
                  <option value="Not Known">Not Known</option>
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
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Primary Physician (Optional)</label>
                <input
                  type="text"
                  value={profileForm.primaryPhysician}
                  onChange={(e) => setProfileForm({ ...profileForm, primaryPhysician: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar, MD"
                  className="med-input text-xs"
                />
              </div>
            </div>

            {/* Location Fields: City, State, Country */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-bold text-[#0F172A] mb-0">General Location</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">City <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="City Name"
                    className="med-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">State / Region (Optional)</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    placeholder="State"
                    className="med-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">Country (Optional)</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    placeholder="Country"
                    className="med-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button 
                variant="primary" 
                size="md" 
                icon={Save} 
                type="submit" 
                loading={saving}
                className="bg-[#0F172A] hover:bg-[#1E293B] rounded-xl text-xs font-semibold py-3 px-6 shadow-xs cursor-pointer"
              >
                Save Health Profile
              </Button>
            </div>

          </form>

        </Card>
      )}

      {/* TAB 2: Security & Privacy */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Change Password Card */}
          <Card className="p-7 space-y-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold border border-slate-200">
                <KeyRound className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A]">Change Account Password</h3>
                <p className="text-xs text-slate-500 font-medium">Update your security credentials</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg text-xs">
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="med-input text-xs"
                />
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters (e.g. SecureP@ss123)"
                    className="med-input text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <p className="font-bold text-[#0F172A]">Complexity Checklist:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                        1 Uppercase (A-Z)
                      </span>
                      <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                        1 Lowercase (a-z)
                      </span>
                      <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                        1 Number (0-9)
                      </span>
                      <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                        {hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                        1 Special (!@#$%)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="med-input text-xs"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={passwordLoading}
                className="bg-[#0F172A] hover:bg-[#1E293B] rounded-xl text-xs font-semibold py-2.5 px-5 cursor-pointer"
              >
                Update Password
              </Button>
            </form>
          </Card>

          {/* Active Sessions & Login Activity Card */}
          <Card className="p-7 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold border border-slate-200">
                <Laptop className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A]">Active Sessions & Login Activity</h3>
                <p className="text-xs text-slate-500 font-medium">Currently authenticated session devices</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0F172A] block text-sm">Current Web Session (Chrome / Windows)</span>
                <span className="text-slate-500 font-medium text-[11px]">Logged in as {userProfile?.email} • JWT Bearer Session</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Now
              </span>
            </div>
          </Card>

          {/* Account Actions: Logout & Reset Data */}
          <Card className="p-7 space-y-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A]">Account & Privacy Control</h3>
                <p className="text-xs text-slate-500 font-medium">Manage session logout and saved workspace records</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Button
                variant="outline"
                size="md"
                icon={LogOut}
                className="rounded-xl border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Sign Out of Account
              </Button>

              <Button
                variant="danger"
                size="md"
                icon={Trash2}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your saved reports and reset your workspace?")) {
                    clearAllData();
                    toast.success("Workspace reset cleanly!");
                  }
                }}
              >
                Delete / Reset Workspace Records
              </Button>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
