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
  Activity,
  ArrowRight,
  TrendingUp
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
  const latestReport = (Array.isArray(reports) && reports.length > 0) ? reports[0] : null;
  const extractedBiomarkers = Array.isArray(latestReport?.biomarkers) ? latestReport.biomarkers : [];

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
          : `नमस्ते ${userProfile.name}. मेडिकल एआई में आपका स्वागत है। अपनी लैब रिपोर्ट अपलोड करें।`;
      } else if (language === 'GU') {
        summaryText = latestReport
          ? `નમસ્તે ${userProfile.name}. તમારા તાજેતરના તબીબી અહેવાલનું પૃથ્થકરણ કરવામાં આવ્યું છે.`
          : `નમસ્તે ${userProfile.name}. મેડિકલ એઆઈમાં આપનું સ્વાગત છે. તમારો લેબ રિપોર્ટ અપલોડ કરો.`;
      } else {
        summaryText = latestReport
          ? `Namaste ${userProfile.name}. ${latestReport.aiSummary || `Your report ${latestReport.title} has been parsed with AI accuracy.`}`
          : `Namaste ${userProfile.name}. Welcome to MedicalAI. Your personal health workspace is ready. Please upload your medical lab report to parse your biomarkers.`;
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
    const text = encodeURIComponent(`🏥 MedicalAI Patient Workspace for ${userProfile.name}:\nStatus: Active\nReports Tracked: ${reports.length}\nManaged via MedicalAI Assistant.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const pendingMeds = (Array.isArray(medicines) ? medicines : []).filter(m => !m.taken);

  return (
    <div className="space-y-8 pb-12 font-sans antialiased">
      
      {/* Patient Hero Executive Banner */}
      <Card className="p-7 bg-white border border-slate-200 shadow-md shadow-slate-200/40 rounded-2xl space-y-6">
        
        {/* Badges Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {latestReport ? (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1 rounded-full border ${
                latestReport.statusType === 'warning'
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}>
                {latestReport.statusType === 'warning' ? <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {latestReport.status} • {extractedBiomarkers.length} Parameters Parsed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200">
                <HeartPulse className="w-3.5 h-3.5 text-[#0D9488]" /> Clinical Portal Active
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ayushman Bharat (PM-JAY) Empaneled
            </span>
          </div>

          {reports.length > 0 && (
            <button
              onClick={clearAllData}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              Reset Workspace
            </button>
          )}
        </div>

        {/* Title / Greeting */}
        <div className="space-y-2">
          {isEditingName ? (
            <div className="flex items-center gap-3 my-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="med-input text-lg font-bold max-w-md"
                autoFocus
              />
              <button
                onClick={saveName}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2.5xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
                {getGreeting()}, {userProfile.name}
              </h1>
              <button
                onClick={() => {
                  setTempName(userProfile.name);
                  setIsEditingName(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Edit Patient Name"
              >
                <Edit2 className="w-3 h-3 text-[#0D9488]" /> Edit Name
              </button>
            </div>
          )}

          <p className="text-base font-normal text-slate-600 max-w-3xl leading-relaxed">
            {latestReport 
              ? (latestReport.aiSummary || `Your report "${latestReport.title}" has been structured. Total ${extractedBiomarkers.length} biomarker test parameters parsed.`)
              : `Welcome to your AI clinical portal. Upload your scanned medical report (PDF or Image) to parse your biomarkers automatically.`
            }
          </p>
        </div>

        {/* Feature Tools & Action Bar */}
        <div className="flex items-center justify-between gap-4 pt-5 border-t border-slate-100 flex-wrap">
          
          {/* Multilingual Voice & Communication Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            <button
              onClick={startVoiceInput}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border shadow-2xs ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-slate-50 text-[#0F172A] hover:bg-slate-100 border-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#0D9488]" />}
              <span>{isListening ? 'Listening...' : voiceLabel}</span>
            </button>

            <button
              onClick={speakAudioSummary}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border shadow-2xs ${
                isSpeaking
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-slate-50 text-[#0F172A] hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#0D9488]" />
              <span>{isSpeaking ? 'Stop Audio' : audioLabel}</span>
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-2 border border-emerald-200 shadow-2xs cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share via WhatsApp</span>
            </button>

          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="py-2.5 px-6 text-sm font-semibold rounded-xl bg-[#0F172A] hover:bg-[#1E293B] shadow-md shadow-slate-900/10 cursor-pointer"
              onClick={() => navigate('/app/upload')}
            >
              Upload Blood Report
            </Button>

            {reports.length === 0 && (
              <Button
                variant="secondary"
                size="md"
                icon={Sparkles}
                className="py-2.5 px-5 text-sm font-semibold rounded-xl bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 cursor-pointer"
                onClick={loadDemoData}
              >
                Load Sample Preview
              </Button>
            )}
          </div>

        </div>

      </Card>

      {/* Clean Empty State Card */}
      {reports.length === 0 && (
        <Card className="p-10 text-center border-2 border-dashed border-slate-300 bg-white space-y-6 rounded-2xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
            <FolderOpen className="w-8 h-8 text-[#0D9488]" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              No Medical Reports Uploaded Yet
            </h2>
            <p className="text-sm font-normal text-slate-600 leading-relaxed">
              Drag & drop or upload a scanned PDF or photo of your lab test result to parse your biomarkers automatically.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Formats: PDF, PNG, JPG
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI OCR Engine Active
            </span>
          </div>

          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="py-3 px-7 text-sm font-semibold rounded-xl bg-[#0F172A] hover:bg-[#1E293B] cursor-pointer"
              onClick={() => navigate('/app/upload')}
            >
              Upload Your First Report
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              className="py-3 px-6 text-sm font-semibold rounded-xl border-slate-200 hover:bg-slate-50 cursor-pointer"
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
                <Card key={bm.id || index} className="p-6 space-y-2 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <span className="truncate max-w-[140px]">{bm.name}</span>
                    <Badge variant={isWarning ? "warning" : "normal"}>{bm.status}</Badge>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2.5xl font-extrabold text-[#0F172A]">
                      {bm.value} <span className="text-xs font-normal text-slate-500">{bm.unit}</span>
                    </span>
                    <span className={`text-xs font-semibold ${isWarning ? 'text-amber-700' : 'text-emerald-600'}`}>
                      {bm.status}
                    </span>
                  </div>

                  <p className="text-xs font-normal text-slate-500">Ref Bounds: {bm.refRange} {bm.unit}</p>
                </Card>
              );
            })}

          </div>

          {/* Main Grid: Reports Table + Medication Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Reports Table */}
            <Card className="lg:col-span-2 p-7 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F172A]">Recent Medical Reports</h3>
                  <p className="text-xs font-normal text-slate-500">Structured by MedicalAI OCR Engine</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  className="font-semibold text-xs border-slate-200 rounded-xl"
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
                        <td className="font-bold text-[#0F172A] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0D9488] shrink-0" />
                          <span>{report.title}</span>
                        </td>
                        <td className="text-slate-600 font-medium">{report.labName}</td>
                        <td className="text-slate-600 font-medium">{report.date}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
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
                            className="font-semibold text-[#0F172A] hover:bg-slate-100"
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
            <Card className="p-7 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Pill className="w-4.5 h-4.5 text-[#0D9488]" /> Today's Medications
                  </h3>
                  <p className="text-xs font-normal text-slate-500">{pendingMeds.length} pending doses for today</p>
                </div>
                <Link to="/app/medicines" className="text-xs font-bold text-[#0D9488] hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-3">
                {(Array.isArray(medicines) ? medicines : []).map((med) => (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      med.taken ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${med.taken ? 'line-through text-slate-500' : 'text-[#0F172A]'}`}>
                        {med.name}
                      </p>
                      <p className="text-xs font-medium text-slate-500">{med.dosage} • {med.time}</p>
                    </div>

                    <button
                      onClick={() => toggleMedicineTaken(med.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        med.taken
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
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
