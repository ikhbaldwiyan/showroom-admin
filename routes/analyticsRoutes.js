
const express = require('express');
const router = express.Router();
const analyticsController = require('../controller/analyticsController');

router.post('/', analyticsController.getAnalyticsData);
router.get('/token', analyticsController.getSingleToken);
router.post('/real-time', analyticsController.getRealTimeData);
router.post('/real-time-users', analyticsController.getRealTimeOnlineUsers);

module.exports = router;
