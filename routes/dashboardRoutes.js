const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController");

router.get("/", dashboardController.dashboardAdmin);

module.exports = router;