import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Upload, 
  BrainCircuit, 
  MapPin, 
  Pill, 
  Siren, 
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  PhoneCall,
  Share2
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useHealthData } from '../context/HealthDataContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useHealthData();
  const [faqOpen, setFaqOpen] = useState(null);

  // Use logged in user name if available, otherwise generic demonstration placeholder
  const displayName = userProfile && userProfile.name && userProfile.name !== 'New Patient' 
    ? userProfile.name 
    : 'Sarah Jenkins';

  const displayAgeBlood = userProfile && userProfile.age 
    ? `${userProfile.age} yrs • ${userProfile.bloodGroup || 'O+'}`
    : '24 yrs • O+';

  const features = [
    {
      icon: Upload,
      title: "AI Medical OCR Extraction",
      description: "Upload scanned lab PDFs or paper test photos. Our OCR engine structures lab test values, units, and reference ranges automatically."
    },
    {
      icon: BrainCircuit,
      title: "Plain-Language Health Summaries",
      description: "Translates complex clinical jargon and biomarker intervals into clear, easy-to-understand medical summaries with practical lifestyle advice."
    },
    {
      icon: MapPin,
      title: "24/7 Nearest Hospital Locator",
      description: "Find government district hospitals, Community Health Centres (CHCs), and Ayushman Bharat (PM-JAY) empaneled medical centers nearby."
    },
    {
      icon: Pill,
      title: "Medication Reminders & Schedules",
      description: "Set up daily prescription reminder schedules, track logged doses, and receive early refill alerts when supplies run low."
    },
    {
      icon: Siren,
      title: "1-Click Emergency SOS Dispatch",
      description: "Instantly alert saved emergency contacts, primary physicians, and national 108 ambulance helplines with live GPS coordinates."
    },
    {
      icon: Shield,
      title: "Ayushman PM-JAY & 2G Fast Mode",
      description: "Optimized for semi-urban towns across India with low-bandwidth 2G/3G compatibility and Ayushman Bharat scheme support."
    }
  ];

  const faqs = [
    {
      question: "How does MedGuardian AI parse paper lab reports?",
      answer: "MedGuardian AI uses optical character recognition (OCR) combined with AI structuring to scan test titles, numerical values, and reference ranges directly from your uploaded paper report photo or PDF."
    },
    {
      question: "Is MedGuardian AI optimized for semi-urban towns in India?",
      answer: "Yes! MedGuardian AI features 108 Ambulance integration, Hindi/English language toggles, audio text-to-speech summary readout for elderly patients, and Ayushman Bharat (PM-JAY) hospital locator filters."
    },
    {
      question: "Is my personal medical data kept private?",
      answer: "Yes. All health data is encrypted and stored securely. We adhere strictly to patient privacy standards and do not sell or share patient records."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <Navbar />

      {/* Clean Healthcare Hero Section */}
      <section className="py-16 md:py-24 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold border border-[#BBF7D0]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clean Healthcare Portal • Ayushman PM-JAY Ready</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#11476C] tracking-tight leading-[1.15]">
                Smart AI Health Guardian for <span className="text-[#77CAF3]">Your Medical Reports</span>
              </h1>

              <p className="text-base text-[#475569] leading-relaxed max-w-2xl font-medium">
                Convert scanned blood test PDFs & paper lab photos into plain-language diagnostic explanations, daily prescription reminders, and 24/7 nearest hospital locator across India.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={Upload}
                  className="bg-[#11476C] hover:bg-[#0d3856] py-3 px-6 text-sm font-semibold rounded-xl shadow-md shadow-[#11476C]/15"
                  onClick={() => navigate('/app/upload')}
                >
                  Upload Blood Report
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={ArrowRight}
                  className="py-3 px-6 text-sm font-semibold rounded-xl bg-[#F0F9FF] border-[#77CAF3]/40 text-[#11476C] hover:bg-[#E0F2FE]"
                  onClick={() => navigate('/app/dashboard')}
                >
                  Open Patient Dashboard
                </Button>
              </div>

              {/* 3 Quick Benefit Pillars */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                <div>
                  <span className="block font-bold text-sm text-[#11476C]">Instant OCR</span>
                  <span>Paper PDF & JPG scan</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#11476C]">108 Ambulance</span>
                  <span>1-Click Emergency SOS</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#11476C]">Hindi / EN</span>
                  <span>Audio Summary (सुनें)</span>
                </div>
              </div>

            </div>

            {/* Right Card Feature Demonstration Mockup */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-4 bg-[#FFFFFF] shadow-lg shadow-slate-200/50 border border-[#E2E8F0] rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#11476C] text-white flex items-center justify-center font-bold shadow-xs">
                      <Shield className="w-5 h-5 text-[#77CAF3]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#11476C]">Patient Baseline</h3>
                      <p className="text-[11px] font-medium text-[#64748B]">Verified Clinical Record</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold border border-[#BBF7D0]">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Patient Name:</span>
                    <strong className="text-[#0F172A] font-bold">{displayName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Age / Blood Group:</span>
                    <strong className="text-[#0F172A] font-bold">{displayAgeBlood}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Primary Physician:</span>
                    <strong className="text-[#11476C] font-bold">Dr. Aris Thorne, MD (Civil Hospital)</strong>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-[#11476C] uppercase tracking-wider">Sample Diagnostic Panel Preview:</p>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]">
                    <span className="text-[#0F172A]">Fasting Glucose: <strong>98 mg/dL</strong></span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-bold text-[11px] border border-[#BBF7D0]">Normal</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]">
                    <span className="text-[#0F172A]">Hemoglobin: <strong>13.5 g/dL</strong></span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-bold text-[11px] border border-[#BBF7D0]">Normal</span>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="features" className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#F0F9FF] text-[#11476C] text-xs font-bold uppercase border border-[#77CAF3]/30">
              Clinical Services
            </span>
            <h2 className="text-3xl font-extrabold text-[#11476C]">
              Comprehensive Patient Healthcare Portal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-6 space-y-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl hover:border-[#77CAF3] transition-colors shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] text-[#11476C] flex items-center justify-center border border-[#77CAF3]/30">
                    <Icon className="w-5 h-5 text-[#11476C]" />
                  </div>
                  <h3 className="text-base font-bold text-[#11476C]">{item.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed font-medium">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-16 bg-[#FFFFFF] border-t border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#11476C]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#FFFFFF]">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-[#0F172A] flex justify-between items-center hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${faqOpen === idx ? 'rotate-180 text-[#11476C]' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="p-4 bg-[#F8FAFC] text-xs text-[#64748B] border-t border-[#E2E8F0] leading-relaxed font-medium">
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
