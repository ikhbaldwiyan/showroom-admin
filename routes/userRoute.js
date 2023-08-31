const express = require("express");
const userPermissionsController = require("../controller/userControlloer");
const middleware = require("../utils/jwtMiddleware");

const router = express.Router();

router.get("/", middleware, userPermissionsController.getUsers);
router.post("/", middleware, userPermissionsController.createUser);
router.get("/:user_id", userPermissionsController.getUserPermissions);
router.put("/:user_id", middleware, userPermissionsController.updateUserPermissions);
router.delete("/:user_id", middleware, userPermissionsController.deleteUser);

module.exports = router;
