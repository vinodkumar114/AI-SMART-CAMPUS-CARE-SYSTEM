const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrollmentYear: Number,
  department: String,
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to a User with role counselor
  }
});
module.exports = mongoose.model('Student', studentSchema);
