import React from 'react';
import { Activity, ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#0F172A] border-t border-slate-800 text-slate-400 text-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                <Activity className="w-5 h-5 text-[#0D9488]" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Medical<span className="text-[#0D9488]">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clinical patient health intelligence platform for medical report OCR parsing, biomarker tracking, hospital locator, and emergency assistance.
            </p>
          </div>

          {/* Platform Services Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/app/dashboard" className="hover:text-white transition-colors">Patient Dashboard</Link></li>
              <li><Link to="/app/upload" className="hover:text-white transition-colors">Upload Blood Report</Link></li>
              <li><Link to="/app/analysis" className="hover:text-white transition-colors">AI Diagnostic Analysis</Link></li>
              <li><Link to="/app/timeline" className="hover:text-white transition-colors">Biomarker History</Link></li>
            </ul>
          </div>

          {/* Emergency & Care */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Emergency & Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/app/hospitals" className="hover:text-white transition-colors">24/7 Hospital Finder</Link></li>
              <li><Link to="/app/medicines" className="hover:text-white transition-colors">Medication Reminders</Link></li>
              <li>
                <Link to="/app/sos" className="hover:text-rose-400 transition-colors flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Emergency SOS Center
                </Link>
              </li>
              <li><Link to="/app/settings" className="hover:text-white transition-colors">Emergency Contacts</Link></li>
            </ul>
          </div>

          {/* Clinical Disclaimer */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Clinical Disclaimer</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              MedicalAI is an educational health Literacy and record tracking tool. It does not provide medical diagnosis or treatment advice. Always consult a licensed medical professional for clinical emergencies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-Bit Encrypted Data Privacy
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MedicalAI. All rights reserved. Designed for healthcare clarity.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Data Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
