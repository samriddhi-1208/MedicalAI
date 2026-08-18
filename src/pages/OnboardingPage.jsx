import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ArrowLeft, Check, Calendar, User, MapPin, Heart, Briefcase, Ruler, Weight as WeightIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, completeOnboarding } = useHealthData();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile?.dateOfBirth || '');
  const [calculatedAge, setCalculatedAge] = useState(userProfile?.age || '');
  const [gender, setGender] = useState(userProfile?.gender || 'Female');

  const [height, setHeight] = useState(userProfile?.height || '');
  const [heightUnit, setHeightUnit] = useState(userProfile?.heightUnit || 'cm');
  const [weight, setWeight] = useState(userProfile?.weight || '');
  const [weightUnit, setWeightUnit] = useState(userProfile?.weightUnit || 'kg');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || 'Not Known');
  const [city, setCity] = useState(userProfile?.city || '');
  const [state, setState] = useState(userProfile?.state || '');
  const [country, setCountry] = useState(userProfile?.country || 'India');
  const [occupation, setOccupation] = useState(userProfile?.occupation || '');

  // Calculate age automatically whenever DOB changes
  useEffect(() => {
    if (!dateOfBirth) {
      setCalculatedAge('');
      return;
    }

    const birthDateObj = new Date(dateOfBirth);
    if (isNaN(birthDateObj.getTime())) {
      setCalculatedAge('');
      return;
    }

    const today = new Date();
    let ageYears = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      ageYears--;
    }

    setCalculatedAge(ageYears >= 0 ? ageYears : 0);
  }, [dateOfBirth]);

  const handleNextStep = (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!dateOfBirth) {
      toast.error("Please select your date of birth.");
      return;
    }

    const birthDateObj = new Date(dateOfBirth);
    if (birthDateObj > new Date()) {
      toast.error("Date of birth cannot be in the future.");
      return;
    }

    if (calculatedAge < 0 || calculatedAge > 120) {
      toast.error("Please select a valid date of birth.");
      return;
    }

    setStep(2);
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();

    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      toast.error("Please enter a valid height measurement.");
      return;
    }

    if (heightUnit === 'cm' && (Number(height) < 40 || Number(height) > 250)) {
      toast.error("Height must be between 40 cm and 250 cm.");
      return;
    }

    if (heightUnit === 'ft' && (Number(height) < 1.3 || Number(height) > 8.5)) {
      toast.error("Height in feet must be between 1.3 ft and 8.5 ft.");
      return;
    }

    if (weight) {
      const numWeight = Number(weight);
      if (isNaN(numWeight) || numWeight <= 0) {
        toast.error("Please enter a valid weight measurement.");
        return;
      }
      if (weightUnit === 'kg' && (numWeight < 10 || numWeight > 300)) {
        toast.error("Weight in kg must be between 10 kg and 300 kg.");
        return;
      }
      if (weightUnit === 'lbs' && (numWeight < 22 || numWeight > 660)) {
        toast.error("Weight in lbs must be between 22 lbs and 660 lbs.");
        return;
      }
    }

    if (!city.trim()) {
      toast.error("Please enter your city.");
      return;
    }

    setLoading(true);
    try {
      if (typeof completeOnboarding === 'function') {
        await completeOnboarding({
          name: fullName.trim(),
          dateOfBirth,
          age: calculatedAge,
          gender,
          height: String(height),
          heightUnit,
          weight: String(weight || ''),
          weightUnit,
          bloodGroup,
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || 'India',
          occupation: occupation.trim()
        });
      } else {
        updateUserProfile({
          name: fullName.trim(),
          dob: dateOfBirth,
          age: calculatedAge,
          gender,
          height: String(height),
          heightUnit,
          weight: String(weight || ''),
          weightUnit,
          bloodGroup,
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || 'India',
          occupation: occupation.trim(),
          profileCompleted: true
        });
      }

      toast.success("Health profile setup complete!");
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3">
        <div className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-bold shadow-md">
            <Activity className="w-6 h-6 text-[#0D9488]" />
          </div>
          <span className="font-extrabold text-2xl text-[#0F172A] tracking-tight">
            Medical<span className="text-[#0D9488]">AI</span>
          </span>
        </div>
        <h2 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight">
          Complete Your Health Profile
        </h2>
        <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
          Help us personalize your clinical AI interpretations and health risk assessments.
        </p>
      </div>

      {/* Progress Bar Header */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/50 rounded-2xl space-y-6">
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>Step {step} of 2</span>
              <span className="text-[#0D9488]">{step === 1 ? 'Personal Details' : 'Health & Location'}</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div 
                className="bg-[#0F172A] h-2 rounded-full transition-all duration-300"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* STEP 1 OF 2: Personal Details */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-[#0F172A]">Let's get to know you</h3>
                <p className="text-xs text-slate-500 font-medium">Basic information for clinical baseline</p>
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                <div className="relative relative-icon-input w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                    <User className="w-4.5 h-4.5 text-[#0F172A]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="med-input w-full block"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="med-form-group">
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Date of Birth <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="med-input w-full block"
                  />
                </div>

                <div className="med-form-group">
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Age (Calculated)</label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-[#0F172A] flex items-center justify-between">
                    <span>{calculatedAge !== '' ? `${calculatedAge} years` : 'Select DOB'}</span>
                    <Calendar className="w-4 h-4 text-[#0D9488]" />
                  </div>
                </div>
              </div>

              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Gender <span className="text-rose-500">*</span></label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="med-input w-full block"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer pt-3"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#0D9488]" />
              </button>
            </form>
          )}

          {/* STEP 2 OF 2: Health Metrics & Location */}
          {step === 2 && (
            <form onSubmit={handleCompleteProfile} className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-[#0F172A]">Your Health Profile</h3>
                <p className="text-xs text-slate-500 font-medium">Physical measurements and general location</p>
              </div>

              {/* Height & Unit (Unified Input Group) */}
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Height <span className="text-rose-500">*</span></label>
                <div className="flex items-center w-full rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-[#0F172A] focus-within:ring-2 focus-within:ring-[#0D9488]/20">
                  <input
                    type="number"
                    step="any"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={heightUnit === 'ft' ? "e.g. 5.9" : "e.g. 175"}
                    className="flex-1 w-full px-3.5 py-2.5 text-sm font-semibold border-0 outline-none focus:outline-none bg-transparent text-[#0F172A]"
                  />
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value)}
                    className="w-20 px-2.5 py-2.5 text-xs font-extrabold bg-slate-100 border-0 border-l border-slate-200 outline-none focus:outline-none cursor-pointer shrink-0 text-[#0F172A]"
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              {/* Weight & Blood Group (Unified Input Group) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="med-form-group">
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Weight (Optional)</label>
                  <div className="flex items-center w-full rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-[#0F172A] focus-within:ring-2 focus-within:ring-[#0D9488]/20">
                    <input
                      type="number"
                      step="any"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={weightUnit === 'lbs' ? "e.g. 150" : "e.g. 70"}
                      className="flex-1 w-full px-3.5 py-2.5 text-sm font-semibold border-0 outline-none focus:outline-none bg-transparent text-[#0F172A]"
                    />
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="w-20 px-2.5 py-2.5 text-xs font-extrabold bg-slate-100 border-0 border-l border-slate-200 outline-none focus:outline-none cursor-pointer shrink-0 text-[#0F172A]"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                <div className="med-form-group">
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Blood Group (Optional)</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="med-input w-full"
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
              </div>

              {/* Location: City, State, Country */}
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">General Location</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City *"
                    className="med-input"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State/Region"
                    className="med-input"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="med-input"
                  />
                </div>
              </div>

              {/* Occupation */}
              <div className="med-form-group">
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Occupation (Optional)</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Software Engineer / Student"
                  className="med-input w-full block"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Profile</span>
                      <Check className="w-4 h-4 text-[#0D9488]" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
};
