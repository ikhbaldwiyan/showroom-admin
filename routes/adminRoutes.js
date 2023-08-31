const express = require("express");
const router = express.Router();
const adminUserController = require("../controller/adminUserController");

router.post("/", adminUserController.createAdminUser);
router.get("/", adminUserController.getAdminUsers);
router.get("/:id", adminUserController.getAdminUserById);
router.put("/:id", adminUserController.updateAdminUser);
router.delete("/:id", adminUserController.deleteAdminUser);

module.exports = router;
