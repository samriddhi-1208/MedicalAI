import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset instructions sent to your email!");
      navigate('/login');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
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
          Reset Your Password
        </h2>
        <p className="text-sm font-normal text-[#475569]">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] py-8 px-6 shadow-xs rounded-xl sm:px-8 space-y-6">
          
          <form onSubmit={handleReset} className="space-y-5">
            <div className="med-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#475569]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="med-input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full med-btn med-btn-primary py-2.5 text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E2E8F0]">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
