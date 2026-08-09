import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#11476C] flex items-center justify-center text-white font-bold shadow-sm">
            <Shield className="w-5 h-5 text-[#77CAF3]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-[#11476C] tracking-tight leading-none font-heading">
              MedGuardian <span className="text-[#77CAF3]">AI</span>
            </span>
            <span className="text-[10px] text-[#475569] font-medium">Clinical Patient Portal</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#11476C]">
          <a href="#features" className="hover:text-[#77CAF3] transition-colors">Services</a>
          <a href="#how-it-works" className="hover:text-[#77CAF3] transition-colors">How it Works</a>
          <a href="#faq" className="hover:text-[#77CAF3] transition-colors">FAQ & Safety</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-[#11476C] hover:text-[#77CAF3] px-3 py-2">
            Sign In
          </Link>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="med-btn med-btn-primary"
          >
            <span>Patient Dashboard</span> <ArrowRight className="w-4 h-4 text-[#77CAF3]" />
          </button>
        </div>

      </div>
    </header>
  );
};
