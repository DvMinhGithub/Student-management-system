const express = require("express");
const router = express.Router();

const courseController = require("./courseController");
const uploadFile = require("#shared/middlewares/uploadFile.js");
const { verifyToken, verifyAdmin } = require("#shared/middlewares/verify.js");

router.get("/", verifyToken, courseController.getAllCourses);

router.post("/", verifyToken, verifyAdmin, courseController.createCourse);
router.post(
  "/uploadExcel",
  verifyToken,
  verifyAdmin,
  uploadFile("file"),
  courseController.uploadExcel
);

router.put("/:id", verifyToken, verifyAdmin, courseController.updateCourseById);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  courseController.deleteCourseById
);

module.exports = router;
