const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true,
  },
  factors: [{
    type: String, // e.g., "Low attendance", "Negative stress survey"
  }],
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RiskScore', riskScoreSchema);
