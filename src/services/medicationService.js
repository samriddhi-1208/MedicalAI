/**
 * MedGuardian AI — Medication Service Architecture
 * Manages upcoming doses, daily schedules, and taken/missed dose logs.
 */

export const medicationService = {
  getNextDose: () => {
    return {
      id: "med-1",
      name: "Lisinopril",
      dosage: "10mg",
      instructions: "After food",
      time: "2:00 PM",
      dateLabel: "Today, 2:00 PM",
      taken: false
    };
  },

  getTodaySchedule: () => {
    return [
      {
        id: "med-1",
        name: "Lisinopril",
        dosage: "10mg",
        instructions: "After food",
        time: "2:00 PM",
        status: "pending",
        taken: false
      },
      {
        id: "med-2",
        name: "Metformin",
        dosage: "500mg",
        instructions: "With dinner",
        time: "8:00 PM",
        status: "pending",
        taken: false
      },
      {
        id: "med-3",
        name: "Multivitamin",
        dosage: "1 tablet",
        instructions: "With breakfast",
        time: "9:00 AM",
        status: "taken",
        taken: true
      }
    ];
  }
};
