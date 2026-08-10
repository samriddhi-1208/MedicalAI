import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Siren, 
  Pill, 
  FileText,
  Plus,
  Sparkles,
  FolderOpen,
  Volume2,
  Share2,
  Edit2,
  CheckCircle2,
  Mic,
  MicOff,
  FileCheck,
  ShieldAlert,
  Clock,
  HeartPulse,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    updateUserProfile,
    reports, 
    medicines, 
    toggleMedicineTaken, 
    loadDemoData,
    clearAllData,
    language
  } = useHealthData();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Dynamic time-of-day greeting based on selected language (EN, HI, GU)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'HI') {
      if (hour < 12) return "शुभ प्रभात";
      if (hour < 17) return "शुभ दोपहर";
      return "शुभ संध्या";
    }
    if (language === 'GU') {
      if (hour < 12) return "સુપ્રભાત";
      if (hour < 17) return "શુભ બપોર";
      return "શુભ સંધ્યા";
    }
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Dynamic button labels based on selected language
  const voiceLabel = language === 'HI' 
    ? 'आवाज से बोलें (Voice Search)' 
    : language === 'GU' 
    ? 'અવાજથી બોલો (Voice Search)' 
    : 'Voice Search';

  const audioLabel = language === 'HI'
    ? 'ऑडियो सारांश (सुनें)'
    : language === 'GU'
    ? 'ઓડિયો સારાંશ (સાંભળો)'
    : 'Audio Summary (Listen)';

  const saveName = () => {
    if (tempName.trim()) {
      updateUserProfile({ name: tempName.trim() });
      toast.success("Patient name updated!");
    }
    setIsEditingName(false);
  };

  // Get active report & biomarkers
  const latestReport = reports.length > 0 ? reports[0] : null;
  const extractedBiomarkers = latestReport?.biomarkers || [];

  const speakAudioSummary = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      let summaryText = "";
      if (language === 'HI') {
        summaryText = latestReport
          ? `नमस्ते ${userProfile.name}. आपकी हालिया मेडिकल रिपोर्ट का विश्लेषण कर लिया गया है।`
          : `नमस्ते ${userProfile.name}. मेडीगार्डियन एआई में आपका स्वागत है। अपनी लैब रिपोर्ट अपलोड करें।`;
      } else if (language === 'GU') {
        summaryText = latestReport
          ? `નમસ્તે ${userProfile.name}. તમારા તાજેતરના તબીબી અહેવાલનું પૃથ્થકરણ કરવામાં આવ્યું છે.`
          : `નમસ્તે ${userProfile.name}. મેડીગાર્ડિયન એઆઈમાં આપનું સ્વાગત છે. તમારો લેબ રિપોર્ટ અપલોડ કરો.`;
      } else {
        summaryText = latestReport
          ? `Namaste ${userProfile.name}. ${latestReport.aiSummary || `Your report ${latestReport.title} has been parsed with AI accuracy.`}`
          : `Namaste ${userProfile.name}. Welcome to MedGuardian AI. Your personal health workspace is ready. Please upload your medical lab report to parse your biomarkers.`;
      }
      
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.lang = language === 'GU' ? 'gu-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      toast.success(`Playing AI audio summary (${language})...`);
    } else {
      toast.error("Audio playback not supported in browser.");
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'GU' ? 'gu-IN' : language === 'HI' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      toast.loading("Listening... Speak now...", { id: 'voice-toast' });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      toast.dismiss('voice-toast');
      toast.success(`Voice Received: "${transcript}"`);

      const lower = transcript.toLowerCase();
      if (lower.includes('hospital') || lower.includes('હોસ્પિટલ') || lower.includes('अस्पताल')) {
        navigate('/app/hospitals');
      } else if (lower.includes('upload') || lower.includes('અપલોડ') || lower.includes('अपलोड')) {
        navigate('/app/upload');
      } else if (lower.includes('medicine') || lower.includes('દવા') || lower.includes('दवा')) {
        navigate('/app/medicines');
      } else if (lower.includes('sos') || lower.includes('help') || lower.includes('મદદ')) {
        navigate('/app/sos');
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.dismiss('voice-toast');
    };

    recognition.onend = () => {
      setIsListening(false);
      toast.dismiss('voice-toast');
    };

    recognition.start();
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`🏥 MedGuardian AI Patient Workspace for ${userProfile.name}:\nStatus: Active\nReports Tracked: ${reports.length}\nManaged via MedGuardian AI Assistant.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const pendingMeds = medicines.filter(m => !m.taken);

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* Patient Greeting Hero Section */}
      <Card className="p-7 bg-[#FFFFFF] border border-[#E2E8F0] shadow-md shadow-slate-200/40 rounded-2xl space-y-6">
        
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {latestReport ? (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1 rounded-full border ${
                latestReport.statusType === 'warning'
                  ? 'text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]'
                  : 'text-[#166534] bg-[#DCFCE7] border-[#BBF7D0]'
              }`}>
                {latestReport.statusType === 'warning' ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {latestReport.status} • {extractedBiomarkers.length} Parameters Parsed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#11476C] bg-[#F0F9FF] px-3.5 py-1 rounded-full border border-[#77CAF3]/40">
                <HeartPulse className="w-3.5 h-3.5 text-[#77CAF3]" /> Personal Workspace Ready
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-3.5 py-1 rounded-full border border-[#BBF7D0]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ayushman Bharat (PM-JAY) Supported
            </span>
          </div>

          {reports.length > 0 && (
            <button
              onClick={clearAllData}
              className="text-xs font-semibold text-[#64748B] hover:text-[#DC2626] hover:underline cursor-pointer"
            >
              Reset Workspace
            </button>
          )}
        </div>

        {/* Dynamic Title / Greeting */}
        <div className="space-y-2">
          {isEditingName ? (
            <div className="flex items-center gap-3 my-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="med-input text-lg font-semibold max-w-md"
                autoFocus
              />
              <button
                onClick={saveName}
                className="px-4 py-2 rounded-xl bg-[#11476C] text-white text-xs font-semibold hover:bg-[#0d3856] shadow-xs cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-3 py-2 rounded-xl bg-[#F1F5F9] text-[#475569] text-xs font-semibold hover:bg-[#E2E8F0] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2.5xl sm:text-3xl font-bold text-[#11476C] tracking-tight leading-snug">
                {getGreeting()}, {userProfile.name}
              </h1>
              <button
                onClick={() => {
                  setTempName(userProfile.name);
                  setIsEditingName(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#11476C] hover:bg-[#E2E8F0] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border border-[#E2E8F0] cursor-pointer"
                title="Edit Patient Name"
              >
                <Edit2 className="w-3 h-3 text-[#11476C]" /> Edit Name
              </button>
            </div>
          )}

          <p className="text-base font-medium text-[#475569] max-w-3xl leading-relaxed">
            {latestReport 
              ? (latestReport.aiSummary || `Your report "${latestReport.title}" has been structured. Total ${extractedBiomarkers.length} biomarker test parameters parsed.`)
              : `Welcome to your AI clinical portal. Upload your scanned medical report (PDF or Image) to parse your biomarkers automatically.`
            }
          </p>
        </div>

        {/* Feature Tools & Action Bar */}
        <div className="flex items-center justify-between gap-4 pt-5 border-t border-[#E2E8F0] flex-wrap">
          
          {/* Multilingual Voice & Communication Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            <button
              onClick={startVoiceInput}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border shadow-2xs ${
                isListening
                  ? 'bg-[#EF4444] text-white border-[#DC2626] animate-pulse'
                  : 'bg-[#F0F9FF] text-[#11476C] hover:bg-[#E0F2FE] border-[#77CAF3]/40'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#11476C]" />}
              <span>{isListening ? 'Listening...' : voiceLabel}</span>
            </button>

            <button
              onClick={speakAudioSummary}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border shadow-2xs ${
                isSpeaking
                  ? 'bg-[#EF4444] text-white border-[#DC2626]'
                  : 'bg-[#F8FAFC] text-[#11476C] hover:bg-[#F1F5F9] border-[#E2E8F0]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#11476C]" />
              <span>{isSpeaking ? 'Stop Audio' : audioLabel}</span>
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold hover:bg-[#BBF7D0] flex items-center gap-2 border border-[#BBF7D0] shadow-2xs cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="py-2.5 px-6 text-sm font-semibold rounded-xl bg-[#11476C] hover:bg-[#0d3856] shadow-md shadow-[#11476C]/15"
              onClick={() => navigate('/app/upload')}
            >
              Upload Blood Report
            </Button>

            {reports.length === 0 && (
              <Button
                variant="secondary"
                size="md"
                icon={Sparkles}
                className="py-2.5 px-5 text-sm font-semibold rounded-xl bg-[#F0F9FF] text-[#11476C] border-[#77CAF3]/50 hover:bg-[#E0F2FE]"
                onClick={loadDemoData}
              >
                Load Sample Preview
              </Button>
            )}
          </div>

        </div>

      </Card>

      {/* Sleek Empty State Card */}
      {reports.length === 0 && (
        <Card className="p-10 text-center border-2 border-dashed border-[#CBD5E1] bg-[#FFFFFF] space-y-6 rounded-2xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F9FF] text-[#11476C] flex items-center justify-center mx-auto border border-[#77CAF3]/40 shadow-sm">
            <FolderOpen className="w-8 h-8 text-[#11476C]" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-[#11476C]">
              No Medical Reports Uploaded Yet
            </h2>
            <p className="text-sm font-medium text-[#64748B] leading-relaxed">
              Drag & drop or upload a scanned PDF or photo of your lab test result to parse your biomarkers automatically.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#475569] flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Supported Formats: PDF, PNG, JPG
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F0F9FF] border border-[#77CAF3]/30 text-[#11476C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#77CAF3]" /> AI Biomarker Parsing Engine Active
            </span>
          </div>

          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="py-3 px-7 text-sm font-semibold rounded-xl bg-[#11476C] hover:bg-[#0d3856] shadow-md shadow-[#11476C]/20"
              onClick={() => navigate('/app/upload')}
            >
              Upload Your First Report
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              className="py-3 px-6 text-sm font-semibold rounded-xl border-[#E2E8F0] hover:bg-[#F8FAFC]"
              onClick={loadDemoData}
            >
              Load Sample Demo Data
            </Button>
          </div>
        </Card>
      )}

      {/* Populated Dashboard Metrics & Tables — 100% Dynamic Extracted Biomarkers */}
      {reports.length > 0 && (
        <>
          {/* Dynamic Vital Metrics Grid from Extracted Report Biomarkers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {extractedBiomarkers.slice(0, 4).map((bm, index) => {
              const isWarning = bm.statusType === 'warning' || bm.status === 'High' || bm.status === 'Low' || bm.status === 'Borderline' || bm.status === 'Elevated';

              return (
                <Card key={bm.id || index} className="p-6 space-y-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs hover:border-[#77CAF3] transition-all">
                  <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold uppercase tracking-wider">
                    <span className="truncate max-w-[140px]">{bm.name}</span>
                    <Badge variant={isWarning ? "warning" : "normal"}>{bm.status}</Badge>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2.5xl font-bold text-[#11476C]">
                      {bm.value} <span className="text-xs font-medium text-[#64748B]">{bm.unit}</span>
                    </span>
                    <span className={`text-xs font-semibold ${isWarning ? 'text-[#B45309]' : 'text-[#16A34A]'}`}>
                      {bm.status}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#64748B]">Ref Bounds: {bm.refRange} {bm.unit}</p>
                </Card>
              );
            })}

          </div>

          {/* Main Grid: Reports Table + Medication Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Reports Table */}
            <Card className="lg:col-span-2 p-7 space-y-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#11476C]">Recent Medical Reports</h3>
                  <p className="text-xs font-medium text-[#64748B]">Structured by MedGuardian AI OCR Engine</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  className="font-semibold text-xs border-[#E2E8F0]"
                  onClick={() => navigate('/app/upload')}
                >
                  Upload New
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="med-table">
                  <thead>
                    <tr>
                      <th>Report Title</th>
                      <th>Diagnostic Lab</th>
                      <th>Date Uploaded</th>
                      <th>OCR Confidence</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="font-bold text-[#11476C] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#11476C] shrink-0" />
                          <span>{report.title}</span>
                        </td>
                        <td className="text-[#64748B] font-medium">{report.labName}</td>
                        <td className="text-[#64748B] font-medium">{report.date}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F0F9FF] text-[#11476C] text-xs font-semibold border border-[#77CAF3]/30">
                            {report.ocrConfidence}
                          </span>
                        </td>
                        <td>
                          <Badge variant={report.statusType}>{report.status}</Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-semibold text-[#11476C] hover:bg-[#F0F9FF]"
                            onClick={() => navigate('/app/analysis')}
                          >
                            View Analysis
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Medicines Widget */}
            <Card className="p-7 space-y-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#11476C] flex items-center gap-2">
                    <Pill className="w-4.5 h-4.5 text-[#11476C]" /> Today's Medications
                  </h3>
                  <p className="text-xs font-medium text-[#64748B]">{pendingMeds.length} pending doses for today</p>
                </div>
                <Link to="/app/medicines" className="text-xs font-semibold text-[#11476C] hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-3">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      med.taken ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60' : 'bg-[#FFFFFF] border-[#E2E8F0]'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${med.taken ? 'line-through text-[#64748B]' : 'text-[#11476C]'}`}>
                        {med.name}
                      </p>
                      <p className="text-xs font-medium text-[#64748B]">{med.dosage} • {med.time}</p>
                    </div>

                    <button
                      onClick={() => toggleMedicineTaken(med.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        med.taken
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : 'bg-[#F0F9FF] text-[#11476C] hover:bg-[#E0F2FE]'
                      }`}
                    >
                      {med.taken ? 'Logged ✓' : 'Take Now'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </>
      )}

    </div>
  );
};
