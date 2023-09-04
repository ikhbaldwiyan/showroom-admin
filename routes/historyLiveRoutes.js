const express = require('express');
const historyLiveController = require('../controller/historyLiveController');
const router = express.Router();

router.get('/', historyLiveController.getAllLiveHistory);
router.get('/:id', historyLiveController.getLiveDetail);
router.post('/list', historyLiveController.getLiveDetailsByIds);

module.exports = router;
