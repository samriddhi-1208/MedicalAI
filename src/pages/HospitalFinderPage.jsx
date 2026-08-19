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
  Globe,
  SlidersHorizontal,
  Star,
  ShieldAlert,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../context/HealthDataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

// Haversine geographic distance calculation in km
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Ensure Leaflet JS and CSS are dynamically loaded in browser environment
const ensureLeafletLoaded = () => {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js-cdn')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js-cdn';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(window.L);
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.L) {
          clearInterval(interval);
          resolve(window.L);
        }
      }, 100);
    }
  });
};

import { getTranslation } from '../utils/translations';

export const HospitalFinderPage = () => {
  const { reports, userProfile, language } = useHealthData();
  const t = (key) => getTranslation(language, key);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});

  // Location Pipeline State
  const [locationState, setLocationState] = useState('prompt'); // 'prompt' | 'loading' | 'granted' | 'denied'
  const [locationMode, setLocationMode] = useState(null); // 'current' | 'manual' | 'profile'
  const [manualQuery, setManualQuery] = useState(userProfile?.city || '');
  const [userCoords, setUserCoords] = useState(null); // { lat, lng, name }

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [category, setCategory] = useState('Hospitals');
  const [radiusKm, setRadiusKm] = useState(5); // 5 | 10 | 25
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'relevance' | 'rating'
  
  // Real API Results State (ZERO Hardcoded / Demo Data)
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [selectedFacilityModal, setSelectedFacilityModal] = useState(null);

  // 1. Cautious Medical-AI Healthcare Guidance
  const getReportAwareAdvice = () => {
    if (!Array.isArray(reports) || reports.length === 0) return null;
    const latestReport = reports[0];
    const biomarkers = Array.isArray(latestReport.biomarkers) ? latestReport.biomarkers : [];

    const cardiacRisk = biomarkers.find(b => 
      (b.name?.toLowerCase().includes('cholesterol') || b.name?.toLowerCase().includes('triglyceride') || b.name?.toLowerCase().includes('ldl')) &&
      (b.status === 'Critical' || b.status === 'Severe High')
    );

    const diabeticRisk = biomarkers.find(b => 
      (b.name?.toLowerCase().includes('glucose') || b.name?.toLowerCase().includes('hba1c') || b.name?.toLowerCase().includes('sugar')) &&
      (b.status === 'Critical' || b.status === 'Severe High')
    );

    const anemiaRisk = biomarkers.find(b => 
      (b.name?.toLowerCase().includes('hemoglobin') || b.name?.toLowerCase().includes('rbc') || b.name?.toLowerCase().includes('iron')) &&
      (b.status === 'Critical' || b.status === 'Severe Low')
    );

    if (cardiacRisk) {
      return {
        biomarker: cardiacRisk.name,
        value: `${cardiacRisk.value} ${cardiacRisk.unit}`,
        recommendation: "Your report contains a lipid-related result that may benefit from professional evaluation.",
        suggestedCategory: "Cardiologist"
      };
    }

    if (diabeticRisk) {
      return {
        biomarker: diabeticRisk.name,
        value: `${diabeticRisk.value} ${diabeticRisk.unit}`,
        recommendation: "Your report contains a blood glucose result that may benefit from professional evaluation.",
        suggestedCategory: "General Physician"
      };
    }

    if (anemiaRisk) {
      return {
        biomarker: anemiaRisk.name,
        value: `${anemiaRisk.value} ${anemiaRisk.unit}`,
        recommendation: "Your report contains a red blood cell index result that may benefit from professional evaluation.",
        suggestedCategory: "General Physician"
      };
    }

    return null;
  };

  const reportAdvice = getReportAwareAdvice();

  // 2. Fetch Real Data from External Places API (OpenStreetMap Nominatim Live API)
  const fetchRealFacilities = async (lat, lng, targetCategory, keyword, radius, sortOrder) => {
    setLoadingFacilities(true);
    setApiError(null);

    try {
      let apiBaseUrl = 'https://medicalai-backend-5ycw.onrender.com/api';
      if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
        apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
        if (!apiBaseUrl.endsWith('/api')) apiBaseUrl += '/api';
      }

      // Try primary radius, auto-expand to 25km if 0 results
      const radiiToTry = [radius, 15, 25, 50];
      let data = [];
      let usedRadius = radius;

      for (const r of radiiToTry) {
        if (r < radius) continue; // Don't try smaller radius than requested
        const backendUrl = `${apiBaseUrl}/hospitals/nearby?lat=${lat}&lng=${lng}&category=${encodeURIComponent(targetCategory)}&radiusKm=${r}`;
        
        const res = await fetch(backendUrl).catch(() => null);
        if (res && res.ok) {
          const json = await res.json().catch(() => []);
          if (Array.isArray(json) && json.length > 0) {
            data = json;
            usedRadius = r;
            break;
          }
        }
      }

      // Process 100% Real API Data from backend
      const results = data.map((item, idx) => {
        const itemLat = item.lat;
        const itemLng = item.lng;
        const dist = item.distanceKm || calculateHaversineDistance(lat, lng, itemLat, itemLng);

        let categoryType = item.type || 'Hospital';
        if (targetCategory !== 'Hospitals' && targetCategory !== 'All') {
          categoryType = `${targetCategory} & Multi-Specialty Facility`;
        }

        return {
          id: item.id || `fac-${idx}`,
          name: item.name,
          type: categoryType,
          address: item.address || 'Address listed on map',
          distanceKm: dist,
          openStatus: item.openingHours ? `🟢 ${item.openingHours}` : (item.emergencyOpen ? '🟢 Open 24/7 (Emergency)' : null),
          rating: item.rating || null,
          emergencyConfirmed: item.emergencyOpen || false,
          phone: item.phone || null,
          website: item.website || null,
          lat: itemLat,
          lng: itemLng,
          directionsUrl: item.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
        };
      });

      // Sort by user selection
      if (sortOrder === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortOrder === 'relevance') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // Default: Distance
        results.sort((a, b) => a.distanceKm - b.distanceKm);
      }

      setFacilities(results);
    } catch (err) {
      console.error("API Fetch Error:", err);
      setFacilities([]);
      setApiError(err.message || "Unable to fetch nearby healthcare facilities. Please try again.");
    } finally {
      setLoadingFacilities(false);
    }
  };

  // 3. Obtain Browser Geolocation Permission (`navigator.geolocation`)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocationState('loading');
    setApiError(null);
    toast.loading("Obtaining browser GPS position...", { id: 'geo-toast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss('geo-toast');
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Current GPS Location"
        };

        // Attempt reverse geocode to get human-readable location name
        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`;
          const revRes = await fetch(revUrl);
          const revData = await revRes.json();
          if (revData?.display_name) {
            coords.name = revData.display_name;
          }
        } catch {
          // Keep GPS Location fallback label
        }

        setUserCoords(coords);
        setLocationState('granted');
        setLocationMode('current');
        toast.success("GPS Location detected!");
        await fetchRealFacilities(coords.lat, coords.lng, category, searchKeyword, radiusKm, sortBy);
      },
      (error) => {
        toast.dismiss('geo-toast');
        setLocationState('denied');
        toast.error("Location access was denied. Please allow location access or search for a city manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 4. Geocode Location manually by city / pincode fallback
  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    if (!manualQuery.trim()) {
      toast.error("Please enter a city name or location.");
      return;
    }

    setLocationState('loading');
    setApiError(null);

    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualQuery.trim())}&limit=1`;
      const nomRes = await fetch(nomUrl);
      const nomData = await nomRes.json();

      if (!Array.isArray(nomData) || nomData.length === 0) {
        throw new Error(`Unable to locate "${manualQuery}". Please check spelling.`);
      }

      const coords = {
        lat: parseFloat(nomData[0].lat),
        lng: parseFloat(nomData[0].lon),
        name: nomData[0].display_name
      };

      setUserCoords(coords);
      setLocationState('granted');
      setLocationMode('manual');
      toast.success(`Location set: ${coords.name.split(',')[0]}`);
      await fetchRealFacilities(coords.lat, coords.lng, category, searchKeyword, radiusKm, sortBy);
    } catch (err) {
      toast.error(err.message || "Could not locate specified area.");
      setApiError(err.message);
      setLocationState('denied');
    }
  };

  // Trigger search when filters change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    if (userCoords) {
      fetchRealFacilities(userCoords.lat, userCoords.lng, newCategory, searchKeyword, radiusKm, sortBy);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    if (userCoords) {
      fetchRealFacilities(userCoords.lat, userCoords.lng, category, searchKeyword, newRadius, sortBy);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (userCoords) {
      fetchRealFacilities(userCoords.lat, userCoords.lng, category, searchKeyword, radiusKm, newSort);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (userCoords) {
      fetchRealFacilities(userCoords.lat, userCoords.lng, category, searchKeyword, radiusKm, sortBy);
    } else {
      handleManualSearch();
    }
  };

  // 5. Mount & Sync Interactive Leaflet Map
  useEffect(() => {
    if (!userCoords || !mapContainerRef.current) return;

    ensureLeafletLoaded().then((L) => {
      if (!L) return;

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
      markersRef.current = {};

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // User Location Marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="background-color: #0F172A; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #0D9488; box-shadow: 0 0 12px rgba(13, 148, 136, 0.7);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br>${userCoords.name}`);

      // Facility Markers (Real API Data)
      facilities.forEach((fac) => {
        const isEmergency = fac.emergencyConfirmed;
        const facIcon = L.divIcon({
          className: 'custom-fac-marker',
          html: `<div style="background-color: ${isEmergency ? '#DC2626' : '#0D9488'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([fac.lat, fac.lng], { icon: facIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 220px; padding: 2px;">
            <strong style="color: #0F172A; display: block; font-size: 13px;">${fac.name}</strong>
            <span style="color: #475569; display: block; font-size: 11px; margin-top: 2px;">${fac.address}</span>
            <div style="margin-top: 6px; font-weight: bold; color: #0D9488; font-size: 11px;">
              ${fac.distanceKm} km away
            </div>
            <a href="${fac.directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; color: #0F172A; font-weight: bold; font-size: 11px; text-decoration: underline;">
              Get Directions →
            </a>
          </div>
        `);

        marker.on('click', () => {
          setSelectedFacilityId(fac.id);
        });

        markersRef.current[fac.id] = marker;
      });
    });
  }, [userCoords, facilities]);

  // Focus facility on card click
  const handleFacilityCardClick = (fac) => {
    setSelectedFacilityId(fac.id);
    if (leafletMapRef.current && fac.lat && fac.lng) {
      leafletMapRef.current.setView([fac.lat, fac.lng], 15);
      const marker = markersRef.current[fac.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const categories = [
    'Hospitals',
    'Clinics',
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
            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">{t('osmLocationEngine')}</span>
          </div>
          <h1 className="text-2.5xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
            {t('hospitalFinder247')}
          </h1>
          <p className="text-xs font-normal text-slate-500">
            {locationState === 'granted' && userCoords
              ? `${t('facilitiesNear')} ${userCoords.name.split(',')[0]}`
              : t('hospitalFinderSubtitle')
            }
          </p>
        </div>

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
            {t('ambulanceHotline')}
          </Button>
        </div>
      </div>

      {/* Medical-AI Cautious Healthcare Guidance */}
      {reportAdvice && (
        <Card className="p-5 bg-teal-50/60 border border-teal-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-[#0D9488] flex items-center justify-center font-bold border border-teal-200 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Healthcare Navigation Suggestion</h3>
                <p className="text-xs text-slate-600 font-normal">
                  Flagged report biomarker: <strong className="text-[#0F172A] font-bold">{reportAdvice.biomarker} ({reportAdvice.value})</strong>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleCategoryChange(reportAdvice.suggestedCategory)}
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

      {/* Location Access Prompt UI (Initial Un-Granted / Denied State) */}
      {locationState !== 'granted' && (
        <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-5 shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto border border-teal-200 shadow-2xs">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-[#0F172A]">{t('findHealthcareNearYou')}</h2>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              {t('locationAccessReq')}
            </p>
          </div>

          {locationState === 'denied' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold space-y-1">
              <p>⚠️ {t('locationDeniedWarning')}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Compass}
              loading={locationState === 'loading'}
              onClick={handleUseCurrentLocation}
              className="bg-[#0F172A] hover:bg-[#1E293B] py-3 px-6 text-xs font-semibold rounded-xl w-full sm:w-auto cursor-pointer"
            >
              {locationState === 'loading' ? t('loadingMedicalData') : t('useCurrentLocation')}
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={MapPin}
              onClick={() => {
                const city = prompt("Enter City Name or Pincode:", manualQuery || "Mumbai");
                if (city) {
                  setManualQuery(city);
                  handleManualSearch();
                }
              }}
              className="py-3 px-6 text-xs font-semibold rounded-xl bg-slate-50 border-slate-200 text-[#0F172A] hover:bg-slate-100 w-full sm:w-auto cursor-pointer"
            >
              {t('enterLocationManually')}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Location Search Bar & Controls (Shown once Location is active) */}
      {locationState === 'granted' && (
        <>
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-[#0D9488]" /> Active Location
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Healthcare facilities near <strong className="text-[#0F172A]">{userCoords?.name?.split(',')[0]}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={locationState === 'loading'}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                    locationMode === 'current'
                      ? 'bg-[#0F172A] text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Compass className={`w-4 h-4 ${locationMode === 'current' ? 'text-[#0D9488]' : 'text-slate-500'}`} />
                  <span>{locationState === 'loading' ? 'Locating...' : 'Use My Current Location'}</span>
                </button>
              </div>
            </div>

            {/* Real Search Bar & Filters Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              
              {/* Search Bar Input */}
              <div className="sm:col-span-6 relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search healthcare facilities... (e.g. hospital, cardiologist, lab)"
                  className="med-input text-xs pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Search Radius Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={radiusKm}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="med-input text-xs"
                >
                  <option value={5}>Radius: 5 km</option>
                  <option value={10}>Radius: 10 km</option>
                  <option value={25}>Radius: 25 km</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="med-input text-xs"
                >
                  <option value="distance">Sort: Distance</option>
                  <option value="relevance">Sort: Relevance</option>
                  <option value="rating">Sort: Rating</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <div className="sm:col-span-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={loadingFacilities}
                  className="bg-[#0F172A] hover:bg-[#1E293B] rounded-xl text-xs font-semibold py-2.5 w-full cursor-pointer"
                >
                  Search
                </Button>
              </div>

            </form>
          </Card>

          {/* Category Specialty Filter Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0F172A]">Facility Category</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = category === cat;
                const isEmergency = cat === 'Emergency Hospital';
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
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

          {/* Main Content Grid: Result Cards + Interactive OpenStreetMap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Result Cards */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>
                  Real API results for: <strong className="text-[#0F172A] font-bold">{category}</strong>
                </span>
                <span>
                  {loadingFacilities 
                    ? 'Finding healthcare facilities near you...'
                    : `${facilities.length} facilities found within ${radiusKm} km`
                  }
                </span>
              </div>

              {/* Loading State */}
              {loadingFacilities && (
                <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="w-8 h-8 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-extrabold text-[#0F172A]">Finding healthcare facilities near you...</p>
                </Card>
              )}

              {/* Error State (Zero Fake Data) */}
              {!loadingFacilities && apiError && (
                <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-base font-extrabold text-[#0F172A]">Unable to fetch nearby healthcare facilities.</h3>
                    <p className="text-xs text-slate-600 font-normal">{apiError}</p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RefreshCw}
                      className="rounded-xl text-xs font-semibold border-slate-200 cursor-pointer"
                      onClick={() => userCoords && fetchRealFacilities(userCoords.lat, userCoords.lng, category, searchKeyword, radiusKm, sortBy)}
                    >
                      Please try again
                    </Button>
                  </div>
                </Card>
              )}

              {/* Empty State (Zero Fake Data) */}
              {!loadingFacilities && !apiError && facilities.length === 0 && (
                <Card className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-base font-extrabold text-[#0F172A]">No healthcare facilities found within {radiusKm} km.</h3>
                    <p className="text-xs text-slate-600 font-normal">Try expanding your search radius to find facilities further out.</p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2 flex-wrap">
                    {radiusKm < 10 && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-xl text-xs font-semibold bg-[#0F172A] cursor-pointer"
                        onClick={() => handleRadiusChange(10)}
                      >
                        Search within 10 km
                      </Button>
                    )}
                    {radiusKm < 25 && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-xl text-xs font-semibold bg-[#0F172A] cursor-pointer"
                        onClick={() => handleRadiusChange(25)}
                      >
                        Search within 25 km
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {/* Real API Facility Cards (100% Authentic Data — Zero Fake Fallbacks) */}
              {!loadingFacilities && !apiError && facilities.map((fac) => (
                <Card 
                  key={fac.id}
                  onClick={() => handleFacilityCardClick(fac)}
                  className={`p-6 space-y-3.5 bg-white border rounded-2xl shadow-xs transition-all cursor-pointer ${
                    selectedFacilityId === fac.id ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20 bg-teal-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0F172A]">{fac.name}</h3>
                      <p className="text-xs text-[#0D9488] font-bold mt-0.5">{fac.type}</p>
                    </div>

                    {/* Open/Closed status — ONLY displayed if API provides it */}
                    {fac.openStatus ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shrink-0">
                        {fac.openStatus}
                      </span>
                    ) : fac.emergencyConfirmed ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 shrink-0">
                        24/7 Emergency Confirmed
                      </span>
                    ) : null}
                  </div>

                  {/* Real Address from API */}
                  <p className="text-xs text-slate-600 flex items-start gap-1.5 font-normal">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                    <span>{fac.address}</span>
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 text-slate-600 font-medium flex-wrap gap-2">
                    <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                      <Compass className="w-3.5 h-3.5 text-[#0D9488]" /> {fac.distanceKm} km away
                    </span>

                    {/* Rating — ONLY displayed if API provides it */}
                    {fac.rating && (
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {fac.rating}
                      </span>
                    )}

                    {/* Phone — Displayed if API provides it, or explicit "Phone unavailable" */}
                    <span className="text-slate-700 font-medium">
                      {fac.phone ? `📞 ${fac.phone}` : <span className="text-slate-400 italic">Phone unavailable</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {fac.phone ? (
                      <Button
                        variant="sos"
                        size="sm"
                        className="py-2 px-3.5 text-xs font-semibold rounded-xl cursor-pointer"
                        icon={Phone}
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Dialing ${fac.name}...`);
                          window.open(`tel:${fac.phone}`);
                        }}
                      >
                        Call ({fac.phone})
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                        Phone unavailable
                      </span>
                    )}

                    <a
                      href={fac.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFacilityModal(fac);
                      }}
                    >
                      View Details
                    </Button>
                  </div>

                </Card>
              ))}

            </div>

            {/* Right: Real Interactive Map Canvas (100% In Sync) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#0D9488]" /> Interactive OpenStreetMap Canvas
                  </span>
                  <span className="text-[#0D9488]">Live Real-Time Tiles</span>
                </div>

                {/* Interactive Leaflet Map Canvas */}
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-[440px] rounded-xl border border-slate-200 bg-slate-100 z-10" 
                />

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600 font-normal">
                  <span className="font-bold text-[#0F172A] block">Map Legend:</span>
                  <div className="flex items-center gap-4 text-[11px] pt-0.5">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0F172A] border border-[#0D9488]" /> Your Location</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" /> Healthcare Facility</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Emergency Hospital</span>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </>
      )}

      {/* Facility Details Modal */}
      <Modal
        isOpen={!!selectedFacilityModal}
        onClose={() => setSelectedFacilityModal(null)}
        title={selectedFacilityModal?.name || 'Facility Details'}
      >
        {selectedFacilityModal && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F172A]">{selectedFacilityModal.name}</h4>
                  <p className="text-xs text-[#0D9488] font-bold">{selectedFacilityModal.type}</p>
                </div>
                {selectedFacilityModal.emergencyConfirmed && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                    Emergency Service Confirmed
                  </span>
                )}
              </div>
              <p className="text-slate-600 font-normal">{selectedFacilityModal.address}</p>
              <p className="text-[#0F172A] font-bold">Distance: {selectedFacilityModal.distanceKm} km away</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F172A]">
                Phone: {selectedFacilityModal.phone || 'Phone unavailable'}
              </span>
              {selectedFacilityModal.phone && (
                <Button
                  variant="sos"
                  size="sm"
                  className="py-1.5 px-3 text-xs font-semibold rounded-lg cursor-pointer"
                  onClick={() => window.open(`tel:${selectedFacilityModal.phone}`)}
                >
                  Call Now
                </Button>
              )}
            </div>

            {selectedFacilityModal.website && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[200px]">{selectedFacilityModal.website}</span>
                <a
                  href={selectedFacilityModal.website}
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
                href={selectedFacilityModal.directionsUrl}
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
