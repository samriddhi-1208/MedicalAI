import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Heart, 
  Siren, 
  Save, 
  Edit2, 
  Calendar, 
  Phone, 
  Building2, 
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';

export const ProfilePage = () => {
  const { userProfile, updateUserProfile, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    dob: userProfile?.dob || '',
    gender: userProfile?.gender || 'Female',
    height: userProfile?.height || '',
    heightUnit: userProfile?.heightUnit || 'cm',
    weight: userProfile?.weight || '',
    weightUnit: userProfile?.weightUnit || 'kg',
    bloodGroup: userProfile?.bloodGroup || 'Not Known',
    primaryPhysician: userProfile?.primaryPhysician || '',
    city: userProfile?.city || '',
    state: userProfile?.state || '',
    country: userProfile?.country || 'India',
    occupation: userProfile?.occupation || '',
    allergies: userProfile?.allergies || '',
    existingConditions: userProfile?.existingConditions || '',
    emergencyContact: userProfile?.emergencyContact || '',
    emergencyPhone: userProfile?.emergencyPhone || '',
    emergencyRelation: userProfile?.emergencyRelation || ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || prev.name,
        email: userProfile.email || prev.email,
        phone: userProfile.phone || prev.phone,
        dob: userProfile.dob || prev.dob,
        gender: userProfile.gender || prev.gender,
        height: userProfile.height || prev.height,
        heightUnit: userProfile.heightUnit || prev.heightUnit,
        weight: userProfile.weight || prev.weight,
        weightUnit: userProfile.weightUnit || prev.weightUnit,
        bloodGroup: userProfile.bloodGroup || prev.bloodGroup,
        primaryPhysician: userProfile.primaryPhysician || prev.primaryPhysician,
        city: userProfile.city || prev.city,
        state: userProfile.state || prev.state,
        country: userProfile.country || prev.country,
        occupation: userProfile.occupation || prev.occupation,
        allergies: userProfile.allergies || prev.allergies,
        existingConditions: userProfile.existingConditions || prev.existingConditions,
        emergencyContact: userProfile.emergencyContact || prev.emergencyContact,
        emergencyPhone: userProfile.emergencyPhone || prev.emergencyPhone,
        emergencyRelation: userProfile.emergencyRelation || prev.emergencyRelation
      }));
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const calculatedAge = calculateAge(formData.dob) || userProfile?.age || 0;
      await updateUserProfile({
        ...formData,
        age: calculatedAge
      });
      toast.success("✓ Profile information saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const computedAge = calculateAge(formData.dob) || userProfile?.age || 'Not Specified';

  return (
    <div className="space-y-6 pb-12 font-sans text-[#0F172A] max-w-4xl mx-auto w-full min-w-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">
            Personal Health Profile
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Manage your personal details, physical attributes, and emergency preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Save className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#0D9488]" /> Personal Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Samriddhi Tiwari"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="med-input bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age (Calculated)</label>
              <input
                type="text"
                value={computedAge ? `${computedAge} yrs` : 'Not Specified'}
                disabled
                className="med-input bg-slate-50 text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="med-input"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Profession / Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Software Engineer / Student"
                className="med-input"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Physical Attributes & Vitals */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#0D9488]" /> Health Vitals & Attributes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="165"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="60"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="med-input"
              >
                <option value="Not Known">Not Known</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Physician</label>
              <input
                type="text"
                name="primaryPhysician"
                value={formData.primaryPhysician}
                onChange={handleChange}
                placeholder="Dr. Aris Thorne"
                className="med-input"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0D9488]" /> Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Ahmedabad"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Gujarat"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
                className="med-input"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contacts */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-red-900 flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-600" /> Emergency Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="e.g. Ramesh Tiwari"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                placeholder="Father / Guardian"
                className="med-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="med-input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-md bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
          >
            <Save className="w-4 h-4 text-[#0D9488]" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
