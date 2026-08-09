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
  PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_HOSPITALS } from '../data/mockData';

export const HospitalFinderPage = () => {
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
    toast.success(`Dialing emergency line: ${phone} (${name})`);
  };

  return (
    <div className="space-y-6 pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-xs text-[#16A34A] font-bold uppercase">District GPS Active • Tier 2/3 India Locator</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">24/7 Nearest Hospital & Emergency Locator</h2>
          <p className="text-xs text-[#475569]">Includes Government Hospitals, CHCs, & Ayushman Bharat (PM-JAY) Empaneled Centers</p>
        </div>

        <div className="flex gap-2">
          <Button variant="sos" size="sm" icon={PhoneCall} onClick={() => handleCall("108", "National Ambulance Helpline 108")}>
            108 Ambulance Hotline
          </Button>

          <Button variant="secondary" size="sm" icon={Phone} onClick={() => handleCall("102", "102 Maternal Helpline")}>
            102 Pregnancy Helpline
          </Button>
        </div>
      </div>

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
                className={`px-3 py-1 rounded-lg text-xs font-bold ${filterType === 'all' ? 'bg-[#1D4ED8] text-white' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A]'}`}
              >
                All Hospitals ({hospitals.length})
              </button>
              <button
                onClick={() => setFilterType('ayushman')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${filterType === 'ayushman' ? 'bg-[#16A34A] text-white' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A]'}`}
              >
                ✓ Ayushman PM-JAY Empaneled
              </button>
              <button
                onClick={() => setFilterType('emergency')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${filterType === 'emergency' ? 'bg-[#EF4444] text-white' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A]'}`}
              >
                24/7 Emergency
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredHospitals.map((hosp) => (
              <Card key={hosp.id} className="p-5 space-y-3 bg-[#FFFFFF]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{hosp.name}</h3>
                    <p className="text-xs text-[#1D4ED8] font-semibold">{hosp.type}</p>
                  </div>
                  {hosp.ayushmanBharat ? (
                    <Badge variant="normal">Ayushman PM-JAY</Badge>
                  ) : (
                    <Badge variant="neutral">Private Diagnostic</Badge>
                  )}
                </div>

                <p className="text-xs text-[#475569] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#475569] shrink-0" /> {hosp.address}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0] text-[#475569]">
                  <span className="flex items-center gap-1 text-[#D97706] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {hosp.rating} ({hosp.reviewsCount} reviews)
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#0F172A]">
                    <Clock className="w-3.5 h-3.5 text-[#1D4ED8]" /> {hosp.distanceKm} km • ~{hosp.etaMins} mins
                  </span>
                  <span className="flex items-center gap-1 text-[#16A34A] font-bold">
                    <Bed className="w-3.5 h-3.5" /> {hosp.icuAvailable} ICU Beds
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="sos"
                    size="sm"
                    className="flex-1"
                    icon={Phone}
                    onClick={() => handleCall(hosp.phone, hosp.name)}
                  >
                    Call ({hosp.phone})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Navigation}
                    onClick={() => setSelectedHospital(hosp)}
                  >
                    Get Directions
                  </Button>
                </div>
              </Card>
            ))}
          </div>

        </div>

        {/* Clean Map Overview Card */}
        <Card className="lg:col-span-5 p-5 bg-[#DBEAFE]/30 border-[#BFDBFE] flex flex-col justify-between min-h-[350px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#1D4ED8]" /> District GPS Overview
              </h3>
              <Badge variant="info">Low-Data Optimized</Badge>
            </div>
            <p className="text-xs text-[#475569]">
              Designed for semi-urban towns in India. Operates efficiently on 2G/3G cellular networks during emergencies.
            </p>

            <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-xs space-y-2">
              <p className="font-bold text-[#0F172A]">Nearest Government Hospital:</p>
              <p className="text-[#1D4ED8] font-bold">District Civil Hospital & Trauma Centre</p>
              <p className="text-[#475569]">Distance: 1.2 km • Drive ETA: 4 mins • 108 Ambulance Ready</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#BFDBFE] text-xs text-[#475569]">
            Empaneled under <strong>Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)</strong> for cashless hospital treatment up to ₹5 Lakh/family.
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
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#DBEAFE] border border-[#93C5FD] space-y-1">
              <p className="font-bold text-[#0F172A]">{selectedHospital.name}</p>
              <p className="text-[#475569]">{selectedHospital.address}</p>
              <p className="text-[#16A34A] font-bold">ETA: ~{selectedHospital.etaMins} mins ({selectedHospital.distanceKm} km drive)</p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-[#0F172A]">Step-by-step turn instructions:</p>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-[#475569]">
                <p>1. Head East on Station Road toward District Hospital Circle (0.4 km)</p>
                <p>2. Turn right onto Civil Lines Expressway (0.6 km)</p>
                <p>3. Arrive at Main Gate 1, {selectedHospital.name} (0.2 km)</p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                size="sm"
                icon={Phone}
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
