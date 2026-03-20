const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendancePercentage: {
    type: Number,
    required: true,
  },
  assignmentSubmissionRate: { // Percentage of assignments submitted on time
    type: Number,
    required: true,
  },
  averageExamScore: { // Percentage or GPA equivalent
    type: Number,
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);
