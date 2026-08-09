exports.getBiomarkerHistories = (req, res) => {
  res.json({
    Glucose: [
      { date: 'Mar 15', value: 118 },
      { date: 'Apr 10', value: 114 },
      { date: 'May 22', value: 109 },
      { date: 'Jun 18', value: 106 },
      { date: 'Jul 28', value: 104 }
    ],
    Cholesterol: [
      { date: 'Mar 15', value: 242 },
      { date: 'Apr 10', value: 236 },
      { date: 'May 22', value: 230 },
      { date: 'Jun 18', value: 228 },
      { date: 'Jul 28', value: 224 }
    ],
    Hemoglobin: [
      { date: 'Mar 15', value: 10.4 },
      { date: 'Apr 10', value: 10.8 },
      { date: 'May 22', value: 11.0 },
      { date: 'Jun 18', value: 11.1 },
      { date: 'Jul 28', value: 11.2 }
    ]
  });
};
