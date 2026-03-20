const mongoose = require('mongoose');

const energyUsageSchema = new mongoose.Schema({
  location: { // e.g., "Hostel Block A", "Library"
    type: String,
    required: true,
  },
  electricityKwh: {
    type: Number,
    required: true,
  },
  waterLiters: {
    type: Number,
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EnergyUsage', energyUsageSchema);
