import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, Activity, Siren, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled 
        ? 'bg-white/95 dark:bg-[#24283A]/95 backdrop-blur-md border-b border-[#D5E8DC] dark:border-[#313750] shadow-xs' 
        : 'bg-white dark:bg-[#24283A] border-b border-[#D5E8DC]/60 dark:border-[#313750]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#0A0E1A] dark:bg-[#7FAF9A] flex items-center justify-center text-white dark:text-[#0A0E1A] font-bold shadow-xs transition-colors">
            <Activity className="w-5 h-5 text-[#54816C] dark:text-[#0A0E1A]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-[#0A0E1A] dark:text-[#F5F7FA] tracking-tight leading-none">
              MedGuardian<span className="text-[#3D6352] dark:text-[#7FAF9A]"> AI</span>
            </span>
            <span className="text-[10px] text-[#526078] dark:text-[#C8D0E0] font-medium tracking-wide">Clinical Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#526078] dark:text-[#C8D0E0]">
          <Link to="/" className="hover:text-[#3D6352] dark:hover:text-[#7FAF9A] transition-colors">
            Home
          </Link>
          <a href="#features" className="hover:text-[#3D6352] dark:hover:text-[#7FAF9A] transition-colors">
            Services & Features
          </a>
          <a href="#how-it-works" className="hover:text-[#3D6352] dark:hover:text-[#7FAF9A] transition-colors">
            How It Works
          </a>
          <a href="#faq" className="hover:text-[#3D6352] dark:hover:text-[#7FAF9A] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#526078] dark:text-[#C8D0E0] hover:text-[#0A0E1A] dark:hover:text-[#F5F7FA] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] border border-[#D5E8DC] dark:border-[#313750] transition-colors cursor-pointer shadow-2xs"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-[#3D6352]" />}
          </button>

          {/* Zero-Login Emergency SOS Button (Muted Medical Red) */}
          <Link
            to="/sos"
            className="py-2 px-3.5 text-xs sm:text-sm font-black rounded-xl bg-[#C94B55] hover:bg-[#B33D46] text-white flex items-center gap-1.5 cursor-pointer shadow-md border border-[#A83D49] transition-all transform hover:scale-105 active:scale-95"
          >
            <Siren className="w-4 h-4 text-white" />
            <span>Emergency SOS</span>
          </Link>

          <Link 
            to="/login" 
            className="text-sm font-semibold text-[#526078] dark:text-[#C8D0E0] hover:text-[#0A0E1A] dark:hover:text-[#F5F7FA] px-3 py-2 rounded-lg hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/signup"
            className="py-2 px-4.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#7FAF9A] dark:hover:bg-[#648F7B] text-white dark:text-[#0A0E1A] flex items-center gap-2 cursor-pointer shadow-xs transition-all font-bold"
          >
            <span>Create Account</span> 
            <ArrowRight className="w-4 h-4 text-white dark:text-[#0A0E1A]" />
          </Link>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#526078] dark:text-[#C8D0E0] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] border border-[#D5E8DC] dark:border-[#313750] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3D6352]" />}
          </button>

          <Link
            to="/sos"
            className="py-1.5 px-3 text-xs font-black rounded-xl bg-[#C94B55] text-white flex items-center gap-1 shadow-sm border border-[#A83D49]"
          >
            <Siren className="w-3.5 h-3.5 text-white" />
            <span>SOS</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#526078] dark:text-[#C8D0E0] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#24283A] border-b border-[#D5E8DC] dark:border-[#313750] px-4 pt-3 pb-6 space-y-3 font-sans text-sm animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Emergency SOS Banner in Mobile Menu */}
          <Link
            to="/sos"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3 px-4 font-black text-white bg-[#C94B55] hover:bg-[#B33D46] rounded-xl flex items-center justify-center gap-2 text-center shadow-md border border-[#A83D49]"
          >
            <Siren className="w-5 h-5 text-white" />
            <span>🚨 1-Tap Emergency SOS (No Login)</span>
          </Link>

          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#0A0E1A] dark:text-[#F5F7FA] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] rounded-lg"
          >
            Home
          </Link>
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#0A0E1A] dark:text-[#F5F7FA] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] rounded-lg"
          >
            Services & Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#0A0E1A] dark:text-[#F5F7FA] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] rounded-lg"
          >
            How It Works
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#0A0E1A] dark:text-[#F5F7FA] hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146] rounded-lg"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-[#D5E8DC] dark:border-[#313750] flex flex-col gap-2">
            {/* Mobile Theme Toggle Button in Drawer */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full py-2.5 px-3.5 rounded-xl border border-[#D5E8DC] dark:border-[#313750] flex items-center justify-between font-bold text-sm text-[#0A0E1A] dark:text-[#F5F7FA] bg-[#EEF7F1]/60 dark:bg-[#2C3146]/60 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3D6352]" />}
                <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </span>
              <span className="text-xs uppercase font-extrabold text-slate-400 dark:text-slate-500">{theme}</span>
            </button>

            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-[#0A0E1A] dark:text-[#F5F7FA] border border-[#D5E8DC] dark:border-[#313750] rounded-xl hover:bg-[#EEF7F1] dark:hover:bg-[#2C3146]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 font-bold text-white dark:text-[#0A0E1A] bg-[#54816C] hover:bg-[#3D6352] dark:bg-[#7FAF9A] dark:hover:bg-[#648F7B] rounded-xl flex items-center justify-center gap-2 text-center"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-white dark:text-[#0A0E1A]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

