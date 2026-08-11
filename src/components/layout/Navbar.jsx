import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Activity, User, LogOut, UserPlus } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userProfile, logout } = useHealthData();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCreateNewAccount = () => {
    if (isAuthenticated) {
      logout();
    }
    navigate('/signup');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs' 
        : 'bg-white border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-[#1E293B] transition-colors">
            <Activity className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-[#0F172A] tracking-tight leading-none">
              Medical<span className="text-[#0D9488]">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Clinical Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <Link to="/" className="hover:text-[#0D9488] transition-colors">
            Home
          </Link>
          <a href="#features" className="hover:text-[#0D9488] transition-colors">
            Services & Features
          </a>
          <a href="#how-it-works" className="hover:text-[#0D9488] transition-colors">
            How It Works
          </a>
          <a href="#faq" className="hover:text-[#0D9488] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && userProfile ? (
            <>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="py-2 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <span>Dashboard ({userProfile.name ? userProfile.name.split(' ')[0] : 'User'})</span>
                <ArrowRight className="w-4 h-4 text-[#0D9488]" />
              </button>

              <button
                onClick={handleCreateNewAccount}
                className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors"
                title="Register a new account"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Create Account</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-700 hover:text-[#0F172A] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="py-2 px-4.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <span>Create Account</span> 
                <ArrowRight className="w-4 h-4 text-[#0D9488]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 font-sans text-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Home
          </Link>
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Services & Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            How It Works
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && userProfile ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/app/dashboard');
                  }}
                  className="w-full py-2.5 font-semibold text-white bg-[#0F172A] rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Dashboard ({userProfile.name ? userProfile.name.split(' ')[0] : 'User'})</span>
                  <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCreateNewAccount();
                  }}
                  className="w-full text-center py-2.5 font-semibold text-slate-800 border border-slate-200 rounded-xl"
                >
                  Create New Account
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-semibold text-slate-800 border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 font-semibold text-white bg-[#0F172A] rounded-xl flex items-center justify-center gap-2 text-center"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
