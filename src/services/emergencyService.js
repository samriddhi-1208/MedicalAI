/**
 * MedGuardian AI — Universal Real-Time Emergency Service Architecture
 * Live Geolocation, Multi-Stage OpenStreetMap Bounding Box + Reverse Geocoding District Engine for Gujarat & India.
 * ZERO HARDCODED HOSPITALS OR TRUSTED CONTACTS.
 */

/**
 * Haversine formula to calculate actual distance between two GPS coordinates in km
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const emergencyService = {
  /**
   * Fetches real nearby emergency hospitals for ANY location in Gujarat / India using multi-tier spatial bounding box & district reverse geocoding
   */
  fetchLiveNearbyEmergencyHospitals: async (lat, lng) => {
    try {
      let rawResults = [];

      // Stage 1: Local 35km Spatial Bounding Box
      const delta1 = 0.35;
      const viewbox1 = `${lng - delta1},${lat + delta1},${lng + delta1},${lat - delta1}`;
      const url1 = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=hospital&viewbox=${viewbox1}&bounded=1&limit=30`;

      try {
        const res1 = await fetch(url1, { headers: { 'User-Agent': 'MedGuardianAI-GujaratEngine/1.0' } });
        if (res1.ok) rawResults = await res1.json();
      } catch (e) {
        console.error("Stage 1 search error:", e);
      }

      // Stage 2: Expanded 60km Spatial Bounding Box if Stage 1 < 5 results
      if (!Array.isArray(rawResults) || rawResults.length < 5) {
        const delta2 = 0.60;
        const viewbox2 = `${lng - delta2},${lat + delta2},${lng + delta2},${lat - delta2}`;
        const url2 = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=hospital&viewbox=${viewbox2}&bounded=1&limit=40`;
        try {
          const res2 = await fetch(url2, { headers: { 'User-Agent': 'MedGuardianAI-GujaratEngine/1.0' } });
          if (res2.ok) {
            const data2 = await res2.json();
            if (Array.isArray(data2) && data2.length > rawResults.length) {
              rawResults = data2;
            }
          }
        } catch (e) {
          console.error("Stage 2 search error:", e);
        }
      }

      // Stage 3: Reverse Geocoding City / District Query (For rural Gujarat towns & villages)
      if (!Array.isArray(rawResults) || rawResults.length < 3) {
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'MedGuardianAI-GujaratEngine/1.0' }
          });
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData.address || {};
            const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.district || addr.state_district || addr.state;
            
            if (cityName) {
              const cityUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=hospital+in+${encodeURIComponent(cityName)}+Gujarat&limit=40`;
              const cityRes = await fetch(cityUrl, { headers: { 'User-Agent': 'MedGuardianAI-GujaratEngine/1.0' } });
              if (cityRes.ok) {
                const cityData = await cityRes.json();
                if (Array.isArray(cityData) && cityData.length > 0) {
                  rawResults = cityData;
                }
              }
            }
          }
        } catch (e) {
          console.error("Stage 3 city reverse geocoding error:", e);
        }
      }

      // Stage 4: Gujarat State Fallback
      if (!Array.isArray(rawResults) || rawResults.length === 0) {
        try {
          const stateUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=hospital+in+Gujarat&limit=40`;
          const stateRes = await fetch(stateUrl, { headers: { 'User-Agent': 'MedGuardianAI-GujaratEngine/1.0' } });
          if (stateRes.ok) {
            rawResults = await stateRes.json();
          }
        } catch (e) {
          console.error("Stage 4 state fallback search error:", e);
        }
      }

      if (!Array.isArray(rawResults) || rawResults.length === 0) {
        return [];
      }

      // Map and calculate exact Haversine proximity for every hospital
      const mapped = rawResults.map((item, index) => {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        const distKm = calculateHaversineDistance(lat, lng, itemLat, itemLng);
        const addressObj = item.address || {};
        
        const fullAddress = [
          addressObj.road,
          addressObj.suburb || addressObj.neighbourhood,
          addressObj.city || addressObj.town || addressObj.county || addressObj.village,
          addressObj.state || 'Gujarat',
          addressObj.postcode
        ].filter(Boolean).join(', ') || item.display_name;

        const phone = item.extratags?.phone || item.extratags?.['contact:phone'] || null;
        const is24_7 = item.extratags?.opening_hours === '24/7' || item.extratags?.emergency === 'yes';

        return {
          id: `hosp-live-${item.place_id || index}`,
          name: item.name || item.display_name.split(',')[0] || `Emergency Hospital #${index + 1}`,
          address: fullAddress,
          lat: itemLat,
          lng: itemLng,
          distanceKm: distKm ? parseFloat(distKm.toFixed(1)) : null,
          distanceText: distKm ? `${distKm.toFixed(1)} km` : 'Proximity calculated',
          driveTimeText: distKm ? `${Math.max(2, Math.round(distKm * 2.5))} min drive` : 'Drive time unavailable',
          phone: phone,
          phoneText: phone ? phone : 'Phone number unavailable',
          emergencyType: is24_7 ? '24/7 ER Available' : 'Emergency Care Facility',
          directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${itemLat},${itemLng}`
        };
      });

      // Sort strictly by proximity from user's current GPS location
      mapped.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
      return mapped;
    } catch (err) {
      console.error("Failed to fetch live nearby emergency facilities:", err);
      return [];
    }
  },

  getIndiaEmergencyHelpline: () => {
    return {
      nationalHelpline: "108",
      label: "108 National Emergency Medical Ambulance Helpline",
      country: "India"
    };
  }
};
