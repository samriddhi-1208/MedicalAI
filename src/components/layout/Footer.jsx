import React from 'react';
import { Activity, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-lg text-white">
                MedGuardian <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered personal health intelligence platform for OCR report parsing, biomarker longitudinal tracking, and 24/7 emergency assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/app/dashboard" className="hover:text-cyan-400 transition-colors">Health Dashboard</Link></li>
              <li><Link to="/app/upload" className="hover:text-cyan-400 transition-colors">Report OCR Parser</Link></li>
              <li><Link to="/app/analysis" className="hover:text-cyan-400 transition-colors">AI Diagnostics</Link></li>
              <li><Link to="/app/timeline" className="hover:text-cyan-400 transition-colors">Biomarker Trends</Link></li>
            </ul>
          </div>

          {/* Emergency & Safety */}
          <div>
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider mb-4">Emergency Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/app/hospitals" className="hover:text-cyan-400 transition-colors">24/7 Hospital Finder</Link></li>
              <li><Link to="/app/medicines" className="hover:text-cyan-400 transition-colors">Medicine Reminders</Link></li>
              <li><Link to="/app/sos" className="hover:text-rose-400 transition-colors flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Emergency SOS</Link></li>
              <li><Link to="/app/settings" className="hover:text-cyan-400 transition-colors">Emergency Contacts</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Clinical Disclaimer</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              MedGuardian AI is an intelligent health tracking tool and does not provide formal medical diagnosis or treatment. Always consult a certified medical practitioner for medical emergencies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted Data Privacy
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MedGuardian AI Inc. Built for healthcare precision.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
