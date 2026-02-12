const express = require("express");
const router = express.Router();

const adminController = require("./adminController");
const { verifyToken, verifyAdmin } = require("#shared/middlewares/verify.js");
const uploadFile = require("#shared/middlewares/uploadFile.js");

router.get("/detail/:id", verifyToken, verifyAdmin, adminController.getDetailAdmin);

router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  uploadFile('avatar'),
  adminController.updateAdmin
);

module.exports = router;
