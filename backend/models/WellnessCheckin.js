const mongoose = require('mongoose');

const wellnessCheckinSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moodScore: { 
    type: Number, 
    required: true,
    min: 1, 
    max: 5 // 1=Very Poor, 5=Excellent
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10 // 1=Low, 10=High
  },
  sleepHours: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WellnessCheckin', wellnessCheckinSchema);
