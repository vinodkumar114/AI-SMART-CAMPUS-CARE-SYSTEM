const mongoose = require('mongoose');

const campusResourceSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: ['StudyRoom', 'Classroom', 'LibrarySection', 'Lab'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  currentOccupancy: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('CampusResource', campusResourceSchema);
