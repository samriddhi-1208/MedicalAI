import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Activity, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useHealthData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Silent background warmup ping to Render backend REST API
    fetch('https://medicalai-backend-5ycw.onrender.com/api/health').catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigate directly to Patient Dashboard
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
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
          Sign In to Your Patient Workspace
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Access plain-language AI lab report summaries and clinical assistance
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-8 space-y-5">
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="med-form-group">
              <label htmlFor="email" className="block text-xs font-bold text-[#0F172A] mb-1.5">Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                  <Mail className="w-4.5 h-4.5 text-[#0F172A]" />
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-[#0F172A] mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#0D9488] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                  <Lock className="w-4.5 h-4.5 text-[#0F172A]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="med-input w-full block !pl-11 !pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer mt-1"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-[#0F172A] hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
