const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const middleware = require("../utils/jwtMiddleware");

router.post('/', notificationController.createNotification);
router.post('/discord', notificationController.sendDiscordSharingUser);
router.post('/read-notification-admin', middleware, notificationController.readNotificationAdmin);
router.post('/read-notification', notificationController.readNotification);
router.get('/count-notification-admin', notificationController.countNotificationAdmin);
router.get('/:userId/count-notification', notificationController.countNotification);
router.get('/discord/users', notificationController.checkDiscordAccount);
router.get('/:userId', notificationController.getNotificationsByUserId);
router.get('/', notificationController.getAllNotificationsForAdmin);

module.exports = router;
