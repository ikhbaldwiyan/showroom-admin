const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const middleware = require("../utils/jwtMiddleware");

router.post('/', notificationController.createNotification);
router.get('/:userId', notificationController.getNotificationsByUserId);
router.get('/', notificationController.getAllNotificationsForAdmin);
router.post('/discord', notificationController.sendDiscordSharingUser);
router.get('/discord/users', notificationController.checkDiscordAccount);
router.post('/read-notification-admin', middleware, notificationController.readNotificationAdmin);
router.post('/read-notification', notificationController.readNotification);

module.exports = router;
