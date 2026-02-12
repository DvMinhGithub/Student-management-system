const express = require("express");
const router = express.Router();

const teacherController = require("./teacherController");
const uploadFile = require("#shared/middlewares/uploadFile.js");
const { verifyToken, verifyAdmin, verifySelfByUserOrAdmin } = require("#shared/middlewares/verify.js");

router.get("/", verifyToken, teacherController.getAllTeachers);

router.post("/", verifyToken, verifyAdmin, teacherController.addTeacher);
router.post(
  "/uploadExcel",
  verifyToken,
  verifyAdmin,
  uploadFile("file"),
  teacherController.uploadExcel
);

router.put("/:id", verifyToken, verifySelfByUserOrAdmin, teacherController.updateTeacher);

router.delete("/:id", verifyToken, verifyAdmin, teacherController.deleteTeacher);

module.exports = router;
