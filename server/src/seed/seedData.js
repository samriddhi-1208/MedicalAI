require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');
const ReportSummary = require('../models/ReportSummary');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const SOSEvent = require('../models/SOSEvent');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ MongoDB Atlas already contains seeded patient data.');
      
      const counts = {
        users: await User.countDocuments(),
        emergencyContacts: await EmergencyContact.countDocuments(),
        medicines: await Medicine.countDocuments(),
        medicineLogs: await MedicineLog.countDocuments(),
        reports: await Report.countDocuments(),
        reportValues: await ReportValue.countDocuments(),
        reportSummaries: await ReportSummary.countDocuments(),
        sosEvents: await SOSEvent.countDocuments()
      };

      console.log('📊 Current MongoDB Atlas Document Counts:');
      console.log(`- users inserted: ${counts.users}`);
      console.log(`- emergency contacts inserted: ${counts.emergencyContacts}`);
      console.log(`- medicines inserted: ${counts.medicines}`);
      console.log(`- medicine logs inserted: ${counts.medicineLogs}`);
      console.log(`- reports inserted: ${counts.reports}`);
      console.log(`- report values inserted: ${counts.reportValues}`);
      console.log(`- report summaries inserted: ${counts.reportSummaries}`);
      console.log(`- SOS events inserted: ${counts.sosEvents}`);
      return counts;
    }

    console.log('🌱 Seeding initial patient record to MongoDB Atlas...');

    // 1. Create Default Patient User
    const user = await User.create({
      email: "laxmi.manapure@example.com",
      password_hash: "$2a$10$w8T0F.82yB/wR3s8dG2u0eK0W.m9cR5H3uJ4kL.b1V2N3M4P5Q6R7",
      full_name: "Laxmi Manapure",
      phone: "9173737949",
      age: 20,
      gender: "Female",
      blood_group: "B+",
      height: "168 cm",
      weight: "64 kg",
      primary_physician: "Dr. Rajesh Kumar, MD (Civil Hospital)"
    });

    // 2. Create Emergency Contacts
    const contacts = await EmergencyContact.insertMany([
      { user_id: user._id, name: "Dr. Rajesh Kumar", relation: "Primary Physician (Civil Hospital)", phone: "+91 98765 43210", email: "dr.rajesh@civilhospital.in", is_primary: 1, notify_on_sos: 1 },
      { user_id: user._id, name: "National Emergency Ambulance (108)", relation: "Govt 108 Emergency Helpline", phone: "108", email: "sos@108ambulance.in", is_primary: 1, notify_on_sos: 1 },
      { user_id: user._id, name: "Ramesh Tiwari", relation: "Family Contact / Caregiver", phone: "+91 98123 45678", email: "ramesh.tiwari@example.com", is_primary: 0, notify_on_sos: 1 }
    ]);

    // 3. Create Sample Report
    const report = await Report.create({
      user_id: user._id,
      title: "Complete Blood Count & Lipid Profile",
      lab_name: "Apex Clinical Laboratories",
      doctor_name: "Dr. Aris Thorne",
      report_date: "2026-07-28",
      file_name: "CBC_Lipid_July2026.pdf",
      file_type: "application/pdf",
      ocr_confidence: "98.9%",
      status_flag: "Attention Needed"
    });

    // 4. Create Biomarker Report Values
    const reportValues = await ReportValue.insertMany([
      { report_id: report._id, biomarker_name: "Hemoglobin", value: "11.2", unit: "g/dL", reference_range: "12.0 - 15.5", status_flag: "Low", category: "Hematology" },
      { report_id: report._id, biomarker_name: "Total Cholesterol", value: "224", unit: "mg/dL", reference_range: "< 200", status_flag: "High", category: "Lipids" },
      { report_id: report._id, biomarker_name: "HbA1c", value: "5.8", unit: "%", reference_range: "< 5.7", status_flag: "Stable", category: "Metabolic" },
      { report_id: report._id, biomarker_name: "WBC Count", value: "6.8", unit: "k/mcL", reference_range: "4.5 - 11.0", status_flag: "Normal", category: "Hematology" }
    ]);

    // 5. Create Report Summary
    const reportSummary = await ReportSummary.create({
      report_id: report._id,
      plain_language_summary: "AI report analysis complete. Total Cholesterol is measured at 224 mg/dL (High), while Hemoglobin is slightly low at 11.2 g/dL. Renal panel and white blood cells remain optimal.",
      key_findings: [
        "Total Cholesterol measured at 224 mg/dL (Desirable: < 200 mg/dL).",
        "Hemoglobin measured at 11.2 g/dL (Reference: 12.0 - 15.5 g/dL).",
        "HbA1c Blood Sugar measured at 5.8% (Stable)."
      ],
      lifestyle_advice: [
        "Increase soluble fiber intake (oats, legumes).",
        "Maintain 150 minutes of weekly aerobic exercise."
      ],
      clinical_advice: [
        "Schedule follow-up consultation with Dr. Aris Thorne in 30 days."
      ]
    });

    // 6. Create Medicines
    const med1 = await Medicine.create({
      user_id: user._id,
      name: "Metformin Hydrochloride",
      dosage: "500 mg",
      frequency: "Twice Daily",
      time_slot: "Morning",
      scheduled_time: "08:00 AM",
      purpose: "Blood Sugar Management",
      total_pills: 60,
      pills_remaining: 42
    });

    const med2 = await Medicine.create({
      user_id: user._id,
      name: "Atorvastatin Calcium",
      dosage: "10 mg",
      frequency: "Once Daily",
      time_slot: "Night",
      scheduled_time: "09:30 PM",
      purpose: "Cholesterol Regulation",
      total_pills: 30,
      pills_remaining: 18
    });

    // 7. Create Medicine Log
    const medLog = await MedicineLog.create({
      medicine_id: med1._id,
      taken_at: new Date(),
      status: "Logged"
    });

    // 8. Create SOS Event
    const sosEvent = await SOSEvent.create({
      user_id: user._id,
      trigger_type: "Manual SOS Button",
      latitude: 28.6139,
      longitude: 77.2090,
      status: "DISPATCHED",
      notes: "Manual High-Intensity Emergency SOS Button"
    });

    const results = {
      users: 1,
      emergencyContacts: contacts.length,
      medicines: 2,
      medicineLogs: 1,
      reports: 1,
      reportValues: reportValues.length,
      reportSummaries: 1,
      sosEvents: 1
    };

    console.log('✅ Initial patient record seeded successfully to MongoDB Atlas.');
    console.log('📊 Seeding Results Summary:');
    console.log(`- users inserted: ${results.users}`);
    console.log(`- emergency contacts inserted: ${results.emergencyContacts}`);
    console.log(`- medicines inserted: ${results.medicines}`);
    console.log(`- medicine logs inserted: ${results.medicineLogs}`);
    console.log(`- reports inserted: ${results.reports}`);
    console.log(`- report values inserted: ${results.reportValues}`);
    console.log(`- report summaries inserted: ${results.reportSummaries}`);
    console.log(`- SOS events inserted: ${results.sosEvents}`);

    return results;
  } catch (error) {
    console.error('❌ Error seeding MongoDB Atlas:', error.message);
  }
};

// Executed directly via npm run seed
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Fatal seed error:', err);
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;
