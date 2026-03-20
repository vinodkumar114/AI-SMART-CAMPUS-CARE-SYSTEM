const WellnessCheckin = require('../models/WellnessCheckin');
const AcademicRecord = require('../models/AcademicRecord');
const BehaviorLog = require('../models/BehaviorLog');
const RiskScore = require('../models/RiskScore');
const Alert = require('../models/Alert');
const { calculateRiskScore } = require('../ai-models/riskPredictor');

// @desc    Submit academic record (attendance, assignments, exams)
// @route   POST /api/student/academics
// @access  Private (Student)
const submitAcademicRecord = async (req, res) => {
  try {
    const { attendancePercentage, assignmentSubmissionRate, averageExamScore } = req.body;

    if (
      attendancePercentage === undefined ||
      assignmentSubmissionRate === undefined ||
      averageExamScore === undefined
    ) {
      return res.status(400).json({ message: 'Please add attendance, assignments, and exam score' });
    }

    const record = await AcademicRecord.create({
      studentId: req.user._id,
      attendancePercentage,
      assignmentSubmissionRate,
      averageExamScore,
    });

    // Trigger AI Risk Analysis asynchronously
    analyzeRiskAndAlert(req.user._id, req.app.get('io'));

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit wellness checkin
// @route   POST /api/student/wellness
// @access  Private (Student)
const submitWellnessCheckin = async (req, res) => {
  try {
    const { moodScore, stressLevel, sleepHours, notes } = req.body;
    
    // Create checkin
    const checkin = await WellnessCheckin.create({
      studentId: req.user._id,
      moodScore,
      stressLevel,
      sleepHours,
      notes
    });

    // Trigger AI Risk Analysis asynchronously
    analyzeRiskAndAlert(req.user._id, req.app.get('io'));

    res.status(201).json(checkin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student Dashboard Data
// @route   GET /api/student/dashboard
// @access  Private
const getStudentDashboard = async (req, res) => {
  try {
    const checkins = await WellnessCheckin.find({ studentId: req.user._id }).sort({ submittedAt: -1 }).limit(5);
    const risk = await RiskScore.findOne({ studentId: req.user._id }).sort({ calculatedAt: -1 });
    const academics = await AcademicRecord.findOne({ studentId: req.user._id }).sort({ recordedAt: -1 });

    res.json({
      checkins,
      riskScore: risk || { score: 0, riskLevel: 'Low', factors: [] },
      academics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal function to calculate risk and emit socket alerts
const analyzeRiskAndAlert = async (studentId, io) => {
  try {
    const latestAcademic = await AcademicRecord.findOne({ studentId }).sort({ recordedAt: -1 });
    const latestBehavior = await BehaviorLog.findOne({ studentId }).sort({ timestamp: -1 });
    const latestWellness = await WellnessCheckin.findOne({ studentId }).sort({ submittedAt: -1 });

    const analysis = calculateRiskScore(latestAcademic, latestBehavior, latestWellness);

    // Save risk score
    const newRisk = await RiskScore.create({
      studentId,
      score: analysis.score,
      riskLevel: analysis.riskLevel,
      factors: analysis.factors
    });

    // Alerting logic
    if (analysis.riskLevel === 'High' || analysis.riskLevel === 'Critical') {
      const alert = await Alert.create({
        studentId,
        type: 'RiskThreshold',
        message: `Student risk level is ${analysis.riskLevel} (${analysis.score}%). Factors: ${analysis.factors.join(', ')}`
      });

      // Emit real-time socket event to counselors & admin
      if (io) {
        io.emit('newAlert', alert);
        io.emit('riskUpdate', newRisk);
      }
    }
  } catch (error) {
    console.error('Error in analyzeRiskAndAlert', error);
  }
};

module.exports = { submitAcademicRecord, submitWellnessCheckin, getStudentDashboard, analyzeRiskAndAlert };
