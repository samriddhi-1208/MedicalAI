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

export const LandingPage = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState(null);

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />

      {/* Clean Healthcare Hero Section */}
      <section className="py-16 md:py-24 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold border border-[#BBF7D0]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clean Healthcare Portal • Ayushman PM-JAY Ready</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Smart AI Health Guardian for <span className="text-[#1D4ED8]">Your Medical Reports</span>
              </h1>

              <p className="text-base text-[#475569] leading-relaxed max-w-2xl">
                Convert scanned blood test PDFs & paper lab photos into plain-language diagnostic explanations, daily prescription reminders, and 24/7 nearest hospital locator across India.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={Upload}
                  onClick={() => navigate('/app/upload')}
                >
                  Upload Blood Report
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={ArrowRight}
                  onClick={() => navigate('/app/dashboard')}
                >
                  Open Patient Dashboard
                </Button>
              </div>

              {/* 3 Quick Benefit Pillars */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0] text-xs font-semibold text-[#475569]">
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Instant OCR</span>
                  <span>Paper PDF & JPG scan</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">108 Ambulance</span>
                  <span>1-Click Emergency SOS</span>
                </div>
                <div>
                  <span className="block font-bold text-sm text-[#0F172A]">Hindi / EN</span>
                  <span>Audio Summary (सुनें)</span>
                </div>
              </div>

            </div>

            {/* Right Card Feature Mockup */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-4 bg-[#FFFFFF] shadow-md border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">Patient Baseline</h3>
                      <p className="text-[11px] text-[#475569]">Verified Clinical Record</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] text-xs font-bold">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569] font-medium">Patient Name:</span>
                    <strong className="text-[#0F172A]">Laxmi Manapure</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569] font-medium">Age / Blood Group:</span>
                    <strong className="text-[#0F172A]">20 yrs • B+</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569] font-medium">Primary Doctor:</span>
                    <strong className="text-[#1D4ED8]">Dr. Rajesh Kumar (Civil Hospital)</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#0F172A]">Extracted Lab Panel Summary:</p>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs">
                    <span>Total Cholesterol: <strong>224 mg/dL</strong></span>
                    <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-bold">Borderline</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs">
                    <span>Hemoglobin: <strong>11.2 g/dL</strong></span>
                    <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-bold">Low</span>
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
            <span className="px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold uppercase">
              Clinical Services
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">
              Comprehensive Patient Healthcare Portal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-6 space-y-3 bg-[#FFFFFF] hover:border-[#93C5FD] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{item.description}</p>
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
            <h2 className="text-2xl font-extrabold text-[#0F172A]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#FFFFFF]">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-[#0F172A] flex justify-between items-center hover:bg-[#F8FAFC]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-[#475569] transition-transform ${faqOpen === idx ? 'rotate-180 text-[#1D4ED8]' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="p-4 bg-[#F8FAFC] text-xs text-[#475569] border-t border-[#E2E8F0] leading-relaxed">
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
