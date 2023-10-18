const express = require('express');
const router = express.Router();
const premiumLiveController = require('../controller/premiumLiveController');

router.get('/', premiumLiveController.getAllPremiumLives);
router.get('/today', premiumLiveController.getTodayPremiumLive);
router.post('/', premiumLiveController.createPremiumLive);
router.get('/:id', premiumLiveController.getPremiumLiveById);
router.put('/:id', premiumLiveController.updatePremiumLive);
router.delete('/:id', premiumLiveController.deletePremiumLive);

module.exports = router;
