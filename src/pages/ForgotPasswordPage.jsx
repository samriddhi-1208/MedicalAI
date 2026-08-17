import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
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
          Reset Your Password
        </h2>
        <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200/90 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-8 space-y-6">
          
          {submitted ? (
            <div className="text-center space-y-5 animate-in fade-in duration-200 py-2">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#0D9488] flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7 text-[#0D9488]" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[#0F172A]">Recovery Email Sent!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  We have sent password reset instructions to <strong className="text-[#0F172A] font-bold">{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="pt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer block mx-auto"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="med-form-group">
                <label htmlFor="email" className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                    <Mail className="w-4.5 h-4.5 text-[#0F172A]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="med-input w-full block !pl-11 py-3 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Email</span>
                    <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                  </>
                )}
              </button>

              <div className="text-center pt-3 border-t border-slate-100">
                <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#0F172A] hover:text-[#0D9488] transition-colors">
                  <ArrowLeft className="w-4 h-4 text-[#0D9488]" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};
