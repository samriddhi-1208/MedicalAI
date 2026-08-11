import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  Search,
  Siren,
  Compass,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Stethoscope,
  Building2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

const API_BASE = 'http://localhost:5000/api';

export const HospitalFinderPage = () => {
  const { reports, userProfile } = useHealthData();
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  // Location State
  const [locationMode, setLocationMode] = useState('manual'); // 'current' | 'manual'
  const [manualQuery, setManualQuery] = useState(userProfile?.city || 'New Delhi');
  const [userCoords, setUserCoords] = useState(null); // { lat, lng, name }
  const [locLoading, setLocLoading] = useState(false);

  // Search & Facility State
  const [category, setCategory] = useState('All');
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);

  // 1. Report-Aware Medical Need Analysis
  const getReportAwareAdvice = () => {
    if (!Array.isArray(reports) || reports.length === 0) return null;
    const latestReport = reports[0];
    const biomarkers = Array.isArray(latestReport.biomarkers) ? latestReport.biomarkers : [];

    const cardiacRisk = biomarkers.find(b => 
      (b.name?.toLowerCase().includes('cholesterol') || b.name?.toLowerCase().includes('triglyceride') || b.name?.toLowerCase().includes('ldl')) &&
      (b.status === 'High' || b.status === 'Elevated' || b.statusType === 'warning')
    );

    const diabeticRisk = biomarkers.find(b => 
      (b.name?.toLowerCase().includes('glucose') || b.name?.toLowerCase().includes('hba1c') || b.name?.toLowerCase().includes('sugar')) &&
      (b.status === 'High' || b.status === 'Elevated' || b.statusType === 'warning')
    );

    const anemiaRisk = biomarkers.find(b => 
      (b.name?.toLowerCase().includes('hemoglobin') || b.name?.toLowerCase().includes('rbc') || b.name?.toLowerCase().includes('iron')) &&
      (b.status === 'Low' || b.status === 'Slightly Low' || b.statusType === 'warning')
    );

    if (cardiacRisk) {
      return {
        biomarker: cardiacRisk.name,
        value: `${cardiacRisk.value} ${cardiacRisk.unit}`,
        recommendation: "Based on your extracted report values, consider consulting a General Physician or Cardiologist.",
        suggestedCategory: "Cardiologist"
      };
    }

    if (diabeticRisk) {
      return {
        biomarker: diabeticRisk.name,
        value: `${diabeticRisk.value} ${diabeticRisk.unit}`,
        recommendation: "Based on your extracted report values, consider consulting a General Physician or Endocrinologist.",
        suggestedCategory: "General Physician"
      };
    }

    if (anemiaRisk) {
      return {
        biomarker: anemiaRisk.name,
        value: `${anemiaRisk.value} ${anemiaRisk.unit}`,
        recommendation: "Based on your extracted report values, consider consulting a General Physician or Hematologist.",
        suggestedCategory: "General Physician"
      };
    }

    return null;
  };

  const reportAdvice = getReportAwareAdvice();

  // 2. Fetch Facilities from Backend OpenStreetMap API
  const fetchNearbyFacilities = async (lat, lng, targetCategory = category) => {
    setLoadingFacilities(true);
    setErrorMsg('');

    try {
      const url = `${API_BASE}/hospitals/nearby?lat=${lat}&lng=${lng}&category=${encodeURIComponent(targetCategory)}&radiusKm=15`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Nearby healthcare data is temporarily unavailable. Please try again or enter another location.");
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setFacilities(data);
        if (data.length === 0) {
          setErrorMsg("No healthcare facilities found within 15 km of this location. Try expanding your search or selecting another city.");
        }
      } else {
        setFacilities([]);
        setErrorMsg("Nearby healthcare data is temporarily unavailable. Please try again or enter another location.");
      }
    } catch (err) {
      console.error("Facility fetch error:", err);
      setFacilities([]);
      setErrorMsg(err.message || "Nearby healthcare data is temporarily unavailable. Please try again or enter another location.");
    } finally {
      setLoadingFacilities(false);
    }
  };

  // 3. Geocode Location manually by city / pincode
  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    if (!manualQuery.trim()) {
      toast.error("Please enter a city or pincode to search.");
      return;
    }

    setLocLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/hospitals/geocode?query=${encodeURIComponent(manualQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Unable to locate "${manualQuery}". Please check spelling.`);
      }

      const coords = { lat: data.lat, lng: data.lng, name: data.name };
      setUserCoords(coords);
      setLocationMode('manual');
      toast.success(`Location set: ${data.name.split(',')[0]}`);
      await fetchNearbyFacilities(data.lat, data.lng, category);
    } catch (err) {
      toast.error(err.message || "Could not find specified location.");
      setErrorMsg(err.message);
    } finally {
      setLocLoading(false);
    }
  };

  // 4. Get Current Geolocation Coordinates
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocLoading(true);
    toast.loading("Fetching GPS position...", { id: 'geo-toast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss('geo-toast');
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Current GPS Position"
        };
        setUserCoords(coords);
        setLocationMode('current');
        toast.success("GPS location locked!");
        await fetchNearbyFacilities(coords.lat, coords.lng, category);
        setLocLoading(false);
      },
      (error) => {
        toast.dismiss('geo-toast');
        setLocLoading(false);
        let msg = "Geolocation permission denied. Please enter a city manually below.";
        if (error.code === error.TIMEOUT) msg = "GPS location request timed out. Please enter a city manually.";
        toast.error(msg);
        // Fallback to manual city if geolocation fails
        handleManualSearch();
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Initial load: Geocode user's default city or prompt location
  useEffect(() => {
    const initialCity = userProfile?.city || 'New Delhi';
    setManualQuery(initialCity);

    // Initial load fetch
    fetch(`${API_BASE}/hospitals/geocode?query=${encodeURIComponent(initialCity)}`)
      .then(res => res.json())
      .then(data => {
        if (data.lat && data.lng) {
          const coords = { lat: data.lat, lng: data.lng, name: data.name };
          setUserCoords(coords);
          fetchNearbyFacilities(data.lat, data.lng, 'All');
        }
      })
      .catch(() => {
        handleUseCurrentLocation();
      });
  }, []);

  // 5. Category Selection Change Handler
  const handleCategorySelect = (newCategory) => {
    setCategory(newCategory);
    if (userCoords) {
      fetchNearbyFacilities(userCoords.lat, userCoords.lng, newCategory);
    }
  };

  // 6. Interactive Leaflet Map Mounting
  useEffect(() => {
    if (!userCoords || !mapContainerRef.current) return;

    if (window.L) {
      const L = window.L;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current).setView([userCoords.lat, userCoords.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        leafletMapRef.current = map;
      } else {
        leafletMapRef.current.setView([userCoords.lat, userCoords.lng], 13);
      }

      const map = leafletMapRef.current;

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // User Marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="background-color: #0F172A; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #0D9488; box-shadow: 0 0 10px rgba(13, 148, 136, 0.6);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br>${userCoords.name}`);

      // Facility Markers
      facilities.forEach(fac => {
        const isEmergency = fac.emergencyOpen;
        const facIcon = L.divIcon({
          className: 'custom-fac-marker',
          html: `<div style="background-color: ${isEmergency ? '#DC2626' : '#0D9488'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([fac.lat, fac.lng], { icon: facIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 200px;">
            <strong style="color: #0F172A; display: block;">${fac.name}</strong>
            <span style="color: #475569; display: block; font-size: 11px;">${fac.address}</span>
            <span style="color: #0D9488; font-weight: bold;">${fac.distanceKm} km away</span>
          </div>
        `);
      });
    }
  }, [userCoords, facilities]);

  const categories = [
    'All',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Orthopedic',
    'Gynecologist',
    'Pediatrician',
    'Diagnostic Lab',
    'Pharmacy',
    'Emergency Hospital'
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">OpenStreetMap Real-Time Engine</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
            24/7 Hospital & Healthcare Finder
          </h1>
          <p className="text-xs font-normal text-slate-500">
            Real nearby hospitals, specialist clinics, pharmacies, and emergency centers based on live geolocation
          </p>
        </div>

        {/* Helpline CTAs */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="sos" 
            size="sm" 
            icon={PhoneCall} 
            className="py-2 px-3.5 text-xs font-semibold rounded-xl cursor-pointer"
            onClick={() => {
              toast.success("Dialing National Ambulance Helpline 108...");
              window.open("tel:108");
            }}
          >
            108 Ambulance Hotline
          </Button>
        </div>
      </div>

      {/* Report-Aware Medical Need Recommendation */}
      {reportAdvice && (
        <Card className="p-5 bg-teal-50/60 border border-teal-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-[#0D9488] flex items-center justify-center font-bold border border-teal-200 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Report-Aware Specialist Recommendation</h3>
                <p className="text-xs text-slate-600 font-normal">
                  Identified flagged biomarker: <strong className="text-[#0F172A] font-bold">{reportAdvice.biomarker} ({reportAdvice.value})</strong>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleCategorySelect(reportAdvice.suggestedCategory)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Find Nearby {reportAdvice.suggestedCategory}s</span>
            </button>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {reportAdvice.recommendation}
          </p>
        </Card>
      )}

      {/* Location Selector Card */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-[#0D9488]" /> Select Location
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Choose live GPS detection or enter city/pincode manually</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleUseCurrentLocation}
              disabled={locLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                locationMode === 'current'
                  ? 'bg-[#0F172A] text-white border-slate-800 shadow-xs'
                  : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Compass className={`w-4 h-4 ${locationMode === 'current' ? 'text-[#0D9488]' : 'text-slate-500'}`} />
              <span>{locLoading ? 'Locating...' : 'Use My Current Location'}</span>
            </button>
          </div>
        </div>

        {/* Manual Location Form */}
        <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Enter City Name or Pincode (e.g., Mumbai, New Delhi, 110001)"
              className="med-input text-xs"
            />
          </div>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={locLoading}
            icon={Search}
            className="bg-[#0F172A] hover:bg-[#1E293B] rounded-xl text-xs font-semibold py-2.5 px-5 shrink-0 cursor-pointer"
          >
            Search Location
          </Button>
        </form>

        {userCoords && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2">
            <span className="text-slate-600 font-medium truncate">
              Active Location: <strong className="text-[#0F172A] font-bold">{userCoords.name}</strong> ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> GPS Locked
            </span>
          </div>
        )}
      </Card>

      {/* Category Specialty Filter Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#0F172A]">Medical Facility Category</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = category === cat;
            const isEmergency = cat === 'Emergency Hospital';
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? isEmergency 
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-[#0F172A] text-white border-slate-800 shadow-xs'
                    : isEmergency
                    ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isEmergency && <Siren className="w-3.5 h-3.5 inline mr-1 text-rose-400" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid: Facilities List + Interactive OpenStreetMap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Facilities List */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Real-time results for: <strong className="text-[#0F172A] font-bold">{category}</strong>
            </span>
            <span>{facilities.length} Verified Facilities Found</span>
          </div>

          {/* Loading Skeleton */}
          {loadingFacilities && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 bg-white border border-slate-200 rounded-2xl animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                </Card>
              ))}
            </div>
          )}

          {/* Error / Empty State */}
          {!loadingFacilities && errorMsg && (
            <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-[#0F172A]">Nearby Healthcare Data Unavailable</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{errorMsg}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                className="rounded-xl text-xs font-semibold border-slate-200"
                onClick={() => userCoords && fetchNearbyFacilities(userCoords.lat, userCoords.lng, category)}
              >
                Retry Search
              </Button>
            </Card>
          )}

          {/* Real OpenStreetMap Facility Cards */}
          {!loadingFacilities && !errorMsg && facilities.map((fac) => (
            <Card 
              key={fac.id} 
              className={`p-6 space-y-3.5 bg-white border rounded-2xl shadow-xs transition-all ${
                selectedFacility?.id === fac.id ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">{fac.name}</h3>
                  <p className="text-xs text-[#0D9488] font-bold mt-0.5">{fac.type}</p>
                </div>

                {fac.emergencyOpen ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 shrink-0">
                    24/7 Emergency
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shrink-0">
                    {fac.openingHours || 'Healthcare Clinic'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 flex items-start gap-1.5 font-normal">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                <span>{fac.address}</span>
              </p>

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 text-slate-600 font-medium flex-wrap gap-2">
                <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                  <Compass className="w-3.5 h-3.5 text-[#0D9488]" /> {fac.distanceKm} km away
                </span>
                <span>Driving ETA: ~{fac.etaMins} mins</span>
                {fac.phone && (
                  <span className="text-slate-700 font-semibold">{fac.phone}</span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {fac.phone && (
                  <Button
                    variant="sos"
                    size="sm"
                    className="py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer"
                    icon={Phone}
                    onClick={() => {
                      toast.success(`Dialing ${fac.name}...`);
                      window.open(`tel:${fac.phone}`);
                    }}
                  >
                    Call ({fac.phone})
                  </Button>
                )}

                <a
                  href={fac.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A] hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  className="py-2 px-3 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 ml-auto cursor-pointer"
                  onClick={() => setSelectedFacility(fac)}
                >
                  View Details
                </Button>
              </div>

            </Card>
          ))}

        </div>

        {/* Right: Interactive OpenStreetMap Container */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#0D9488]" /> Live Interactive Map
              </span>
              <span className="text-[#0D9488]">OpenStreetMap Engine</span>
            </div>

            {/* Map Canvas Container */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-[420px] rounded-xl border border-slate-200 bg-slate-100 z-10" 
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600 font-normal">
              <span className="font-bold text-[#0F172A] block">Map Legend:</span>
              <div className="flex items-center gap-4 text-[11px] pt-0.5">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0F172A] border border-[#0D9488]" /> Your Location</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" /> Healthcare Clinic</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Emergency Hospital</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Facility Details Modal */}
      <Modal
        isOpen={!!selectedFacility}
        onClose={() => setSelectedFacility(null)}
        title={selectedFacility?.name || 'Facility Details'}
      >
        {selectedFacility && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F172A]">{selectedFacility.name}</h4>
                  <p className="text-xs text-[#0D9488] font-bold">{selectedFacility.type}</p>
                </div>
                {selectedFacility.emergencyOpen && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                    24/7 Emergency
                  </span>
                )}
              </div>
              <p className="text-slate-600 font-normal">{selectedFacility.address}</p>
              <p className="text-[#0F172A] font-bold">Distance: {selectedFacility.distanceKm} km away (~{selectedFacility.etaMins} mins drive)</p>
            </div>

            {selectedFacility.phone && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F172A]">Phone: {selectedFacility.phone}</span>
                <Button
                  variant="sos"
                  size="sm"
                  className="py-1.5 px-3 text-xs font-semibold rounded-lg"
                  onClick={() => window.open(`tel:${selectedFacility.phone}`)}
                >
                  Call Now
                </Button>
              </div>
            )}

            {selectedFacility.website && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[200px]">{selectedFacility.website}</span>
                <a
                  href={selectedFacility.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0D9488] font-bold hover:underline flex items-center gap-1"
                >
                  Visit Website <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <a
                href={selectedFacility.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 text-xs font-semibold rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#0D9488]" />
                <span>Get Google Maps Directions</span>
              </a>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
