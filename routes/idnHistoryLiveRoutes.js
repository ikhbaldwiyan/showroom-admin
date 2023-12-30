const express = require('express');
const router = express.Router();
const idnHistoryLiveController = require('../controller/idnHistoryLive')

router.get('/', idnHistoryLiveController.getAllHistory)

module.exports = router