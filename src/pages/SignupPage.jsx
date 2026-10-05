import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Activity, Eye, EyeOff, Check, X, Siren } from 'lucide-react';
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

  // Live password complexity conditions
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

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

    if (!isPasswordValid) {
      toast.error("Password must meet all complexity requirements: 1 uppercase, 1 lowercase, 1 number, 1 special character, and min 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        name: fullName,
        email,
        password,
        confirmPassword
      });

      if (res && res.success) {
        navigate('/complete-profile');
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      
      {/* Zero-Login Emergency SOS Quick Access Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <div className="p-3.5 bg-[#3A2028] text-white rounded-2xl shadow-md border border-[#A83D49] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-[#A83D49]/50">
              <Siren className="w-5 h-5 text-[#F3C6CB]" />
            </div>
            <div>
              <div className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#F3C6CB]">Medical Emergency?</div>
              <div className="text-xs sm:text-[13px] font-bold text-white">No Login / No Password Needed</div>
            </div>
          </div>
          <Link
            to="/sos"
            className="px-3.5 py-2 bg-white text-[#C94B55] hover:bg-[#FDF2F4] text-xs font-black rounded-xl shadow-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shrink-0 border border-[#A83D49]/30"
          >
            Open SOS Now ⚡
          </Link>
        </div>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
          <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shadow-md">
            <Activity className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <span className="font-extrabold text-2xl text-[var(--text-main)] tracking-tight">
            MedGuardian<span className="text-[var(--color-primary)]"> AI</span>
          </span>
        </Link>
        <h2 className="text-2.5xl font-extrabold text-[var(--text-main)] tracking-tight">
          Create Your Patient Account
        </h2>
        <p className="text-xs font-medium text-[var(--text-muted)]">
          Get started with instant medical report OCR parsing & emergency protection
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] py-8 px-6 shadow-xl rounded-2xl sm:px-8 space-y-6">
          
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="med-form-group">
              <label htmlFor="fullName" className="block text-xs font-bold text-[var(--text-main)] mb-1.5">Full Name</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)] z-10">
                  <User className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="med-input w-full block !pl-11"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="email" className="block text-xs font-bold text-[var(--text-main)] mb-1.5">Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)] z-10">
                  <Mail className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="med-input w-full block !pl-11"
                  required
                />
              </div>
            </div>

            <div className="med-form-group">
              <label htmlFor="password" className="block text-xs font-bold text-[var(--text-main)] mb-1.5">Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)] z-10">
                  <Lock className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars (e.g. SecureP@ss123)"
                  className="med-input w-full block !pl-11 !pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirement Live Checklist */}
              {password && (
                <div className="mt-2.5 p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-color)] text-[11px] space-y-1.5">
                  <p className="font-bold text-[var(--text-main)] mb-1">Password Criteria:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-medium">
                    <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                      {hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      1 Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                      {hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      1 Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      1 Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                      {hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      1 Special (!@#$%)
                    </span>
                  </div>
                  <div className={`pt-1 border-t border-[var(--border-color)] flex items-center gap-1 ${hasLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                    {hasLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                    At least 8 characters long
                  </div>
                </div>
              )}
            </div>

            <div className="med-form-group">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[var(--text-main)] mb-1.5">Confirm Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)] z-10">
                  <Lock className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="med-input w-full block !pl-11"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Setup Profile</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-[var(--border-color)]">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[var(--color-primary)] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
