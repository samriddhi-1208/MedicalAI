import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Upload, 
  FileText, 
  BrainCircuit, 
  Clock, 
  Pill, 
  Siren, 
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Activity,
  HeartPulse,
  Lock,
  Stethoscope,
  Sparkles,
  BarChart3,
  Users
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useHealthData } from '../context/HealthDataContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useHealthData();
  const [faqOpen, setFaqOpen] = useState(0); // First item open by default

  const displayName = userProfile && userProfile.name && userProfile.name !== 'New Patient' 
    ? userProfile.name 
    : 'Sarah Jenkins';

  const displayAgeBlood = userProfile && userProfile.age 
    ? `${userProfile.age} yrs • ${userProfile.bloodGroup || 'O+'}`
    : '28 yrs • O+';

  const features = [
    {
      icon: FileText,
      title: "AI Medical Report Analysis",
      description: "Extract test values, reference intervals, and clinical biomarkers from paper photos or PDF lab results with high accuracy."
    },
    {
      icon: Activity,
      title: "Patient Health Dashboard",
      description: "Centralized personal portal displaying key vital metrics, test trends, recent medical reports, and diagnostic summaries."
    },
    {
      icon: Clock,
      title: "Longitudinal Medical History",
      description: "Maintain a structured timeline of past blood panels, historical lab metrics, and diagnostic findings across care visits."
    },
    {
      icon: Pill,
      title: "Medicine Tracking & Schedule",
      description: "Set daily dosage reminders, log taken medications, track pill inventory, and receive timely refill alerts."
    },
    {
      icon: Siren,
      title: "Emergency SOS Dispatch",
      description: "1-click automated alert dispatch to saved emergency contacts, primary care doctors, and 108 ambulance services with live GPS."
    },
    {
      icon: HeartPulse,
      title: "Structured Health Reports",
      description: "Translate complex clinical laboratory jargon into plain-language summaries with actionable lifestyle and diet guidance."
    },
    {
      icon: BrainCircuit,
      title: "AI Clinical Insights",
      description: "Intelligent biomarker risk indicators pointing out out-of-range parameters and potential medical areas of attention."
    },
    {
      icon: Lock,
      title: "Secure Patient Data Privacy",
      description: "256-bit encrypted local storage architecture ensuring strict patient data privacy and total record confidentiality."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Report",
      description: "Drag and drop or scan paper lab test results, blood panel PDFs, or diagnostic images."
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our OCR and clinical AI engine extracts parameters, units, reference bounds, and clinical flags."
    },
    {
      step: "03",
      title: "Understand Results",
      description: "Review clear plain-language summaries, abnormal biomarkers, and risk indicators."
    },
    {
      step: "04",
      title: "Track Your Health",
      description: "Monitor long-term health metrics, manage prescriptions, and share records with doctors."
    }
  ];

  const faqs = [
    {
      question: "How does MedicalAI analyze paper medical reports?",
      answer: "MedicalAI utilizes Optical Character Recognition (OCR) combined with clinical AI parsing algorithms to read PDF or paper photo lab reports. It automatically extracts test titles, numerical values, measurement units, and reference ranges to flag out-of-bounds parameters."
    },
    {
      question: "Can MedicalAI replace my doctor or primary physician?",
      answer: "No. MedicalAI is an intelligent health literacy and record organization assistant designed to help patients understand lab results and prepare questions for doctor consultations. It does not provide formal medical diagnoses or prescribe treatment."
    },
    {
      question: "Is my personal medical data safe and private?",
      answer: "Yes. All health data is encrypted and managed with strict privacy controls. Your personal health records are never sold or shared with unauthorized third parties."
    },
    {
      question: "How does the Emergency SOS feature work?",
      answer: "When triggered, Emergency SOS dispatches automated alert payloads containing live GPS coordinates to your saved emergency contacts, matched primary physician, and national ambulance helpline services."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Trusted AI Health Intelligence • Clinical Report Guidance</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Smart AI Healthcare Guidance <br className="hidden sm:inline" />
                <span className="text-[#0D9488]">for Your Medical Reports</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                MedicalAI helps you understand medical reports, extract key clinical parameters, identify potential health concerns, and effortlessly organize your healthcare information in one secure dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={Upload}
                  className="bg-[#0F172A] hover:bg-[#1E293B] py-3.5 px-6 text-sm font-semibold rounded-xl shadow-md shadow-slate-900/10 cursor-pointer"
                  onClick={() => navigate('/app/upload')}
                >
                  Upload Medical Report
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={ArrowRight}
                  className="py-3.5 px-6 text-sm font-semibold rounded-xl bg-slate-50 border-slate-200 text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                  onClick={() => navigate('/app/dashboard')}
                >
                  Open Patient Dashboard
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Instant OCR</span>
                  <span>PDF & paper report scan</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Biomarker Flags</span>
                  <span>Out-of-range indicators</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">24/7 Emergency</span>
                  <span>1-Click SOS dispatch</span>
                </div>
              </div>

            </div>

            {/* Hero Right Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5 text-[#0D9488]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">Patient Overview</h3>
                      <p className="text-xs text-slate-500 font-medium">Diagnostic Health Record</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200">
                    Report Active
                  </span>
                </div>

                {/* Patient Details Row */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Patient:</span>
                    <strong className="text-[#0F172A] font-bold">{displayName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Vitals:</span>
                    <strong className="text-[#0F172A] font-bold">{displayAgeBlood}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Primary Doctor:</span>
                    <strong className="text-[#0D9488] font-bold">Dr. Marcus Vance, MD</strong>
                  </div>
                </div>

                {/* AI Analysis Preview */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                    <span>AI Biomarker Insights:</span>
                    <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">1 Concern Flagged</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                      <div>
                        <span className="font-semibold text-slate-800">Total Cholesterol</span>
                        <span className="block text-[11px] text-slate-500">Ref: 125-200 mg/dL</span>
                      </div>
                      <span className="font-bold text-slate-900">224 mg/dL <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] ml-1">High</span></span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                      <div>
                        <span className="font-semibold text-slate-800">Fasting Glucose</span>
                        <span className="block text-[11px] text-slate-500">Ref: 70-100 mg/dL</span>
                      </div>
                      <span className="font-bold text-slate-900">92 mg/dL <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] ml-1">Normal</span></span>
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5 text-[#0D9488]" /> 256-Bit Encrypted
                  </span>
                  <Link to="/app/analysis" className="text-[#0D9488] font-bold hover:underline">
                    View Full Analysis →
                  </Link>
                </div>

              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-teal-50 text-[#0D9488] text-xs font-bold uppercase tracking-wider border border-teal-200">
              Platform Features
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Designed for Complete Patient Care
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              Comprehensive clinical tools to manage lab reports, track medications, locate specialty care, and alert contacts during emergencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={idx} 
                  className="p-6 space-y-3 bg-white border border-slate-200 rounded-2xl card-hover-lift shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center border border-slate-200">
                    <Icon className="w-5 h-5 text-[#0D9488]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.description}</p>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-200">
              Simple Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              How MedicalAI Works
            </h2>
            <p className="text-sm text-slate-600">
              Four simple steps to transform raw paper lab tests into actionable health guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="text-3xl font-extrabold text-[#0D9488]/40 tracking-tight">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="bg-[#0F172A] hover:bg-[#1E293B] py-3.5 px-8 text-sm font-semibold rounded-xl cursor-pointer"
              onClick={() => navigate('/app/upload')}
            >
              Get Started Now
            </Button>
          </div>

        </div>
      </section>

      {/* FAQ Interactive Accordion Section */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-600 font-medium">Answers to common questions about report OCR, privacy, and clinical features.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs transition-all"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-[#0F172A] flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${faqOpen === idx ? 'rotate-180 text-[#0D9488]' : ''}`} />
                </button>
                
                {faqOpen === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed font-normal animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
