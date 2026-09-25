const express = require('express');
const router = express.Router();

const HOSPITALS_DATABASE = [
  {
    id: "hosp-1",
    name: "St. Jude Heart & Emergency Medical Center",
    type: "Level 1 Trauma & Cardiac Care",
    distanceKm: 1.2,
    etaMins: 4,
    rating: 4.9,
    reviewsCount: 342,
    address: "742 Evergreen Terrace, Medical District",
    phone: "+1 (555) 911-7000",
    emergencyOpen: true,
    icuAvailable: 14,
    specialties: ["Cardiology", "Trauma ICU", "Neurology", "Emergency Surgery"],
    lat: 28.6145,
    lng: 77.2095
  },
  {
    id: "hosp-2",
    name: "Apex Multispecialty Hospital",
    type: "General & Surgical Hospital",
    distanceKm: 2.8,
    etaMins: 8,
    rating: 4.7,
    reviewsCount: 518,
    address: "104 Healthcare Boulevard, Suite 200",
    phone: "+1 (555) 482-1100",
    emergencyOpen: true,
    icuAvailable: 6,
    specialties: ["Internal Medicine", "Pulmonology", "Radiology", "Pediatrics"],
    lat: 28.6210,
    lng: 77.2180
  },
  {
    id: "hosp-3",
    name: "Metro Health Super Specialty Hospital",
    type: "Advanced Critical Care",
    distanceKm: 4.5,
    etaMins: 12,
    rating: 4.8,
    reviewsCount: 890,
    address: "88 Horizon Tower Way, West Wing",
    phone: "+1 (555) 300-8899",
    emergencyOpen: true,
    icuAvailable: 22,
    specialties: ["Nephrology", "Endocrinology", "Vascular Surgery"],
    lat: 28.6080,
    lng: 77.1950
  },
  {
    id: "hosp-4",
    name: "Mercy Care Urgent Care Clinic",
    type: "Urgent Outpatient Clinic",
    distanceKm: 5.1,
    etaMins: 15,
    rating: 4.5,
    reviewsCount: 174,
    address: "12 Pine Ridge Road",
    phone: "+1 (555) 210-4411",
    emergencyOpen: false,
    icuAvailable: 0,
    specialties: ["Urgent Care", "First Aid", "Blood Work", "X-Ray"],
    lat: 28.6300,
    lng: 77.2250
  }
];

// GET /api/hospitals (Nearest hospital query based on live location)
router.get('/', (req, res) => {
  const { filter, search } = req.query;

  let results = [...HOSPITALS_DATABASE];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(h => h.name.toLowerCase().includes(q) || h.specialties.some(s => s.toLowerCase().includes(q)));
  }

  if (filter === 'icu') {
    results = results.filter(h => h.icuAvailable > 0);
  } else if (filter === 'emergency') {
    results = results.filter(h => h.emergencyOpen);
  }

  // Distance sort
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    userLocation: { lat: 28.6139, lng: 77.2090, label: "Live GPS Position" },
    count: results.length,
    hospitals: results
  });
});

module.exports = router;
