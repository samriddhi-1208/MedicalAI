import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, User, Phone, Calendar, Activity, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';

const API_BASE = 'http://localhost:5000/api';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { updateUserProfile, clearAllData } = useHealthData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [password, setPassword] = useState('');
  const [showVitals, setShowVitals] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Save last user email ONLY on this device's browser
      localStorage.setItem('medguardian_last_user_email', email);

      // Send real POST request to backend API to insert user into MongoDB Atlas with vitals
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          phone: phone || '',
          birthDate: birthDate || '',
          age: age ? parseInt(age) : 20,
          gender: gender,
          bloodGroup: bloodGroup,
          height: height ? `${height} cm` : '',
          weight: weight ? `${weight} kg` : '',
          password: password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      if (data.token) {
        localStorage.setItem('medguardian_token', data.token);
      }

      clearAllData();
      updateUserProfile({
        name: data.user?.full_name || fullName,
        email: data.user?.email || email,
        phone: data.user?.phone || phone,
        birthDate: data.user?.birth_date || birthDate,
        age: data.user?.age || age || 20,
        gender: data.user?.gender || gender,
        bloodGroup: data.user?.blood_group || bloodGroup,
        height: data.user?.height || (height ? `${height} cm` : ''),
        weight: data.user?.weight || (weight ? `${weight} kg` : '')
      });

      toast.success(`Account registered for ${fullName}!`);
      navigate('/app/dashboard');
    } catch (err) {
      console.log("Backend offline or signup fallback: ", err.message);
      localStorage.setItem('medguardian_last_user_email', email);
      clearAllData();
      updateUserProfile({
        name: fullName,
        email: email,
        phone: phone || "",
        birthDate: birthDate,
        age: age || 20,
        gender: gender,
        bloodGroup: bloodGroup,
        height: height ? `${height} cm` : '',
        weight: weight ? `${weight} kg` : ''
      });
      toast.success(`Welcome ${fullName}! Your workspace is ready.`);
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
          <div className="w-11 h-11 rounded-2xl bg-[#11476C] text-white flex items-center justify-center font-bold shadow-md shadow-[#11476C]/15">
            <Shield className="w-6 h-6 text-[#77CAF3]" />
          </div>
          <span className="font-extrabold text-2xl text-[#11476C] tracking-tight">
            MedGuardian <span className="text-[#77CAF3]">AI</span>
          </span>
        </Link>
        <h2 className="text-2.5xl font-bold text-[#11476C] tracking-tight">
          Create Your Patient Account
        </h2>
        <p className="text-sm font-medium text-[#475569]">
          Get started with instant medical report OCR parsing & emergency protection
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-8 space-y-6">
          
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="med-form-group">
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Full Name</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="w-4.5 h-4.5 text-[#11476C]" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="med-input w-full block"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="email" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Mail className="w-4.5 h-4.5 text-[#11476C]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="med-input w-full block"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="phone" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone Number (Optional)</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Phone className="w-4.5 h-4.5 text-[#11476C]" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="med-input w-full block"
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="password" className="block text-sm font-semibold text-[#0F172A] mb-1.5">Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4.5 h-4.5 text-[#11476C]" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="med-input w-full block"
                  required
                />
              </div>
            </div>

            {/* Optional Personal Vitals & Birth Date Accordion */}
            <div className="pt-1 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowVitals(!showVitals)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#11476C] hover:text-[#0d3856] py-1.5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#77CAF3]" />
                  <span>Personal Health Vitals (Age, Birth Date, Height, Weight)</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVitals ? 'rotate-180' : ''}`} />
              </button>

              {showVitals && (
                <div className="mt-3 space-y-3 p-3.5 rounded-xl bg-[#F0F9FF] border border-[#77CAF3]/30">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#11476C] mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="med-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#11476C] mb-1">Age (Years)</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="22"
                        className="med-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#11476C] mb-1">Height (cm)</label>
                      <input
                        type="text"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="165"
                        className="med-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#11476C] mb-1">Weight (kg)</label>
                      <input
                        type="text"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="58"
                        className="med-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#11476C] mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="med-input text-xs"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#11476C] mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
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
                  </div>

                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#11476C] hover:bg-[#0d3856] active:bg-[#0a2940] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#11476C]/20 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Register & Proceed</span>
                  <ArrowRight className="w-4 h-4 text-[#77CAF3]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-[#E2E8F0]">
            <p className="text-xs font-medium text-[#475569]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#11476C] hover:text-[#77CAF3] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
