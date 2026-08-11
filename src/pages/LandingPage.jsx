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
  Search,
  Building2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useHealthData } from '../context/HealthDataContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useHealthData();
  const [faqOpen, setFaqOpen] = useState(0);

  const handleUploadClick = () => {
    if (isAuthenticated) {
      navigate('/app/upload');
    } else {
      navigate('/signup');
    }
  };

  const handleSignInClick = () => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: FileText,
      title: "AI Medical Report Analysis",
      description: "Upload scanned lab tests (PDF, JPG, PNG). Our OCR & AI engine extracts test parameters, units, and reference ranges into structured JSON."
    },
    {
      icon: BrainCircuit,
      title: "Biomarker Parameter Extraction",
      description: "Automatically parses lab values such as Hemoglobin, WBCs, RBCs, Glucose, and Thyroid metrics without manual data entry."
    },
    {
      icon: Activity,
      title: "Personalized Health Insights",
      description: "Plain-language interpretations of out-of-range clinical parameters paired with actionable dietary and lifestyle suggestions."
    },
    {
      icon: Building2,
      title: "24/7 Hospital & Specialist Finder",
      description: "Locate empaneled government district hospitals, CHCs, and Ayushman Bharat PM-JAY centers near your GPS location."
    },
    {
      icon: Pill,
      title: "Medicine Schedule & Reminders",
      description: "Set daily dosage alerts, log taken prescriptions, track bottle inventory, and receive timely pharmacy refill warnings."
    },
    {
      icon: Siren,
      title: "Emergency SOS Dispatch",
      description: "1-click automated SMS/Email alert dispatch with live GPS coordinates to your emergency contacts and care providers."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up securely to create your private, encrypted healthcare workspace."
    },
    {
      step: "02",
      title: "Upload Report",
      description: "Upload paper photos or PDF lab results directly to the secure backend processor."
    },
    {
      step: "03",
      title: "AI Parameter Extraction",
      description: "AI extracts lab values, measurement units, and reference bounds into structured JSON data."
    },
    {
      step: "04",
      title: "View Insights",
      description: "Explore plain-language diagnostic summaries and monitor your longitudinal health metrics."
    }
  ];

  const faqs = [
    {
      question: "How does MedicalAI process my medical reports?",
      answer: "MedicalAI uses an AI and Optical Character Recognition (OCR) pipeline. When you upload a PDF or image report, our backend extracts the text, identifies test names, values, and reference ranges, and structures the findings into your private database."
    },
    {
      question: "Will unauthenticated visitors or other users see my health data?",
      answer: "No. Your health records are strictly isolated under your authenticated account ID. MedicalAI enforces strict JWT session security, ensuring no unauthenticated visitor or other user can ever view your records."
    },
    {
      question: "Does MedicalAI provide a definitive medical diagnosis?",
      answer: "No. MedicalAI provides AI-generated interpretations intended strictly for informational and record organization purposes. It is not a replacement for professional consultation with a qualified medical doctor."
    },
    {
      question: "How does the Emergency SOS feature work?",
      answer: "When triggered, Emergency SOS dispatches automated alert payloads containing live GPS coordinates to your saved emergency contacts and care providers."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <Navbar />

      {/* Hero Section - Pure Product Focus (No Fake Patient Data) */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-[#0D9488] text-xs font-semibold border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>AI-Powered Medical Report Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Understand Your Medical Reports <br className="hidden sm:inline" />
                <span className="text-[#0D9488]">with AI Intelligence</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Upload your medical report and let MedicalAI extract important clinical parameters and provide an easy-to-understand interpretation.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={Upload}
                  className="bg-[#0F172A] hover:bg-[#1E293B] py-3.5 px-6 text-sm font-semibold rounded-xl shadow-md shadow-slate-900/10 cursor-pointer"
                  onClick={handleUploadClick}
                >
                  Upload Medical Report
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={ArrowRight}
                  className="py-3.5 px-6 text-sm font-semibold rounded-xl bg-slate-50 border-slate-200 text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                  onClick={handleSignInClick}
                >
                  {isAuthenticated ? "Open Dashboard" : "Sign In"}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Instant OCR</span>
                  <span>PDF & paper report extraction</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Structured JSON</span>
                  <span>Parameter & bound parsing</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">256-Bit Encrypted</span>
                  <span>Private database storage</span>
                </div>
              </div>

            </div>

            {/* Hero Right Product Capability Preview (Generic Showcase) */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold">
                      <BrainCircuit className="w-5 h-5 text-[#0D9488]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">MedicalAI OCR Pipeline</h3>
                      <p className="text-xs text-slate-500 font-medium">Automated Structured Extraction</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    SaaS Engine
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#0F172A]">
                      <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-[#0D9488]" /> Input Document:</span>
                      <span className="text-slate-500 text-[11px]">PDF / PNG / JPG</span>
                    </div>
                    <p className="text-slate-600 font-medium text-[11px]">Raw lab report file uploaded by patient</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between text-[#0D9488] font-bold">
                      <span>Structured JSON Output:</span>
                      <span>100% Parsed</span>
                    </div>
                    <p className="text-slate-300 font-normal">
                      &#123; "biomarkers": [ &#123; "name": "Hemoglobin", "status": "Extracted" &#125; ] &#125;
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-900">
                    <span className="font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Patient Privacy Guaranteed</span>
                    <p className="text-[11px] font-normal">Records are saved strictly under your private authenticated user account.</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5 text-[#0D9488]" /> REST API Connected
                  </span>
                  <Link to="/signup" className="text-[#0D9488] font-bold hover:underline">
                    Get Started Free →
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
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Integrated Healthcare Management Suite
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              Designed for complete record organization, AI biomarker extraction, prescription tracking, and 24/7 emergency care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              Four simple steps from account creation to AI report insights.
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
              onClick={handleUploadClick}
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
