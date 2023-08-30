const express = require('express');
const activityController = require('../controller/activityController');
const router = express.Router();

router.get('/', activityController.getAllActivities);
router.post('/', activityController.createActivity);
router.get('/:id', activityController.getActivityById);
router.delete('/:id', activityController.deleteActivityById);

module.exports = router;
