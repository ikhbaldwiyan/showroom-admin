const express = require("express");
const activityController = require("../controller/activityController");
const router = express.Router();
const middleware = require("../utils/jwtMiddleware");

router.get("/", middleware, activityController.getAllActivities);
router.post("/", activityController.createActivity);
router.get("/:id", middleware, activityController.getActivityById);
router.delete("/:id", middleware, activityController.deleteActivityById);

module.exports = router;
