import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Activity, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useHealthData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: fullName,
        email,
        password,
        confirmPassword
      });

      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
          <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-bold shadow-md">
            <Activity className="w-6 h-6 text-[#0D9488]" />
          </div>
          <span className="font-extrabold text-2xl text-[#0F172A] tracking-tight">
            Medical<span className="text-[#0D9488]">AI</span>
          </span>
        </Link>
        <h2 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight">
          Create Your Patient Account
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Get started with instant medical report OCR parsing & emergency protection
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-8 space-y-6">
          
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="med-form-group">
              <label htmlFor="fullName" className="block text-xs font-bold text-[#0F172A] mb-1.5">Full Name</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4.5 h-4.5 text-[#0F172A]" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="med-input w-full block"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="email" className="block text-xs font-bold text-[#0F172A] mb-1.5">Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5 text-[#0F172A]" />
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
              <label htmlFor="password" className="block text-xs font-bold text-[#0F172A] mb-1.5">Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5 text-[#0F172A]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="med-input w-full block pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#0F172A] mb-1.5">Confirm Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5 text-[#0F172A]" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="med-input w-full block"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#0F172A] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
