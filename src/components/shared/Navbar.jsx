import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, Activity, Siren } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
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
        ? 'bg-white/95 dark:bg-[#24283A]/95 backdrop-blur-md border-b border-[#D9DDEC] dark:border-[#313750] shadow-xs' 
        : 'bg-white dark:bg-[#24283A] border-b border-[#D9DDEC]/60 dark:border-[#313750]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#172033] dark:bg-[#7C87B8] flex items-center justify-center text-white dark:text-[#172033] font-bold shadow-xs transition-colors">
            <Activity className="w-5 h-5 text-[#AEB7D5] dark:text-[#172033]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-[#172033] dark:text-[#F5F7FA] tracking-tight leading-none">
              MedGuardian<span className="text-[#66729F] dark:text-[#9DA8D0]"> AI</span>
            </span>
            <span className="text-[10px] text-[#526078] dark:text-[#C8D0E0] font-medium tracking-wide">Clinical Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#526078] dark:text-[#C8D0E0]">
          <Link to="/" className="hover:text-[#66729F] dark:hover:text-[#9DA8D0] transition-colors">
            Home
          </Link>
          <a href="#features" className="hover:text-[#66729F] dark:hover:text-[#9DA8D0] transition-colors">
            Services & Features
          </a>
          <a href="#how-it-works" className="hover:text-[#66729F] dark:hover:text-[#9DA8D0] transition-colors">
            How It Works
          </a>
          <a href="#faq" className="hover:text-[#66729F] dark:hover:text-[#9DA8D0] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
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
            className="text-sm font-semibold text-[#526078] dark:text-[#C8D0E0] hover:text-[#172033] dark:hover:text-[#F5F7FA] px-3 py-2 rounded-lg hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146] transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/signup"
            className="py-2 px-4.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#66729F] hover:bg-[#55608B] dark:bg-[#7C87B8] dark:hover:bg-[#8F99C8] text-white dark:text-[#172033] flex items-center gap-2 cursor-pointer shadow-xs transition-all font-bold"
          >
            <span>Create Account</span> 
            <ArrowRight className="w-4 h-4 text-white dark:text-[#172033]" />
          </Link>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/sos"
            className="py-1.5 px-3 text-xs font-black rounded-xl bg-[#C94B55] text-white flex items-center gap-1 shadow-sm border border-[#A83D49]"
          >
            <Siren className="w-3.5 h-3.5 text-white" />
            <span>SOS</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#526078] dark:text-[#C8D0E0] hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#24283A] border-b border-[#D9DDEC] dark:border-[#313750] px-4 pt-3 pb-6 space-y-3 font-sans text-sm animate-in fade-in slide-in-from-top-2 duration-150">
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
            className="block px-3 py-2 font-semibold text-[#172033] dark:text-[#F5F7FA] hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146] rounded-lg"
          >
            Home
          </Link>
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#172033] dark:text-[#F5F7FA] hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146] rounded-lg"
          >
            Services & Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#172033] dark:text-[#F5F7FA] hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146] rounded-lg"
          >
            How It Works
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 font-semibold text-[#172033] dark:text-[#F5F7FA] hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146] rounded-lg"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-[#D9DDEC] dark:border-[#313750] flex flex-col gap-2">
            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-[#172033] dark:text-[#F5F7FA] border border-[#D9DDEC] dark:border-[#313750] rounded-xl hover:bg-[#EEF1FA] dark:hover:bg-[#2C3146]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 font-bold text-white dark:text-[#172033] bg-[#66729F] hover:bg-[#55608B] dark:bg-[#7C87B8] dark:hover:bg-[#8F99C8] rounded-xl flex items-center justify-center gap-2 text-center"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-white dark:text-[#172033]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

