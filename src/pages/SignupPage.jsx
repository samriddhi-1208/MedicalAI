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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#11476C] text-white flex items-center justify-center font-bold shadow-sm">
            <Shield className="w-5 h-5 text-[#77CAF3]" />
          </div>
          <span className="font-extrabold text-xl text-[#11476C] tracking-tight">
            MedGuardian <span className="text-[#77CAF3]">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-semibold text-[#11476C] tracking-tight">
          Create Your Patient Account
        </h2>
        <p className="text-sm font-normal text-[#475569]">
          Get started with instant medical report OCR parsing & emergency protection
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] py-8 px-6 shadow-xs rounded-xl sm:px-8 space-y-6">
          
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="med-form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Samriddhi Tiwari"
                  className="med-input pl-10 w-full block"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tiwari.samriddhi12@gmail.com"
                  className="med-input pl-10 w-full block"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9173737949"
                  className="med-input pl-10 w-full block"
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="password">Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="med-input pl-10 w-full block"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full med-btn med-btn-primary py-2.5 text-sm font-medium flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Register & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#475569]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#1D4ED8] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
