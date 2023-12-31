const express = require('express');
const router = express.Router();
const idnHistoryLiveController = require('../controller/idnHistoryLive')

router.get('/', idnHistoryLiveController.getAllHistory);
router.get('/:id', idnHistoryLiveController.getIdnHistoryDetail);
router.get('/member/:username', idnHistoryLiveController.getIdnHistoryMember);

module.exports = router