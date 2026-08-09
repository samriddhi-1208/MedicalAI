// Utility Helper Functions
module.exports = {
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  generateId: (prefix = 'id') => {
    return `${prefix}-${Date.now()}`;
  }
};
