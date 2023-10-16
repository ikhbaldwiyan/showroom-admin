const express = require('express');
const router = express.Router();
const sharingLiveController = require('../controller/sharingLiveController');

router.get('/', sharingLiveController.getAllSharingLive);
router.post('/', sharingLiveController.createSharingLive);
router.get('/:id', sharingLiveController.getSharingLiveDetail);
router.put('/:id', sharingLiveController.updateSharingLive);
router.delete('/:id', sharingLiveController.deleteSharingLive);

module.exports = router;
