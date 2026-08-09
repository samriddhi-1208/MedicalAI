import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useHealthData();

  const [email, setEmail] = useState('laxmi.manapure@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      updateUserProfile({
        name: "Laxmi Manapure",
        email: email
      });
      setLoading(false);
      toast.success("Welcome back, Laxmi Manapure!");
      navigate('/app/dashboard');
    }, 600);
  };

  const handleAutoFill = () => {
    setEmail("laxmi.manapure@example.com");
    setPassword("password123");
    toast.success("Demo credentials loaded!");
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
          Sign In to Your Patient Workspace
        </h2>
        <p className="text-sm font-medium text-[#475569]">
          Access plain-language AI lab report summaries and 24/7 health assistance
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-8 space-y-6">
          
          {/* Quick Auto-Fill Demo Button */}
          <button
            type="button"
            onClick={handleAutoFill}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#11476C] text-xs font-semibold border border-[#77CAF3]/40 flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#77CAF3]" />
            <span>Auto-Fill Demo Credentials (Laxmi Manapure)</span>
          </button>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="name@example.com"
                  className="med-input w-full block"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-[#0F172A] mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#11476C] hover:text-[#77CAF3] hover:underline">
                  Forgot Password?
                </Link>
              </div>
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
              className="w-full py-3.5 px-4 rounded-xl bg-[#11476C] hover:bg-[#0d3856] active:bg-[#0a2940] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#11476C]/20 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#77CAF3]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-[#E2E8F0]">
            <p className="text-xs font-medium text-[#475569]">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-[#11476C] hover:text-[#77CAF3] hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
