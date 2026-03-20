const CampusResource = require('../models/CampusResource');
const EnergyUsage = require('../models/EnergyUsage');
const RiskScore = require('../models/RiskScore');

// @desc    Get admin Dashboard Data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const resources = await CampusResource.find({});
    const energy = await EnergyUsage.find({}).sort({ recordedAt: -1 }).limit(10);
    const riskScores = await RiskScore.find({}).populate('studentId', 'name');
    
    // Aggregating risk distributions for charts
    const riskDistribution = {
      Low: riskScores.filter(r => r.riskLevel === 'Low').length,
      Medium: riskScores.filter(r => r.riskLevel === 'Medium').length,
      High: riskScores.filter(r => r.riskLevel === 'High').length,
      Critical: riskScores.filter(r => r.riskLevel === 'Critical').length,
    };

    res.json({ resources, energy, riskDistribution, totalStudentsScored: riskScores.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboard };
