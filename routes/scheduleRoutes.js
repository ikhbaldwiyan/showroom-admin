const express = require('express');
const scheduleController = require('../controller/scheduleController');
const middleware = require("../utils/jwtMiddleware");
const router = express.Router();

router.get('/', scheduleController.getAllSchedules);
router.get('/today', scheduleController.getTodayTheaterSchedule);
router.post('/', middleware, scheduleController.createSchedule);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', middleware, scheduleController.updateSchedule);
router.delete('/:id', middleware, scheduleController.deleteSchedule);

module.exports = router;
