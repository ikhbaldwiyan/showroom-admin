const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.post('/', notificationController.createNotification);
router.get('/:userId', notificationController.getNotificationsByUserId);
router.get('/', notificationController.getAllNotificationsForAdmin);
router.post('/discord', notificationController.sendDiscordSharingUser);
router.get('/discord/users', notificationController.checkDiscordAccount);

module.exports = router;
