const express = require('express');
const scrapperController = require('../controller/scrapperController');

const router = express.Router();

router.get('/schedule', scrapperController.getTheaterSchedule);
router.post('/premium-live-history', scrapperController.getPremiumLiveHistory);
router.post('/most-visit', scrapperController.getMostVisitRoom);

module.exports = router;
