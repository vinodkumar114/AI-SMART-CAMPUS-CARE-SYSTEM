const mongoose = require('mongoose');

const hostelRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  currentOccupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

module.exports = mongoose.model('HostelRoom', hostelRoomSchema);
