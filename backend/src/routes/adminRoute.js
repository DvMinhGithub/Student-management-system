const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/verify");
const uploadFile = require("../middlewares/uploadFile");

router.get("/detail/:id", verifyToken, adminController.getDetailAdmin);

router.put(
  "/:id",
  // verifyToken,
  uploadFile('avatar'),
  adminController.updateAdmin
);

module.exports = router;
