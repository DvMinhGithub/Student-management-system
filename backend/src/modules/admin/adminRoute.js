const express = require("express");
const router = express.Router();

const adminController = require("./adminController");
const { verifyToken } = require("../../shared/middlewares/verify");
const uploadFile = require("../../shared/middlewares/uploadFile");

router.get("/detail/:id", verifyToken, adminController.getDetailAdmin);

router.put(
  "/:id",
  // verifyToken,
  uploadFile('avatar'),
  adminController.updateAdmin
);

module.exports = router;
