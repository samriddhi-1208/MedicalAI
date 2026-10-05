import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Upload, 
  FileText, 
  BrainCircuit, 
  Pill, 
  Siren, 
  ArrowRight,
  ChevronDown,
  Activity,
  Sparkles,
  Building2,
  ShieldCheck,
  Check,
  ArrowDown,
  TrendingUp,
  HeartPulse,
  Compass,
  PhoneCall,
  LayoutDashboard
} from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useHealthData } from '../context/HealthDataContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useHealthData();
  const [faqOpen, setFaqOpen] = useState(0);
  const [previewTab, setPreviewTab] = useState('dashboard'); // 'dashboard' | 'trends' | 'sos'

  const handleUploadClick = () => {
    if (isAuthenticated) {
      navigate('/app/upload');
    } else {
      navigate('/signup');
    }
  };

  const handleHowItWorksClick = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: FileText,
      title: "AI Medical Report Analysis",
      description: "Upload scanned lab tests (PDF, JPG, PNG). MedGuardian AI reads report text and extracts key parameters into your private patient portal."
    },
    {
      icon: BrainCircuit,
      title: "Biomarker Parameter Extraction",
      description: "Automatically identifies lab values such as Hemoglobin, WBCs, RBCs, Glucose, and Thyroid metrics without manual data entry."
    },
    {
      icon: TrendingUp,
      title: "Longitudinal Health Trends",
      description: "Interactive progression line charts for Hemoglobin (Hb), Blood Glucose, and Blood Pressure with 6-month clinical change tracking."
    },
    {
      icon: Building2,
      title: "Hospital & Emergency Center Finder",
      description: "Locate real nearby hospitals, specialist clinics, pharmacies, and emergency centers based on live geolocation."
    },
    {
      icon: Pill,
      title: "Medicine Schedule & Reminders",
      description: "Set daily dosage alerts, log taken prescriptions, track bottle inventory, and receive timely pharmacy refill warnings."
    },
    {
      icon: Siren,
      title: "Emergency SOS Assistance",
      description: "1-click automated email alert dispatch with live GPS coordinates to your emergency contacts, plus direct 108 ambulance dialing."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up securely to create your private, account-isolated healthcare workspace."
    },
    {
      step: "02",
      title: "Upload Report",
      description: "Upload paper photos or PDF lab results directly to your secure account."
    },
    {
      step: "03",
      title: "AI Analysis",
      description: "AI extracts lab values, measurement units, and standard reference ranges."
    },
    {
      step: "04",
      title: "View Insights",
      description: "Explore plain-language medical summaries and monitor your longitudinal health metrics."
    }
  ];

  const faqs = [
    {
      question: "How does MedGuardian AI process my medical reports?",
      answer: "When you upload a PDF or image report, MedGuardian AI extracts text, identifies test names, measured values, and reference ranges, and organizes the findings into your private patient dashboard."
    },
    {
      question: "Will unauthenticated visitors or other users see my health data?",
      answer: "No. Your health records are strictly isolated under your authenticated account ID. MedGuardian AI enforces strict JWT session security, ensuring no unauthenticated visitor or other user can ever view your records."
    },
    {
      question: "Does MedGuardian AI provide a definitive medical diagnosis?",
      answer: "No. MedGuardian AI provides AI-generated plain-language interpretations intended strictly for informational and record organization purposes. It does not provide definitive medical diagnoses and is not a replacement for consultation with a qualified medical doctor."
    },
    {
      question: "How does the Emergency SOS feature work?",
      answer: "When triggered, Emergency SOS dispatches automated email alerts containing live GPS coordinates to your saved emergency contacts and provides a direct shortcut to call the 108 ambulance helpline."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <Navbar />

      {/* Zero-Login Emergency Announcement Ribbon */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 flex-wrap shadow-xs">
        <span className="flex items-center gap-1.5 font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
          <Siren className="w-3.5 h-3.5" /> Emergency SOS
        </span>
        <span>Facing a medical emergency? Instant 1-tap dispatch, 108 ambulance call & GPS sharing:</span>
        <Link 
          to="/sos" 
          className="underline font-black hover:text-yellow-200 ml-1 inline-flex items-center gap-1"
        >
          Open SOS (No Login Needed) &rarr;
        </Link>
      </div>

      {/* MedGuardian AI Hero Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-[#0D9488] text-xs font-semibold border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>MedGuardian AI • Clinical Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Understand Your Health <br className="hidden sm:inline" />
                <span className="text-[#0D9488]">with AI Intelligence</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                MedGuardian AI turns scanned paper lab reports into structured biomarker data, longitudinal trend graphs, and rapid emergency location sharing.
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

                <Link
                  to="/sos"
                  className="py-3 px-5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Siren className="w-4 h-4 text-white animate-pulse" />
                  <span>1-Tap Emergency SOS</span>
                </Link>

                <Button
                  variant="secondary"
                  size="md"
                  icon={ArrowRight}
                  className="py-3.5 px-6 text-sm font-semibold rounded-xl bg-slate-50 border-slate-200 text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                  onClick={handleHowItWorksClick}
                >
                  How It Works
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">AI Report OCR</span>
                  <span>PDF & photo parsing</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Biomarker Trends</span>
                  <span>Longitudinal line graphs</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">24/7 Emergency SOS</span>
                  <span>1-click GPS email alert</span>
                </div>
              </div>

            </div>

            {/* Hero Right Patient-Facing Product Demonstration Flow */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold">
                      <BrainCircuit className="w-5 h-5 text-[#0D9488]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">MedGuardian AI Clinical Workflow</h3>
                      <p className="text-xs text-slate-500 font-medium">Patient Analysis System</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure AI Analysis
                  </span>
                </div>

                {/* Patient Flow Diagram */}
                <div className="space-y-2.5 text-xs">
                  
                  {/* Step 1: Medical Report */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#0F172A] flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4 text-[#0D9488]" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block text-xs">1. Medical Report</span>
                        <span className="text-[11px] text-slate-500 font-medium">Scanned PDF or photo lab result</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">PDF / Photo</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4 text-[#0D9488]" />
                  </div>

                  {/* Step 2: AI Analysis */}
                  <div className="p-3.5 rounded-xl bg-[#0F172A] text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-[#0D9488]" />
                      </div>
                      <div>
                        <span className="font-bold block text-xs text-white">2. AI Analysis</span>
                        <span className="text-[11px] text-slate-300 font-normal">Extracting test names, values & reference bounds</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0D9488]">Report Analyzed</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4 text-[#0D9488]" />
                  </div>

                  {/* Step 3: Extracted Health Information */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
                    <div className="flex items-center justify-between font-bold text-xs text-emerald-900">
                      <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> 3. AI-Extracted Health Data</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">MedGuardian AI Analysis Engine</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-white border border-emerald-200/80">
                        <span className="text-slate-500 block text-[10px]">Test Parameter:</span>
                        <strong className="text-[#0F172A] font-bold">Hemoglobin (13.8 g/dL)</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-emerald-200/80">
                        <span className="text-slate-500 block text-[10px]">Clinical Summary:</span>
                        <strong className="text-[#0F172A] font-bold">Plain-Language Insights</strong>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5 text-[#0D9488]" /> Account-Isolated Patient Records
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

      {/* MedGuardian AI Interactive Application Showcase Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-teal-50 text-[#0D9488] text-xs font-bold uppercase tracking-wider border border-teal-200">
              Platform Feature Preview
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Interactive Patient Portal Preview
            </h2>
            <p className="text-sm text-slate-600">
              Sample interface preview illustrating key patient features: Dashboard, Health Trends & Analytics, and Emergency SOS Center.
            </p>
          </div>

          {/* Interactive Viewport Tabs */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPreviewTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                previewTab === 'dashboard'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#0D9488]" /> Dashboard
            </button>

            <button
              onClick={() => setPreviewTab('trends')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                previewTab === 'trends'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#0D9488]" /> Health Trends & Analytics
            </button>

            <button
              onClick={() => setPreviewTab('sos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                previewTab === 'sos'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <Siren className="w-4 h-4" /> Emergency SOS Center
            </button>
          </div>

          {/* Feature Showcase Container */}
          <Card className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 max-w-4xl mx-auto space-y-6">
            
            {previewTab === 'dashboard' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block">Dashboard Preview</span>
                    <h3 className="text-xl font-extrabold text-white">Patient Workspace Overview</h3>
                  </div>
                  <Link to="/signup" className="px-3.5 py-1.5 rounded-xl bg-[#0D9488] text-white text-xs font-bold hover:bg-teal-600 transition-colors">
                    Try Live Dashboard →
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-center space-y-1">
                    <Upload className="w-5 h-5 text-teal-400 mx-auto" />
                    <span className="block text-xs font-bold text-slate-200">Upload Report</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-center space-y-1">
                    <Building2 className="w-5 h-5 text-teal-400 mx-auto" />
                    <span className="block text-xs font-bold text-slate-200">Find Hospital</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-center space-y-1">
                    <Pill className="w-5 h-5 text-teal-400 mx-auto" />
                    <span className="block text-xs font-bold text-slate-200">Medicine</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                    <span className="text-slate-300 block text-[11px] font-medium">Blood Pressure</span>
                    <strong className="text-white text-base font-extrabold block">118/78 <span className="text-[10px] font-normal text-slate-300">mmHg</span></strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                    <span className="text-slate-300 block text-[11px] font-medium">Fasting Glucose</span>
                    <strong className="text-white text-base font-extrabold block">95 <span className="text-[10px] font-normal text-slate-300">mg/dL</span></strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                    <span className="text-slate-300 block text-[11px] font-medium">Hemoglobin (Hb)</span>
                    <strong className="text-white text-base font-extrabold block">13.8 <span className="text-[10px] font-normal text-slate-300">g/dL</span></strong>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'trends' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block">Health Trends & Analytics</span>
                    <h3 className="text-xl font-extrabold text-white">Biomarker Longitudinal Progression</h3>
                  </div>
                  <Link to="/signup" className="px-3.5 py-1.5 rounded-xl bg-[#0D9488] text-white text-xs font-bold hover:bg-teal-600 transition-colors">
                    View Interactive Trends →
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Hemoglobin (Hb) Trend Line</span>
                    <span className="text-emerald-400 font-bold">+1.4 g/dL (6M Gain)</span>
                  </div>
                  <div className="h-20 bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center text-slate-200 text-xs font-mono font-medium">
                    📈 [Interactive Line Graph: Jan 12.4 → Aug 13.8 g/dL]
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'sos' && (
              <div className="space-y-5 animate-in fade-in duration-200 text-center">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-left">
                  <div>
                    <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block">Emergency SOS Center</span>
                    <h3 className="text-xl font-extrabold text-white">Emergency Assistance</h3>
                  </div>
                  <Link to="/signup" className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">
                    Open Emergency SOS →
                  </Link>
                </div>

                <div className="w-28 h-28 rounded-full bg-rose-600 text-white font-extrabold text-xl shadow-xl shadow-rose-900/50 flex flex-col items-center justify-center mx-auto border-4 border-rose-400 animate-pulse">
                  <span className="text-3xl leading-none">*</span>
                  <span>SOS</span>
                </div>

                <p className="text-xs text-slate-200 max-w-sm mx-auto font-medium">
                  Dispatches automated email alerts with live GPS coordinates to saved emergency contacts, with one-tap 108 ambulance calling.
                </p>
              </div>
            )}

          </Card>

        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-[#12141D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-900">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
              Integrated Healthcare Management Suite
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#C8D0E0] font-normal">
              Designed for secure health record organization, AI-assisted report analysis, medication tracking, emergency assistance, and nearby hospital discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={idx} 
                  className="p-6 space-y-3 bg-white dark:bg-[#1C1F2E] border border-slate-200 dark:border-slate-800 rounded-2xl card-hover-lift shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F5F7FA] flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Icon className="w-5 h-5 text-[#0D9488]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F5F7FA]">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#C8D0E0] leading-relaxed font-normal">{item.description}</p>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-[#161926] border-t border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#25293C] text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              Simple Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
              How MedGuardian AI Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#C8D0E0]">
              Four simple steps from account creation to AI report insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 dark:bg-[#1C1F2E] border border-slate-200/90 dark:border-slate-800 space-y-3">
                <div className="text-3xl font-extrabold text-[#0D9488]/40 dark:text-teal-400/40 tracking-tight">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F5F7FA]">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#C8D0E0] leading-relaxed font-normal">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#0D9488] dark:hover:bg-[#0f766e] text-white py-3.5 px-8 text-sm font-semibold rounded-xl cursor-pointer shadow-md"
              onClick={() => navigate('/signup')}
            >
              Get Started (Create Account)
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="py-3.5 px-8 text-sm font-semibold rounded-xl bg-white dark:bg-[#25293C] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e334a] text-[#0F172A] dark:text-[#F5F7FA] cursor-pointer shadow-2xs"
              onClick={() => navigate('/login')}
            >
              Already Have An Account? Sign In
            </Button>
          </div>

        </div>
      </section>

      {/* FAQ Interactive Accordion Section */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-[#12141D] transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-[#25293C] text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-slate-700">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-[#F5F7FA]">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-600 dark:text-[#C8D0E0] font-medium">Answers to common questions about report OCR, privacy, and clinical features.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border rounded-xl overflow-hidden shadow-xs transition-all ${
                  faqOpen === idx 
                    ? 'border-[#0D9488]/50 dark:border-[#0D9488]/60 bg-white dark:bg-[#1C1F2E]' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1F2E]'
                }`}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className={`w-full p-5 text-left font-bold text-sm flex justify-between items-center cursor-pointer transition-colors ${
                    faqOpen === idx 
                      ? 'bg-slate-50/60 dark:bg-[#25293C]/50 text-[#0D9488] dark:text-[#2DD4BF]' 
                      : 'text-[#0F172A] dark:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#25293C]'
                  }`}
                >
                  <span className={faqOpen === idx ? 'text-[#0D9488] dark:text-[#2DD4BF]' : 'text-[#0F172A] dark:text-[#F5F7FA]'}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                    faqOpen === idx 
                      ? 'rotate-180 text-[#0D9488] dark:text-[#2DD4BF]' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`} />
                </button>
                
                {faqOpen === idx && (
                  <div className="px-5 pb-5 pt-2 text-xs text-slate-600 dark:text-[#C8D0E0] border-t border-slate-100 dark:border-slate-800/80 leading-relaxed font-normal animate-in fade-in duration-150">
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
