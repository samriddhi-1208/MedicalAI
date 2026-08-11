import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Star, 
  Clock, 
  Search,
  Bed,
  Siren,
  Compass,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Stethoscope,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_HOSPITALS } from '../data/mockData';
import { getMatchedMedicalCare } from '../utils/clinicalMatcher';

export const HospitalFinderPage = () => {
  const { reports } = useHealthData();
  const matchedCare = getMatchedMedicalCare(reports);

  const [hospitals] = useState(MOCK_HOSPITALS);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                          h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
    if (filterType === 'ayushman') return matchesSearch && h.ayushmanBharat;
    if (filterType === 'emergency') return matchesSearch && h.emergencyOpen;
    if (filterType === 'icu') return matchesSearch && h.icuAvailable > 0;
    return matchesSearch;
  });

  const handleCall = (phone, name) => {
    toast.success(`Dialing line: ${phone} (${name})`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">GPS Locator • Specialty Hospital Matcher</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">24/7 Hospital & Specialist Finder</h1>
          <p className="text-xs font-normal text-slate-500">Government District Hospitals, CHCs, & Ayushman Bharat (PM-JAY) Empaneled Centers</p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <Button variant="sos" size="sm" icon={PhoneCall} className="py-2.5 px-4 text-xs font-semibold rounded-xl cursor-pointer" onClick={() => handleCall("108", "National Ambulance Helpline 108")}>
            108 Ambulance Hotline
          </Button>

          <Button variant="secondary" size="sm" icon={Phone} className="py-2.5 px-4 text-xs font-semibold bg-slate-50 border-slate-200 text-[#0F172A] cursor-pointer" onClick={() => handleCall("102", "102 Maternal Helpline")}>
            102 Pregnancy Helpline
          </Button>
        </div>
      </div>

      {/* AI Clinical Recommendation Banner */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center border border-slate-200">
              <Sparkles className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">AI Matched Hospital & Specialist Doctor</h2>
              <p className="text-xs font-medium text-slate-500">Matched based on your diagnostic report condition: <strong className="text-[#0F172A]">{matchedCare.condition}</strong></p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Condition Matched ✓
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Building2 className="w-4 h-4 text-[#0D9488]" /> Recommended Specialty Hospital:
            </div>
            <p className="text-sm font-extrabold text-[#0F172A]">{matchedCare.hospitalName}</p>
            <p className="text-xs text-slate-500 font-normal">{matchedCare.specialty} • {matchedCare.address}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Stethoscope className="w-4 h-4 text-[#059669]" /> Consulting Specialist Doctor:
            </div>
            <p className="text-sm font-extrabold text-[#0F172A]">{matchedCare.doctorName}</p>
            <p className="text-xs text-slate-500 font-normal">{matchedCare.doctorRole} ({matchedCare.phone})</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hospital Cards List */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospital name, district, or medical specialty..."
              className="med-input"
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${filterType === 'all' ? 'bg-[#0F172A] text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Hospitals ({hospitals.length})
              </button>
              <button
                onClick={() => setFilterType('ayushman')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${filterType === 'ayushman' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                ✓ Ayushman PM-JAY Empaneled
              </button>
              <button
                onClick={() => setFilterType('emergency')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${filterType === 'emergency' ? 'bg-rose-700 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                24/7 Emergency
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredHospitals.map((hosp) => (
              <Card key={hosp.id} className="p-6 space-y-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">{hosp.name}</h3>
                    <p className="text-xs text-emerald-700 font-bold">{hosp.type}</p>
                  </div>
                  {hosp.ayushmanBharat ? (
                    <Badge variant="normal">Ayushman PM-JAY</Badge>
                  ) : (
                    <Badge variant="neutral">Private Diagnostic</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-normal">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {hosp.address}
                </p>

                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 text-slate-500 flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-amber-700 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {hosp.rating} ({hosp.reviewsCount} reviews)
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#0F172A]">
                    <Clock className="w-3.5 h-3.5 text-[#0D9488]" /> {hosp.distanceKm} km • ~{hosp.etaMins} mins
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <Bed className="w-3.5 h-3.5" /> {hosp.icuAvailable} ICU Beds
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="sos"
                    size="sm"
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
                    icon={Phone}
                    onClick={() => handleCall(hosp.phone, hosp.name)}
                  >
                    Call ({hosp.phone})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Navigation}
                    className="py-2.5 px-4 text-xs font-semibold bg-slate-50 border-slate-200 text-[#0F172A] rounded-xl cursor-pointer"
                    onClick={() => setSelectedHospital(hosp)}
                  >
                    Get Directions
                  </Button>
                </div>
              </Card>
            ))}
          </div>

        </div>

        {/* GPS Map Overview Card */}
        <Card className="lg:col-span-5 p-6 bg-slate-50 border border-slate-200 flex flex-col justify-between min-h-[360px] rounded-2xl shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                <Compass className="w-4.5 h-4.5 text-[#0D9488]" /> GPS Overview
              </h3>
              <Badge variant="info">Fast Network Mode</Badge>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Locates government district hospitals, emergency trauma centers, and empaneled clinics nearby.
            </p>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 shadow-2xs">
              <p className="font-bold text-[#0F172A] uppercase tracking-wider">AI Matched Center:</p>
              <p className="text-[#0F172A] font-extrabold text-sm">{matchedCare.hospitalName}</p>
              <p className="text-slate-500 font-medium">{matchedCare.address} • 108 Emergency Enabled</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
            Empaneled under <strong>Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)</strong> for medical care up to ₹5 Lakh/family.
          </div>
        </Card>

      </div>

      {/* Directions Modal */}
      <Modal
        isOpen={!!selectedHospital}
        onClose={() => setSelectedHospital(null)}
        title={`Directions to ${selectedHospital?.name}`}
      >
        {selectedHospital && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-[#0F172A]">{selectedHospital.name}</p>
              <p className="text-slate-500 font-medium">{selectedHospital.address}</p>
              <p className="text-emerald-700 font-bold">ETA: ~{selectedHospital.etaMins} mins ({selectedHospital.distanceKm} km drive)</p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-[#0F172A]">Step-by-step turn instructions:</p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-600 font-medium">
                <p>1. Head East on Main Expressway toward Hospital Circle (0.4 km)</p>
                <p>2. Turn right onto Clinical Hub Sector 4 (0.6 km)</p>
                <p>3. Arrive at Main Gate 1, {selectedHospital.name} (0.2 km)</p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                size="sm"
                icon={Phone}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-xs font-semibold py-2.5 px-5 rounded-xl cursor-pointer"
                onClick={() => handleCall(selectedHospital.phone, selectedHospital.name)}
              >
                Call Hospital ({selectedHospital.phone})
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
