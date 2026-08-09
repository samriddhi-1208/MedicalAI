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
  MicOff
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
    triggerSOS, 
    loadDemoData,
    clearAllData
  } = useHealthData();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const saveName = () => {
    if (tempName.trim()) {
      updateUserProfile({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const speakAudioSummary = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const summaryText = reports.length > 0
        ? `Namaste ${userProfile.name}. Your total cholesterol level is 224 milligrams per deciliter. Hemoglobin is 11.2. Blood sugar levels are stable.`
        : `Namaste ${userProfile.name}. Welcome to MedGuardian AI. Please upload your scanned medical report to view your health summary.`;
      
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      toast.success("Playing audio summary...");
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
    recognition.lang = 'gu-IN';

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
    const text = encodeURIComponent(`🏥 MedGuardian AI Summary for ${userProfile.name}: Managed via MedGuardian AI.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const pendingMeds = medicines.filter(m => !m.taken);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Patient Greeting Card with 28px Padding */}
      <Card className="p-7 bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs rounded-xl space-y-6">
        
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {reports.length > 0 ? (
              <Badge variant="warning">Attention Needed • 1 High Biomarker</Badge>
            ) : (
              <Badge variant="info">Fresh Account • Ready for Uploads</Badge>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-[#16A34A] font-medium bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ayushman Bharat (PM-JAY) Supported
            </span>
            <span className="text-xs font-normal text-[#475569]">
              {reports.length > 0 ? 'Last Test Date: July 28, 2026' : 'Personal Medical Workspace'}
            </span>
          </div>

          {reports.length > 0 && (
            <button
              onClick={clearAllData}
              className="text-xs font-medium text-[#475569] hover:text-[#DC2626] hover:underline"
            >
              Clear Data (Reset)
            </button>
          )}
        </div>

        {/* 32px Semibold Page Title / Greeting */}
        <div className="space-y-2">
          {isEditingName ? (
            <div className="flex items-center gap-3 my-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="med-input text-lg font-medium max-w-md"
                autoFocus
              />
              <button
                onClick={saveName}
                className="med-btn med-btn-primary py-2 px-4 text-sm font-medium"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#11476C] tracking-tight leading-snug">
                Good Morning, {userProfile.name}
              </h1>
              <button
                onClick={() => {
                  setTempName(userProfile.name);
                  setIsEditingName(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#11476C] hover:bg-[#E2E8F0] text-xs font-medium transition-colors inline-flex items-center gap-1 border border-[#E2E8F0]"
                title="Edit Patient Name"
              >
                <Edit2 className="w-3 h-3 text-[#11476C]" /> Edit Name
              </button>
            </div>
          )}

          {/* 16px Regular Body Text */}
          <p className="text-base font-normal text-[#475569] max-w-3xl leading-relaxed">
            {reports.length > 0 
              ? `Your overall AI Health Score is 84/100. Blood sugar levels remain stable, while cholesterol requires dietary fiber adjustments.`
              : `Welcome ${userProfile.name}! Upload your scanned medical report (PDF or Image) to parse your biomarkers and view AI explanations.`
            }
          </p>
        </div>

        {/* Important Actions Row */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0] flex-wrap">
          
          {/* Left Secondary Tools */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={startVoiceInput}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                isListening
                  ? 'bg-[#EF4444] text-white border-[#DC2626] animate-pulse'
                  : 'bg-[#F8FAFC] text-[#11476C] hover:bg-[#E2E8F0] border-[#E2E8F0]'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#11476C]" />}
              <span>{isListening ? 'Listening...' : 'Voice Input (અવાજથી બોલો)'}</span>
            </button>

            <button
              onClick={speakAudioSummary}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                isSpeaking
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#F8FAFC] text-[#11476C] hover:bg-[#E2E8F0] border-[#E2E8F0]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-[#11476C]" />
              <span>{isSpeaking ? 'Stop Audio' : 'Audio Summary (સાંભળો)'}</span>
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="px-3.5 py-2 rounded-lg bg-[#DCFCE7] text-[#16A34A] text-xs font-medium hover:bg-[#BBF7D0] flex items-center gap-1.5 border border-[#BBF7D0]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>

          {/* Right Primary Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="py-2.5 px-5 text-sm font-medium"
              onClick={() => navigate('/app/upload')}
            >
              Upload Blood Report
            </Button>

            {reports.length === 0 && (
              <Button
                variant="secondary"
                size="md"
                icon={Sparkles}
                className="py-2.5 px-5 text-sm font-medium"
                onClick={loadDemoData}
              >
                Load Demo Preview Data
              </Button>
            )}

            <Button
              variant="sos"
              size="md"
              icon={Siren}
              className="py-2.5 px-5 text-sm font-medium"
              onClick={() => triggerSOS("Manual Dashboard SOS Button")}
            >
              Emergency SOS
            </Button>
          </div>

        </div>

      </Card>

      {/* Empty State Card */}
      {reports.length === 0 && (
        <Card className="p-10 text-center border-dashed border-[#E2E8F0] bg-[#FFFFFF] space-y-6 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto border border-[#BFDBFE]">
            <FolderOpen className="w-7 h-7 text-[#1D4ED8]" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-2xl font-semibold text-[#11476C]">
              No Medical Reports Uploaded Yet
            </h2>
            <p className="text-base font-normal text-[#475569] leading-relaxed">
              Upload a scanned PDF or photo of your lab test result to parse your biomarkers automatically.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              className="py-2.5 px-6 text-sm font-medium"
              onClick={() => navigate('/app/upload')}
            >
              Upload Your First Report
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              className="py-2.5 px-6 text-sm font-medium"
              onClick={loadDemoData}
            >
              Load Sample Demo Data
            </Button>
          </div>
        </Card>
      )}

      {/* Populated Dashboard Metrics & Tables */}
      {reports.length > 0 && (
        <>
          {/* Vital Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card className="p-6 space-y-2 bg-[#FFFFFF]">
              <div className="flex items-center justify-between text-xs text-[#475569] font-medium uppercase tracking-wider">
                <span>Total Cholesterol</span>
                <Badge variant="warning">Borderline</Badge>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-semibold text-[#11476C]">224 <span className="text-xs font-normal text-[#475569]">mg/dL</span></span>
                <span className="text-xs text-[#B45309] font-medium">224 mg/dL</span>
              </div>
              <p className="text-xs text-[#475569]">Ref Range: &lt; 200 mg/dL</p>
            </Card>

            <Card className="p-6 space-y-2 bg-[#FFFFFF]">
              <div className="flex items-center justify-between text-xs text-[#475569] font-medium uppercase tracking-wider">
                <span>Hemoglobin</span>
                <Badge variant="warning">Borderline</Badge>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-semibold text-[#11476C]">11.2 <span className="text-xs font-normal text-[#475569]">g/dL</span></span>
                <span className="text-xs text-[#B45309] font-medium">11.2 g/dL</span>
              </div>
              <p className="text-xs text-[#475569]">Ref Range: 12.0 - 15.5 g/dL</p>
            </Card>

            <Card className="p-6 space-y-2 bg-[#FFFFFF]">
              <div className="flex items-center justify-between text-xs text-[#475569] font-medium uppercase tracking-wider">
                <span>HbA1c Sugar</span>
                <Badge variant="normal">Normal</Badge>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-semibold text-[#11476C]">5.8 <span className="text-xs font-normal text-[#475569]">%</span></span>
                <span className="text-xs text-[#16A34A] font-medium">5.8 %</span>
              </div>
              <p className="text-xs text-[#475569]">Ref Range: &lt; 5.7 %</p>
            </Card>

            <Card className="p-6 space-y-2 bg-[#FFFFFF]">
              <div className="flex items-center justify-between text-xs text-[#475569] font-medium uppercase tracking-wider">
                <span>Blood Pressure</span>
                <Badge variant="normal">Normal</Badge>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-semibold text-[#11476C]">122/80 <span className="text-xs font-normal text-[#475569]">mmHg</span></span>
                <span className="text-xs text-[#16A34A] font-medium">Normal</span>
              </div>
              <p className="text-xs text-[#475569]">Ref Range: 120/80 mmHg</p>
            </Card>

          </div>

          {/* Main Grid: Reports Table + Medication Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Reports Table */}
            <Card className="lg:col-span-2 p-7 space-y-4 bg-[#FFFFFF]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#11476C]">Recent Medical Reports</h3>
                  <p className="text-xs text-[#475569]">Structured by MedGuardian AI OCR Engine</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  className="font-medium"
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
                        <td className="font-semibold text-[#11476C] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                          <span>{report.title}</span>
                        </td>
                        <td className="text-[#475569]">{report.labName}</td>
                        <td className="text-[#475569]">{report.date}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-medium border border-[#BFDBFE]">
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
                            className="font-medium text-[#1D4ED8]"
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
            <Card className="p-7 space-y-4 bg-[#FFFFFF]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#11476C] flex items-center gap-2">
                    <Pill className="w-4.5 h-4.5 text-[#1D4ED8]" /> Today's Medications
                  </h3>
                  <p className="text-xs text-[#475569]">{pendingMeds.length} pending doses for today</p>
                </div>
                <Link to="/app/medicines" className="text-xs font-medium text-[#1D4ED8] hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-3">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-lg border flex items-center justify-between ${
                      med.taken ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60' : 'bg-[#FFFFFF] border-[#E2E8F0]'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${med.taken ? 'line-through text-[#475569]' : 'text-[#11476C]'}`}>
                        {med.name}
                      </p>
                      <p className="text-xs text-[#475569]">{med.dosage} • {med.time}</p>
                    </div>

                    <button
                      onClick={() => toggleMedicineTaken(med.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        med.taken
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#BFDBFE]'
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
