const express = require('express');
const scheduleController = require('../controller/scheduleController');

const router = express.Router();

router.get('/', scheduleController.getAllSchedules);
router.post('/', scheduleController.createSchedule);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
