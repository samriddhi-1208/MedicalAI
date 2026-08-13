/**
 * MedGuardian AI — 100% Real-Time Emergency Service Architecture
 * Live Geolocation, OpenStreetMap Nearby Emergency Facilities API, and 108 Dispatch.
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
   * Fetches real nearby emergency hospitals from OpenStreetMap Nominatim Live API
   */
  fetchLiveNearbyEmergencyHospitals: async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=hospital+emergency+near+${lat},${lng}&limit=20`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MedGuardianAI-EmergencySystem/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenStreetMap API returned status ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      const mapped = data.map((item, index) => {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        const distKm = calculateHaversineDistance(lat, lng, itemLat, itemLng);
        const addressObj = item.address || {};
        
        const fullAddress = [
          addressObj.road,
          addressObj.suburb || addressObj.neighbourhood,
          addressObj.city || addressObj.town || addressObj.county,
          addressObj.state,
          addressObj.postcode
        ].filter(Boolean).join(', ') || item.display_name;

        const phone = item.extratags?.phone || item.extratags?.['contact:phone'] || null;
        const is24_7 = item.extratags?.opening_hours === '24/7' || item.extratags?.emergency === 'yes';

        return {
          id: `hosp-live-${item.place_id || index}`,
          name: item.name || item.display_name.split(',')[0] || `Emergency Healthcare Facility #${index + 1}`,
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

      // Sort strictly by actual geographic proximity
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
