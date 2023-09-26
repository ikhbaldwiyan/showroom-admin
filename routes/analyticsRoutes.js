
const express = require('express');
const router = express.Router();
const analyticsController = require('../controller/analyticsController');

router.post('/', analyticsController.getAnalyticsData);

module.exports = router;
