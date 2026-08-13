/**
 * MedGuardian AI — Health Service Architecture
 * Manages vital metrics, biomarker trend histories, and AI clinical summaries.
 */

export const healthService = {
  getVitalsOverview: () => {
    return [
      {
        id: 'bp',
        name: 'Blood Pressure',
        value: '120/80',
        unit: 'mmHg',
        status: 'Normal',
        statusType: 'normal',
        statusSymbol: '✓',
        refRange: 'Systolic <120 / Diastolic <80',
        trend: 'stable',
        iconName: 'HeartPulse'
      },
      {
        id: 'glucose',
        name: 'Fasting Glucose',
        value: '95',
        unit: 'mg/dL',
        status: 'Normal',
        statusType: 'normal',
        statusSymbol: '✓',
        refRange: '70 - 99 mg/dL',
        trend: 'down',
        iconName: 'Activity'
      },
      {
        id: 'hba1c',
        name: 'HbA1c',
        value: '5.8',
        unit: '%',
        status: 'Elevated',
        statusType: 'warning',
        statusSymbol: '▲',
        refRange: '< 5.7 %',
        trend: 'up',
        iconName: 'TrendingUp'
      }
    ];
  },

  getAIInsightSummary: () => {
    return {
      title: "AI Clinical Insight",
      summary: "Your recent glucose levels are stable at 95 mg/dL. However, your HbA1c shows a slight upward trend over the last 6 months (5.8%). Consider reviewing your current diet plan with your healthcare provider.",
      severity: "warning",
      actionLabel: "View Details & Guidance",
      disclaimer: "AI-generated information is for informational purposes only and should not replace professional medical advice."
    };
  },

  getTrendHistories: (timeFilter = '6M') => {
    return {
      hba1c: [
        { date: 'Jan 2026', value: 5.4, target: 5.7 },
        { date: 'Mar 2026', value: 5.5, target: 5.7 },
        { date: 'May 2026', value: 5.6, target: 5.7 },
        { date: 'Jul 2026', value: 5.7, target: 5.7 },
        { date: 'Aug 2026', value: 5.8, target: 5.7 },
      ],
      glucose: [
        { date: 'Jan 2026', value: 112, target: 99 },
        { date: 'Mar 2026', value: 108, target: 99 },
        { date: 'May 2026', value: 102, target: 99 },
        { date: 'Jul 2026', value: 98, target: 99 },
        { date: 'Aug 2026', value: 95, target: 99 },
      ],
      bp: [
        { date: 'Jan 2026', systolic: 128, diastolic: 84 },
        { date: 'Mar 2026', systolic: 125, diastolic: 82 },
        { date: 'May 2026', systolic: 122, diastolic: 80 },
        { date: 'Jul 2026', systolic: 120, diastolic: 80 },
        { date: 'Aug 2026', systolic: 118, diastolic: 78 },
      ]
    };
  },

  getHistoricalMilestones: () => {
    return [
      {
        date: "Oct 12, 2023",
        category: "Medication Change",
        title: "Started Metformin 500mg",
        desc: "Prescribed low-dose metformin to stabilize glycemic variation."
      },
      {
        date: "Jan 05, 2024",
        category: "Dietary Milestone",
        title: "Started Mediterranean Diet",
        desc: "Adopted antioxidant-rich dietary plan with low glycemic load."
      },
      {
        date: "Mar 22, 2024",
        category: "Lab Result",
        title: "HbA1c Dropped Below 6.0%",
        desc: "Demonstrated positive progress towards target glycemic baseline."
      }
    ];
  }
};
