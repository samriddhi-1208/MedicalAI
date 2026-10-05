import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Activity, Eye, EyeOff, UserCheck, Siren } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { OtpVerificationScreen } from '../components/auth/OtpVerificationScreen';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, API_BASE, isAuthenticated, userProfile, logout } = useHealthData();

  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const warmUpBackend = () => {
      fetch(`${API_BASE}/health`, { mode: 'no-cors' }).catch(() => {});
    };
    warmUpBackend();
  }, [API_BASE]);

  const handleInputFocus = () => {
    fetch(`${API_BASE}/health`, { mode: 'no-cors' }).catch(() => {});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.twoFactorRequired) {
        // Transition seamlessly to OTP verification screen
        setOtpEmail(res.email || email);
        setStep('otp');
        setLoading(false);
        toast.success(res.message || "Verification code sent to your email!");
      } else if (res && res.success) {
        navigate('/app/dashboard');
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
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
          Sign In to Your Patient Workspace
        </h2>
        <p className="text-xs font-medium text-[var(--text-muted)]">
          Access plain-language AI lab report summaries and clinical assistance
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {step === 'otp' ? (
          <OtpVerificationScreen
            email={otpEmail}
            onBackToLogin={() => setStep('credentials')}
            onVerificationSuccess={() => navigate('/app/dashboard')}
          />
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] py-8 px-6 shadow-xl rounded-2xl sm:px-8 space-y-5">
            
            {/* Active Session Info Banner (If already logged in) */}
            {isAuthenticated && userProfile && (
              <div className="p-4 rounded-xl bg-[#D9DDEC]/40 dark:bg-[#7C87B8]/20 border border-[#AEB7D5]/40 dark:border-[#7C87B8]/40 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-[#66729F] dark:text-[#9DA8D0] font-bold">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Currently Signed In</span>
                </div>
                <p className="text-[var(--text-muted)]">
                  You are currently logged in as <strong className="text-[var(--text-main)]">{userProfile.name || userProfile.email}</strong>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/app/dashboard')}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-main)] font-semibold text-xs cursor-pointer"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                    onFocus={handleInputFocus}
                    placeholder="patient@example.com"
                    className="med-input w-full block !pl-11"
                    required
                  />
                </div>
              </div>

              <div className="med-form-group">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-bold text-[var(--text-main)] mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)] z-10">
                    <Lock className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="••••••••••••"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-1"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-[var(--border-color)]">
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-[var(--color-primary)] hover:underline ml-1">
                  Create Account
                </Link>
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
