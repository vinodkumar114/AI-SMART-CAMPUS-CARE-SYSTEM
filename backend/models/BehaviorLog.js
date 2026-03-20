const mongoose = require('mongoose');

const behaviorLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  libraryVisitsPerWeek: {
    type: Number,
    default: 0,
  },
  campusEventParticipation: { // Number of events attended recently
    type: Number,
    default: 0,
  },
  hostelMovementFlags: { // E.g., not leaving room often, late entries
    type: Number,
    default: 0, // Higher score = more concerning behavior
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BehaviorLog', behaviorLogSchema);
