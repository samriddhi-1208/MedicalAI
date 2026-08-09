import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useHealthData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      updateUserProfile({
        name: fullName,
        email: email,
        phone: phone || "9173737949"
      });
      setLoading(false);
      toast.success(`Account created successfully for ${fullName}!`);
      navigate('/app/dashboard');
    }, 600);
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
                  placeholder="Samriddhi Tiwari"
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
                  placeholder="tiwari.samriddhi12@gmail.com"
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
                  placeholder="9173737949"
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
