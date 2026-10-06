import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid registered email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("✓ Password recovery email sent!");
    }, 650);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      
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
          Reset Your Password
        </h2>
        <p className="text-xs font-medium text-[var(--text-muted)] max-w-sm mx-auto">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] py-8 px-6 shadow-xl rounded-2xl sm:px-8 space-y-6">
          
          {submitted ? (
            <div className="text-center space-y-5 animate-in fade-in duration-200 py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF7F1] dark:bg-[#568570]/20 border border-[#D5E8DC] dark:border-[#568570]/40 text-[#3D6352] dark:text-[#6B9B85] flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7 text-[#3D6352] dark:text-[#6B9B85]" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[var(--text-main)]">Recovery Email Sent!</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                  We have sent password reset instructions to <strong className="text-[var(--text-main)] font-bold">{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="pt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer block mx-auto"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="med-form-group">
                <label htmlFor="email" className="block text-xs font-bold text-[var(--text-main)] mb-1.5">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)] z-10">
                    <Mail className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="med-input w-full block !pl-11 py-3 text-xs sm:text-sm rounded-xl border-[var(--border-color)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Email</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <div className="text-center pt-3 border-t border-[var(--border-color)]">
                <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-main)] hover:text-[var(--color-primary)] transition-colors">
                  <ArrowLeft className="w-4 h-4 text-[var(--color-primary)]" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};
