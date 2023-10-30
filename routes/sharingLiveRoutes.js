const express = require('express');
const router = express.Router();
const sharingLiveController = require('../controller/sharingLiveController');

router.get('/', sharingLiveController.getAllSharingLive);
router.post('/', sharingLiveController.registerSharingLive);
router.get('/:id', sharingLiveController.getSharingLiveDetail);
router.put('/:id', sharingLiveController.updateSharingLive);
router.delete('/:id', sharingLiveController.deleteSharingLive);
router.get('/users/:id', sharingLiveController.getSharingLiveUsers);

module.exports = router;
