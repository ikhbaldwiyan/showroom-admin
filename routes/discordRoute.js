const express = require("express");
// const userPermissionsController = require("../controller/userControlloer");
const discordController = require('../controller/discordController')
const middleware = require("../utils/jwtMiddleware");

const router = express.Router();

router.get("/role", discordController.getUserRoles);

module.exports = router;
