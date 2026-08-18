import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Heart, 
  Siren, 
  ShieldCheck, 
  Save, 
  Compass, 
  Edit2, 
  Info,
  CheckCircle2,
  Calendar,
  Phone,
  Building2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { getTranslation } from '../utils/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { userProfile, updateUserProfile, language } = useHealthData();
  const t = (key) => getTranslation(language, key);

  // Helper to calculate age automatically from DOB
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
    phone: userProfile?.phone || '',
    dob: userProfile?.dob || '',
    gender: userProfile?.gender || '',
    height: userProfile?.height || '',
    heightUnit: userProfile?.heightUnit || 'cm',
    weight: userProfile?.weight || '',
    weightUnit: userProfile?.weightUnit || 'kg',
    bloodGroup: userProfile?.bloodGroup || '',
    primaryPhysician: userProfile?.primaryPhysician || '',
    city: userProfile?.city || '',
    state: userProfile?.state || '',
    country: userProfile?.country || '',
    allergies: userProfile?.allergies || '',
    existingConditions: userProfile?.existingConditions || '',
    currentMedications: userProfile?.currentMedications || '',
    emergencyNotes: userProfile?.emergencyNotes || '',
    emergencyContact: userProfile?.emergencyContact || '',
    emergencyPhone: userProfile?.emergencyPhone || '',
    emergencyRelation: userProfile?.emergencyRelation || '',
    preferredHospital: userProfile?.preferredHospital || ''
  });

  // Sync state if userProfile updates
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || prev.name,
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
        allergies: userProfile.allergies || prev.allergies,
        existingConditions: userProfile.existingConditions || prev.existingConditions,
        currentMedications: userProfile.currentMedications || prev.currentMedications,
        emergencyNotes: userProfile.emergencyNotes || prev.emergencyNotes,
        emergencyContact: userProfile.emergencyContact || prev.emergencyContact,
        emergencyPhone: userProfile.emergencyPhone || prev.emergencyPhone,
        emergencyRelation: userProfile.emergencyRelation || prev.emergencyRelation,
        preferredHospital: userProfile.preferredHospital || prev.preferredHospital
      }));
    }
  }, [userProfile]);

  const [locLoading, setLocLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocLoading(true);
    toast.loading("Detecting current location...", { id: 'loc-toast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss('loc-toast');
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
          const revRes = await fetch(revUrl);
          const revData = await revRes.json();
          if (revData?.address) {
            const city = revData.address.city || revData.address.town || revData.address.village || 'Local Area';
            const state = revData.address.state || revData.address.region || '';
            const country = revData.address.country || '';

            setFormData(prev => ({ ...prev, city, state, country }));
            toast.success(`Location locked: ${city}, ${country}`);
          }
        } catch {
          toast.success("GPS Coordinates detected.");
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        toast.dismiss('loc-toast');
        setLocLoading(false);
        toast.error("Location access denied or unavailable.");
      },
      { timeout: 8000 }
    );
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (typeof updateUserProfile === 'function') {
      updateUserProfile(formData);
    }
    toast.success("✓ Health profile updated successfully");
  };

  const age = calculateAge(formData.dob);

  return (
    <div className="space-y-6 pb-12 font-sans antialiased max-w-4xl mx-auto">
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1A4B84] text-white font-extrabold text-2xl flex items-center justify-center border-2 border-[#2D90A6] shadow-md shrink-0">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2D90A6] animate-pulse" />
              <span className="text-xs text-[#2D90A6] font-bold uppercase tracking-wider">Patient Identity Baseline</span>
            </div>
            <h1 className="text-2.5xl font-extrabold text-[#1A4B84] tracking-tight">
              {t('personalHealthProfile')}
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {t('personalHealthSubtitle')}
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-[#EBF6F8] text-[#2D90A6] text-xs font-bold border border-[#2D90A6]/30 shrink-0 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2D90A6]" /> {t('authenticatedSession')}
        </span>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">

        {/* 1. Personal Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-[#2D90A6]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">{t('personalInformation')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="med-form-group">
              <label htmlFor="name">{t('fullName')}</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sakshi Bhatt"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="phone">{t('phoneNumber')}</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="dob">{t('dateOfBirth')}</label>
              <input
                id="dob"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="med-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="med-form-group">
                <label>{t('age')}</label>
                <div className={`med-input bg-slate-50 font-bold text-xs flex items-center ${age ? 'text-slate-800' : 'text-slate-400 font-normal'}`}>
                  {age ? `${age} ${language === 'HI' ? 'वर्ष' : language === 'GU' ? 'વર્ષ' : 'years old'}` : '--'}
                </div>
              </div>

              <div className="med-form-group">
                <label htmlFor="gender">{t('gender')}</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="med-input text-xs"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

          </div>
        </Card>

        {/* 2. Physical & Health Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Heart className="w-5 h-5 text-[#2D90A6]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">{t('physicalHealthBaseline')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            <div className="med-form-group">
              <label htmlFor="height">{t('height')}</label>
              <div className="flex items-center gap-2">
                <input
                  id="height"
                  type="number"
                  step="any"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder={formData.heightUnit === 'ft' ? "e.g. 5.9" : "e.g. 165"}
                  className="med-input text-xs flex-1 min-w-0"
                />
                <select
                  name="heightUnit"
                  value={formData.heightUnit}
                  onChange={handleChange}
                  className="med-input med-input-unit text-xs font-bold bg-slate-50"
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="weight">{t('weight')}</label>
              <div className="flex items-center gap-2">
                <input
                  id="weight"
                  type="number"
                  step="any"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder={formData.weightUnit === 'lbs' ? "e.g. 130" : "e.g. 58"}
                  className="med-input text-xs flex-1 min-w-0"
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="med-input med-input-unit text-xs font-bold bg-slate-50"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="bloodGroup">{t('bloodGroup')}</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="med-input text-xs"
              >
                <option value="">Select Blood Group</option>
                <option value="O+">O positive (O+)</option>
                <option value="O-">O negative (O-)</option>
                <option value="A+">A positive (A+)</option>
                <option value="A-">A negative (A-)</option>
                <option value="B+">B positive (B+)</option>
                <option value="B-">B negative (B-)</option>
                <option value="AB+">AB positive (AB+)</option>
                <option value="AB-">AB negative (AB-)</option>
              </select>
            </div>

            <div className="med-form-group">
              <label htmlFor="primaryPhysician">{t('primaryPhysician')}</label>
              <input
                id="primaryPhysician"
                type="text"
                name="primaryPhysician"
                value={formData.primaryPhysician}
                onChange={handleChange}
                placeholder="e.g. Dr. Emily Chen"
                className="med-input text-xs"
              />
            </div>

          </div>
        </Card>

        {/* 3. Location & Emergency Hospital */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2D90A6]" />
              <h3 className="text-base font-extrabold text-[#1A4B84]">{t('location')}</h3>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Compass className={`w-3.5 h-3.5 text-[#2D90A6] ${locLoading ? 'animate-spin' : ''}`} />
              <span>{locLoading ? t('locating') : t('useCurrentLocation')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="med-form-group">
              <label htmlFor="city">{t('city')}</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Vadodara"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="state">{t('state')}</label>
              <input
                id="state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Gujarat"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="country">{t('country')}</label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. India"
                className="med-input text-xs"
              />
            </div>
          </div>
        </Card>

        {/* 4. Medical Notes & Emergency Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Siren className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">{t('emergencyMedicalNotes')}</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="med-form-group">
              <label htmlFor="allergies">{t('knownAllergies')}</label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="existingConditions">{t('existingConditions')}</label>
              <textarea
                id="existingConditions"
                name="existingConditions"
                value={formData.existingConditions}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="emergencyNotes">{t('emergencyNotes')}</label>
              <textarea
                id="emergencyNotes"
                name="emergencyNotes"
                value={formData.emergencyNotes}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Blood type O+, carries EpiPen in handbag, pacemakers fitted."
                className="med-input text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Action Button Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#1A4B84] hover:bg-[#123661] text-white font-extrabold text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Save className="w-4 h-4 text-[#2D90A6]" />
            <span>{t('saveProfileDetails')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
