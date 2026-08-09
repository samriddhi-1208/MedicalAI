exports.getNearbyHospitals = (req, res) => {
  res.json([
    { id: "h1", name: "St. Jude Heart & Emergency Medical Center", type: "Super Specialty Trauma & Cardiac Hospital", address: "45 Healthcare Ave, Central District", phone: "+1 (555) 911-0199", distanceKm: 1.2, etaMins: 4, rating: 4.9, reviewsCount: 312, emergencyOpen: true, icuAvailable: 6 },
    { id: "h2", name: "Apex University Medical Center", type: "General Hospital & ICU Intensive Unit", address: "108 University Boulevard, North Sector", phone: "+1 (555) 911-0422", distanceKm: 2.8, etaMins: 8, rating: 4.8, reviewsCount: 540, emergencyOpen: true, icuAvailable: 12 },
    { id: "h3", name: "Mercy General Community Hospital", type: "Urgent Care & Maternity Center", address: "89 Mercy Lane, West Suburb", phone: "+1 (555) 911-0880", distanceKm: 4.1, etaMins: 11, rating: 4.6, reviewsCount: 189, emergencyOpen: true, icuAvailable: 2 }
  ]);
};
