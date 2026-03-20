const express = require('express');
const router = express.Router();
const { submitMessage } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/message', protect, authorize('student'), submitMessage);

module.exports = router;
