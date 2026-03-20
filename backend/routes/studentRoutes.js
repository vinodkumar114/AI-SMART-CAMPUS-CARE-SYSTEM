const express = require('express');
const router = express.Router();
const { submitAcademicRecord, submitWellnessCheckin, getStudentDashboard } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/academics', protect, authorize('student'), submitAcademicRecord);
router.post('/wellness', protect, authorize('student'), submitWellnessCheckin);
router.get('/dashboard', protect, authorize('student'), getStudentDashboard);

module.exports = router;
