const express = require("express");
const discordController = require('../controller/discordController')
const idnLivesController = require('../controller/idnLivesController');

const router = express.Router();

router.get("/role", discordController.getUserRoles);
router.get('/idn-lives', idnLivesController.sendDiscordNotif);

module.exports = router;
