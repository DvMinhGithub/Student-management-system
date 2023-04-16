const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");
const uploadFile = require("../middlewares/uploadFile");
const { verifyToken } = require("../middlewares/verify");

router.get("/", verifyToken, teacherController.getAllTeachers);

router.post("/", verifyToken, teacherController.addTeacher);
router.post(
  "/uploadExcel",
  uploadFile("file"),
  verifyToken,
  teacherController.uploadExcel
);

router.put("/:id", verifyToken, teacherController.updateTeacher);

router.delete("/:id", verifyToken, teacherController.deleteTeacher);

module.exports = router;
