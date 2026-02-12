const express = require("express");
const authController = require("./authController");
const { verifyToken } = require("#shared/middlewares/verify.js");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me/profile", verifyToken, authController.getMeProfile);
router.post("/refresh", authController.refresh);

module.exports = router;
