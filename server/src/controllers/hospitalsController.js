const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Haversine formula to compute exact distance in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Distance in km (e.g. 1.2 km)
}

// 1. Geocode City or Pincode using OpenStreetMap Nominatim API
exports.geocodeLocation = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Please enter a valid city or pincode to search." });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MedicalAI-Healthcare-Portal/2.0' }
    });

    if (!response.ok) {
      throw new Error("Unable to connect to geocoding service.");
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return res.status(444 || 404).json({ error: `Location "${query}" could not be found. Please check spelling or enter a city name.` });
    }

    const location = data[0];
    res.json({
      name: location.display_name,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon)
    });
  } catch (error) {
    next(error);
  }
};

// 2. Fetch Real Nearby Hospitals & Healthcare Facilities via OpenStreetMap Overpass API
exports.getNearbyHospitals = async (req, res, next) => {
  try {
    let { lat, lng, category, radiusKm } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude parameters are required." });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radius = parseInt(radiusKm) || 10; // default 10km radius
    const radiusMeters = radius * 1000;

    console.log(`[HOSPITAL FINDER] Real search around (${userLat}, ${userLng}) within ${radius}km for category: "${category || 'All'}"`);

    // Determine OSM Overpass tags based on medical category
    let osmTagFilter = `["amenity"~"hospital|clinic|doctors|pharmacy"]`;
    if (category === 'Pharmacy') {
      osmTagFilter = `["amenity"="pharmacy"]`;
    } else if (category === 'Emergency Hospital' || category === 'Emergency') {
      osmTagFilter = `["amenity"="hospital"]`;
    } else if (category === 'Diagnostic Lab') {
      osmTagFilter = `["amenity"~"clinic|hospital"]["healthcare"~"laboratory|diagnostic"]`;
    } else if (category && category !== 'All' && category !== 'Other') {
      osmTagFilter = `["amenity"~"hospital|clinic|doctors"]`;
    }

    // Overpass QL Query
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node${osmTagFilter}(around:${radiusMeters},${userLat},${userLng});
        way${osmTagFilter}(around:${radiusMeters},${userLat},${userLng});
      );
      out center 30;
    `;

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MedicalAI-Healthcare-Portal/2.0'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });

    if (!response.ok) {
      console.error("[HOSPITAL FINDER] Overpass API error status:", response.status);
      return res.status(503).json({ error: "Nearby healthcare data is temporarily unavailable. Please try again or enter another location." });
    }

    const data = await response.json();
    const elements = data.elements || [];

    if (elements.length === 0) {
      return res.json([]);
    }

    // Process and normalize real OSM elements
    const realFacilities = elements
      .map(item => {
        const tags = item.tags || {};
        const name = tags.name || tags['name:en'] || tags.operator || tags.brand;
        if (!name) return null; // Skip unnamed nodes

        const facilityLat = item.lat || item.center?.lat;
        const facilityLng = item.lon || item.center?.lon;
        if (!facilityLat || !facilityLng) return null;

        const distKm = calculateHaversineDistance(userLat, userLng, facilityLat, facilityLng);

        // Construct real address from OSM tags
        const street = tags['addr:street'] || tags['addr:full'] || tags['addr:housenumber'] || '';
        const city = tags['addr:city'] || tags['addr:suburb'] || tags['addr:district'] || '';
        const address = [street, city].filter(Boolean).join(', ') || tags['addr:full'] || 'Address listed on map';

        const amenity = tags.amenity || tags.healthcare || 'healthcare';
        let facilityType = 'Healthcare Clinic';
        if (amenity === 'hospital') facilityType = tags.emergency === 'yes' ? 'Emergency Hospital & Trauma Center' : 'General Hospital';
        else if (amenity === 'pharmacy') facilityType = 'Licensed Pharmacy';
        else if (amenity === 'doctors') facilityType = 'Doctor Specialist Clinic';

        const phone = tags.phone || tags['contact:phone'] || tags['phone:mobile'] || null;
        const website = tags.website || tags['contact:website'] || null;
        const emergencyOpen = tags.emergency === 'yes' || tags['opening_hours'] === '24/7' || amenity === 'hospital';

        return {
          id: `osm-${item.type}-${item.id}`,
          name: name.trim(),
          type: facilityType,
          address: address.trim(),
          lat: facilityLat,
          lng: facilityLng,
          distanceKm: distKm,
          etaMins: Math.max(2, Math.round(distKm * 2.5)), // Estimated driving ETA
          phone: phone ? phone.trim() : null,
          website: website ? website.trim() : null,
          openingHours: tags['opening_hours'] || (emergencyOpen ? 'Open 24/7' : null),
          emergencyOpen: emergencyOpen,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${facilityLat},${facilityLng}`
        };
      })
      .filter(Boolean);

    // Sort by distance ascending
    realFacilities.sort((a, b) => a.distanceKm - b.distanceKm);

    // Return unique real facilities by name
    const uniqueFacilities = [];
    const seenNames = new Set();
    for (const f of realFacilities) {
      const lower = f.name.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        uniqueFacilities.push(f);
      }
    }

    res.json(uniqueFacilities.slice(0, 20));
  } catch (error) {
    console.error("[HOSPITAL FINDER] Error fetching nearby hospitals:", error);
    res.status(503).json({ error: "Nearby healthcare data is temporarily unavailable. Please try again or enter another location." });
  }
};
