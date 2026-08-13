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
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { userProfile, updateUserProfile } = useHealthData();

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
    weight: userProfile?.weight || '',
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
        weight: userProfile.weight || prev.weight,
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
              Personal & Health Profile
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Your personal information and clinical baseline used to personalize your healthcare experience.
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-[#EBF6F8] text-[#2D90A6] text-xs font-bold border border-[#2D90A6]/30 shrink-0 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2D90A6]" /> Authenticated Patient Profile
        </span>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">

        {/* 1. Personal Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-[#2D90A6]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="med-form-group">
              <label htmlFor="name">Full Name</label>
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
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 234-5678"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="dob">Date of Birth</label>
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
                <label>Age (Auto-Calculated)</label>
                <div className="med-input bg-slate-50 text-slate-700 font-bold text-xs flex items-center">
                  {age ? `${age} years old` : 'Enter DOB to calculate'}
                </div>
              </div>

              <div className="med-form-group">
                <label htmlFor="gender">Gender</label>
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
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

          </div>
        </Card>

        {/* 2. Physical & Health Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Heart className="w-5 h-5 text-[#2D90A6]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">Health Baseline</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            
            <div className="med-form-group">
              <label htmlFor="height">Height</label>
              <div className="flex items-center gap-2">
                <input
                  id="height"
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g. 165"
                  className="med-input text-xs"
                />
                <span className="px-3 py-2 rounded-xl bg-slate-100 font-bold text-slate-700">cm</span>
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="weight">Weight</label>
              <div className="flex items-center gap-2">
                <input
                  id="weight"
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 58"
                  className="med-input text-xs"
                />
                <span className="px-3 py-2 rounded-xl bg-slate-100 font-bold text-slate-700">kg</span>
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="bloodGroup">Blood Group</label>
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
              <label htmlFor="primaryPhysician">Primary Physician</label>
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

        {/* 3. Location Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2D90A6]" />
              <h3 className="text-base font-extrabold text-[#1A4B84]">General Location</h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              type="button"
              icon={Compass}
              loading={locLoading}
              onClick={handleUseCurrentLocation}
              className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 cursor-pointer"
            >
              Use Current Location
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="med-form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. San Francisco"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="state">State / Region</label>
              <input
                id="state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. California"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. United States"
                className="med-input text-xs"
              />
            </div>
          </div>
        </Card>

        {/* 4. Medical Background */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-5 h-5 text-[#2D90A6]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">Medical Background</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="med-form-group">
              <label htmlFor="allergies">Known Allergies</label>
              <input
                id="allergies"
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts, Sulfa"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="existingConditions">Existing Medical Conditions</label>
              <input
                id="existingConditions"
                type="text"
                name="existingConditions"
                value={formData.existingConditions}
                onChange={handleChange}
                placeholder="e.g. Mild Asthma, High Blood Pressure"
                className="med-input text-xs"
              />
            </div>

            <div className="sm:col-span-2 med-form-group">
              <label htmlFor="currentMedications">Current Medications</label>
              <input
                id="currentMedications"
                type="text"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder="e.g. Lisinopril 10mg, Metformin 500mg"
                className="med-input text-xs"
              />
            </div>

            <div className="sm:col-span-2 med-form-group">
              <label htmlFor="emergencyNotes">Emergency Medical Notes</label>
              <textarea
                id="emergencyNotes"
                name="emergencyNotes"
                rows={2}
                value={formData.emergencyNotes}
                onChange={handleChange}
                placeholder="e.g. Asthma inhaler kept in travel bag. No penicillin."
                className="med-input text-xs resize-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-normal">
            <strong>Privacy Note:</strong> This information helps MedGuardian AI provide more relevant health insights. It should not be used as a substitute for professional medical advice.
          </div>
        </Card>

        {/* 5. Emergency Information */}
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Siren className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-extrabold text-[#1A4B84]">Emergency Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="med-form-group">
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                id="emergencyContact"
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="e.g. Michael (Son)"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="emergencyPhone">Contact Phone</label>
              <input
                id="emergencyPhone"
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 987-6543"
                className="med-input text-xs"
              />
            </div>

            <div className="med-form-group">
              <label htmlFor="emergencyRelation">Relationship</label>
              <input
                id="emergencyRelation"
                type="text"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                placeholder="e.g. Son / Primary Contact"
                className="med-input text-xs"
              />
            </div>

            <div className="sm:col-span-3 med-form-group">
              <label htmlFor="preferredHospital">Preferred Emergency Hospital</label>
              <input
                id="preferredHospital"
                type="text"
                name="preferredHospital"
                value={formData.preferredHospital}
                onChange={handleChange}
                placeholder="e.g. City General Hospital"
                className="med-input text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Profile Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => window.history.back()}
            className="py-3 px-6 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            type="submit"
            icon={Save}
            className="bg-[#1A4B84] hover:bg-[#143A66] py-3.5 px-8 text-xs font-bold rounded-xl cursor-pointer"
          >
            Save Health Profile
          </Button>
        </div>

      </form>

    </div>
  );
};
