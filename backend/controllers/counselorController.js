const RiskScore = require('../models/RiskScore');
const Alert = require('../models/Alert');
const AcademicRecord = require('../models/AcademicRecord');

// @desc    Get counselor Dashboard Data
// @route   GET /api/counselor/dashboard
// @access  Private (Counselor)
const getCounselorDashboard = async (req, res) => {
  try {
    const highRiskStudents = await RiskScore.find({ riskLevel: { $in: ['High', 'Critical'] } }).populate('studentId', 'name email').sort({ score: -1 });
    const alerts = await Alert.find({ isRead: false }).populate('studentId', 'name email').sort({ createdAt: -1 });
    
    res.json({ highRiskStudents, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCounselorDashboard };
