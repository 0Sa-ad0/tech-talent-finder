const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats, getRecentCandidates } = require('../controllers/dashboardController');

router.get('/stats', protect, getDashboardStats);
router.get('/recent-candidates', protect, getRecentCandidates);

module.exports = router;