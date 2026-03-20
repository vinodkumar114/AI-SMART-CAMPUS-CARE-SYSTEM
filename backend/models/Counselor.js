const mongoose = require('mongoose');

const counselorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: String,
  specialization: String,
});
module.exports = mongoose.model('Counselor', counselorSchema);
