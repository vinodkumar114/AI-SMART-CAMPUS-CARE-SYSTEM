const express = require('express');
const router = express.Router();
const { getCounselorDashboard } = require('../controllers/counselorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('counselor'), getCounselorDashboard);

module.exports = router;
