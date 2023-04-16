const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const uploadFile = require("../middlewares/uploadFile");
const { verifyToken, verifyAdmin } = require("../middlewares/verify");

router.get("/", verifyToken, courseController.getAllCourses);

router.post("/", verifyToken, verifyAdmin, courseController.createCourse);
router.post(
  "/uploadExcel",
  uploadFile("file"),
  verifyToken,
  verifyAdmin,
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
