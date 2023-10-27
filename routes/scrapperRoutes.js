const express = require('express');
const scrapperController = require('../controller/scrapperController');

const router = express.Router();

router.get('/schedule', scrapperController.getTheaterSchedule);
router.get('/premium-live-history', scrapperController.getPremiumLiveHistory);
router.get('/most-visit', scrapperController.getMostVisitRoom);

module.exports = router;